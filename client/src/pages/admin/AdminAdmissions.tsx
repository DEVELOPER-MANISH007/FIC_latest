import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getIcon } from "@/constants/iconMap";
import { COURSE_OPTIONS } from "@/constants/siteData";
import {
  fetchAdmissions,
  updateAdmissionStatus,
  deleteAdmission,
  exportAdmissionsCSV,
} from "@/services/api/adminAdmission.service";
import type { AdmissionRecord, AdmissionStatus } from "@/types";

const DownloadIcon = getIcon("download");
const CloseIcon = getIcon("close");

const STATUS_OPTIONS: AdmissionStatus[] = ["new", "contacted", "admitted", "closed"];

const statusBadgeClass = (status: AdmissionStatus) =>
  status === "admitted"
    ? "bg-green-50 text-green-600"
    : status === "contacted"
    ? "bg-amber-50 text-amber-600"
    : status === "closed"
    ? "bg-gray-100 text-gray-500"
    : "bg-blue-50 text-blue-600";

const AdminAdmissions = () => {
  const [items, setItems] = useState<AdmissionRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [keyword, setKeyword] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<AdmissionRecord | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    fetchAdmissions({ page, limit: pagination.limit, keyword, course, status }).then((data) => {
      setItems(data?.items || []);
      if (data?.pagination) setPagination(data.pagination);
      setLoading(false);
    });
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, course, status]);

  const handleStatusChange = async (id: string, next: AdmissionStatus) => {
    await updateAdmissionStatus(id, next);
    load(pagination.page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this admission form permanently?")) return;
    await deleteAdmission(id);
    load(pagination.page);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAdmissionsCSV({ keyword, course, status });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout title="Admission Forms">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          className="field max-w-xs"
          placeholder="Search by name or mobile..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select className="field max-w-[200px]" value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">All Courses</option>
          {COURSE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="field max-w-[160px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button onClick={handleExport} disabled={exporting} className="btn btn-outline btn-sm ml-auto">
          <DownloadIcon size={14} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="h-64 ph" />
        ) : (
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="p-4">Student Name</th>
                <th className="p-4">Father's Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Course</th>
                <th className="p-4">Date &amp; Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-4 font-medium">{a.name}</td>
                  <td className="p-4 text-[var(--ink-soft)]">{a.fatherName}</td>
                  <td className="p-4 text-[var(--ink-soft)]">{a.phone}</td>
                  <td className="p-4 text-[var(--ink-soft)]">{a.course}</td>
                  <td className="p-4 text-[var(--ink-soft)]">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="p-4">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a._id, e.target.value as AdmissionStatus)}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-medium border-0 ${statusBadgeClass(a.status)}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <button onClick={() => setViewing(a)} className="text-[var(--royal)] hover:underline mr-4">
                      View
                    </button>
                    <button onClick={() => handleDelete(a._id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--ink-soft)]">
                    No admission forms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
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

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-[var(--radius-lg)] max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">Admission Form Details</h2>
              <button onClick={() => setViewing(null)} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">
                <CloseIcon size={20} />
              </button>
            </div>
            <dl className="space-y-3 text-[13.5px]">
              {[
                ["Student Name", viewing.name],
                ["Father's Name", viewing.fatherName],
                ["Mobile Number", viewing.phone],
                ["Email", viewing.email || "—"],
                ["Course", viewing.course],
                ["Qualification", viewing.qualification],
                ["Address", viewing.address],
                ["Message", viewing.message || "—"],
                ["Date & Time", viewing.createdAt ? new Date(viewing.createdAt).toLocaleString("en-IN") : "—"],
                ["Status", viewing.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[var(--line)] pb-2 last:border-0">
                  <dt className="text-[var(--ink-soft)]">{label}</dt>
                  <dd className="font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAdmissions;
