/**
 * Student-wise / Batch-wise Test Assignment — single source of truth for
 * "can this student see/attempt this exam" so the rule can never drift
 * between the list endpoint, the detail endpoint, and the start-attempt
 * endpoint. Never trust the frontend for this decision.
 *
 * @param {{ assignToAll?: boolean, assignedStudents?: Array<any> }} exam
 * @param {string | import("mongoose").Types.ObjectId} studentId
 */
export const canStudentAccessExam = (exam, studentId) => {
  if (!exam) return false;
  if (exam.assignToAll) return true;
  return (exam.assignedStudents || []).some((id) => String(id) === String(studentId));
};

/** Mongo query clause — use alongside { isActive: true } wherever exams are listed for a student. */
export const examVisibilityFilter = (studentId) => ({
  $or: [{ assignToAll: true }, { assignedStudents: studentId }],
});

