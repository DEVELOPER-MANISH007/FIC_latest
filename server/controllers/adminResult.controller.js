import Result from "../models/Result.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { buildExcelBuffer } from "../utils/excelHelper.js";

/**
 * @route GET /api/admin/results
 * @desc  List/search/filter results. Query: page, limit, student, exam, keyword
 */
export const getResults = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.student) filter.student = req.query.student;
  if (req.query.exam) filter.exam = req.query.exam;

  let query = Result.find(filter).populate("student", "name email phone").populate("exam", "name topic");

  if (req.query.keyword) {
    const re = new RegExp(req.query.keyword, "i");
    const all = await Result.find(filter)
      .populate("student", "name email phone")
      .populate("exam", "name topic")
      .sort({ createdAt: -1 })
      .lean();
    const filtered = all.filter(
      (r) => re.test(r.student?.name || "") || re.test(r.exam?.name || "")
    );
    const total = filtered.length;
    const items = filtered.slice(skip, skip + limit);
    return res.status(200).json(
      new ApiResponse(200, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } })
    );
  }

  const [items, total] = await Promise.all([
    query.sort({ createdAt: -1 }).skip(skip).limit(limit),
    Result.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  );
});

/**
 * @route GET /api/admin/results/export
 * @desc  Export all (optionally filtered) results to .xlsx.
 */
export const exportResults = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.student) filter.student = req.query.student;
  if (req.query.exam) filter.exam = req.query.exam;

  const results = await Result.find(filter).populate("student", "name email phone").populate("exam", "name topic").lean();

  const rows = results.map((r) => ({
    Student: r.student?.name || "",
    Email: r.student?.email || "",
    Phone: r.student?.phone || "",
    Test: r.exam?.name || "",
    Topic: r.exam?.topic || "",
    "Total Questions": r.totalQuestions,
    Correct: r.correct,
    Wrong: r.wrong,
    Skipped: r.skipped,
    "Obtained Marks": r.obtainedMarks,
    "Total Marks": r.totalMarks,
    "Percentage": r.percentage,
    Result: r.isPassed ? "Pass" : "Fail",
    "Time Taken (sec)": r.timeTakenSeconds,
    Date: new Date(r.createdAt).toLocaleString("en-IN"),
  }));

  const buffer = buildExcelBuffer(rows.length ? rows : [{ Student: "No results found" }], "Results");

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=results-export.xlsx");
  return res.status(200).send(buffer);
});
