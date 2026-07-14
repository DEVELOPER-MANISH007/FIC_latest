import Student from "../models/Student.js";
import Result from "../models/Result.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/** Map Mongoose document to the shape the frontend expects (`id`, not `_id`). */
const publicStudent = (student) => ({
  id: student._id,
  name: student.name,
  email: student.email,
  username: student.username || "",
  phone: student.phone,
  address: student.address,
  course: student.course,
  batch: student.batch || "",
  photo: student.photo || "",
  studentIdCode: student.studentIdCode || "",
  isActive: student.isActive,
  createdAt: student.createdAt,
});

/**
 * @route GET /api/admin/students
 * @desc  List/search students. Query: page, limit, keyword
 */
export const getStudents = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.keyword) {
    const re = new RegExp(req.query.keyword, "i");
    filter.$or = [{ name: re }, { email: re }, { username: re }, { phone: re }, { course: re }, { batch: re }];
  }

  const [items, total] = await Promise.all([
    Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      items: items.map(publicStudent),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  );
});

/**
 * @route GET /api/admin/students/:id
 * @desc  Full student profile including their result history.
 */
export const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, "Student not found");

  const results = await Result.find({ student: student._id }).populate("exam", "name topic").sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { student: publicStudent(student), results }));
});

/** Shared uniqueness check for email/username on create + update. */
const assertUnique = async (field, value, excludeId) => {
  if (!value) return;
  const query = { [field]: value.toLowerCase(), ...(excludeId ? { _id: { $ne: excludeId } } : {}) };
  const taken = await Student.findOne(query);
  if (taken) throw new ApiError(409, `An account with this ${field} already exists`);
};

/**
 * @route POST /api/admin/students
 * @desc  Admin-only student account creation (#9 — public self-registration
 *        has been removed; this is now the only way a student account gets
 *        made). Password is hashed by the same Student pre("save") hook
 *        used everywhere else — never hashed here manually.
 * @access Admin only (protectAdmin applied at the router level)
 */
export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, phone, password, username, course, batch, address, isActive } = req.body;

  if (!name?.trim()) throw new ApiError(400, "Name is required");
  if (!email?.trim()) throw new ApiError(400, "Email is required");
  if (!phone?.trim()) throw new ApiError(400, "Mobile number is required");
  if (!password || password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  await assertUnique("email", email);
  if (username?.trim()) await assertUnique("username", username);

  const student = await Student.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password,
    ...(username?.trim() ? { username: username.trim().toLowerCase() } : {}),
    course: course?.trim() || "",
    batch: batch?.trim() || "",
    address: address?.trim() || "",
    isActive: isActive ?? true,
    createdBy: req.admin?._id,
  });

  return res.status(201).json(new ApiResponse(201, publicStudent(student), "Student account created"));
});

/**
 * @route PUT /api/admin/students/:id
 * @desc  Admin edits a student's profile fields. Password is intentionally
 *        NOT editable here — use PATCH /:id/reset-password for that, which
 *        keeps password changes on one clearly-audited code path.
 * @access Admin only
 */
export const updateStudent = asyncHandler(async (req, res) => {
  const { name, email, phone, username, course, batch, address, isActive } = req.body;

  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, "Student not found");

  if (email !== undefined && email.trim().toLowerCase() !== student.email) {
    await assertUnique("email", email, student._id);
    student.email = email.trim().toLowerCase();
  }
  if (username !== undefined) {
    const next = username.trim().toLowerCase();
    if (next && next !== student.username) {
      await assertUnique("username", next, student._id);
    }
    student.username = next || undefined;
  }

  if (name !== undefined) student.name = name.trim();
  if (phone !== undefined) student.phone = phone.trim();
  if (course !== undefined) student.course = course.trim();
  if (batch !== undefined) student.batch = batch.trim();
  if (address !== undefined) student.address = address.trim();
  if (isActive !== undefined) student.isActive = isActive;

  await student.save();
  return res.status(200).json(new ApiResponse(200, publicStudent(student), "Student updated"));
});

/**
 * @route PATCH /api/admin/students/:id/disable
 * @desc  Toggle (Activate/Deactivate) a student account's active state.
 */
export const toggleStudentStatus = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, "Student not found");

  student.isActive = req.body.isActive ?? !student.isActive;
  await student.save();

  return res
    .status(200)
    .json(new ApiResponse(200, publicStudent(student), student.isActive ? "Account enabled" : "Account disabled"));
});

/**
 * @route PATCH /api/admin/students/:id/reset-password
 * @desc  Admin sets a new password for a student who can't sign in
 *        (forgot password) — no old password required. Hashed by the same
 *        pre-save hook used at account creation, so the student can log in
 *        immediately with the new password.
 * @access Admin only (protectAdmin applied at the router level)
 */
export const resetStudentPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, "Student not found");

  student.password = newPassword; // pre("save") hook on Student hashes this with bcrypt
  await student.save();

  return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

/**
 * @route DELETE /api/admin/students/:id
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) throw new ApiError(404, "Student not found");
  return res.status(200).json(new ApiResponse(200, null, "Student deleted"));
});
