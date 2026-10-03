import { useState, type FormEvent } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import FormField from "@/components/common/FormField";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { updateAdminAccount } from "@/services/api/adminAccount.service";

const AdminAccountSettings = () => {
  const { admin, replaceSession } = useAdminAuth();
  const [adminId, setAdminId] = useState(admin?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    setSaving(true);
    try {
      const result = await updateAdminAccount({ currentPassword, adminId: adminId.trim(), ...(newPassword ? { newPassword, confirmPassword } : {}) });
      replaceSession(result.token, result.admin);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setMessage({ type: "success", text: "Account updated. This browser stays signed in; other sessions must sign in again." });
    } catch (error: any) {
      setMessage({ type: "error", text: error?.response?.data?.message || error?.message || "Account could not be updated." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Account Settings">
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="card p-5 sm:p-7">
          <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Admin sign-in details</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Verify your current password before updating your admin ID or password.</p>
          <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
            <FormField label="Admin ID / Email" id="admin-id" type="email" autoComplete="username" value={adminId} onChange={(event) => setAdminId(event.target.value)} required />
            <FormField label="Current password" id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
            <div className="border-t border-[var(--line)] pt-5">
              <h3 className="font-medium text-[var(--ink)]">Change password <span className="font-normal text-[var(--ink-soft)]">(optional)</span></h3>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Use at least 12 characters with upper-case, lower-case, number and symbol characters.</p>
              <div className="mt-4 space-y-5">
                <FormField label="New password" id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={12} />
                <FormField label="Confirm new password" id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={12} />
              </div>
            </div>
            {message && <p role={message.type === "error" ? "alert" : "status"} className={message.type === "error" ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"}>{message.text}</p>}
            <button type="submit" disabled={saving || !currentPassword} className="btn btn-primary w-full sm:w-auto">{saving ? "Saving..." : "Save account changes"}</button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminAccountSettings;
