import mongoose from "mongoose";

const MediaAssetSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    url: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, min: 0, default: 0 },
    folder: { type: String, trim: true, default: "website" },
    altText: { type: String, trim: true, default: "", maxlength: 240 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

MediaAssetSchema.index({ createdAt: -1 });

export default mongoose.models.MediaAsset || mongoose.model("MediaAsset", MediaAssetSchema);
