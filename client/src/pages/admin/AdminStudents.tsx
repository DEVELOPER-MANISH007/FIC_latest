import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchStudents, toggleStudentStatus, deleteStudent, getStudentId } from "@/services/api/adminStudent.service";
import type { StudentUser } from "@/types";

const AdminStudents = () => {
  const [students, setStudents] = useState<(StudentUser & { isActive?: boolean })[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleToggle = async (s: StudentUser & { isActive?: boolean }) => {
    const studentId = getStudentId(s);
    if (!studentId) return;
    await toggleStudentStatus(studentId, !s.isActive);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student account permanently?")) return;
    await deleteStudent(id);
    load();
  };

  return (
    <AdminLayout title="Student Management">
      <input
        className="field max-w-sm mb-6"
        placeholder="Search by name, email, phone or course..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="h-64 ph" />
        ) : (
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Course</th>
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
                  <td className="p-4 text-[var(--ink-soft)]">{s.email}</td>
                  <td className="p-4 text-[var(--ink-soft)]">{s.phone}</td>
                  <td className="p-4 text-[var(--ink-soft)]">{s.course || "—"}</td>
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
                      <button onClick={() => handleDelete(studentId)} className="text-red-500 font-medium hover:underline">
                        Delete
                      </button>
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
    </AdminLayout>
  );
};

export default AdminStudents;
