import StudyMaterial, { STUDY_MATERIAL_CATEGORIES } from "../models/StudyMaterial.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { persistUploadedMaterial, deleteUploadedMaterial, detectFileType } from "../utils/materialUpload.js";

const SORT_MAP = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  downloads: { downloadCount: -1 },
  title: { title: 1 },
};

/**
 * @route GET /api/admin/materials
 * @desc  List study materials with search/filter/sort/pagination.
 *        Query: page, limit, keyword, subject, visibility, sortBy
 */
export const getAdminMaterials = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.subject) filter.subject = new RegExp(`^${req.query.subject.trim()}$`, "i");
  if (req.query.visibility) filter.visibility = req.query.visibility;
  if (req.query.keyword) {
    const re = new RegExp(req.query.keyword.trim(), "i");
    filter.$or = [{ title: re }, { subject: re }, { unit: re }, { description: re }];
  }

  const sort = SORT_MAP[req.query.sortBy] || SORT_MAP.latest;

  const [items, total] = await Promise.all([
    StudyMaterial.find(filter).sort(sort).skip(skip).limit(limit),
    StudyMaterial.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});

/**
 * @route GET /api/admin/materials/subjects
 * @desc  Distinct subject names in use — powers the admin Subject filter
 *        dropdown without needing a separate Course/Subject catalogue.
 */
export const getAdminMaterialSubjects = asyncHandler(async (req, res) => {
  const subjects = await StudyMaterial.distinct("subject", { subject: { $ne: "" } });
  return res.status(200).json(new ApiResponse(200, subjects.sort((a, b) => a.localeCompare(b))));
});

/**
 * @route GET /api/admin/materials/:id
 */
export const getAdminMaterialById = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findById(req.params.id);
  if (!material) throw new ApiError(404, "Study material not found");
  return res.status(200).json(new ApiResponse(200, material));
});

/**
 * @route POST /api/admin/materials
 * @desc  Upload a new study material. Expects multipart/form-data with a
 *        "file" field plus title (Topic), subject, unit (all required;
 *        description/visibility optional).
 */
export const createMaterial = asyncHandler(async (req, res) => {
  const { title, description, subject, unit, visibility, category, difficulty } = req.body;

  if (!title?.trim()) throw new ApiError(400, "Topic/Notes title is required");
  if (!subject?.trim()) throw new ApiError(400, "Subject name is required");
  if (!unit?.trim()) throw new ApiError(400, "Unit name is required");
  if (!req.file) throw new ApiError(400, 'A file is required (field name "file"): PDF, ZIP, DOC(X), PPT(X), or image');

  // Legacy field — only validated if explicitly supplied by an older caller.
  if (category && !STUDY_MATERIAL_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Category must be one of: ${STUDY_MATERIAL_CATEGORIES.join(", ")}`);
  }

  const { url, publicId, resourceType } = await persistUploadedMaterial(req.file);

  const material = await StudyMaterial.create({
    title: title.trim(),
    description: description?.trim() || "",
    subject: subject.trim(),
    unit: unit.trim(),
    category: category || "",
    difficulty: difficulty || "",
    fileUrl: url,
    fileType: detectFileType(req.file.originalname),
    fileName: req.file.originalname,
    fileSize: req.file.size,
    filePublicId: publicId,
    fileResourceType: resourceType,
    visibility: visibility === "enrolled" ? "enrolled" : "public",
    uploadedBy: req.admin?._id,
  });

  return res.status(201).json(new ApiResponse(201, material, "Study material uploaded"));
});

/**
 * @route PUT /api/admin/materials/:id
 * @desc  Update metadata and/or replace the file (multipart, "file" optional).
 */
export const updateMaterial = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findById(req.params.id);
  if (!material) throw new ApiError(404, "Study material not found");

  const { title, description, subject, unit, visibility, category, difficulty } = req.body;

  if (title !== undefined) {
    if (!title.trim()) throw new ApiError(400, "Topic/Notes title is required");
    material.title = title.trim();
  }
  if (subject !== undefined) {
    if (!subject.trim()) throw new ApiError(400, "Subject name is required");
    material.subject = subject.trim();
  }
  if (unit !== undefined) {
    if (!unit.trim()) throw new ApiError(400, "Unit name is required");
    material.unit = unit.trim();
  }
  if (description !== undefined) material.description = description.trim();
  if (visibility !== undefined) material.visibility = visibility === "enrolled" ? "enrolled" : "public";
  if (category !== undefined) {
    if (category && !STUDY_MATERIAL_CATEGORIES.includes(category)) throw new ApiError(400, "Invalid category");
    material.category = category;
  }
  if (difficulty !== undefined) material.difficulty = difficulty;

  if (req.file) {
    const previous = {
      fileUrl: material.fileUrl,
      filePublicId: material.filePublicId,
      fileResourceType: material.fileResourceType,
    };
    const { url, publicId, resourceType } = await persistUploadedMaterial(req.file);
    material.fileUrl = url;
    material.fileType = detectFileType(req.file.originalname);
    material.fileName = req.file.originalname;
    material.fileSize = req.file.size;
    material.filePublicId = publicId;
    material.fileResourceType = resourceType;
    deleteUploadedMaterial(previous);
  }

  await material.save();
  return res.status(200).json(new ApiResponse(200, material, "Study material updated"));
});

/**
 * @route DELETE /api/admin/materials/:id
 */
export const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findByIdAndDelete(req.params.id);
  if (!material) throw new ApiError(404, "Study material not found");

  deleteUploadedMaterial(material);

  return res.status(200).json(new ApiResponse(200, null, "Study material deleted"));
});
