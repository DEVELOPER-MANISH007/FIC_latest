import Admission from "../models/Admission.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendAdmissionNotification } from "../services/email.service.js";

/**
 * @route   POST /api/admissions
 * @desc    Submit a new admission enquiry — validates, persists to
 *          MongoDB, fires an (optional) email notification, and
 *          returns a success response. This is an enquiry only,
 *          not a confirmed admission.
 * @access  Public
 */
export const createAdmission = asyncHandler(async (req, res) => {
  const { name, phone, email, fatherName, address, course, qualification, message } = req.body;

  const admission = await Admission.create({
    name,
    phone,
    email,
    fatherName,
    address,
    course,
    qualification,
    message,
  });

  // Fire-and-forget — a failed email must never block the API response.
  sendAdmissionNotification(admission).catch(() => {});

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { id: admission._id },
        "Your enquiry has been received. This confirms your enquiry only, not an admission — our team will contact you shortly."
      )
    );
});

/**
 * @route   GET /api/admissions
 * @desc    List admission enquiries (newest first).
 *          Reserved for the future admin panel.
 * @access  Public for now (architecture ready for admin-only auth)
 */
export const getAdmissions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Admission.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Admission.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});
