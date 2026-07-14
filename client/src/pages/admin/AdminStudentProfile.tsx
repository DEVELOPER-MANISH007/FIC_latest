import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import ResetPasswordModal from "@/components/admin/ResetPasswordModal";
import StudentFormModal from "@/components/admin/StudentFormModal";
import { fetchStudentProfile } from "@/services/api/adminStudent.service";
import type { ExamResult, StudentUser } from "@/types";

const AdminStudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const studentId = id && id !== "undefined" ? id : undefined;
  const [student, setStudent] = useState<(StudentUser & { isActive?: boolean }) | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const load = () => {
    if (!studentId) return;
    setError("");
    fetchStudentProfile(studentId)
      .then((data) => {
        if (data) {
          setStudent(data.student);
          setResults(data.results);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Could not load student profile");
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  if (!studentId) {
    return (
      <AdminLayout title="Student Profile">
        <p className="text-[13.5px] text-red-500">Invalid student link.</p>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Student Profile">
        <p className="text-[13.5px] text-red-500">{error}</p>
      </AdminLayout>
    );
  }

  if (!student) return <AdminLayout title="Student Profile"><div className="h-64 ph card" /></AdminLayout>;

  return (
    <AdminLayout title="Student Profile">
      <div className="card p-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="font-display font-bold text-2xl">{student.name}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]">
              Edit
            </button>
            <button onClick={() => setShowReset(true)} className="btn btn-outline btn-sm !text-[var(--royal)] !border-[var(--line)]">
              Reset Password
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-[13.5px]">
          <div><p className="text-[var(--ink-soft)]">Email</p><p className="font-medium">{student.email}</p></div>
          <div><p className="text-[var(--ink-soft)]">Username</p><p className="font-medium">{student.username ? `@${student.username}` : "—"}</p></div>
          <div><p className="text-[var(--ink-soft)]">Phone</p><p className="font-medium">{student.phone}</p></div>
          <div><p className="text-[var(--ink-soft)]">Course</p><p className="font-medium">{student.course || "—"}</p></div>
          <div><p className="text-[var(--ink-soft)]">Batch</p><p className="font-medium">{student.batch || "—"}</p></div>
          <div><p className="text-[var(--ink-soft)]">Address</p><p className="font-medium">{student.address || "—"}</p></div>
          <div><p className="text-[var(--ink-soft)]">Status</p><p className={`font-medium ${student.isActive === false ? "text-red-500" : "text-green-600"}`}>{student.isActive === false ? "Disabled" : "Active"}</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Test History</h3>
        {results.length === 0 ? (
          <p className="text-[13.5px] text-[var(--ink-soft)]">No test attempts yet.</p>
        ) : (
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="p-3">Test</th>
                <th className="p-3">Score</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-3">{typeof r.exam === "string" ? "Test" : r.exam?.name || "Test (removed)"}</td>
                  <td className="p-3">{r.obtainedMarks}/{r.totalMarks}</td>
                  <td className="p-3">{r.percentage}%</td>
                  <td className="p-3">
                    <span className={r.isPassed ? "text-green-600" : "text-red-500"}>{r.isPassed ? "Pass" : "Fail"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showReset && (
        <ResetPasswordModal studentId={studentId} studentName={student.name} onClose={() => setShowReset(false)} />
      )}

      {showEdit && (
        <StudentFormModal
          student={student}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminStudentProfile;
