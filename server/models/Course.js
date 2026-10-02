import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    shortTitle: { type: String, trim: true, default: "", maxlength: 80 },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, "Icon key is required"],
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    eligibility: { type: String, trim: true, default: "", maxlength: 240 },
    feeDisplay: { type: String, trim: true, default: "", maxlength: 120 },
    image: { type: String, trim: true, default: "" },
    features: { type: [String], default: [] },
    subjects: { type: [String], default: [] },
    batches: { type: [String], default: [] },
    ctaLabel: { type: String, trim: true, default: "Enquire now", maxlength: 80 },
    ctaHref: { type: String, trim: true, default: "#admission" },
    category: {
      type: String,
      enum: ["general", "programming", "office", "industry"],
      default: "general",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", CourseSchema);
