import mongoose from "mongoose";

/**
 * A Test is a reusable exam configuration created by the Admin.
 * `categoryDistribution` drives the random question generator —
 * e.g. [{ category: id_of_ComputerFundamentals, count: 15 }, ...].
 * If left empty, the generator pulls `totalQuestions` randomly from
 * the given `topic` (legacy/simple mode) across any category.
 */
const TestSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, default: 15 }, // minutes
    totalQuestions: { type: Number, required: true, default: 50 },
    topic: { type: String, trim: true, default: "Basic Computer" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Mixed"], default: "Mixed" },
    passingMarks: { type: Number, required: true, default: 60 }, // percentage
    categoryDistribution: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        count: { type: Number, min: 1 },
      },
    ],
    isActive: { type: Boolean, default: true },
    allowRetest: { type: Boolean, default: false },
    showExplanationAfterSubmit: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Test", TestSchema);

