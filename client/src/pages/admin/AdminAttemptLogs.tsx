import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getIcon } from "@/constants/iconMap";
import { fetchAttemptLogs, fetchAttemptLogById } from "@/services/api/adminAttempt.service";
import { parseBrowserLabel } from "@/utils/userAgent";
import type { AttemptLogItem } from "@/types";

const AlertIcon = getIcon("shield");
const CloseIcon = getIcon("close");
const EyeIcon = getIcon("eye");

const VIOLATION_LABELS: Record<string, string> = {
  "fullscreen-exit": "Exited Fullscreen",
  "tab-switch": "Switched Tab",
  "window-blur": "Window Lost Focus",
  "refresh-attempt": "Refresh / Close Attempt",
  "devtools-detected": "DevTools Detected",
  "copy-paste-attempt": "Copy / Paste / Shortcut Attempt",
  other: "Other",
};

/** Suspicious Activity Log — admin-only view of every exam attempt's anti-cheating violations (#18). */
const AdminAttemptLogs = () => {
  const [items, setItems] = useState<AttemptLogItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [flaggedOnly, setFlaggedOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AttemptLogItem | null>(null);

  const load = (page = 1) => {
    setLoading(true);
    fetchAttemptLogs({ page, limit: pagination.limit, flaggedOnly })
      .then((data) => {
        setItems(data?.items || []);
        if (data?.pagination) setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flaggedOnly]);

  const openDetail = (id: string) => fetchAttemptLogById(id).then((data) => data && setDetail(data));

  return (
    <AdminLayout title="Suspicious Activity Log">
      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center gap-2 text-[13px] font-medium cursor-pointer">
          <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />
          Show flagged attempts only (violations &gt; 0)
        </label>
      </div>

      {loading ? (
        <div className="card p-8 h-40 ph" />
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">No attempts found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left border-b border-[var(--line)] text-[var(--ink-soft)]">
                <th className="p-4">Student</th>
                <th className="p-4">Test</th>
                <th className="p-4">Status</th>
                <th className="p-4">Violations</th>
                <th className="p-4">Auto-Submit Reason</th>
                <th className="p-4">Started</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-4 font-medium">{a.student?.name || "Deleted student"}</td>
                  <td className="p-4">{a.exam?.name || "Deleted test"}</td>
                  <td className="p-4 capitalize">{a.status.replace("-", " ")}</td>
                  <td className="p-4">
                    {a.violationCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-semibold">
                        <AlertIcon size={12} /> {a.violationCount}
                      </span>
                    ) : (
                      <span className="text-[var(--ink-soft)]">0</span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--ink-soft)]">{a.autoSubmitReason || "—"}</td>
                  <td className="p-4 text-[var(--ink-soft)]">{new Date(a.startedAt).toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <button onClick={() => openDetail(a._id)} className="text-[var(--royal)] hover:underline flex items-center gap-1">
                      <EyeIcon size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => load(p)}
              className={`w-9 h-9 rounded-lg text-[13px] font-medium ${
                p === pagination.page ? "bg-[var(--royal)] text-white" : "bg-white text-[var(--ink-soft)] border border-[var(--line)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-[var(--radius-lg)] max-w-lg w-full max-h-[85vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">Violation Timeline</h2>
              <button onClick={() => setDetail(null)} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">
                <CloseIcon size={20} />
              </button>
            </div>
            <p className="text-[13px] text-[var(--ink-soft)] mb-5">
              {detail.student?.name || "Deleted student"} — {detail.exam?.name || "Deleted test"}
            </p>
            {detail.violations.length === 0 ? (
              <p className="text-[13.5px] text-[var(--ink-soft)]">No violations recorded for this attempt.</p>
            ) : (
              <div className="space-y-3">
                {detail.violations.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-[var(--bg-soft)] p-3.5">
                    <AlertIcon size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-medium">{VIOLATION_LABELS[v.type] || v.type}</p>
                      <p className="text-[11.5px] text-[var(--ink-soft)]">
                        {new Date(v.occurredAt).toLocaleString("en-IN")} · {parseBrowserLabel(v.userAgent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAttemptLogs;
