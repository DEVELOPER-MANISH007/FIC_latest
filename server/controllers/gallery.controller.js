import Gallery from "../models/Gallery.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route   GET /api/gallery
 * @desc    List all active gallery images, optionally filtered by
 *          ?category=. Ordered for display.
 * @access  Public
 */
export const getGallery = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;

  const items = await Gallery.find(filter).sort({ order: 1, createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, items));
});

