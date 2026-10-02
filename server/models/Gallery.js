import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Campus", "Classroom", "Lab", "Events", "Workshops", "Seminars", "Students", "Achievements", "Computer Lab", "Smart Classroom", "Practical Sessions", "Institute Building", "Students Learning", "Other"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    caption: { type: String, trim: true, default: "", maxlength: 500 },
    eventName: { type: String, trim: true, default: "", maxlength: 160 },
    eventDate: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false },
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

export default mongoose.model("Gallery", GallerySchema);
