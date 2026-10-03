import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

const publicAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

/**
 * @route POST /api/admin/auth/login
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password +authVersion");
  if (!admin) throw new ApiError(401, "Invalid email or password");

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const token = generateToken(admin._id, "admin", { authVersion: admin.authVersion || 0 });

  return res.status(200).json(new ApiResponse(200, { token, admin: publicAdmin(admin) }, "Login successful"));
});

/** @route PATCH /api/admin/auth/account — verify current password before changes. */
export const updateAdminAccount = asyncHandler(async (req, res) => {
  const { currentPassword, adminId, newPassword, confirmPassword } = req.body;
  if (typeof currentPassword !== "string" || !currentPassword) throw new ApiError(400, "Enter your current password to confirm these changes");
  if (adminId !== undefined && (typeof adminId !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminId.trim()))) {
    throw new ApiError(400, "Enter a valid admin email / ID");
  }
  if (newPassword !== undefined && (typeof newPassword !== "string" || newPassword.length < 12 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword))) {
    throw new ApiError(400, "New password must be at least 12 characters and include upper-case, lower-case, number and symbol characters");
  }
  if (newPassword && newPassword !== confirmPassword) throw new ApiError(400, "New password and confirmation do not match");

  const admin = await Admin.findById(req.admin._id).select("+password +authVersion");
  if (!admin || !(await admin.comparePassword(currentPassword))) throw new ApiError(401, "Current password is incorrect");

  const nextEmail = typeof adminId === "string" ? adminId.trim().toLowerCase() : admin.email;
  if (nextEmail !== admin.email) {
    const existing = await Admin.findOne({ email: nextEmail, _id: { $ne: admin._id } }).select("_id");
    if (existing) throw new ApiError(409, "This admin ID is already in use");
    admin.email = nextEmail;
  }
  if (newPassword) admin.password = newPassword;
  admin.authVersion = Number(admin.authVersion || 0) + 1;
  await admin.save();

  const token = generateToken(admin._id, "admin", { authVersion: admin.authVersion });
  return res.status(200).json(new ApiResponse(200, { token, admin: publicAdmin(admin) }, "Admin account updated. Other sessions have been signed out."));
});

/**
 * @route GET /api/admin/auth/me
 */
export const getAdminMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, publicAdmin(req.admin)));
});
