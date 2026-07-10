import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAdminDashboard } from "@/services/api/adminDashboard.service";
import { getIcon } from "@/constants/iconMap";
import type { AdminDashboardStats } from "@/types";

const UsersIcon = getIcon("users");
const FileTextIcon = getIcon("fileText");
const AwardIcon = getIcon("award");
const ClockIcon = getIcon("clock");
const TrendingUpIcon = getIcon("trendingUp");
const CheckFileIcon = getIcon("checkFile");
const MailIcon = getIcon("mail");

const ADMISSION_CARD_CONFIG = [
  { key: "totalAdmissions", label: "Total Admissions", icon: CheckFileIcon },
  { key: "totalEnquiries", label: "Total Enquiries", icon: MailIcon },
  { key: "todaysAdmissions", label: "Today's Admissions", icon: ClockIcon },
  { key: "todaysEnquiries", label: "Today's Enquiries", icon: ClockIcon },
] as const;

const CARD_CONFIG = [
  { key: "totalStudents", label: "Total Students", icon: UsersIcon },
  { key: "totalQuestions", label: "Total Questions", icon: FileTextIcon },
  { key: "totalTests", label: "Total Tests", icon: AwardIcon },
  { key: "todaysAttempts", label: "Today's Attempts", icon: ClockIcon },
  { key: "averageScore", label: "Average Score (%)", icon: TrendingUpIcon },
] as const;

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    fetchAdminDashboard().then(setStats);
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {ADMISSION_CARD_CONFIG.map((card) => (
          <div key={card.key} className="card p-6">
            <div className="icon-wrap mb-4">
              <card.icon size={20} />
            </div>
            <p className="font-display font-bold text-2xl">{stats ? stats[card.key] : "—"}</p>
            <p className="text-[12.5px] text-[var(--ink-soft)] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        {CARD_CONFIG.map((card) => (
          <div key={card.key} className="card p-6">
            <div className="icon-wrap mb-4">
              <card.icon size={20} />
            </div>
            <p className="font-display font-bold text-2xl">{stats ? stats[card.key] : "—"}</p>
            <p className="text-[12.5px] text-[var(--ink-soft)] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 rounded-[var(--radius-lg)]">
        <h2 className="font-display font-semibold text-lg mb-5">Recent Registrations</h2>
        {!stats ? (
          <div className="h-32 ph rounded-xl" />
        ) : stats.recentRegistrations.length === 0 ? (
          <p className="text-[13.5px] text-[var(--ink-soft)]">No registrations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Course</th>
                  <th className="py-2 pr-4">Registered</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRegistrations.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-[var(--ink-soft)]">{s.email}</td>
                    <td className="py-3 pr-4 text-[var(--ink-soft)]">{s.course || "—"}</td>
                    <td className="py-3 pr-4 text-[var(--ink-soft)]">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
