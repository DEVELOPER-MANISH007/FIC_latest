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
      default: function () {
        return this.title ? `Practical training in ${this.title}.` : "";
      },
      trim: true,
    },
    icon: {
      type: String,
      default: "monitor",
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
      // `general` remains supported for existing records; new CMS courses use
      // the five catalog categories below.
      enum: ["general", "office", "programming", "professional", "industry", "design"],
      default: "office",
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
