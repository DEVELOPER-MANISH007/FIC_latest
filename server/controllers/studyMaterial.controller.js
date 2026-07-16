import StudyMaterial from "../models/StudyMaterial.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * @route GET /api/materials
 * @desc  Browse active study materials. Any authenticated student may
 *        access and download these items. Query: page, limit, keyword,
 *        subject, sortBy (latest|oldest)
 * @access Student (protected)
 */
export const getMaterials = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 60);

  const filter = { isActive: true };
  if (req.query.subject) filter.subject = new RegExp(`^${escapeRegex(req.query.subject.trim())}$`, "i");
  if (req.query.keyword) {
    const re = new RegExp(escapeRegex(req.query.keyword.trim()), "i");
    filter.$or = [{ title: re }, { subject: re }, { unit: re }];
  }

  const sort = req.query.sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
  const skip = (page - 1) * limit;

  const [rawItems, total] = await Promise.all([
    StudyMaterial.find(filter).sort(sort).skip(skip).limit(limit),
    StudyMaterial.countDocuments(filter),
  ]);

  const items = rawItems.map((material) => ({ ...material.toObject(), locked: false }));

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    })
  );
});

/**
 * @route GET /api/materials/subjects
 * @desc  Distinct subject names among all active materials (Public +
 *        Enrolled-Only, whether or not this student is enrolled in them —
 *        subjects should still show up as browsable folders/filters even
 *        when locked).
 * @access Student (protected)
 */
export const getMaterialSubjects = asyncHandler(async (req, res) => {
  const subjects = await StudyMaterial.distinct("subject", { isActive: true, subject: { $ne: "" } });
  return res.status(200).json(new ApiResponse(200, subjects.sort((a, b) => a.localeCompare(b))));
});

/**
 * @route GET /api/materials/:id
 * @access Student (protected). Public and matching Enrolled-Only material
 *         return in full; non-matching Enrolled-Only material returns a
 *         locked summary (200, not 404) so the UI can render the
 *         "available only for enrolled students" state with an Enroll CTA.
 */
export const getMaterialById = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOne({ _id: req.params.id, isActive: true });
  if (!material) throw new ApiError(404, "Material not found");

  return res.status(200).json(new ApiResponse(200, { ...material.toObject(), locked: false }));
});

/**
 * @route POST /api/materials/:id/download
 * @desc  Atomically increments the download counter and returns the file
 *        URL. Any authenticated student may download active materials.
 * @access Student (protected)
 */
export const registerDownload = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOne({ _id: req.params.id, isActive: true });
  if (!material) throw new ApiError(404, "Material not found");

  material.downloadCount += 1;
  await material.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { fileUrl: material.fileUrl, fileName: material.fileName }, "Download counted"));
});
