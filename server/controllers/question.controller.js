import Question from "../models/Question.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { parseExcelBuffer, buildExcelBuffer, normalizeQuestionRow } from "../utils/excelHelper.js";

/**
 * @route GET /api/admin/questions
 * @desc  List questions with search/filter/sort/pagination.
 *        Query params: page, limit, category, difficulty, status,
 *        keyword, sortBy, sortOrder
 */
export const getQuestions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 200);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.keyword) filter.$text = { $search: req.query.keyword };

  const sortField = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Question.find(filter)
      .populate("category", "name slug")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Question.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});

/**
 * @route GET /api/admin/questions/:id
 */
export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id).populate("category", "name slug");
  if (!question) throw new ApiError(404, "Question not found");
  return res.status(200).json(new ApiResponse(200, question));
});

/**
 * @route POST /api/admin/questions
 */
export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create({ ...req.body, createdBy: req.admin?._id });
  return res.status(201).json(new ApiResponse(201, question, "Question created"));
});

/**
 * @route PUT /api/admin/questions/:id
 */
export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) throw new ApiError(404, "Question not found");
  return res.status(200).json(new ApiResponse(200, question, "Question updated"));
});

/**
 * @route DELETE /api/admin/questions/:id
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) throw new ApiError(404, "Question not found");
  return res.status(200).json(new ApiResponse(200, null, "Question deleted"));
});

/**
 * @route POST /api/admin/questions/:id/duplicate
 */
export const duplicateQuestion = asyncHandler(async (req, res) => {
  const original = await Question.findById(req.params.id).lean();
  if (!original) throw new ApiError(404, "Question not found");

  delete original._id;
  delete original.createdAt;
  delete original.updatedAt;
  original.question = `${original.question} (Copy)`;
  original.usageCount = 0;

  const copy = await Question.create(original);
  return res.status(201).json(new ApiResponse(201, copy, "Question duplicated"));
});

/**
 * @route POST /api/admin/questions/bulk-delete
 * @body  { ids: string[] }
 */
export const bulkDeleteQuestions = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) throw new ApiError(400, "Provide an array of question ids to delete");

  const result = await Question.deleteMany({ _id: { $in: ids } });
  return res.status(200).json(new ApiResponse(200, { deletedCount: result.deletedCount }, "Questions deleted"));
});

/**
 * @route POST /api/admin/questions/import
 * @desc  Bulk import questions from an uploaded .xlsx/.csv file.
 *        Categories are matched by name (case-insensitive), created
 *        automatically if missing. Rows failing validation or matching
 *        an existing question verbatim are reported back, not silently dropped.
 */
export const importQuestions = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file received. Upload a .csv or .xlsx file with the field name \"file\".");

  let rawRows;
  try {
    rawRows = parseExcelBuffer(req.file.buffer, {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error("[CSV Import] Parse failed:", err.message);
    throw new ApiError(400, err.message);
  }

  if (!rawRows.length) throw new ApiError(400, "The uploaded file has no data rows after the header row");

  const categoryCache = new Map();
  const getCategoryId = async (name) => {
    const categoryName = name?.trim() || "General";
    const key = categoryName.toLowerCase();
    if (categoryCache.has(key)) return categoryCache.get(key);
    let category = await Category.findOne({ name: new RegExp(`^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
    if (!category) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      category = await Category.create({ name: categoryName, slug: slug || "general" });
    }
    categoryCache.set(key, category._id);
    return category._id;
  };

  const imported = [];
  const failed = [];
  const duplicates = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 2; // account for header row
    const normalized = normalizeQuestionRow(rawRows[i]);

    const missing = ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer"].filter(
      (field) => !normalized[field]
    );
    if (missing.length || !["A", "B", "C", "D"].includes(normalized.correctAnswer)) {
      const detail = missing.length
        ? `Missing or empty: ${missing.join(", ")}`
        : `Correct Answer must be A, B, C, or D (got "${normalized.correctAnswer || ""}")`;
      failed.push({ row: rowNumber, reason: detail });
      continue;
    }

    const existing = await Question.findOne({ question: normalized.question });
    if (existing) {
      duplicates.push({ row: rowNumber, question: normalized.question });
      continue;
    }

    try {
      const categoryId = await getCategoryId(normalized.category);
      const doc = await Question.create({
        category: categoryId,
        topic: normalized.topic,
        question: normalized.question,
        optionA: normalized.optionA,
        optionB: normalized.optionB,
        optionC: normalized.optionC,
        optionD: normalized.optionD,
        correctAnswer: normalized.correctAnswer,
        difficulty: ["Easy", "Medium", "Hard"].includes(normalized.difficulty) ? normalized.difficulty : "Medium",
        marks: normalized.marks || 1,
        language: normalized.language || "English",
        explanation: normalized.explanation,
        createdBy: req.admin?._id,
      });
      imported.push(doc._id);
    } catch (err) {
      console.error(`[CSV Import] Row ${rowNumber} insert failed:`, err.message);
      failed.push({ row: rowNumber, reason: err.message || "Database insert failed" });
    }
  }

  return res.status(200).json(
    new ApiResponse(200, {
      importedCount: imported.length,
      failedCount: failed.length,
      duplicateCount: duplicates.length,
      failed,
      duplicates,
    }, "Import complete")
  );
});

/**
 * @route GET /api/admin/questions/export
 * @desc  Export questions to .xlsx. Optional filters: category, topic, difficulty.
 *        Omit all filters to export the complete database.
 */
export const exportQuestions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.topic) filter.topic = req.query.topic;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;

  const questions = await Question.find(filter).populate("category", "name").lean();

  const rows = questions.map((q) => ({
    Category: q.category?.name || "",
    Topic: q.topic,
    Question: q.question,
    "Option A": q.optionA,
    "Option B": q.optionB,
    "Option C": q.optionC,
    "Option D": q.optionD,
    "Correct Answer": q.correctAnswer,
    Difficulty: q.difficulty,
    Marks: q.marks,
    Language: q.language,
    Explanation: q.explanation,
  }));

  const buffer = buildExcelBuffer(rows.length ? rows : [{ Category: "", Question: "No questions matched these filters" }]);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=questions-export.xlsx");
  return res.status(200).send(buffer);
});

/**
 * @route GET /api/admin/questions/analytics
 * @desc  Question Bank analytics: totals, per-category, per-difficulty,
 *        recently added, unused, and most frequently used questions.
 */
export const getQuestionAnalytics = asyncHandler(async (req, res) => {
  const [total, byCategory, byDifficulty, recent, unused, frequentlyUsed] = await Promise.all([
    Question.countDocuments(),
    Question.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, category: "$category.name", count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Question.aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }]),
    Question.find().sort({ createdAt: -1 }).limit(10).select("question createdAt").populate("category", "name"),
    Question.find({ usageCount: 0 }).countDocuments(),
    Question.find().sort({ usageCount: -1 }).limit(10).select("question usageCount").populate("category", "name"),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total,
      byCategory,
      byDifficulty,
      recentlyAdded: recent,
      unusedCount: unused,
      frequentlyUsed,
    })
  );
});
