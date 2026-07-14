import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/student/StudentLayout";
import { useAuth } from "@/context/AuthContext";
import { fetchActiveExams, startExamAttempt } from "@/services/api/exam.service";
import { fetchMyResults } from "@/services/api/attempt.service";
import { getIcon } from "@/constants/iconMap";
import type { ExamConfig, ExamResult } from "@/types";

const BookIcon = getIcon("bookOpen");
const AwardIcon = getIcon("award");
const CheckIcon = getIcon("checkCircle");
const ClockIcon = getIcon("clock");
const TrendingUpIcon = getIcon("trendingUp");

const examIdOf = (r: ExamResult) => (typeof r.exam === "string" ? r.exam : r.exam?._id || "");

/** % of profile fields the student has filled in. */
const profileCompletion = (student: ReturnType<typeof useAuth>["student"]) => {
  if (!student) return 0;
  const fields = [student.name, student.email, student.phone, student.address, student.course, student.photo, student.studentIdCode];
  const filled = fields.filter((f) => f && String(f).trim()).length;
  return Math.round((filled / fields.length) * 100);
};

const StudentDashboard = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
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
  const upcomingTests = exams.filter((e) => !attemptedIds.has(e._id));
  const latestResult = results[0] || null;
  const averageScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;
  const completion = profileCompletion(student);

  // Progress chart: oldest -> newest result percentages
  const chartData = useMemo(() => [...results].reverse().slice(-10), [results]);

  const handleQuickStart = async () => {
    const next = upcomingTests[0];
    if (!next) return;
    setError("");
    setStartingId(next._id);
    try {
      const paper = await startExamAttempt(next._id);
      if (paper) navigate(`/exam/${paper.attemptId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not start the test. Please try again.");
    } finally {
      setStartingId(null);
    }
  };

  return (
    <StudentLayout title="Dashboard">
      {/* Welcome card */}
      <div className="card p-8 rounded-[var(--radius-lg)] mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-[var(--ink-soft)] font-medium">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl lg:text-3xl mt-1">{student?.name}</h2>
            <p className="text-[13.5px] text-[var(--ink-soft)] mt-2 flex items-center gap-2">
              <BookIcon size={14} /> {student?.course || "Course not set"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[var(--ink-soft)]">Profile Completion</p>
            <p className="font-display font-bold text-xl">{completion}%</p>
            <div className="w-36 h-2 rounded-full bg-[var(--bg-soft)] mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-[var(--royal)]" style={{ width: `${completion}%` }} />
            </div>
            {completion < 100 && (
              <Link to="/dashboard/profile" className="text-[12px] text-[var(--royal)] font-semibold hover:underline mt-1 inline-block">
                Complete your profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 flex items-center gap-4">
          <div className="icon-wrap"><BookIcon size={20} /></div>
          <div>
            <p className="text-[12px] text-[var(--ink-soft)]">Total Available Tests</p>
            <p className="font-display font-bold text-xl">{loading ? "—" : exams.length}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="icon-wrap"><CheckIcon size={20} /></div>
          <div>
            <p className="text-[12px] text-[var(--ink-soft)]">Tests Attempted</p>
            <p className="font-display font-bold text-xl">{loading ? "—" : results.length}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="icon-wrap"><TrendingUpIcon size={20} /></div>
          <div>
            <p className="text-[12px] text-[var(--ink-soft)]">Average Score</p>
            <p className="font-display font-bold text-xl">{loading ? "—" : `${averageScore}%`}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13.5px] px-4 py-3 mb-6">{error}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Latest result + quick start */}
        <div className="space-y-8">
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Latest Result</h3>
            {loading ? (
              <div className="card p-6 h-28 ph" />
            ) : latestResult ? (
              <Link to={`/result/${latestResult._id}`} className="card p-6 flex items-center justify-between gap-4 block hover:!translate-y-[-2px]">
                <div>
                  <p className="font-display font-semibold text-[15px]">
                    {typeof latestResult.exam === "string" ? "Test" : latestResult.exam?.name || "Test (removed)"}
                  </p>
                  <p className="text-[12.5px] text-[var(--ink-soft)] mt-1">
                    {latestResult.correct}/{latestResult.totalQuestions} correct · {latestResult.percentage}%
                  </p>
                </div>
                <span className={`text-[12px] font-semibold px-3 py-1.5 rounded-full ${latestResult.isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {latestResult.isPassed ? "Pass" : "Fail"}
                </span>
              </Link>
            ) : (
              <div className="card p-6 text-[13.5px] text-[var(--ink-soft)]">No results yet — take your first test.</div>
            )}
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Start</h3>
            <div className="card p-6">
              {upcomingTests.length > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display font-semibold text-[15px]">{upcomingTests[0].name}</p>
                    <p className="text-[12.5px] text-[var(--ink-soft)] mt-1 flex items-center gap-2">
                      <ClockIcon size={13} /> {upcomingTests[0].durationMinutes} min · {upcomingTests[0].totalQuestions} Questions
                    </p>
                  </div>
                  <button onClick={handleQuickStart} disabled={startingId !== null} className="btn btn-primary btn-sm shrink-0">
                    {startingId ? "Starting..." : "Start Test"}
                  </button>
                </div>
              ) : (
                <p className="text-[13.5px] text-[var(--ink-soft)]">
                  {loading ? "Loading..." : "No pending tests. You have attempted all available tests."}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Upcoming Tests</h3>
            {loading ? (
              <div className="card p-6 h-24 ph" />
            ) : upcomingTests.length === 0 ? (
              <div className="card p-6 text-[13.5px] text-[var(--ink-soft)]">No upcoming tests right now.</div>
            ) : (
              <div className="space-y-3">
                {upcomingTests.slice(0, 4).map((exam) => (
                  <div key={exam._id} className="card p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-[14px]">{exam.name}</p>
                      <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">
                        {exam.durationMinutes} min · {exam.totalQuestions} Questions
                      </p>
                    </div>
                    <Link to="/dashboard/tests" className="text-[12.5px] text-[var(--royal)] font-semibold hover:underline shrink-0">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress chart */}
        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Progress Chart</h3>
          <div className="card p-6">
            {chartData.length === 0 ? (
              <p className="text-[13.5px] text-[var(--ink-soft)]">Your score progress will appear here after your first test.</p>
            ) : (
              <div>
                <div className="flex items-end gap-3 h-48" role="img" aria-label={`Bar chart of your last ${chartData.length} test scores`}>
                  {chartData.map((r) => (
                    <div key={r._id} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                      <span className="text-[11px] font-semibold text-[var(--ink-soft)]">{Math.round(r.percentage)}%</span>
                      <div
                        className={`w-full max-w-12 rounded-t-lg ${r.isPassed ? "bg-[var(--royal)]" : "bg-red-300"}`}
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
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Link to="/dashboard/performance" className="text-[13px] text-[var(--royal)] font-semibold hover:underline">
              View full performance
            </Link>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
