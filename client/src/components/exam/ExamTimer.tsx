import { getIcon } from "@/constants/iconMap";

const ClockIcon = getIcon("clock");

const ExamTimer = ({ formatted, isLow, dark = false }: { formatted: string; isLow: boolean; dark?: boolean }) => (
  <div
    className={`flex items-center gap-2 px-4 py-2 rounded-full font-num font-bold text-lg ${
      isLow ? "bg-red-100 text-red-800" : dark ? "bg-white/10 text-white" : "bg-[var(--royal)]/10 text-[var(--royal)]"
    }`}
  >
    <ClockIcon size={18} />
    {formatted}
  </div>
);

export default ExamTimer;
