import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, trim: true, default: "Student", maxlength: 120 },
    quote: { type: String, required: true, trim: true, maxlength: 1500 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    image: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

TestimonialSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
