import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAdminAnalytics } from "@/services/api/adminDashboard.service";
import { fetchQuestionAnalytics } from "@/services/api/adminQuestion.service";

const COLORS = ["#2547E0", "#FF7A29", "#22c55e", "#f59e0b", "#a855f7", "#0ea5e9", "#ef4444", "#14b8a6", "#eab308", "#64748b"];

const AdminAnalytics = () => {
  const [examAnalytics, setExamAnalytics] = useState<Awaited<ReturnType<typeof fetchAdminAnalytics>> | null>(null);
  const [qAnalytics, setQAnalytics] = useState<Awaited<ReturnType<typeof fetchQuestionAnalytics>> | null>(null);

  useEffect(() => {
    fetchAdminAnalytics().then(setExamAnalytics);
    fetchQuestionAnalytics().then(setQAnalytics);
  }, []);

  const passFailData = examAnalytics
    ? [
        { name: "Pass", value: examAnalytics.passVsFail.pass },
        { name: "Fail", value: examAnalytics.passVsFail.fail },
      ]
    : [];

  return (
    <AdminLayout title="Analytics">
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Pass vs Fail</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={passFailData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Top Students</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examAnalytics?.topStudents || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#2547E0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Questions per Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={qAnalytics?.byCategory || []} dataKey="count" nameKey="category" outerRadius={90} label>
                  {(qAnalytics?.byCategory || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Most Difficult Questions</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(examAnalytics?.mostDifficultQuestions || []).map((q, i) => (
              <div key={i} className="flex items-center justify-between text-[13px] border-b border-[var(--line)] pb-2">
                <p className="truncate max-w-[70%]">{q.question}</p>
                <span className="text-red-500 font-semibold">{Math.round(q.correctRate * 100)}% correct</span>
              </div>
            ))}
            {(!examAnalytics || examAnalytics.mostDifficultQuestions.length === 0) && (
              <p className="text-[13px] text-[var(--ink-soft)]">Not enough attempt data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div className="card p-6">
          <p className="text-[12px] text-[var(--ink-soft)]">Total Questions in Bank</p>
          <p className="font-display font-bold text-2xl mt-1">{qAnalytics?.total ?? "—"}</p>
        </div>
        <div className="card p-6">
          <p className="text-[12px] text-[var(--ink-soft)]">Unused Questions</p>
          <p className="font-display font-bold text-2xl mt-1">{qAnalytics?.unusedCount ?? "—"}</p>
        </div>
        <div className="card p-6">
          <p className="text-[12px] text-[var(--ink-soft)]">Recently Added</p>
          <p className="font-display font-bold text-2xl mt-1">{qAnalytics?.recentlyAdded?.length ?? "—"}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

