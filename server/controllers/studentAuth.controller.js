import crypto from "crypto";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

const publicStudent = (student) => ({
  id: student._id,
  name: student.name,
  email: student.email,
  phone: student.phone,
  address: student.address,
  course: student.course,
  photo: student.photo || "",
  studentIdCode: student.studentIdCode || "",
  createdAt: student.createdAt,
});

/**
 * @route POST /api/student/auth/signup
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password, address, course } = req.body;

  const existing = await Student.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const student = await Student.create({ name, email, phone, password, address, course });
  const token = generateToken(student._id, "student");

  return res
    .status(201)
    .json(new ApiResponse(201, { token, student: publicStudent(student) }, "Account created successfully"));
});

/**
 * @route POST /api/student/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email: email.toLowerCase() }).select("+password");
  if (!student) throw new ApiError(401, "Invalid email or password");
  if (!student.isActive) throw new ApiError(403, "This account has been disabled. Please contact the institute.");

  const isMatch = await student.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const token = generateToken(student._id, "student");

  return res.status(200).json(new ApiResponse(200, { token, student: publicStudent(student) }, "Login successful"));
});

/**
 * @route GET /api/student/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, publicStudent(req.student)));
});

/**
 * @route PUT /api/student/auth/profile
 * @desc  Student edits their own profile: name, phone, email, address,
 *        course and student ID.
 * @access Student
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, email, address, course, studentIdCode } = req.body;

  const student = await Student.findById(req.student._id);
  if (!student) throw new ApiError(404, "Student not found");

  if (email && email.toLowerCase() !== student.email) {
    const taken = await Student.findOne({ email: email.toLowerCase(), _id: { $ne: student._id } });
    if (taken) throw new ApiError(409, "An account with this email already exists");
    student.email = email.toLowerCase();
  }

  if (name !== undefined) student.name = name;
  if (phone !== undefined) student.phone = phone;
  if (address !== undefined) student.address = address;
  if (course !== undefined) student.course = course;
  if (studentIdCode !== undefined) student.studentIdCode = studentIdCode;

  await student.save();
  return res.status(200).json(new ApiResponse(200, publicStudent(student), "Profile updated"));
});

/**
 * @route POST /api/student/auth/profile-photo
 * @desc  Upload a profile photo (multipart field: "photo").
 * @access Student
 */
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please choose an image to upload");

  const student = await Student.findById(req.student._id);
  if (!student) throw new ApiError(404, "Student not found");

  const { persistUploadedImage } = await import("../utils/imageUpload.js");
  student.photo = await persistUploadedImage(req.file, "students");
  await student.save();

  return res.status(200).json(new ApiResponse(200, publicStudent(student), "Profile photo updated"));
});

/**
 * @route POST /api/student/auth/change-password
 * @desc  Verifies the current password, then saves the new one.
 *        Hashing is done with bcrypt via the Student model's pre-save hook.
 * @access Student
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) throw new ApiError(400, "Current and new password are required");
  if (newPassword.length < 6) throw new ApiError(400, "New password must be at least 6 characters");
  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirmation do not match");
  }

  const student = await Student.findById(req.student._id).select("+password");
  if (!student) throw new ApiError(404, "Student not found");

  const isMatch = await student.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  student.password = newPassword;
  await student.save();

  return res.status(200).json(new ApiResponse(200, null, "Password updated successfully"));
});

/**
 * @route POST /api/student/auth/forgot-password
 * Architecture ready: generates a reset token and (if email is configured)
 * emails a reset link. Does not reveal whether the email exists.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({ email: email.toLowerCase() });

  if (student) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    student.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    student.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await student.save();
    // Email sending is architecture-ready via services/email.service.js;
    // wire up sendPasswordResetEmail(student, resetToken) once SMTP creds are set.
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "If an account exists for this email, a reset link has been sent."));
});

/**
 * @route POST /api/student/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const student = await Student.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!student) throw new ApiError(400, "Reset link is invalid or has expired");

  student.password = password;
  student.resetPasswordToken = undefined;
  student.resetPasswordExpires = undefined;
  await student.save();

  return res.status(200).json(new ApiResponse(200, null, "Password reset successful — please log in"));
});
