import mongoose from "mongoose";

/** Fixed set of material categories — legacy, optional. Kept for backward
 *  compatibility with materials uploaded before the Subject/Unit redesign. */
export const STUDY_MATERIAL_CATEGORIES = [
  "Notes",
  "Assignments",
  "Practice Questions",
  "Previous Year Papers",
  "Cheat Sheets",
  "Projects",
  "Code Examples",
  "Interview Questions",
];

export const STUDY_MATERIAL_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

/**
 * A single uploaded study-material file.
 *
 * Structure (current): Subject -> Topic (title) -> Unit, with a
 * Public / Enrolled-Only visibility flag. Free-text `subject`/`unit` — no
 * Course selection required.
 *
 * Legacy fields (`course`, `courseName`, `subjectId`, `subjectName`,
 * `category`, `difficulty`, `module`) are kept, optional, for materials
 * uploaded under the earlier Course -> Subject -> Category structure. See
 * `server/scripts/migrateStudyMaterial.js` for the one-time backfill that
 * populates `subject`/`unit` on those older records.
 */
const StudyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Topic/Notes title is required"], trim: true },
    description: { type: String, trim: true, default: "" },

    // Current structure — free text, no dynamic Course catalogue required.
    subject: { type: String, trim: true, required: [true, "Subject name is required"] },
    unit: { type: String, trim: true, required: [true, "Unit name is required"] },

    // Legacy (pre-redesign) linkage — optional, retained for old records only.
    course: { type: mongoose.Schema.Types.ObjectId, ref: "StudyCourse" },
    courseName: { type: String, trim: true, default: "" },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    subjectName: { type: String, trim: true, default: "" },
    category: { type: String, enum: [...STUDY_MATERIAL_CATEGORIES, ""], default: "" },
    module: { type: String, trim: true, default: "" }, // superseded by `unit`
    difficulty: { type: String, enum: [...STUDY_MATERIAL_DIFFICULTIES, ""], default: "" },

    fileUrl: { type: String, required: [true, "File is required"] },
    fileType: { type: String, enum: ["pdf", "zip", "docx", "ppt", "image", "file"], required: true },
    fileName: { type: String, trim: true, default: "" },
    fileSize: { type: Number, required: true, default: 0 }, // bytes
    // Only present when stored on Cloudinary — lets us clean up the remote
    // file on edit/delete without guessing the public id back from the URL.
    filePublicId: { type: String, default: "" },
    fileResourceType: { type: String, default: "" },

    visibility: { type: String, enum: ["public", "enrolled"], default: "public" },
    downloadCount: { type: Number, default: 0 },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StudyMaterialSchema.index({ title: "text", subject: "text", unit: "text", courseName: "text", subjectName: "text" });
StudyMaterialSchema.index({ subject: 1 });
StudyMaterialSchema.index({ course: 1, subjectId: 1, category: 1 });
StudyMaterialSchema.index({ visibility: 1, isActive: 1 });

export default mongoose.model("StudyMaterial", StudyMaterialSchema);
