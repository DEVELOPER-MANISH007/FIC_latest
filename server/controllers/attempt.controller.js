import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Result from "../models/Result.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { shuffleArray, shuffleOptionOrder } from "../utils/shuffle.js";

const VIOLATION_TYPES = [
  "fullscreen-exit",
  "tab-switch",
  "window-blur",
  "refresh-attempt",
  "devtools-detected",
  "copy-paste-attempt",
  "other",
];

/**
 * Builds the student-facing view of a paper — never includes correctAnswer,
 * and never includes any other student's data. `exam` here is the
 * populated Exam doc (name + the Secure Exam Mode settings only — never
 * the raw `questions` ref list), so the client always has an authoritative,
 * server-issued copy of what security rules apply to this test.
 */
const buildPaperView = (attempt, studentName) => ({
  attemptId: attempt._id,
  examName: attempt.exam?.name || "Test",
  studentName,
  startedAt: attempt.startedAt,
  expiresAt: attempt.expiresAt,
  status: attempt.status,
  violationCount: attempt.violationCount || 0,
  settings: {
    fullscreenRequired: attempt.exam?.fullscreenRequired ?? true,
    tabSwitchDetectionEnabled: attempt.exam?.tabSwitchDetectionEnabled ?? true,
    maxViolations: attempt.exam?.maxViolations ?? 3,
    autoSubmitOnMaxViolations: attempt.exam?.autoSubmitOnMaxViolations ?? true,
    calculatorEnabled: attempt.exam?.calculatorEnabled ?? false,
  },
  questions: attempt.questions.map((aq, index) => {
    const q = aq.question;
    const optionTextByLetter = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD };
    return {
      index,
      questionId: q._id,
      text: q.question,
      options: aq.optionOrder.map((origLetter, i) => ({
        letter: "ABCD"[i],
        text: optionTextByLetter[origLetter],
      })),
      selectedAnswer: aq.selectedAnswer,
      isMarkedForReview: aq.isMarkedForReview,
      marks: q.marks,
    };
  }),
});

const EXAM_SETTINGS_FIELDS = "name fullscreenRequired tabSwitchDetectionEnabled maxViolations autoSubmitOnMaxViolations calculatorEnabled passingPercentage";

/**
 * Selects `count` random active questions from a pool, given optional
 * category/topic/difficulty filters — the core Random Question Generator
 * used both for plain topic-based tests and category-distribution tests.
 */
const pickRandomQuestions = async (filter, count) => {
  // exam: null — the random pool must never contain questions that belong
  // to a specific test (Test Builder questions are exam-scoped).
  const pool = await Question.find({ ...filter, exam: null, status: "Active" }).select("_id");
  if (pool.length < count) {
    throw new ApiError(
      400,
      `Not enough questions available (${pool.length} found, ${count} required) for this test configuration`
    );
  }
  const chosen = shuffleArray(pool).slice(0, count);
  return chosen.map((q) => q._id);
};

const generateQuestionIds = async (exam) => {
  // Test Builder exams own their questions: load ONLY the questions that
  // belong to this test. Never pull questions from another test or pool.
  if (exam.questions?.length) {
    const own = await Question.find({ _id: { $in: exam.questions }, exam: exam._id, status: "Active" }).select("_id");
    if (!own.length) throw new ApiError(400, "This test has no active questions yet. Please contact the institute.");
    // Server-side randomization: every student gets the same question set,
    // shuffled into a different order — never reproducible from the client.
    return shuffleArray(own.map((q) => q._id));
  }

  if (exam.categoryDistribution?.length) {
    const all = [];
    for (const dist of exam.categoryDistribution) {
      const ids = await pickRandomQuestions({ category: dist.category }, dist.count);
      all.push(...ids);
    }
    return shuffleArray(all);
  }

  const filter = {};
  if (exam.topic) filter.topic = new RegExp(exam.topic, "i");
  if (exam.difficulty && exam.difficulty !== "Mixed") filter.difficulty = exam.difficulty;

  try {
    return await pickRandomQuestions(filter, exam.totalQuestions);
  } catch {
    // Fall back to the full active pool if the topic filter is too narrow —
    // keeps the exam usable while the question bank is still being built out.
    return await pickRandomQuestions({}, exam.totalQuestions);
  }
};

