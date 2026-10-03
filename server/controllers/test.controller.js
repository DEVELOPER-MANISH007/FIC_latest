import Test from "../models/Test.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route GET /api/tests
 * @desc  Public/student list of active tests (available to take).
 * @access Private (student)
 */
export const getActiveTests = asyncHandler(async (req, res) => {
  const tests = await Test.find({ isActive: true }).select("-categoryDistribution").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, tests));
});

/**
 * @route GET /api/admin/tests
 * @access Private (admin)
 */
export const getAllTests = asyncHandler(async (req, res) => {
  const tests = await Test.find().populate("categoryDistribution.category", "name").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, tests));
});

/**
 * @route POST /api/admin/tests
 * @access Private (admin)
 */
export const createTest = asyncHandler(async (req, res) => {
  const test = await Test.create(req.body);
  return res.status(201).json(new ApiResponse(201, test, "Test created"));
});

/**
 * @route PUT /api/admin/tests/:id
 * @access Private (admin)
 */
export const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!test) throw new ApiError(404, "Test not found");
  return res.status(200).json(new ApiResponse(200, test, "Test updated"));
});

/**
 * @route DELETE /api/admin/tests/:id
 * @access Private (admin)
 */
export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndDelete(req.params.id);
  if (!test) throw new ApiError(404, "Test not found");
  return res.status(200).json(new ApiResponse(200, null, "Test deleted"));
});

