import { useState, type FormEvent } from "react";
import StudentLayout from "@/components/student/StudentLayout";
import FormField from "@/components/common/FormField";
import { changeStudentPassword } from "@/services/api/studentAuth.service";

/**
 * Change Password — verifies the current password server-side, then saves
 * the new bcrypt-hashed password.
 */
const StudentChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setSaving(true);
    try {
      await changeStudentPassword(form.currentPassword, form.newPassword, form.confirmPassword);
      setMessage({ type: "success", text: "Password updated successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Could not change password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout title="Change Password">
      <form onSubmit={handleSubmit} className="card p-8 max-w-xl">
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

        <div className="space-y-5">
          <FormField
            label="Current Password"
            id="cp-current"
            type="password"
            value={form.currentPassword}
            onChange={setField("currentPassword")}
            autoComplete="current-password"
            required
          />
          <FormField
            label="New Password"
            id="cp-new"
            type="password"
            value={form.newPassword}
            onChange={setField("newPassword")}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <p className="text-[11.5px] text-[var(--ink-soft)] mt-1.5">At least 6 characters.</p>
          <FormField
            label="Confirm New Password"
            id="cp-confirm"
            type="password"
            value={form.confirmPassword}
            onChange={setField("confirmPassword")}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <div className="mt-8">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </StudentLayout>
  );
};

export default StudentChangePassword;
