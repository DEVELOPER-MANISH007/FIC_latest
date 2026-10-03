import Category from "../models/Category.js";
import Question from "../models/Question.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const toSlug = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * @route GET /api/categories
 * @access Public — students need category names for exam context
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, categories));
});

/**
 * @route POST /api/admin/categories
 * @access Admin — lets new categories be added without touching code
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) throw new ApiError(400, "Category name is required");

  const slug = toSlug(name);
  const existing = await Category.findOne({ slug });
  if (existing) throw new ApiError(409, "A category with this name already exists");

  const category = await Category.create({ name: name.trim(), slug, description });
  return res.status(201).json(new ApiResponse(201, category, "Category created"));
});

/**
 * @route PUT /api/admin/categories/:id
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  const update = {};
  if (name) {
    update.name = name.trim();
    update.slug = toSlug(name);
  }
  if (description !== undefined) update.description = description;
  if (isActive !== undefined) update.isActive = isActive;

  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, "Category not found");

  return res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

/**
 * @route DELETE /api/admin/categories/:id
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Question.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    throw new ApiError(409, `Cannot delete — ${inUse} question(s) still use this category`);
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  return res.status(200).json(new ApiResponse(200, null, "Category deleted"));
});

