import mongoose from "mongoose";

/**
 * A reusable Exam/Test template configured by the Admin.
 * `categoryDistribution` allows building a paper like:
 * Computer Fundamentals -> 15, MS Word -> 5, etc. (Test Generator).
 * If left empty, questions are pulled from `topic`/overall pool instead.
 */
const ExamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    // Test Builder: the ordered list of questions belonging to THIS test only.
    // When non-empty, attempts load exactly these questions - never the global pool.
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    durationMinutes: { type: Number, required: true, default: 15 },
    totalQuestions: { type: Number, required: true, default: 50 },
    topic: { type: String, trim: true, default: "Basic Computer" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Mixed"], default: "Mixed" },
    passingPercentage: { type: Number, default: 60 },
    categoryDistribution: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        count: { type: Number, required: true },
      },
    ],
    // ---- Student-wise / Batch-wise Test Assignment ----
    // When assignToAll is true (the default — preserves original behaviour
    // for every test that existed before this feature), every logged-in
    // student can see/attempt the test, exactly as before.
    // When false, only students listed in assignedStudents may see or
    // attempt it. assignedStudents is always the final, already-resolved
    // list of student IDs (batch picks are expanded into student IDs and
    // merged with individually added/removed students at save time).
    assignToAll: { type: Boolean, default: true },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student", index: true }],
    allowRetest: { type: Boolean, default: false },
    // Deprecated: answer keys/correct-answer review are no longer ever shown
    // to students (see attempt.controller.js getResultById) — kept on the
    // schema only so existing documents don't lose the field.
    showExplanationAfterSubmit: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

    // ---- Secure Exam Mode / anti-cheating configuration (admin-editable) ----
    fullscreenRequired: { type: Boolean, default: true },
    tabSwitchDetectionEnabled: { type: Boolean, default: true },
    maxViolations: { type: Number, default: 3, min: 1 },
    autoSubmitOnMaxViolations: { type: Boolean, default: true },
    calculatorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", ExamSchema);
