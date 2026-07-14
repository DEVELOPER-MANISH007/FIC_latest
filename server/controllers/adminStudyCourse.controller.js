import StudyCourse from "../models/StudyCourse.js";
import StudyMaterial from "../models/StudyMaterial.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * @route GET /api/admin/study-courses
 * @desc  Full course + subject list, including inactive ones, for the
 *        Course & Subject Management screen.
 */
export const getAdminStudyCourses = asyncHandler(async (req, res) => {
  const courses = await StudyCourse.find().sort({ order: 1, name: 1 });
  return res.status(200).json(new ApiResponse(200, courses));
});

/**
 * @route POST /api/admin/study-courses
 * @body  { name, description? }
 */
export const createStudyCourse = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) throw new ApiError(400, "Course name is required");

  const existing = await StudyCourse.findOne({ name: new RegExp(`^${escapeRegex(name.trim())}$`, "i") });
  if (existing) throw new ApiError(409, "A course with this name already exists");

  const course = await StudyCourse.create({
    name: name.trim(),
    description: description?.trim() || "",
    createdBy: req.admin?._id,
  });

  return res.status(201).json(new ApiResponse(201, course, "Course created"));
});

/**
 * @route PUT /api/admin/study-courses/:id
 * @body  { name?, description?, isActive? }
 */
export const updateStudyCourse = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;

  const course = await StudyCourse.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  if (name !== undefined && name.trim()) {
    const duplicate = await StudyCourse.findOne({
      _id: { $ne: course._id },
      name: new RegExp(`^${escapeRegex(name.trim())}$`, "i"),
    });
    if (duplicate) throw new ApiError(409, "A course with this name already exists");
    course.name = name.trim();
  }
  if (description !== undefined) course.description = description.trim();
  if (isActive !== undefined) course.isActive = isActive;

  await course.save();

  // Keep the denormalized snapshot on existing materials in sync.
  if (name !== undefined && name.trim()) {
    await StudyMaterial.updateMany({ course: course._id }, { courseName: course.name });
  }

  return res.status(200).json(new ApiResponse(200, course, "Course updated"));
});

/**
 * @route DELETE /api/admin/study-courses/:id
 */
export const deleteStudyCourse = asyncHandler(async (req, res) => {
  const inUse = await StudyMaterial.countDocuments({ course: req.params.id });
  if (inUse > 0) throw new ApiError(409, `Cannot delete — ${inUse} material(s) still use this course`);

  const course = await StudyCourse.findByIdAndDelete(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, null, "Course deleted"));
});

/**
 * @route POST /api/admin/study-courses/:id/subjects
 * @body  { name }
 */
export const addSubject = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) throw new ApiError(400, "Subject name is required");

  const course = await StudyCourse.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  const duplicate = course.subjects.some((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  if (duplicate) throw new ApiError(409, "A subject with this name already exists in this course");

  course.subjects.push({ name: name.trim() });
  await course.save();

  return res.status(201).json(new ApiResponse(201, course, "Subject added"));
});

/**
 * @route PUT /api/admin/study-courses/:id/subjects/:subjectId
 * @body  { name?, isActive? }
 */
export const updateSubject = asyncHandler(async (req, res) => {
  const { name, isActive } = req.body;

  const course = await StudyCourse.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  const subject = course.subjects.id(req.params.subjectId);
  if (!subject) throw new ApiError(404, "Subject not found");

  const renamed = name !== undefined && name.trim() && name.trim() !== subject.name;
  if (renamed) {
    const duplicate = course.subjects.some(
      (s) => s._id.toString() !== subject._id.toString() && s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) throw new ApiError(409, "A subject with this name already exists in this course");
    subject.name = name.trim();
  }
  if (isActive !== undefined) subject.isActive = isActive;

  await course.save();

  if (renamed) {
    await StudyMaterial.updateMany({ subjectId: subject._id }, { subjectName: subject.name });
  }

  return res.status(200).json(new ApiResponse(200, course, "Subject updated"));
});

/**
 * @route DELETE /api/admin/study-courses/:id/subjects/:subjectId
 */
export const deleteSubject = asyncHandler(async (req, res) => {
  const inUse = await StudyMaterial.countDocuments({ subjectId: req.params.subjectId });
  if (inUse > 0) throw new ApiError(409, `Cannot delete — ${inUse} material(s) still use this subject`);

  const course = await StudyCourse.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  const subject = course.subjects.id(req.params.subjectId);
  if (!subject) throw new ApiError(404, "Subject not found");

  subject.deleteOne();
  await course.save();

  return res.status(200).json(new ApiResponse(200, course, "Subject deleted"));
});
