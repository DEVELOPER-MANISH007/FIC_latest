import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "@/components/student/StudentLayout";
import { fetchMyResults } from "@/services/api/attempt.service";
import type { ExamResult } from "@/types";

const examNameOf = (r: ExamResult) => (typeof r.exam === "string" ? "Test" : r.exam?.name || "Test (removed)");

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

/**
 * Attempted Tests — every submitted attempt with score, time taken and a
 * link to the detailed result page.
 */
const StudentAttempted = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyResults()
      .then((r) => setResults(r || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StudentLayout title="Attempted Tests">
      {loading ? (
        <div className="card p-6 h-40 ph" />
      ) : results.length === 0 ? (
        <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
          You have not attempted any tests yet.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11.5px] uppercase tracking-wide text-[var(--ink-soft)]">
                  <th className="px-6 py-4 font-semibold">Test</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Percentage</th>
                  <th className="px-6 py-4 font-semibold">Time Taken</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id} className="border-b border-[var(--line)] last:border-0 text-[13.5px]">
                    <td className="px-6 py-4 font-medium">{examNameOf(r)}</td>
                    <td className="px-6 py-4 text-[var(--ink-soft)]">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      {r.correct}/{r.totalQuestions}
                    </td>
                    <td className="px-6 py-4">{Math.round(r.percentage)}%</td>
                    <td className="px-6 py-4 text-[var(--ink-soft)]">{formatTime(r.timeTakenSeconds)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11.5px] font-semibold px-3 py-1 rounded-full ${
                          r.isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {r.isPassed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/result/${r._id}`} className="text-[12.5px] text-[var(--royal)] font-semibold hover:underline">
                        View Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentAttempted;
