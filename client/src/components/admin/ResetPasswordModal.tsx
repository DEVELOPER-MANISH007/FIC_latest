import { useState } from "react";
import { getIcon } from "@/constants/iconMap";
import { resetStudentPassword } from "@/services/api/adminStudent.service";
import { useToast } from "@/context/ToastContext";

const CloseIcon = getIcon("close");

interface Props {
  studentId: string;
  studentName: string;
  onClose: () => void;
}

/**
 * Admin-only "Reset Password" action for a student who has forgotten theirs.
 * No old password required — the new password is hashed by Student's
 * pre("save") hook, exactly as at registration, so the student can log in
 * immediately.
 */
const ResetPasswordModal = ({ studentId, studentName, onClose }: Props) => {
  const toast = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) return setError("New password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setSaving(true);
    try {
      await resetStudentPassword(studentId, newPassword);
      toast.success(`Password reset for ${studentName}. They can log in with the new password now.`);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not reset password";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">Reset Password</h2>
          <button onClick={onClose} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <CloseIcon size={20} />
          </button>
        </div>

        <p className="text-[13.5px] text-[var(--ink-soft)] mb-6">
          Setting a new password for <span className="font-semibold text-[var(--ink)]">{studentName}</span>. They won't
          need their old password — this immediately replaces it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="f-label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              className="field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoFocus
            />
          </div>
          <div>
            <label className="f-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              className="field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter the new password"
            />
          </div>

          {error && <p className="text-[12.5px] text-red-500">{error}</p>}

          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
