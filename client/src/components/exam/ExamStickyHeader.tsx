import { getIcon } from "@/constants/iconMap";
import ExamTimer from "@/components/exam/ExamTimer";

const UserIcon = getIcon("users2");
const MaximizeIcon = getIcon("eye");
const AlertIcon = getIcon("shield");

interface Props {
  examName: string;
  studentName: string;
  formatted: string;
  isLow: boolean;
  fullscreenRequired: boolean;
  isFullscreen: boolean;
  violationCount: number;
  maxViolations: number;
}

/** Fixed top bar kept visible throughout the exam (#14). */
const ExamStickyHeader = ({
  examName,
  studentName,
  formatted,
  isLow,
  fullscreenRequired,
  isFullscreen,
  violationCount,
  maxViolations,
}: Props) => (
  <div className="sticky top-0 z-30 border-b border-white/10 bg-[var(--navy)] text-white shadow-sm">
    <div className="container-x py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display font-bold text-[16px] leading-tight truncate max-w-[260px] sm:max-w-none">{examName}</h1>
        <p className="text-[11.5px] text-white/75 flex items-center gap-1.5 mt-0.5">
          <UserIcon size={11} /> {studentName}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {fullscreenRequired && (
          <span
            className={`hidden sm:flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-full ${
            isFullscreen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <MaximizeIcon size={12} /> {isFullscreen ? "Fullscreen" : "Not Fullscreen"}
          </span>
        )}

        {violationCount > 0 && (
          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
            <AlertIcon size={12} /> {violationCount}/{maxViolations} Alerts
          </span>
        )}

        <ExamTimer formatted={formatted} isLow={isLow} dark />
      </div>
    </div>
  </div>
);

export default ExamStickyHeader;
