import ExamAttempt from "../models/ExamAttempt.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/**
 * @route GET /api/admin/attempts
 * @desc  Suspicious Activity Log — every attempt with its violation count,
 *        filterable to just the ones that actually have violations.
 *        Query: page, limit, exam, student, flaggedOnly=true
 * @access Admin
 */
export const getAttempts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.exam) filter.exam = req.query.exam;
  if (req.query.student) filter.student = req.query.student;
  if (req.query.flaggedOnly === "true") filter.violationCount = { $gt: 0 };

  const [items, total] = await Promise.all([
    ExamAttempt.find(filter)
      .select("-questions") // question/option data never needed for the activity log
      .populate("student", "name email")
      .populate("exam", "name maxViolations")
      .sort({ violationCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ExamAttempt.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
  );
});

/**
 * @route GET /api/admin/attempts/:id
 * @desc  Full violation timeline for one attempt.
 * @access Admin
 */
export const getAttemptById = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findById(req.params.id)
    .select("-questions")
    .populate("student", "name email phone")
    .populate("exam", "name maxViolations autoSubmitOnMaxViolations");
  if (!attempt) throw new ApiError(404, "Attempt not found");
  return res.status(200).json(new ApiResponse(200, attempt));
});
