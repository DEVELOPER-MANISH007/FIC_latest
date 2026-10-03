import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    // Every Test Builder question belongs to exactly one Exam. Legacy
    // question-bank rows (exam: null) are still readable but new tests
    // only ever load questions scoped to their own examId.
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", default: null, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    topic: { type: String, trim: true, default: "" },
    question: { type: String, required: [true, "Question text is required"], trim: true },
    optionA: { type: String, required: true, trim: true },
    optionB: { type: String, required: true, trim: true },
    optionC: { type: String, required: true, trim: true },
    optionD: { type: String, required: true, trim: true },
    correctAnswer: { type: String, required: true, enum: ["A", "B", "C", "D"] },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    marks: { type: Number, default: 1, min: 0 },
    language: { type: String, default: "English", trim: true },
    explanation: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // Future-ready fields (architecture only — not yet exposed in UI)
    hasNegativeMarking: { type: Boolean, default: false },
    negativeMarks: { type: Number, default: 0 },
    allowMultipleCorrect: { type: Boolean, default: false },
    correctAnswers: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
    codeSnippet: { type: String, default: "" },

    usageCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

QuestionSchema.index({ category: 1, difficulty: 1, status: 1 });
QuestionSchema.index({ exam: 1, status: 1 });
QuestionSchema.index({ question: "text", topic: "text" });

export default mongoose.model("Question", QuestionSchema);

