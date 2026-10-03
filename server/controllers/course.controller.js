import Course from "../models/Course.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route   GET /api/courses
 * @desc    List all active courses, ordered for display.
 *          Supports optional ?category= and ?featured=true filters.
 * @access  Public
 */
export const getCourses = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === "true") filter.featured = true;

  const courses = await Course.find(filter).sort({ order: 1, createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, courses));
});

/**
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json(new ApiResponse(404, null, "Course not found"));
  }
  return res.status(200).json(new ApiResponse(200, course));
});

