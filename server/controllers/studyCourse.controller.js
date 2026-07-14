import StudyCourse from "../models/StudyCourse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route   GET /api/study-courses
 * @desc    List active courses with their active subjects only.
 *          Used by the Student "Study Material" browser and by the Admin
 *          upload form's Course -> Subject dropdowns.
 * @access  Public
 */
export const getStudyCourses = asyncHandler(async (req, res) => {
  const courses = await StudyCourse.find({ isActive: true }).sort({ order: 1, name: 1 });

  const shaped = courses.map((course) => ({
    _id: course._id,
    name: course.name,
    description: course.description,
    subjects: course.subjects.filter((subject) => subject.isActive).map((subject) => ({
      _id: subject._id,
      name: subject.name,
    })),
  }));

  return res.status(200).json(new ApiResponse(200, shaped));
});
