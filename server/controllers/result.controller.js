import Result from "../models/Result.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { buildExcelBuffer } from "../utils/excelUtil.js";

/**
 * @route GET /api/results/my
 * @desc  Logged-in student's own result history.
 * @access Private (student)
 */
export const getMyResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ student: req.student._id })
    .populate("exam", "name passingPercentage durationMinutes")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, results));
});

/**
 * @route GET /api/results/:id
 * @desc  A single result's full detail (used by the Result page).
 * @access Private (student, owner only — or admin)
 */
export const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate("exam", "name passingPercentage durationMinutes")
    .populate("student", "name email");
  if (!result) throw new ApiError(404, "Result not found");

  if (req.student && String(result.student._id) !== String(req.student._id)) {
    throw new ApiError(403, "Not authorized to view this result");
  }

  return res.status(200).json(new ApiResponse(200, result));
});

/**
 * @route GET /api/admin/results
 * @desc  All results with optional ?student= / ?test= filters.
 * @access Private (admin)
 */
export const getAllResults = asyncHandler(async (req, res) => {
  const { student, test, exam, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (exam || test) filter.exam = exam || test;

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(parseInt(limit) || 20, 200);

  const [items, total] = await Promise.all([
    Result.find(filter)
      .populate("student", "name email phone")
      .populate("exam", "name passingPercentage")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Result.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } })
  );
});

/**
 * @route GET /api/admin/results/export
 * @access Private (admin)
 */
export const exportResults = asyncHandler(async (req, res) => {
  const { student, test, exam } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (exam || test) filter.exam = exam || test;

  const results = await Result.find(filter)
    .populate("student", "name email phone")
    .populate("exam", "name passingPercentage")
    .sort({ createdAt: -1 })
    .lean();

  const rows = results.map((r) => ({
    Student: r.student?.name || "",
    Email: r.student?.email || "",
    Phone: r.student?.phone || "",
    Exam: r.exam?.name || "",
    "Total Questions": r.totalQuestions,
    Correct: r.correct,
    Wrong: r.wrong,
    Skipped: r.skipped,
    "Marks Obtained": r.obtainedMarks,
    "Total Marks": r.totalMarks,
    Percentage: r.percentage,
    Result: r.isPassed ? "Passed" : "Failed",
    "Time Taken (sec)": r.timeTakenSeconds,
    Date: new Date(r.createdAt).toLocaleString("en-IN"),
  }));

  const buffer = buildExcelBuffer(rows, "Results");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=results-export.xlsx");
  return res.status(200).send(buffer);
});
