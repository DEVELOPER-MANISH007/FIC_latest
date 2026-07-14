import type { PaperQuestion } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  questions: PaperQuestion[];
  currentIndex: number;
  visited: Set<number>;
  onNavigate: (index: number) => void;
}

const getStatus = (q: PaperQuestion, isVisited: boolean) => {
  if (q.isMarkedForReview) return "review";
  if (q.selectedAnswer) return "answered";
  if (!isVisited) return "not-visited";
  return "not-answered";
};

const statusClasses: Record<string, string> = {
  answered: "bg-green-500 text-white border-green-500",
  review: "bg-purple-500 text-white border-purple-500",
  "not-answered": "bg-red-50 text-red-600 border-red-200",
  "not-visited": "bg-white text-[var(--ink)] border-[var(--line)]",
};

/** Professional Question Palette — Answered / Not Answered / Marked for Review / Not Visited (#13). */
const QuestionPalette = ({ questions, currentIndex, visited, onNavigate }: Props) => (
  <div className="card p-5 rounded-[var(--radius-md)]">
    <h3 className="font-display font-semibold text-[14px] mb-4">Question Palette</h3>
    <div className="grid grid-cols-5 gap-2">
      {questions.map((q, i) => (
        <button
          key={q.questionId}
          onClick={() => onNavigate(i)}
          className={cn(
            "w-9 h-9 rounded-lg text-[12.5px] font-semibold border transition",
            statusClasses[getStatus(q, visited.has(i))],
            currentIndex === i && "ring-2 ring-offset-1 ring-[var(--royal)]"
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
    <div className="mt-5 space-y-2 text-[12px]">
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Answered</div>
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block" /> Not Answered</div>
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-500 inline-block" /> Marked for Review</div>
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white border border-[var(--line)] inline-block" /> Not Visited</div>
    </div>
  </div>
);

export default QuestionPalette;
