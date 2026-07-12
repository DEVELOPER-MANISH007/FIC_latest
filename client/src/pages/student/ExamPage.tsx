import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAttempt, saveAnswer, submitAttempt } from "@/services/api/attempt.service";
import { useExamTimer } from "@/hooks/useExamTimer";
import ExamTimer from "@/components/exam/ExamTimer";
import QuestionPalette from "@/components/exam/QuestionPalette";
import Loading from "@/components/common/Loading";
import type { AttemptPaper } from "@/types";
import { cn } from "@/utils/cn";

const isPaper = (data: any): data is AttemptPaper => data && Array.isArray(data.questions);

const isRedirect = (data: any): data is { resultId: string } =>
  data && typeof data.resultId === "string" && ("autoSubmitted" in data || "submitted" in data);

const ExamPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<AttemptPaper | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const loadAttempt = useCallback(async () => {
    if (!attemptId) return;
    const data = await fetchAttempt(attemptId);
    if (isPaper(data)) {
      setPaper(data);
    } else if (isRedirect(data)) {
      navigate(`/result/${data.resultId}`, { replace: true });
    }
    setLoading(false);
  }, [attemptId, navigate]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await submitAttempt(attemptId);
      if (res) navigate(`/result/${res.resultId}`, { replace: true });
    } catch {
      // If it was already auto-submitted server-side, re-fetch to get the redirect.
      await loadAttempt();
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, navigate, loadAttempt]);

  const { formatted, isLow } = useExamTimer(paper?.expiresAt || null, handleSubmit);

  if (loading) return <Loading />;
  if (!paper) return null;

  const question = paper.questions[currentIndex];

  const persistAnswer = async (updates: { selectedAnswer?: "A" | "B" | "C" | "D" | null; isMarkedForReview?: boolean }) => {
    if (!attemptId) return;
    setPaper((prev) => {
      if (!prev) return prev;
      const questions = [...prev.questions];
      questions[currentIndex] = { ...questions[currentIndex], ...updates };
      return { ...prev, questions };
    });
    try {
      await saveAnswer(attemptId, { questionIndex: currentIndex, ...updates });
    } catch {
      // Auto-save failure is non-fatal for the current click; the next
      // interaction (or periodic re-fetch) will retry persisting state.
    }
  };

  const answeredCount = paper.questions.filter((q) => q.selectedAnswer).length;
  const progressPercent = Math.round((answeredCount / paper.questions.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg-soft)] py-6">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-xl">Basic Computer Test</h1>
            <p className="text-[12.5px] text-[var(--ink-soft)] mt-1">
              Question {currentIndex + 1} of {paper.questions.length}
            </p>
          </div>
          <ExamTimer formatted={formatted} isLow={isLow} />
        </div>

        <div className="w-full h-2 rounded-full bg-[var(--line)] mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--royal)] to-[var(--orange)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="card p-8 rounded-[var(--radius-lg)]">
            <p className="font-display font-semibold text-lg leading-relaxed">{question.text}</p>

            <div className="mt-6 space-y-3">
              {question.options.map((opt) => (
                <button
                  key={opt.letter}
                  onClick={() => persistAnswer({ selectedAnswer: opt.letter })}
                  className={cn(
                    "w-full text-left px-5 py-4 rounded-xl border-2 transition flex items-center gap-3",
                    question.selectedAnswer === opt.letter
                      ? "border-[var(--royal)] bg-[var(--royal)]/5"
                      : "border-[var(--line)] hover:border-[var(--royal)]/40"
                  )}
                >
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[12.5px] font-bold shrink-0",
                      question.selectedAnswer === opt.letter
                        ? "bg-[var(--royal)] text-white"
                        : "bg-[var(--bg-soft)] text-[var(--ink-soft)]"
                    )}
                  >
                    {opt.letter}
                  </span>
                  <span className="text-[14.5px]">{opt.text}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-[var(--line)]">
              <button
                onClick={() => persistAnswer({ isMarkedForReview: !question.isMarkedForReview })}
                className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]"
              >
                {question.isMarkedForReview ? "Unmark Review" : "Mark for Review"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="btn btn-navy btn-sm"
                >
                  Previous
                </button>
                {currentIndex < paper.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(paper.questions.length - 1, i + 1))}
                    className="btn btn-navy btn-sm"
                  >
                    Next
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">
                    {submitting ? "Submitting..." : "Submit Test"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <QuestionPalette questions={paper.questions} currentIndex={currentIndex} onNavigate={setCurrentIndex} />
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary w-full">
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
