import { getIcon } from "@/constants/iconMap";

const AlertIcon = getIcon("shield");

const REASON_MESSAGES: Record<string, string> = {
  "tab-switch": "You have left the examination window. Tab switching or leaving fullscreen is not allowed during the examination.",
  "window-blur": "You have left the examination window. Tab switching or leaving fullscreen is not allowed during the examination.",
  "fullscreen-exit": "You have exited fullscreen mode. Tab switching or leaving fullscreen is not allowed during the examination.",
};

interface Props {
  reason: string | null;
  violationCount: number;
  maxViolations: number;
  onOk: () => void;
}

/**
 * Custom "Examination Security Warning" dialog (#2) — deliberately not a
 * browser alert(). Rendering this at all means the exam is paused (#3):
 * ExamPage disables question navigation/answer selection for as long as
 * it's open, and it only resumes once the student clicks OK (#1, #6).
 */
const SecurityWarningModal = ({ reason, violationCount, maxViolations, onOk }: Props) => {
  if (!reason) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[95] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-md w-full p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
          <AlertIcon size={28} />
        </div>
        <h2 className="font-display font-bold text-lg">⚠️ Examination Security Warning</h2>
        <p className="text-[13.5px] text-[var(--ink-soft)] mt-3 leading-relaxed">
          {REASON_MESSAGES[reason] || "A security violation was detected during the examination."}
        </p>
        <p className="font-display font-bold text-[15px] mt-4">
          Violation: {violationCount} / {maxViolations}
        </p>
        <p className="text-[12.5px] text-[var(--ink-soft)] mt-1">Click OK to continue.</p>

        <button onClick={onOk} className="btn btn-primary w-full mt-6">
          OK
        </button>
      </div>
    </div>
  );
};

export default SecurityWarningModal;
