import StudyMaterial from "../models/StudyMaterial.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every query here is hard-scoped to Public + active — never exposes Enrolled-Only material. */
const PUBLIC_FILTER = { visibility: "public", isActive: true };

/**
 * @route GET /api/public/materials
 * @desc  Home page "Notes Library" — Public study materials only, no login
 *        required. Query: page, limit, keyword, subject, sortBy (latest|oldest)
 * @access Public
 */
export const getPublicMaterials = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 24, 60);
  const skip = (page - 1) * limit;

  const filter = { ...PUBLIC_FILTER };
  if (req.query.subject) filter.subject = new RegExp(`^${escapeRegex(req.query.subject.trim())}$`, "i");
  if (req.query.keyword) {
    const re = new RegExp(escapeRegex(req.query.keyword.trim()), "i");
    filter.$and = [{ $or: [{ title: re }, { subject: re }, { unit: re }, { description: re }] }];
  }

  const sort = req.query.sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

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
 * @route GET /api/public/materials/subjects
 * @desc  Distinct subjects among Public materials — powers the Notes Library
 *        filter dropdown on the home page.
 * @access Public
 */
export const getPublicMaterialSubjects = asyncHandler(async (req, res) => {
  const subjects = await StudyMaterial.distinct("subject", PUBLIC_FILTER);
  return res.status(200).json(new ApiResponse(200, subjects.sort((a, b) => a.localeCompare(b))));
});

/**
 * @route GET /api/public/materials/:id
 * @access Public — 404s for anything not Public+active (Enrolled-Only stays protected).
 */
export const getPublicMaterialById = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOne({ _id: req.params.id, ...PUBLIC_FILTER });
  if (!material) throw new ApiError(404, "Material not found or is not publicly available");
  return res.status(200).json(new ApiResponse(200, material));
});

/**
 * @route POST /api/public/materials/:id/download
 * @desc  Increments the download counter and returns the file URL — only
 *        for Public materials, no login required.
 * @access Public
 */
export const registerPublicDownload = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOneAndUpdate(
    { _id: req.params.id, ...PUBLIC_FILTER },
    { $inc: { downloadCount: 1 } },
    { new: true }
  );
  if (!material) throw new ApiError(404, "Material not found or is not publicly available");

  return res
    .status(200)
    .json(new ApiResponse(200, { fileUrl: material.fileUrl, fileName: material.fileName }, "Download counted"));
});
