import Contact from "../models/Contact.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendContactNotification } from "../services/email.service.js";

/**
 * @route   POST /api/contact
 * @desc    Submit a contact message — validates, persists to MongoDB,
 *          fires an (optional) email notification, and returns
 *          a success response.
 * @access  Public
 */
export const createContact = asyncHandler(async (req, res) => {
  const { name, phone, email, course, message } = req.body;

  const contact = await Contact.create({ name, phone, email, course, message });

  sendContactNotification(contact).catch(() => {});

  return res
    .status(201)
    .json(new ApiResponse(201, { id: contact._id }, "Thank you — your message has been received."));
});

/**
 * @route   GET /api/contact
 * @desc    List contact messages (newest first). Reserved for admin panel.
 * @access  Public for now (architecture ready for admin-only auth)
 */
export const getContacts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});