/** Grades one attempt, persists a Result, and marks the attempt submitted. */
const finalizeAttempt = async (attemptDoc, autoSubmitReason = "") => {
  const attempt = await ExamAttempt.findById(attemptDoc._id).populate("questions.question");

  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let obtainedMarks = 0;
  let totalMarks = 0;

  attempt.questions.forEach((aq) => {
    const q = aq.question;
    totalMarks += q.marks;

    if (!aq.selectedAnswer) {
      skipped += 1;
      aq.isCorrect = null;
      aq.marks = 0;
      return;
    }

    const displayIndex = "ABCD".indexOf(aq.selectedAnswer);
    const originalLetter = aq.optionOrder[displayIndex];
    const isCorrect = originalLetter === q.correctAnswer;

    if (isCorrect) {
      correct += 1;
      obtainedMarks += q.marks;
      aq.marks = q.marks;
    } else {
      wrong += 1;
      aq.marks = 0;
    }
    aq.isCorrect = isCorrect;
  });

  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  if (autoSubmitReason) attempt.autoSubmitReason = autoSubmitReason;
  await attempt.save();

  await Question.updateMany(
    { _id: { $in: attempt.questions.map((q) => q.question._id) } },
    { $inc: { usageCount: 1 } }
  );

  const exam = await Exam.findById(attempt.exam);
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 10000) / 100 : 0;
  const isPassed = percentage >= (exam?.passingPercentage ?? 60);
  const timeTakenSeconds = Math.round((attempt.submittedAt - attempt.startedAt) / 1000);

  const result = await Result.findOneAndUpdate(
    { student: attempt.student, exam: attempt.exam },
    {
      student: attempt.student,
      exam: attempt.exam,
      attempt: attempt._id,
      totalQuestions: attempt.questions.length,
      correct,
      wrong,
      skipped,
      totalMarks,
      obtainedMarks,
      percentage,
      isPassed,
      timeTakenSeconds,
    },
    { upsert: true, new: true, setDefaultErrors: true }
  );

  return result;
};

/**
 * @route POST /api/exams/:examId/start
 * @desc  Starts a new attempt (or resumes an in-progress one) — enforces
 *        "one attempt only unless admin allows a retest" and persists the
 *        timer (startedAt/expiresAt) in MongoDB so it survives refresh/close.
 * @access Student
 */
export const startAttempt = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam || !exam.isActive) throw new ApiError(404, "Test not found or is no longer active");

  const existingResult = await Result.findOne({ student: req.student._id, exam: exam._id });
  if (existingResult && !exam.allowRetest) {
    throw new ApiError(403, "You have already attempted this test. Retesting is not enabled for this test.");
  }

  const inProgress = await ExamAttempt.findOne({
    student: req.student._id,
    exam: exam._id,
    status: "in-progress",
  })
    .populate("questions.question")
    .populate("exam", EXAM_SETTINGS_FIELDS);

  if (inProgress) {
    if (new Date() > inProgress.expiresAt) {
      await finalizeAttempt(inProgress, "time-expired");
      throw new ApiError(403, "Your previous attempt's time expired and has been auto-submitted.");
    }
    return res.status(200).json(new ApiResponse(200, buildPaperView(inProgress, req.student.name), "Resuming your in-progress test"));
  }

  const questionIds = await generateQuestionIds(exam);
  const durationSeconds = exam.durationMinutes * 60;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationSeconds * 1000);

  const attempt = await ExamAttempt.create({
    student: req.student._id,
    exam: exam._id,
    questions: questionIds.map((qId) => ({
      question: qId,
      // Server-side randomization: each student gets their own shuffled
      // A/B/C/D order; the mapping back to the real answer never leaves the server.
      optionOrder: shuffleOptionOrder(),
      selectedAnswer: null,
      isMarkedForReview: false,
    })),
    startedAt,
    durationSeconds,
    expiresAt,
    status: "in-progress",
  });

  const populated = await ExamAttempt.findById(attempt._id)
    .populate("questions.question")
    .populate("exam", EXAM_SETTINGS_FIELDS);
  return res.status(201).json(new ApiResponse(201, buildPaperView(populated, req.student.name), "Test started"));
});

/**
 * @route GET /api/attempts/:attemptId
 * @desc  Fetches the current state of an attempt — auto-submits server-side
 *        if the timer has already expired (covers refresh/browser-close cases).
 * @access Student (owner only)
 */
export const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findById(req.params.attemptId)
    .populate("questions.question")
    .populate("exam", EXAM_SETTINGS_FIELDS);
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (String(attempt.student) !== String(req.student._id)) throw new ApiError(403, "Not authorized");

  if (attempt.status === "in-progress" && new Date() > attempt.expiresAt) {
    const result = await finalizeAttempt(attempt, "time-expired");
    return res.status(200).json(new ApiResponse(200, { autoSubmitted: true, resultId: result._id }, "Time expired — test auto-submitted"));
  }

  return res.status(200).json(new ApiResponse(200, buildPaperView(attempt, req.student.name)));
});

