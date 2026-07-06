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
  phone: student.phone,
  address: student.address,
  course: student.course,
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
    filter.$or = [{ name: re }, { email: re }, { phone: re }, { course: re }];
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

/**
 * @route PATCH /api/admin/students/:id/disable
 * @desc  Toggle a student account's active/disabled state.
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
 * @route DELETE /api/admin/students/:id
 */
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) throw new ApiError(404, "Student not found");
  return res.status(200).json(new ApiResponse(200, null, "Student deleted"));
});
