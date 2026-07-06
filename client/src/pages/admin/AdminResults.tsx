import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAdminResults, exportResultsExcel } from "@/services/api/adminResult.service";
import type { ExamResult } from "@/types";

const studentNameOf = (result: ExamResult) => {
  const { student } = result;
  if (!student) return "Student (removed)";
  if (typeof student === "string") return student;
  return student.name || "Unknown student";
};

const examNameOf = (result: ExamResult) => {
  const { exam } = result;
  if (!exam) return "Test (removed)";
  if (typeof exam === "string") return exam;
  return exam.name || "Test (removed)";
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN");
};

const AdminResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    fetchAdminResults({ keyword })
      .then((data) => {
        setResults(Array.isArray(data?.items) ? data.items : []);
      })
      .catch((err) => {
        setResults([]);
        setError(err?.response?.data?.message || "Could not load results. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportResultsExcel();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not export results.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout title="Result Management">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          className="field max-w-sm"
          placeholder="Search by student or test name..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={handleExport} disabled={exporting} className="btn btn-navy btn-sm">
          {exporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-600">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="h-64 ph" />
        ) : !results.length ? (
          <div className="p-12 text-center text-[var(--ink-soft)]">
            <p className="font-medium text-[15px] text-[var(--ink)]">No results found</p>
            <p className="mt-2 text-[13.5px]">
              {keyword.trim()
                ? "Try a different search term or clear the filter."
                : "Student test results will appear here once exams are submitted."}
            </p>
          </div>
        ) : (
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="p-4">Student</th>
                <th className="p-4">Test</th>
                <th className="p-4">Score</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Result</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-4 font-medium">{studentNameOf(r)}</td>
                  <td className="p-4">{examNameOf(r)}</td>
                  <td className="p-4">
                    {r.obtainedMarks ?? 0}/{r.totalMarks ?? 0}
                  </td>
                  <td className="p-4">{r.percentage ?? 0}%</td>
                  <td className="p-4">
                    <span className={r.isPassed ? "text-green-600" : "text-red-500"}>
                      {r.isPassed ? "Pass" : "Fail"}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--ink-soft)]">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminResults;
