import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import TestAssignmentModal from "@/components/admin/TestAssignmentModal";
import { fetchAllExams, updateExam, deleteExam } from "@/services/api/adminExam.service";
import type { ExamConfig } from "@/types";

/**
 * Test Management — lists all tests. Creating or editing a test opens
 * the Test Builder, where the test's own questions are managed
 * (manual add or per-test CSV import).
 */
const AdminExams = () => {
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningExam, setAssigningExam] = useState<ExamConfig | null>(null);

  const load = () =>
    fetchAllExams()
      .then((e) => setExams(e || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (exam: ExamConfig) => {
    // Activating opens the Test Assignment popup so the admin can choose
    // who gets access before the test goes live. Deactivating stays instant.
    if (!exam.isActive) {
      setAssigningExam(exam);
      return;
    }
    await updateExam(exam._id, { isActive: false });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test and all of its questions?")) return;
    await deleteExam(id);
    load();
  };

  return (
    <AdminLayout title="Test Management">
      <div className="flex justify-end mb-6">
        <Link to="/admin/exams/new" className="btn btn-primary btn-sm">
          + Create Test
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
              <th className="p-4">Test Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Questions</th>
              <th className="p-4">Passing %</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id} className="border-b border-[var(--line)] last:border-0">
                <td className="p-4 font-medium">{exam.name}</td>
                <td className="p-4">{exam.category || exam.topic || "—"}</td>
                <td className="p-4">{exam.durationMinutes} min</td>
                <td className="p-4">{exam.totalQuestions}</td>
                <td className="p-4">{exam.passingPercentage}%</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(exam)}
                    className={exam.isActive ? "text-green-600 font-medium" : "text-[var(--ink-soft)] font-medium"}
                  >
                    {exam.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link to={`/admin/exams/${exam._id}/builder`} className="text-[var(--royal)] font-medium hover:underline">
                      Edit
                    </Link>
                    {exam.isActive && (
                      <button onClick={() => setAssigningExam(exam)} className="text-[var(--royal)] font-medium hover:underline">
                        Manage Access
                      </button>
                    )}
                    <button onClick={() => handleDelete(exam._id)} className="text-red-500 font-medium hover:underline">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && exams.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--ink-soft)]">
                  No tests created yet. Click "+ Create Test" to open the Test Builder.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {assigningExam && (
        <TestAssignmentModal
          exam={assigningExam}
          onClose={() => setAssigningExam(null)}
          onSaved={() => {
            setAssigningExam(null);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminExams;

