import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { parseExcelBuffer, normalizeQuestionRow } from "../utils/excelHelper.js";

/**
 * @route GET /api/exams
 * @desc  List active exams — used by the Student Dashboard
 *        ("My Tests" / "Upcoming Tests").
 * @access Student
 */
export const getActiveExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ isActive: true }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, exams));
});

/**
 * @route GET /api/exams/:id
 * @access Student
 */
export const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam || !exam.isActive) throw new ApiError(404, "Test not found or is no longer active");
  return res.status(200).json(new ApiResponse(200, exam));
});

/**
 * @route GET /api/admin/exams
 * @access Admin
 */
export const getAllExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().populate("categoryDistribution.category", "name").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, exams));
});

/**
 * @route POST /api/admin/exams
 * @desc  Create Test — Test Name, Duration, Number of Questions, Topic,
 *        Passing Marks, Active/Inactive, plus optional category distribution
 *        for the Test Generator (e.g. Computer Fundamentals -> 15, MS Word -> 5).
 * @access Admin
 */
export const createExam = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    durationMinutes,
    totalQuestions,
    topic,
    difficulty,
    passingPercentage,
    categoryDistribution,
    allowRetest,
    showExplanationAfterSubmit,
    isActive,
    fullscreenRequired,
    tabSwitchDetectionEnabled,
    maxViolations,
    autoSubmitOnMaxViolations,
    calculatorEnabled,
  } = req.body;

  if (!name || !durationMinutes) {
    throw new ApiError(400, "Test name and duration are required");
  }

  if (categoryDistribution?.length) {
    const distributionTotal = categoryDistribution.reduce((sum, d) => sum + Number(d.count || 0), 0);
    if (distributionTotal !== Number(totalQuestions)) {
      throw new ApiError(
        400,
        `Category distribution (${distributionTotal}) must add up to the total number of questions (${totalQuestions})`
      );
    }
  }

  const exam = await Exam.create({
    name,
    description,
    category,
    durationMinutes,
    totalQuestions: totalQuestions || 0,
    topic,
    difficulty,
    passingPercentage,
    categoryDistribution,
    allowRetest,
    showExplanationAfterSubmit,
    isActive,
    fullscreenRequired,
    tabSwitchDetectionEnabled,
    maxViolations,
    autoSubmitOnMaxViolations,
    calculatorEnabled,
    createdBy: req.admin._id,
  });

  return res.status(201).json(new ApiResponse(201, exam, "Test created successfully"));
});

/**
 * @route PUT /api/admin/exams/:id
 * @access Admin
 */
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!exam) throw new ApiError(404, "Test not found");
  return res.status(200).json(new ApiResponse(200, exam, "Test updated"));
});

/**
 * @route DELETE /api/admin/exams/:id
 * @desc  Deletes a test AND every question that belongs to it —
 *        exam-scoped questions never outlive their test.
 * @access Admin
 */
export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) throw new ApiError(404, "Test not found");
  await Question.deleteMany({ exam: exam._id });
  return res.status(200).json(new ApiResponse(200, null, "Test deleted"));
});

// ==========================================================
// Test Builder — exam-scoped question management
// ==========================================================

const REQUIRED_QUESTION_FIELDS = ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer"];

const validateQuestionPayload = (payload) => {
  const missing = REQUIRED_QUESTION_FIELDS.filter((f) => !String(payload[f] ?? "").trim());
  if (missing.length) throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  if (!["A", "B", "C", "D"].includes(payload.correctAnswer)) {
    throw new ApiError(400, "Correct answer must be A, B, C or D");
  }
};

/** Keeps exam.totalQuestions in sync with its own question list. */
const syncExamQuestionCount = async (examId) => {
  const exam = await Exam.findById(examId);
  if (!exam) return;
  exam.totalQuestions = exam.questions.length;
  await exam.save();
};

/**
 * @route GET /api/admin/exams/:id
 * @desc  Test Builder — full test config with its own questions populated
 *        in their saved order.
 * @access Admin
 */
export const getAdminExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id).populate("questions");
  if (!exam) throw new ApiError(404, "Test not found");
  return res.status(200).json(new ApiResponse(200, exam));
});

/**
 * @route POST /api/admin/exams/:examId/questions
 * @desc  Add Question (manual) — creates the question scoped to this exam
 *        only and appends it to the test's ordered question list.
 * @access Admin
 */
