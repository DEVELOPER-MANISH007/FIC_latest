import Faculty from "../models/Faculty.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route   GET /api/faculty
 * @desc    List all active faculty members, ordered for display.
 * @access  Public
 */
export const getFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, faculty));
});

