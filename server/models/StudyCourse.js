import mongoose from "mongoose";

/** A subject nested inside a Course (e.g. Course "Data Science" -> Subjects "Python", "Pandas"). */
const StudySubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Subject name is required"], trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Dynamic Course + Subject catalogue used by the Study Material module.
 * Kept separate from the public marketing `Course` model (which powers the
 * homepage course cards) so this feature never touches existing UI/data.
 * Admin can create unlimited courses, each with unlimited subjects, with
 * no code changes required.
 */
const StudyCourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      unique: true,
    },
    description: { type: String, trim: true, default: "" },
    subjects: { type: [StudySubjectSchema], default: [] },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("StudyCourse", StudyCourseSchema);
