import { getIcon } from "@/constants/iconMap";

const AlertIcon = getIcon("shield");

interface Props {
  answeredCount: number;
  totalCount: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** "Submit Test?" confirmation — required before any manual submission. */
const ConfirmSubmitModal = ({ answeredCount, totalCount, submitting, onCancel, onConfirm }: Props) => {
  const unanswered = totalCount - answeredCount;

  return (
    <div className="fixed inset-0 bg-black/60 z-[95] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-md w-full p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
          <AlertIcon size={26} />
        </div>
        <h2 className="font-display font-bold text-xl">Submit Test?</h2>
        <p className="text-[13.5px] text-[var(--ink-soft)] mt-3 leading-relaxed">
          Are you sure you want to submit your test? Once submitted, you cannot change your answers.
        </p>
        {unanswered > 0 && (
          <p className="text-[12.5px] text-amber-600 font-medium mt-3">
            You still have {unanswered} unanswered question{unanswered === 1 ? "" : "s"}.
          </p>
        )}
        <div className="flex gap-3 mt-7">
          <button onClick={onCancel} disabled={submitting} className="btn btn-outline flex-1 !text-[var(--ink)] !border-[var(--line)]">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={submitting} className="btn btn-primary flex-1">
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSubmitModal;
