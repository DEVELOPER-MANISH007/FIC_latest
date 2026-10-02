import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },
    subject: { type: String, trim: true, default: "", maxlength: 120 },
    experience: { type: String, trim: true, default: "", maxlength: 120 },
    specialization: { type: String, trim: true, default: "", maxlength: 300 },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: [true, "Image is required"],
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

export default mongoose.model("Faculty", FacultySchema);
