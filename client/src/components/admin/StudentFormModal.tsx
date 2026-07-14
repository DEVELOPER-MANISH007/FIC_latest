import { useState } from "react";
import FormField from "@/components/common/FormField";
import { getIcon } from "@/constants/iconMap";
import { createStudent, updateStudent } from "@/services/api/adminStudent.service";
import { useToast } from "@/context/ToastContext";
import type { StudentUser } from "@/types";

const CloseIcon = getIcon("close");

interface Props {
  student: (StudentUser & { isActive?: boolean }) | null;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Create/Edit a student account (#9 — Student Authentication Update).
 * Admin assigns Name, Email, Mobile, Username, Password, Course, Batch,
 * Status. Password is only collected on create — resetting an existing
 * student's password goes through the dedicated Reset Password action so
 * password changes stay on one clearly-audited path.
 */
const StudentFormModal = ({ student, onClose, onSaved }: Props) => {
  const toast = useToast();
  const isEdit = !!student;

  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [phone, setPhone] = useState(student?.phone || "");
  const [username, setUsername] = useState(student?.username || "");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState(student?.course || "");
  const [batch, setBatch] = useState(student?.batch || "");
  const [address, setAddress] = useState(student?.address || "");
  const [isActive, setIsActive] = useState(student?.isActive ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!phone.trim()) return setError("Mobile number is required");
    if (!isEdit && password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      if (isEdit && student) {
        await updateStudent(student.id, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          username: username.trim(),
          course: course.trim(),
          batch: batch.trim(),
          address: address.trim(),
          isActive,
        });
        toast.success("Student updated successfully");
      } else {
        await createStudent({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          username: username.trim(),
          course: course.trim(),
          batch: batch.trim(),
          address: address.trim(),
          isActive,
        });
        toast.success("Student account created");
      }
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not save the student account";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">{isEdit ? "Edit Student" : "Create Student"}</h2>
          <button onClick={onClose} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <FormField label="Mobile Number" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormField label="Username" id="username" optional value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Optional — for login" />
          </div>

          {!isEdit && (
            <FormField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Course" id="course" optional value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Python Full Stack" />
            <FormField label="Batch" id="batch" optional value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 2026-Morning" />
          </div>

          <FormField label="Address" id="address" optional value={address} onChange={(e) => setAddress(e.target.value)} />

          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-4 py-3 cursor-pointer">
            <span className="text-[13px] font-medium">Account Active</span>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </label>

          {error && <p className="text-[12.5px] text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Saving..." : isEdit ? "Update Student" : "Create Student"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
