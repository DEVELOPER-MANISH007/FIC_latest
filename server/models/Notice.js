import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    summary: { type: String, trim: true, default: "", maxlength: 500 },
    body: { type: String, trim: true, default: "", maxlength: 12000 },
    category: {
      type: String,
      enum: ["Admission", "Exam", "Result", "Holiday", "Course", "General", "Important"],
      default: "General",
    },
    priority: { type: String, enum: ["normal", "important", "urgent"], default: "normal" },
    link: { type: String, trim: true, default: "" },
    attachment: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    pinned: { type: Boolean, default: false },
    order: { type: Number, default: 0, min: 0 },
    publishAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NoticeSchema.index({ isActive: 1, pinned: -1, publishAt: -1, expiresAt: 1 });

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