/**
 * @route PATCH /api/attempts/:attemptId/answer
 * @desc  Auto-save — persists a single selected answer / review flag
 *        immediately into MongoDB so no answer is ever lost.
 * @body  { questionIndex, selectedAnswer?, isMarkedForReview? }
 * @access Student (owner only)
 */
export const saveAnswer = asyncHandler(async (req, res) => {
  const { questionIndex, selectedAnswer, isMarkedForReview } = req.body;
  if (questionIndex === undefined) throw new ApiError(400, "questionIndex is required");

  const attempt = await ExamAttempt.findById(req.params.attemptId);
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (String(attempt.student) !== String(req.student._id)) throw new ApiError(403, "Not authorized");
  if (attempt.status !== "in-progress") throw new ApiError(400, "This test has already been submitted");

  if (new Date() > attempt.expiresAt) {
    await finalizeAttempt(attempt, "time-expired");
    throw new ApiError(403, "Time expired — this test has been auto-submitted");
  }

  const q = attempt.questions[questionIndex];
  if (!q) throw new ApiError(400, "Invalid question index");

  if (selectedAnswer !== undefined) q.selectedAnswer = selectedAnswer;
  if (isMarkedForReview !== undefined) q.isMarkedForReview = isMarkedForReview;

  await attempt.save();
  return res.status(200).json(new ApiResponse(200, { saved: true }));
});

/**
 * @route POST /api/attempts/:attemptId/violation
 * @desc  Suspicious Activity Log — records one anti-cheating violation
 *        (fullscreen exit, tab switch, devtools, copy/paste attempt, etc.)
 *        server-side, and auto-submits once the exam's configured
 *        maxViolations is reached (if autoSubmitOnMaxViolations is on).
 *        This is the authoritative enforcement point — the frontend only
 *        detects and reports; it can never be the one deciding whether an
 *        attempt gets force-submitted.
 * @body  { type, meta? }
 * @access Student (owner only)
 */
export const logViolation = asyncHandler(async (req, res) => {
  const { type, meta } = req.body;
  if (!VIOLATION_TYPES.includes(type)) throw new ApiError(400, "Invalid violation type");

  const attempt = await ExamAttempt.findById(req.params.attemptId).populate("exam", EXAM_SETTINGS_FIELDS);
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (String(attempt.student) !== String(req.student._id)) throw new ApiError(403, "Not authorized");
  if (attempt.status !== "in-progress") {
    return res.status(200).json(new ApiResponse(200, { violationCount: attempt.violationCount, autoSubmitted: false }));
  }

  attempt.violations.push({ type, meta: String(meta || "").slice(0, 200), userAgent: req.headers["user-agent"] || "" });
  attempt.violationCount += 1;
  await attempt.save();

  const maxViolations = attempt.exam?.maxViolations ?? 3;
  const autoSubmitEnabled = attempt.exam?.autoSubmitOnMaxViolations ?? true;

  if (autoSubmitEnabled && attempt.violationCount >= maxViolations) {
    const result = await finalizeAttempt(attempt, "max-violations");
    return res.status(200).json(
      new ApiResponse(200, { violationCount: attempt.violationCount, autoSubmitted: true, resultId: result._id }, "Maximum violations reached — test auto-submitted")
    );
  }

  return res.status(200).json(new ApiResponse(200, { violationCount: attempt.violationCount, autoSubmitted: false }));
});

/**
 * @route POST /api/attempts/:attemptId/submit
 * @access Student (owner only)
 */
export const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findById(req.params.attemptId);
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (String(attempt.student) !== String(req.student._id)) throw new ApiError(403, "Not authorized");
  if (attempt.status !== "in-progress") throw new ApiError(400, "This test has already been submitted");

  const result = await finalizeAttempt(attempt, "manual");
  return res.status(200).json(new ApiResponse(200, { resultId: result._id }, "Test submitted successfully"));
});

/**
 * @route GET /api/attempts/results/:resultId
 * @desc  Result summary only — score, percentage, pass/fail, time taken.
 *        Per policy, the answer key / correct-answer breakdown is NEVER
 *        returned to students, regardless of any exam setting: only Admin
 *        has access to that (via the Question Bank / Test Builder).
 * @access Student (owner only)
 */
export const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.resultId).populate("exam", "name topic passingPercentage");
  if (!result) throw new ApiError(404, "Result not found");
  if (String(result.student) !== String(req.student._id)) throw new ApiError(403, "Not authorized");

  return res.status(200).json(new ApiResponse(200, { result }));
});

/**
 * @route GET /api/student/results
 * @desc  Previous Results list for the Student Dashboard.
 * @access Student
 */
export const getMyResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ student: req.student._id }).populate("exam", "name topic").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, results));
});
