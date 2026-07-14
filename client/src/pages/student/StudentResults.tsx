import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "@/components/student/StudentLayout";
import { fetchMyResults } from "@/services/api/attempt.service";
import type { ExamResult } from "@/types";

const examNameOf = (r: ExamResult) => (typeof r.exam === "string" ? "Test" : r.exam?.name || "Test (removed)");

/**
 * Results — card view of every result with marks, percentage and pass/fail,
 * linking to the full result review page.
 */
const StudentResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyResults()
      .then((r) => setResults(r || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StudentLayout title="Results">
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6 h-32 ph" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
          No results yet. Your results will appear here after you complete a test.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((r) => (
            <Link key={r._id} to={`/result/${r._id}`} className="card p-6 block hover:!translate-y-[-2px]">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display font-semibold text-[15px] text-balance">{examNameOf(r)}</h3>
                <span
                  className={`text-[11.5px] font-semibold px-3 py-1 rounded-full shrink-0 ${
                    r.isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {r.isPassed ? "Pass" : "Fail"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div>
                  <p className="text-[11px] text-[var(--ink-soft)]">Score</p>
                  <p className="font-display font-bold text-lg">
                    {r.correct}/{r.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--ink-soft)]">Percentage</p>
                  <p className="font-display font-bold text-lg">{Math.round(r.percentage)}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--ink-soft)]">Marks</p>
                  <p className="font-display font-bold text-lg">
                    {r.obtainedMarks}/{r.totalMarks}
                  </p>
                </div>
              </div>
              <p className="text-[11.5px] text-[var(--ink-soft)] mt-4">
                {new Date(r.createdAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentResults;
