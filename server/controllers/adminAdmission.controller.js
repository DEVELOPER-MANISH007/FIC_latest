import Admission from "../models/Admission.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { toCSV } from "../utils/csvExport.js";

const ALLOWED_STATUSES = ["new", "contacted", "admitted", "closed"];

/** Builds the shared Mongo filter from query params (keyword/mobile search + course filter). */
const buildFilter = (query) => {
  const filter = {};

  if (query.keyword) {
    const re = new RegExp(query.keyword, "i");
    filter.$or = [{ name: re }, { phone: re }, { fatherName: re }, { email: re }];
  }
  if (query.course) {
    filter.course = query.course;
  }
  if (query.status && ALLOWED_STATUSES.includes(query.status)) {
    filter.status = query.status;
  }

  return filter;
};

/**
 * @route GET /api/admin/admissions
 * @desc  List admission form submissions — search by name/mobile,
 *        filter by course/status, sorted latest first, paginated.
 */
export const getAdmissions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = buildFilter(req.query);

  const [items, total] = await Promise.all([
    Admission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Admission.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});

/**
 * @route GET /api/admin/admissions/export
 * @desc  Export the (filtered) admission list as a CSV file.
 */
export const exportAdmissions = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const items = await Admission.find(filter).sort({ createdAt: -1 });

  const csv = toCSV(
    items.map((a) => ({
      name: a.name,
      fatherName: a.fatherName,
      phone: a.phone,
      email: a.email,
      course: a.course,
      qualification: a.qualification,
      address: a.address,
      status: a.status,
      submittedAt: a.createdAt?.toISOString(),
    })),
    [
      { key: "name", label: "Student Name" },
      { key: "fatherName", label: "Father's Name" },
      { key: "phone", label: "Mobile Number" },
      { key: "email", label: "Email" },
      { key: "course", label: "Course" },
      { key: "qualification", label: "Qualification" },
      { key: "address", label: "Address" },
      { key: "status", label: "Status" },
      { key: "submittedAt", label: "Date & Time" },
    ]
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=admission-forms.csv");
  return res.status(200).send(csv);
});

/**
 * @route GET /api/admin/admissions/:id
 * @desc  View full details of a single admission submission.
 */
export const getAdmissionById = asyncHandler(async (req, res) => {
  const admission = await Admission.findById(req.params.id);
  if (!admission) throw new ApiError(404, "Admission form not found");
  return res.status(200).json(new ApiResponse(200, admission));
});

/**
 * @route PUT /api/admin/admissions/:id
 * @desc  Update the status of an admission submission (New / Contacted / Admitted).
 */
export const updateAdmissionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(422, "Status must be one of: new, contacted, admitted, closed");
  }

  const admission = await Admission.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!admission) throw new ApiError(404, "Admission form not found");

  return res.status(200).json(new ApiResponse(200, admission, "Status updated"));
});

/**
 * @route DELETE /api/admin/admissions/:id
 */
export const deleteAdmission = asyncHandler(async (req, res) => {
  const admission = await Admission.findByIdAndDelete(req.params.id);
  if (!admission) throw new ApiError(404, "Admission form not found");
  return res.status(200).json(new ApiResponse(200, null, "Admission form deleted"));
});
