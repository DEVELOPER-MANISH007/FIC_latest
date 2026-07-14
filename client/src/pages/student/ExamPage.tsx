import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAttempt, saveAnswer, submitAttempt, reportViolation } from "@/services/api/attempt.service";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useToast } from "@/context/ToastContext";
import ExamStickyHeader from "@/components/exam/ExamStickyHeader";
import QuestionPalette from "@/components/exam/QuestionPalette";
import ConfirmSubmitModal from "@/components/exam/ConfirmSubmitModal";
import SecurityWarningModal from "@/components/exam/SecurityWarningModal";
import SecurityBanner from "@/components/exam/SecurityBanner";
import MaxViolationsModal from "@/components/exam/MaxViolationsModal";
import ConnectionBanner from "@/components/exam/ConnectionBanner";
import SimpleCalculator from "@/components/exam/SimpleCalculator";
import Loading from "@/components/common/Loading";
import type { AttemptPaper, ViolationType } from "@/types";
import { cn } from "@/utils/cn";

const isPaper = (data: any): data is AttemptPaper => data && Array.isArray(data.questions);

const OFFLINE_QUEUE_PREFIX = "exam-offline-queue:";

type PendingAnswerUpdate = {
  selectedAnswer?: "A" | "B" | "C" | "D" | null;
  isMarkedForReview?: boolean;
};

type PendingAnswer = {
  questionIndex: number;
  selectedAnswer?: "A" | "B" | "C" | "D" | null;
  isMarkedForReview?: boolean;
};

const ExamPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isOnline = useOnlineStatus();

  const [paper, setPaper] = useState<AttemptPaper | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [bannerTrigger, setBannerTrigger] = useState(0);
  const submittedRef = useRef(false);
  const wasOfflineRef = useRef(false);

  const loadAttempt = useCallback(async () => {
    if (!attemptId) return;
    const data = await fetchAttempt(attemptId);
    if (isPaper(data)) {
      setPaper(data);
    } else if (data && "resultId" in data) {
      navigate(`/result/${data.resultId}`, { replace: true });
    }
    setLoading(false);
  }, [attemptId, navigate]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  // ---- Manual vs. automatic submission (#1, #12 from the earlier phase) ----
  // Automatic paths (timer expiry, max violations) never show a confirmation
  // dialog and go straight through; the "Submit Test" button always does.
  const doSubmit = useCallback(async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await submitAttempt(attemptId);
      if (res) navigate(`/result/${res.resultId}`, { replace: true });
    } catch {
      await loadAttempt();
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, navigate, loadAttempt]);

  const { formatted, isLow } = useExamTimer(paper?.expiresAt || null, doSubmit);

  // ---- Suspicious Activity reporting (#1, #4, #5, #7, #8) ----
  const handleViolation = useCallback(
    (type: ViolationType, meta?: string) => {
      if (!attemptId || submittedRef.current) return;
      setBannerTrigger(Date.now());
      reportViolation(attemptId, type, meta)
        .then((res) => {
          if (!res) return;
          setPaper((prev) => (prev ? { ...prev, violationCount: res.violationCount } : prev));

          if (res.autoSubmitted) {
            submittedRef.current = true;
            setTerminating(true);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            // Give the student a moment to read the "exceeded max violations"
            // message before redirecting, per spec ("Display ... Then auto-submit").
            setTimeout(() => navigate(`/result/${res.resultId}`, { replace: true }), 2200);
          }
        })
        .catch(() => {});
    },
    [attemptId, navigate]
  );

  const { isFullscreen, isPaused, pausedReason, resume } = useExamSecurity({
    active: !!paper && paper.status === "in-progress" && !submitting && !terminating,
    fullscreenRequired: paper?.settings.fullscreenRequired ?? true,
    tabSwitchDetectionEnabled: paper?.settings.tabSwitchDetectionEnabled ?? true,
    onViolation: handleViolation,
  });

  // ---- Auto-save with an offline queue ----
  const queueKey = attemptId ? `${OFFLINE_QUEUE_PREFIX}${attemptId}` : "";

  const flushOfflineQueue = useCallback(async () => {
    if (!attemptId || !queueKey) return;
    const raw = localStorage.getItem(queueKey);
    if (!raw) return;
    let queued: PendingAnswer[] = [];
    try {
      queued = JSON.parse(raw);
    } catch {
      queued = [];
    }
    if (!queued.length) return;
    localStorage.removeItem(queueKey);
    for (const item of queued) {
      try {
        await saveAnswer(attemptId, item);
      } catch {
        const remaining = queued.slice(queued.indexOf(item));
        localStorage.setItem(queueKey, JSON.stringify(remaining));
        return;
      }
    }
    toast.success("Your answers have been synced.");
  }, [attemptId, queueKey, toast]);

  useEffect(() => {
    if (isOnline && wasOfflineRef.current) {
      flushOfflineQueue();
    }
    wasOfflineRef.current = !isOnline;
  }, [isOnline, flushOfflineQueue]);

  if (loading) return <Loading />;
  if (!paper) return null;

  const question = paper.questions[currentIndex];
  // Question navigation, answer selection, and other exam controls are all
  // locked out while a security warning is up (#3) — resumed only via OK.
  const isLocked = isPaused || terminating;

  const persistAnswer = async (updates: PendingAnswerUpdate) => {
    if (!attemptId || isLocked) return;
    const fullUpdate: PendingAnswer = {
      questionIndex: currentIndex,
      ...updates,
    };
    setPaper((prev) => {
      if (!prev) return prev;
      const questions = [...prev.questions];
      questions[currentIndex] = { ...questions[currentIndex], ...updates };
      return { ...prev, questions };
    });
    try {
      await saveAnswer(attemptId, fullUpdate);
    } catch {
      const raw = localStorage.getItem(queueKey);
      const queued: PendingAnswer[] = raw ? JSON.parse(raw) : [];
      queued.push(fullUpdate);
      localStorage.setItem(queueKey, JSON.stringify(queued));
    }
  };

  const goToQuestion = (index: number) => {
    if (isLocked) return;
    setCurrentIndex(index);
    setVisited((prev) => new Set(prev).add(index));
  };

  const answeredCount = paper.questions.filter((q) => q.selectedAnswer).length;
  const progressPercent = Math.round((answeredCount / paper.questions.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      {!isOnline && <ConnectionBanner />}
      <SecurityBanner triggerKey={bannerTrigger} />
      {terminating && <MaxViolationsModal />}
      {!terminating && (
        <SecurityWarningModal
          reason={pausedReason}
          violationCount={paper.violationCount}
          maxViolations={paper.settings.maxViolations}
          onOk={resume}
        />
      )}
      {showConfirm && !isLocked && (
        <ConfirmSubmitModal
          answeredCount={answeredCount}
          totalCount={paper.questions.length}
          submitting={submitting}
          onCancel={() => setShowConfirm(false)}
          onConfirm={doSubmit}
        />
      )}
      {paper.settings.calculatorEnabled && <SimpleCalculator />}

      <ExamStickyHeader
        examName={paper.examName}
        studentName={paper.studentName}
        formatted={formatted}
        isLow={isLow}
        fullscreenRequired={paper.settings.fullscreenRequired}
        isFullscreen={isFullscreen}
        violationCount={paper.violationCount}
        maxViolations={paper.settings.maxViolations}
      />

      <div className={cn("container-x py-6", isLocked && "pointer-events-none select-none opacity-60")} aria-hidden={isLocked}>
        <p className="text-[12.5px] text-[var(--ink-soft)] mb-4">
          Question {currentIndex + 1} of {paper.questions.length}
        </p>

        <div className="w-full h-2 rounded-full bg-[var(--line)] mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--royal)] to-[var(--orange)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div
            className="card p-8 rounded-[var(--radius-lg)] select-none"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <p className="font-display font-semibold text-lg leading-relaxed">{question.text}</p>

            <div className="mt-6 space-y-3">
              {question.options.map((opt) => (
                <button
                  key={opt.letter}
                  onClick={() => persistAnswer({ selectedAnswer: opt.letter })}
                  disabled={isLocked}
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
                disabled={isLocked}
                className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]"
              >
                {question.isMarkedForReview ? "Unmark Review" : "Mark for Review"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                  disabled={isLocked || currentIndex === 0}
                  className="btn btn-navy btn-sm"
                >
                  Previous
                </button>
                {currentIndex < paper.questions.length - 1 ? (
                  <button
                    onClick={() => goToQuestion(Math.min(paper.questions.length - 1, currentIndex + 1))}
                    disabled={isLocked}
                    className="btn btn-navy btn-sm"
                  >
                    Next
                  </button>
                ) : (
                  <button onClick={() => setShowConfirm(true)} disabled={isLocked || submitting} className="btn btn-primary btn-sm">
                    Submit Test
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <QuestionPalette questions={paper.questions} currentIndex={currentIndex} visited={visited} onNavigate={goToQuestion} />
            <button onClick={() => setShowConfirm(true)} disabled={isLocked || submitting} className="btn btn-primary w-full">
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
