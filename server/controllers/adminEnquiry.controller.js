import Contact from "../models/Contact.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { toCSV } from "../utils/csvExport.js";

const ALLOWED_STATUSES = ["new", "read", "resolved"];

const buildFilter = (query) => {
  const filter = {};

  if (query.keyword) {
    const re = new RegExp(query.keyword, "i");
    filter.$or = [{ name: re }, { phone: re }, { email: re }, { message: re }];
  }
  if (query.status && ALLOWED_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  return filter;
};

/**
 * @route GET /api/admin/enquiries
 * @desc  List contact/enquiry submissions — search, filter by status,
 *        sorted latest first, paginated.
 */
export const getEnquiries = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = buildFilter(req.query);

  const [items, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});

/**
 * @route GET /api/admin/enquiries/export
 * @desc  Export the (filtered) enquiry list as a CSV file.
 */
export const exportEnquiries = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const items = await Contact.find(filter).sort({ createdAt: -1 });

  const csv = toCSV(
    items.map((c) => ({
      name: c.name,
      phone: c.phone,
      email: c.email,
      message: c.message,
      status: c.status,
      submittedAt: c.createdAt?.toISOString(),
    })),
    [
      { key: "name", label: "Name" },
      { key: "phone", label: "Mobile" },
      { key: "email", label: "Email" },
      { key: "message", label: "Message" },
      { key: "status", label: "Status" },
      { key: "submittedAt", label: "Date & Time" },
    ]
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=enquiry-forms.csv");
  return res.status(200).send(csv);
});

/**
 * @route GET /api/admin/enquiries/:id
 */
export const getEnquiryById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new ApiError(404, "Enquiry not found");
  return res.status(200).json(new ApiResponse(200, contact));
});

/**
 * @route PUT /api/admin/enquiries/:id
 * @desc  Update the status of an enquiry (New / Read / Resolved).
 */
export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(422, "Status must be one of: new, read, resolved");
  }

  const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!contact) throw new ApiError(404, "Enquiry not found");

  return res.status(200).json(new ApiResponse(200, contact, "Status updated"));
});

/**
 * @route DELETE /api/admin/enquiries/:id
 */
export const deleteEnquiry = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) throw new ApiError(404, "Enquiry not found");
  return res.status(200).json(new ApiResponse(200, null, "Enquiry deleted"));
});
