import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";

const getTokenFromHeader = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
};

/**
 * Verifies the JWT and attaches the authenticated student to req.student.
 * Rejects if the account has been disabled by an admin.
 */
export const protectStudent = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) throw new ApiError(401, "Not authorized — please log in");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Session expired — please log in again");
  }

  if (decoded.role !== "student") throw new ApiError(403, "Student access only");

  const student = await Student.findById(decoded.id);
  if (!student) throw new ApiError(401, "Student account not found");
  if (!student.isActive) throw new ApiError(403, "This account has been disabled. Please contact the institute.");

  req.student = student;
  next();
});

/**
 * Verifies the JWT and attaches the authenticated admin to req.admin.
 */
export const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) throw new ApiError(401, "Not authorized — please log in");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Session expired — please log in again");
  }

  if (decoded.role !== "admin") throw new ApiError(403, "Admin access only");

  const admin = await Admin.findById(decoded.id).select("+authVersion");
  if (!admin) throw new ApiError(401, "Admin account not found");
  if (Number(decoded.authVersion || 0) !== Number(admin.authVersion || 0)) {
    throw new ApiError(401, "Your session has expired — please log in again");
  }

  req.admin = admin;
  next();
});
