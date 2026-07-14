import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import ResetPasswordModal from "@/components/admin/ResetPasswordModal";
import StudentFormModal from "@/components/admin/StudentFormModal";
import { getIcon } from "@/constants/iconMap";
import { fetchStudents, toggleStudentStatus, deleteStudent, getStudentId } from "@/services/api/adminStudent.service";
import { useToast } from "@/context/ToastContext";
import type { StudentUser } from "@/types";

const PlusIcon = getIcon("plus");
const EditIcon = getIcon("edit");

type StudentRow = StudentUser & { isActive?: boolean };

const AdminStudents = () => {
  const toast = useToast();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);
  const [formTarget, setFormTarget] = useState<StudentRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    fetchStudents({ keyword }).then((data) => {
      setStudents((data?.items as any) || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleToggle = async (s: StudentRow) => {
    const studentId = getStudentId(s);
    if (!studentId) return;
    await toggleStudentStatus(studentId, !s.isActive);
    toast.success(s.isActive ? "Account disabled" : "Account enabled");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student account permanently?")) return;
    await deleteStudent(id);
    toast.success("Student account deleted");
    load();
  };

  const openCreate = () => {
    setFormTarget(null);
    setShowForm(true);
  };

  const openEdit = (s: StudentRow) => {
    setFormTarget(s);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    load();
  };

  return (
    <AdminLayout title="Student Management">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          className="field max-w-sm"
          placeholder="Search by name, email, username, phone, course..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={openCreate} className="btn btn-primary btn-sm ml-auto">
          <PlusIcon size={14} /> Create Student
        </button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="h-64 ph" />
        ) : (
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="p-4">Name</th>
                <th className="p-4">Email / Username</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Course / Batch</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const studentId = getStudentId(s);
                return (
                <tr key={studentId ?? s.email} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-4 font-medium">
                    {studentId ? (
                      <Link to={`/admin/students/${studentId}`} className="text-[var(--royal)] hover:underline">
                        {s.name}
                      </Link>
                    ) : (
                      <span>{s.name}</span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--ink-soft)]">
                    <p>{s.email}</p>
                    {s.username && <p className="text-[11.5px]">@{s.username}</p>}
                  </td>
                  <td className="p-4 text-[var(--ink-soft)]">{s.phone}</td>
                  <td className="p-4 text-[var(--ink-soft)]">
                    <p>{s.course || "—"}</p>
                    {s.batch && <p className="text-[11.5px]">{s.batch}</p>}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(s)}
                      disabled={!studentId}
                      className={s.isActive === false ? "text-red-500 font-medium" : "text-green-600 font-medium"}
                    >
                      {s.isActive === false ? "Disabled" : "Active"}
                    </button>
                  </td>
                  <td className="p-4">
                    {studentId ? (
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(s)} className="text-[var(--ink-soft)] hover:text-[var(--royal)]" title="Edit">
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={() => setResetTarget({ id: studentId, name: s.name })}
                          className="text-[var(--royal)] font-medium hover:underline"
                        >
                          Reset Password
                        </button>
                        <button onClick={() => handleDelete(studentId)} className="text-red-500 font-medium hover:underline">
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-[var(--ink-soft)]">—</span>
                    )}
                  </td>
                </tr>
              );})}
              {students.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-[var(--ink-soft)]">No students found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {resetTarget && (
        <ResetPasswordModal
          studentId={resetTarget.id}
          studentName={resetTarget.name}
          onClose={() => setResetTarget(null)}
        />
      )}

      {showForm && (
        <StudentFormModal student={formTarget} onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}
    </AdminLayout>
  );
};

export default AdminStudents;
