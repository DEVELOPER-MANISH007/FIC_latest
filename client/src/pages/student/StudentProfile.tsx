import { useRef, useState, type FormEvent } from "react";
import StudentLayout from "@/components/student/StudentLayout";
import { useAuth } from "@/context/AuthContext";
import {
  updateStudentProfile,
  uploadStudentPhoto,
} from "@/services/api/studentAuth.service";
import { resolveImageUrl } from "@/services/api/axiosInstance";

/**
 * My Profile — view and edit personal details, upload a profile photo.
 */
const StudentProfile = () => {
  const { student, updateStudent } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    address: student?.address || "",
    course: student?.course || "",
    studentIdCode: student?.studentIdCode || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const updated = await updateStudentProfile(form);
      if (updated) updateStudent(updated);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Could not update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setUploading(true);
    try {
      const updated = await uploadStudentPhoto(file);
      if (updated) updateStudent(updated);
      setMessage({ type: "success", text: "Profile photo updated." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Could not upload photo." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <StudentLayout title="My Profile">
      <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Photo card */}
        <div className="card p-8 flex flex-col items-center text-center">
          {student?.photo ? (
            <img
              src={resolveImageUrl(student.photo)}
              alt={`${student.name} profile`}
              className="w-28 h-28 rounded-full object-cover bg-[var(--bg-soft)]"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-[var(--bg-soft)] flex items-center justify-center font-display font-bold text-3xl text-[var(--ink-soft)]">
              {student?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          )}
          <h3 className="font-display font-semibold text-[16px] mt-5">{student?.name}</h3>
          <p className="text-[12.5px] text-[var(--ink-soft)] mt-1">{student?.email}</p>
          {student?.studentIdCode && (
            <p className="text-[12px] text-[var(--ink-soft)] mt-1">ID: {student.studentIdCode}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="sr-only"
            id="profile-photo-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-outline btn-sm mt-6 !text-[var(--ink)] !border-[var(--ink)]/25"
          >
            {uploading ? "Uploading..." : "Change Photo"}
          </button>
          <p className="text-[11px] text-[var(--ink-soft)] mt-2">JPG, PNG or WEBP. Max 2 MB.</p>
        </div>

        {/* Details form */}
        <form onSubmit={handleSubmit} className="card p-8">
          <h3 className="font-display font-semibold text-lg mb-6">Personal Details</h3>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-[13.5px] mb-6 border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
              role="status"
            >
              {message.text}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="pf-name" className="label">Full Name</label>
              <input id="pf-name" className="input" value={form.name} onChange={setField("name")} required />
            </div>
            <div>
              <label htmlFor="pf-email" className="label">Email</label>
              <input id="pf-email" type="email" className="input" value={form.email} onChange={setField("email")} required />
            </div>
            <div>
              <label htmlFor="pf-phone" className="label">Phone</label>
              <input id="pf-phone" className="input" value={form.phone} onChange={setField("phone")} required />
            </div>
            <div>
              <label htmlFor="pf-course" className="label">Course</label>
              <input id="pf-course" className="input" value={form.course} onChange={setField("course")} placeholder="e.g. CCC" />
            </div>
            <div>
              <label htmlFor="pf-idcode" className="label">Student ID</label>
              <input id="pf-idcode" className="input" value={form.studentIdCode} onChange={setField("studentIdCode")} placeholder="e.g. FIC-2026-001" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="pf-address" className="label">Address</label>
              <textarea id="pf-address" className="input min-h-20" value={form.address} onChange={setField("address")} />
            </div>
          </div>

          <div className="mt-8">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;

