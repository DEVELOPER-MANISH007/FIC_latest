import Student from "../models/Student.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Result from "../models/Result.js";
import Admission from "../models/Admission.js";
import Contact from "../models/Contact.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route GET /api/admin/dashboard
 * @desc  Summary cards for the Admin Dashboard: Total Students,
 *        Total Questions, Total Tests, Today's Attempts, Average Score,
 *        Recent Registrations, Total/Today's Admissions & Enquiries.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalQuestions,
    totalTests,
    todaysAttempts,
    avgScoreAgg,
    recentRegistrations,
    totalAdmissions,
    totalEnquiries,
    todaysAdmissions,
    todaysEnquiries,
  ] = await Promise.all([
    Student.countDocuments(),
    Question.countDocuments(),
    Exam.countDocuments(),
    ExamAttempt.countDocuments({ createdAt: { $gte: startOfToday } }),
    Result.aggregate([{ $group: { _id: null, avg: { $avg: "$percentage" } } }]),
    Student.find().sort({ createdAt: -1 }).limit(5).select("name email course createdAt"),
    Admission.countDocuments(),
    Contact.countDocuments(),
    Admission.countDocuments({ createdAt: { $gte: startOfToday } }),
    Contact.countDocuments({ createdAt: { $gte: startOfToday } }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalStudents,
      totalQuestions,
      totalTests,
      todaysAttempts,
      averageScore: avgScoreAgg[0] ? Math.round(avgScoreAgg[0].avg * 100) / 100 : 0,
      recentRegistrations,
      totalAdmissions,
      totalEnquiries,
      todaysAdmissions,
      todaysEnquiries,
    })
  );
});

/**
 * @route GET /api/admin/dashboard/analytics
 * @desc  Charts data: average score trend, pass percentage, top
 *        students, recent attempts, most difficult questions
 *        (lowest correct rate).
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const [passVsFail, topStudents, recentAttempts, allResults] = await Promise.all([
    Result.aggregate([{ $group: { _id: "$isPassed", count: { $sum: 1 } } }]),
    Result.aggregate([
      { $sort: { percentage: -1 } },
      { $limit: 10 },
      { $lookup: { from: "students", localField: "student", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $project: { _id: 0, name: "$student.name", percentage: 1, obtainedMarks: 1, totalMarks: 1 } },
    ]),
    ExamAttempt.find({ status: "submitted" })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate("student", "name")
      .populate("exam", "name"),
    Result.find().select("percentage createdAt"),
  ]);

  // Most difficult questions: lowest correct-rate, derived from ExamAttempt sub-documents.
  const difficultyAgg = await ExamAttempt.aggregate([
    { $match: { status: "submitted" } },
    { $unwind: "$questions" },
    {
      $group: {
        _id: "$questions.question",
        attempts: { $sum: 1 },
        correct: { $sum: { $cond: ["$questions.isCorrect", 1, 0] } },
      },
    },
    { $match: { attempts: { $gte: 1 } } },
    { $addFields: { correctRate: { $divide: ["$correct", "$attempts"] } } },
    { $sort: { correctRate: 1 } },
    { $limit: 10 },
    { $lookup: { from: "questions", localField: "_id", foreignField: "_id", as: "question" } },
    { $unwind: "$question" },
    { $project: { _id: 0, question: "$question.question", attempts: 1, correct: 1, correctRate: 1 } },
  ]);

  const passCount = passVsFail.find((p) => p._id === true)?.count || 0;
  const failCount = passVsFail.find((p) => p._id === false)?.count || 0;

  return res.status(200).json(
    new ApiResponse(200, {
      passVsFail: { pass: passCount, fail: failCount },
      topStudents,
      recentAttempts,
      mostDifficultQuestions: difficultyAgg,
      scoreDistribution: allResults.map((r) => ({ percentage: r.percentage, date: r.createdAt })),
    })
  );
});
