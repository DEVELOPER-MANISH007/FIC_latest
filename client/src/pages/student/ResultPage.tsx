import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fetchResult } from "@/services/api/attempt.service";
import Loading from "@/components/common/Loading";
import type { ExamResult } from "@/types";

const COLORS = { correct: "#22c55e", wrong: "#ef4444", skipped: "#94a3b8" };

/**
 * Result summary — score, percentage, pass/fail, time taken only.
 * Per exam security policy, the answer key / question-wise analysis is
 * never shown to students (only Admin has access to correct answers), so
 * there is intentionally no "Analyze Your Result" feature here.
 */
const ResultPage = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;
    fetchResult(resultId).then((data) => {
      if (data) setResult(data.result);
      setLoading(false);
    });
  }, [resultId]);

  if (loading) return <Loading />;
  if (!result) return null;

  const chartData = [
    { name: "Correct", value: result.correct, color: COLORS.correct },
    { name: "Wrong", value: result.wrong, color: COLORS.wrong },
    { name: "Skipped", value: result.skipped, color: COLORS.skipped },
  ];

  const minutes = Math.floor(result.timeTakenSeconds / 60);
  const seconds = result.timeTakenSeconds % 60;

  return (
    <div className="min-h-screen bg-[var(--bg-soft)] py-10">
      <div className="container-x max-w-4xl">
        <div className="card p-8 lg:p-12 rounded-[var(--radius-lg)] text-center">
          <span
            className={`inline-block text-[13px] font-semibold px-4 py-1.5 rounded-full mb-4 ${
              result.isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {result.isPassed ? "PASSED" : "FAILED"}
          </span>
          <h1 className="font-display font-bold text-3xl lg:text-4xl">{result.percentage}%</h1>
          <p className="text-[var(--ink-soft)] mt-2">
            {result.obtainedMarks} / {result.totalMarks} marks
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mt-10 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="card p-4">
                <p className="text-[12px] text-[var(--ink-soft)]">Total Questions</p>
                <p className="font-display font-bold text-xl mt-1">{result.totalQuestions}</p>
              </div>
              <div className="card p-4">
                <p className="text-[12px] text-[var(--ink-soft)]">Correct</p>
                <p className="font-display font-bold text-xl mt-1 text-green-600">{result.correct}</p>
              </div>
              <div className="card p-4">
                <p className="text-[12px] text-[var(--ink-soft)]">Wrong</p>
                <p className="font-display font-bold text-xl mt-1 text-red-500">{result.wrong}</p>
              </div>
              <div className="card p-4">
                <p className="text-[12px] text-[var(--ink-soft)]">Skipped</p>
                <p className="font-display font-bold text-xl mt-1 text-[var(--ink-soft)]">{result.skipped}</p>
              </div>
              <div className="card p-4 col-span-2">
                <p className="text-[12px] text-[var(--ink-soft)]">Time Taken</p>
                <p className="font-display font-bold text-xl mt-1">
                  {minutes}m {seconds}s
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link to="/dashboard" className="btn btn-navy">
              Back to Dashboard
            </Link>
            <Link to="/dashboard/results" className="btn btn-primary">
              View All Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
