import { useEffect, useMemo, useState } from "react";
import StudentLayout from "@/components/student/StudentLayout";
import { fetchMyResults } from "@/services/api/attempt.service";
import { getIcon } from "@/constants/iconMap";
import type { ExamResult } from "@/types";

const TrendingUpIcon = getIcon("trendingUp");
const AwardIcon = getIcon("award");
const CheckIcon = getIcon("checkCircle");
const ClockIcon = getIcon("clock");

const examNameOf = (r: ExamResult) => (typeof r.exam === "string" ? "Test" : r.exam?.name || "Test (removed)");

/**
 * Performance — aggregate stats plus a score-over-time bar chart and a
 * per-test accuracy breakdown (correct / wrong / skipped).
 */
const StudentPerformance = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyResults()
      .then((r) => setResults(r || []))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!results.length) return null;
    const avg = Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length);
    const best = Math.round(Math.max(...results.map((r) => r.percentage)));
    const passed = results.filter((r) => r.isPassed).length;
    const avgTime = Math.round(results.reduce((s, r) => s + r.timeTakenSeconds, 0) / results.length / 60);
    return { avg, best, passed, avgTime };
  }, [results]);

  const chartData = useMemo(() => [...results].reverse(), [results]);

  return (
    <StudentLayout title="Performance">
      {loading ? (
        <div className="card p-6 h-48 ph" />
      ) : !stats ? (
        <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
          Attempt a test to see your performance analytics here.
        </div>
      ) : (
        <>
          {/* Aggregate stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card p-6 flex items-center gap-4">
              <div className="icon-wrap"><TrendingUpIcon size={20} /></div>
              <div>
                <p className="text-[12px] text-[var(--ink-soft)]">Average Score</p>
                <p className="font-display font-bold text-xl">{stats.avg}%</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="icon-wrap"><AwardIcon size={20} /></div>
              <div>
                <p className="text-[12px] text-[var(--ink-soft)]">Best Score</p>
                <p className="font-display font-bold text-xl">{stats.best}%</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="icon-wrap"><CheckIcon size={20} /></div>
              <div>
                <p className="text-[12px] text-[var(--ink-soft)]">Tests Passed</p>
                <p className="font-display font-bold text-xl">
                  {stats.passed}/{results.length}
                </p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="icon-wrap"><ClockIcon size={20} /></div>
              <div>
                <p className="text-[12px] text-[var(--ink-soft)]">Avg. Time / Test</p>
                <p className="font-display font-bold text-xl">{stats.avgTime} min</p>
              </div>
            </div>
          </div>

          {/* Score over time */}
          <div className="card p-6 mb-8">
            <h3 className="font-display font-semibold text-lg mb-6">Score Over Time</h3>
            <div className="flex items-end gap-3 h-52" role="img" aria-label={`Bar chart of all ${chartData.length} test scores in order`}>
              {chartData.map((r) => (
                <div key={r._id} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-[var(--ink-soft)]">{Math.round(r.percentage)}%</span>
                  <div
                    className={`w-full max-w-14 rounded-t-lg ${r.isPassed ? "bg-[var(--royal)]" : "bg-red-300"}`}
                    style={{ height: `${Math.max(r.percentage, 4)}%` }}
                  />
                  <span className="text-[10px] text-[var(--ink-soft)] truncate w-full text-center">
                    {new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-[11.5px] text-[var(--ink-soft)]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[var(--royal)] inline-block" /> Passed</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-300 inline-block" /> Failed</span>
            </div>
          </div>

          {/* Per-test breakdown */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-lg mb-6">Accuracy Breakdown</h3>
            <div className="space-y-5">
              {results.map((r) => {
                const total = r.totalQuestions || 1;
                const correctPct = (r.correct / total) * 100;
                const wrongPct = (r.wrong / total) * 100;
                const skippedPct = (r.skipped / total) * 100;
                return (
                  <div key={r._id}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-[13.5px] font-medium">{examNameOf(r)}</p>
                      <p className="text-[11.5px] text-[var(--ink-soft)]">
                        {r.correct} correct · {r.wrong} wrong · {r.skipped} skipped
                      </p>
                    </div>
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--bg-soft)]">
                      <div className="bg-green-500" style={{ width: `${correctPct}%` }} />
                      <div className="bg-red-400" style={{ width: `${wrongPct}%` }} />
                      <div className="bg-gray-300" style={{ width: `${skippedPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-6 text-[11.5px] text-[var(--ink-soft)]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Correct</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Wrong</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Skipped</span>
            </div>
          </div>
        </>
      )}
    </StudentLayout>
  );
};

export default StudentPerformance;
