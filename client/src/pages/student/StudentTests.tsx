import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/student/StudentLayout";
import { fetchActiveExams, startExamAttempt } from "@/services/api/exam.service";
import { fetchMyResults } from "@/services/api/attempt.service";
import { getIcon } from "@/constants/iconMap";
import type { ExamConfig, StudentResultSummary } from "@/types";

const ClockIcon = getIcon("clock");
const FileTextIcon = getIcon("fileText");

const examIdOf = (r: StudentResultSummary) => r.examId || "";

/**
 * Available Tests — every active test with duration, question count and a
 * Start button. Already-attempted tests show an "Attempted" badge instead
 * (one attempt per test).
 */
const StudentTests = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [results, setResults] = useState<StudentResultSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchActiveExams(), fetchMyResults()])
      .then(([e, r]) => {
        setExams(e || []);
        setResults(r || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const attemptedIds = useMemo(() => new Set(results.map(examIdOf)), [results]);

  const handleStart = async (examId: string) => {
    setError("");
    setStartingId(examId);
    try {
      const paper = await startExamAttempt(examId);
      if (paper) navigate(`/exam/${paper.attemptId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not start the test. Please try again.");
      setStartingId(null);
    }
  };

  return (
    <StudentLayout title="Available Tests">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] px-4 py-3 mb-6">{error}</div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6 h-36 ph" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
          No tests are available right now. Please check back later.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const attempted = attemptedIds.has(exam._id) && !exam.allowRetest;
            return (
              <div key={exam._id} className="card p-6 flex flex-col gap-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-[16px] text-balance">{exam.name}</h3>
                    {exam.category && (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-soft)] text-[var(--ink-soft)] shrink-0">
                        {exam.category}
                      </span>
                    )}
                  </div>
                  {exam.description && (
                    <p className="text-[13px] text-[var(--ink-soft)] mt-2 leading-relaxed">{exam.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-5 text-[12.5px] text-[var(--ink-soft)]">
                  <span className="flex items-center gap-1.5">
                    <ClockIcon size={14} /> {exam.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileTextIcon size={14} /> {exam.totalQuestions} Questions
                  </span>
                  <span>Pass: {exam.passingPercentage}%</span>
                </div>

                <div className="mt-auto">
                  {attempted ? (
                    <span className="inline-block text-[12.5px] font-semibold px-4 py-2 rounded-full bg-green-50 text-green-700">
                      Attempted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStart(exam._id)}
                      disabled={startingId !== null}
                      className="btn btn-primary btn-sm"
                    >
                      {startingId === exam._id ? "Starting..." : "Start Test"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentTests;
