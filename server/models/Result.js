import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    attempt: { type: mongoose.Schema.Types.ObjectId, ref: "ExamAttempt", required: true },
    totalQuestions: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    skipped: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    isPassed: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number, required: true },
  },
  { timestamps: true }
);

ResultSchema.index({ student: 1, exam: 1 }, { unique: true });

export default mongoose.model("Result", ResultSchema);

