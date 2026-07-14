import { getIcon } from "@/constants/iconMap";

const AlertIcon = getIcon("shield");

/** Shown for a moment when violations exceed the max, right before auto-submit (#5). Non-dismissable. */
const MaxViolationsModal = () => (
  <div className="fixed inset-0 bg-black/80 z-[97] flex items-center justify-center p-4">
    <div className="bg-white rounded-[var(--radius-lg)] max-w-md w-full p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
        <AlertIcon size={28} />
      </div>
      <h2 className="font-display font-bold text-lg">Maximum Violations Exceeded</h2>
      <p className="text-[13.5px] text-[var(--ink-soft)] mt-3 leading-relaxed">
        You have exceeded the maximum allowed security violations.
      </p>
      <p className="text-[12.5px] text-[var(--ink-soft)] mt-4">Submitting your test...</p>
    </div>
  </div>
);

export default MaxViolationsModal;
