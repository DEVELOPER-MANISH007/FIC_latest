import mongoose from "mongoose";

const WebsiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true, immutable: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.WebsiteSettings || mongoose.model("WebsiteSettings", WebsiteSettingsSchema);
