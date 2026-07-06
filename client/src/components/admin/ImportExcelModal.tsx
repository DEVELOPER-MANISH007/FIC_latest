import { useRef, useState } from "react";
import { importQuestionsExcel } from "@/services/api/adminQuestion.service";

interface Props {
  onClose: () => void;
  onImported: () => void;
}

const ImportExcelModal = ({ onClose, onImported }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof importQuestionsExcel>> | null>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const res = await importQuestionsExcel(file);
      setResult(res);
      if (res && res.importedCount > 0) onImported();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          err?.message ||
          "Import failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">Import Questions from Excel</h2>
          <button onClick={onClose} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">✕</button>
        </div>

        <p className="text-[13px] text-[var(--ink-soft)] mb-4">
          Required columns: Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D), Difficulty,
          Marks. Optional: Category, Explanation, Topic, Language.
        </p>

        <input ref={fileRef} type="file" accept=".xlsx,.csv" className="field" />

        {error && <p className="text-[12.5px] text-red-500 mt-3">{error}</p>}

        {result && (
          <div className="mt-5 space-y-2 text-[13px]">
            <p className="text-green-600 font-medium">Imported Successfully: {result.importedCount}</p>
            <p className="text-amber-600 font-medium">Duplicate Records: {result.duplicateCount}</p>
            <p className="text-red-500 font-medium">Failed Records: {result.failedCount}</p>
            {result.failed.length > 0 && (
              <div className="max-h-32 overflow-y-auto bg-red-50 rounded-lg p-3 text-[12px] text-red-600">
                {result.failed.map((f) => (
                  <p key={f.row}>Row {f.row}: {f.reason}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)] flex-1">
            Close
          </button>
          <button onClick={handleUpload} disabled={loading} className="btn btn-primary flex-1">
            {loading ? "Importing..." : "Upload & Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExcelModal;