export const addExamQuestion = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) throw new ApiError(404, "Test not found");

  validateQuestionPayload(req.body);

  const question = await Question.create({
    exam: exam._id,
    question: req.body.question,
    optionA: req.body.optionA,
    optionB: req.body.optionB,
    optionC: req.body.optionC,
    optionD: req.body.optionD,
    correctAnswer: req.body.correctAnswer,
    difficulty: ["Easy", "Medium", "Hard"].includes(req.body.difficulty) ? req.body.difficulty : "Medium",
    marks: Number(req.body.marks) || 1,
    explanation: req.body.explanation || "",
    topic: req.body.topic || exam.category || "",
    status: "Active",
    createdBy: req.admin?._id,
  });

  exam.questions.push(question._id);
  exam.totalQuestions = exam.questions.length;
  await exam.save();

  return res.status(201).json(new ApiResponse(201, question, "Question added to test"));
});

/**
 * @route PUT /api/admin/exams/:examId/questions/:questionId
 * @access Admin
 */
export const updateExamQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.questionId, exam: req.params.examId });
  if (!question) throw new ApiError(404, "Question not found in this test");

  validateQuestionPayload({ ...question.toObject(), ...req.body });

  const editable = ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "difficulty", "marks", "explanation", "topic"];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) question[field] = req.body[field];
  });
  await question.save();

  return res.status(200).json(new ApiResponse(200, question, "Question updated"));
});

/**
 * @route DELETE /api/admin/exams/:examId/questions/:questionId
 * @access Admin
 */
export const deleteExamQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findOneAndDelete({ _id: req.params.questionId, exam: req.params.examId });
  if (!question) throw new ApiError(404, "Question not found in this test");

  await Exam.findByIdAndUpdate(req.params.examId, { $pull: { questions: question._id } });
  await syncExamQuestionCount(req.params.examId);

  return res.status(200).json(new ApiResponse(200, null, "Question removed from test"));
});

/**
 * @route POST /api/admin/exams/:examId/questions/:questionId/duplicate
 * @access Admin
 */
export const duplicateExamQuestion = asyncHandler(async (req, res) => {
  const original = await Question.findOne({ _id: req.params.questionId, exam: req.params.examId }).lean();
  if (!original) throw new ApiError(404, "Question not found in this test");

  delete original._id;
  delete original.createdAt;
  delete original.updatedAt;
  original.question = `${original.question} (Copy)`;
  original.usageCount = 0;

  const copy = await Question.create(original);
  await Exam.findByIdAndUpdate(req.params.examId, { $push: { questions: copy._id } });
  await syncExamQuestionCount(req.params.examId);

  return res.status(201).json(new ApiResponse(201, copy, "Question duplicated"));
});

/**
 * @route POST /api/admin/exams/:examId/questions/import
 * @desc  Import CSV/XLSX — every imported question belongs to THIS TEST
 *        ONLY. Nothing is written to any global pool.
 * @access Admin
 */
export const importExamQuestions = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) throw new ApiError(404, "Test not found");
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

  const imported = [];
  const failed = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 2; // account for header row
    const normalized = normalizeQuestionRow(rawRows[i]);

    const missing = REQUIRED_QUESTION_FIELDS.filter((field) => !normalized[field]);
    if (missing.length || !["A", "B", "C", "D"].includes(normalized.correctAnswer)) {
      const detail = missing.length
        ? `Missing or empty: ${missing.join(", ")}`
        : `Correct Answer must be A, B, C, or D (got "${normalized.correctAnswer || ""}")`;
      failed.push({ row: rowNumber, reason: detail });
      continue;
    }

    try {
      const doc = await Question.create({
        exam: exam._id,
        topic: normalized.topic || exam.category || "",
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
        status: "Active",
        createdBy: req.admin?._id,
      });
      imported.push(doc._id);
    } catch (err) {
      console.error(`[CSV Import] Row ${rowNumber} insert failed:`, err.message);
      failed.push({ row: rowNumber, reason: err.message || "Database insert failed" });
    }
  }

  if (imported.length) {
    await Exam.findByIdAndUpdate(exam._id, { $push: { questions: { $each: imported } } });
    await syncExamQuestionCount(exam._id);
  }

  const updated = await Exam.findById(exam._id).populate("questions");

  return res.status(200).json(
    new ApiResponse(
      200,
      { importedCount: imported.length, failedCount: failed.length, failed, exam: updated },
      "Import complete"
    )
  );
});
