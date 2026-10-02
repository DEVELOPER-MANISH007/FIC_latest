import mongoose from "mongoose";

const HeroBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    subtitle: { type: String, trim: true, default: "", maxlength: 240 },
    description: { type: String, trim: true, default: "", maxlength: 1200 },
    image: { type: String, required: true, trim: true },
    mobileImage: { type: String, trim: true, default: "" },
    primaryCtaText: { type: String, trim: true, default: "", maxlength: 80 },
    primaryCtaHref: { type: String, trim: true, default: "" },
    secondaryCtaText: { type: String, trim: true, default: "", maxlength: 80 },
    secondaryCtaHref: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0, min: 0 },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
  },
  { timestamps: true }
);

HeroBannerSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.HeroBanner || mongoose.model("HeroBanner", HeroBannerSchema);
