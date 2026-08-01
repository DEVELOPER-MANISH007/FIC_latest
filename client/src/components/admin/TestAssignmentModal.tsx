import { useEffect, useMemo, useState } from "react";
import { getIcon } from "@/constants/iconMap";
import { fetchStudents, fetchStudentBatches } from "@/services/api/adminStudent.service";
import { assignExam } from "@/services/api/adminExam.service";
import { useToast } from "@/context/ToastContext";
import type { ExamConfig, StudentUser } from "@/types";

const CloseIcon = getIcon("close");
const SearchIcon = getIcon("search");

interface Props {
  exam: ExamConfig;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Student-wise / Batch-wise Test Assignment popup — opened from the
 * "Activate" action on the Test Management list. Admin chooses who can
 * see this test: everyone, whole batches, individually searched students,
 * or any combination. Saving resolves the final student list on the
 * server and activates the test (see assignExam / PATCH .../assign).
 */
const TestAssignmentModal = ({ exam, onClose, onSaved }: Props) => {
  const toast = useToast();

  const [assignToAll, setAssignToAll] = useState(exam.assignToAll ?? true);
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<Set<string>>(new Set());
  // Explicitly added students (by search) that aren't covered by a selected batch.
  const [individualStudents, setIndividualStudents] = useState<Map<string, StudentUser>>(new Map());
  // Students explicitly unchecked even though a selected batch would otherwise include them.
  const [excludedStudents, setExcludedStudents] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<StudentUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const wasAlreadyAssigned = exam.isActive && !exam.assignToAll && (exam.assignedStudents?.length ?? 0) > 0;

  useEffect(() => {
    fetchStudentBatches()
      .then(setBatches)
      .catch(() => setBatches([]));
  }, []);

  // Debounced search-as-you-type by name or Student ID.
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      fetchStudents({ keyword: search.trim(), limit: 20 })
        .then((res) => setSearchResults(res.items || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const isEffectivelySelected = (student: StudentUser) => {
    if (individualStudents.has(student.id)) return true;
    if (excludedStudents.has(student.id)) return false;
    return !!student.batch && selectedBatches.has(student.batch);
  };

  const handleSelectAll = () => {
    setAssignToAll(true);
    setError("");
  };

  const handleDeselectAll = () => {
    setAssignToAll(false);
    setSelectedBatches(new Set());
    setIndividualStudents(new Map());
    setExcludedStudents(new Set());
  };

  const toggleBatch = (batch: string) => {
    setAssignToAll(false);
    setSelectedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batch)) next.delete(batch);
      else next.add(batch);
      return next;
    });
  };

  const toggleStudent = (student: StudentUser) => {
    setAssignToAll(false);
    const selected = isEffectivelySelected(student);

    if (selected) {
      // Deselecting: drop it if it was an individual add, otherwise it's
      // batch-driven, so record an explicit exclusion instead.
      setIndividualStudents((prev) => {
        if (!prev.has(student.id)) return prev;
        const next = new Map(prev);
        next.delete(student.id);
        return next;
      });
      if (student.batch && selectedBatches.has(student.batch)) {
        setExcludedStudents((prev) => new Set(prev).add(student.id));
      }
    } else {
      setExcludedStudents((prev) => {
        if (!prev.has(student.id)) return prev;
        const next = new Set(prev);
        next.delete(student.id);
        return next;
      });
      setIndividualStudents((prev) => new Map(prev).set(student.id, student));
    }
  };

  const selectedBatchList = useMemo(() => Array.from(selectedBatches), [selectedBatches]);
  const individualList = useMemo(() => Array.from(individualStudents.values()), [individualStudents]);

  const handleSave = async () => {
    setError("");
    if (!assignToAll && selectedBatches.size === 0 && individualStudents.size === 0) {
      setError("Select all students, at least one batch, or at least one individual student.");
      return;
    }

    setSaving(true);
    try {
      await assignExam(exam._id, {
        assignToAll,
        batches: selectedBatchList,
        students: individualList.map((s) => s.id),
        excludedStudents: Array.from(excludedStudents),
      });
      toast.success("Test activated — assignment saved");
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not save the test assignment";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-[var(--radius-lg)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-xl">Who can access "{exam.name}"?</h2>
          <button onClick={onClose} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <CloseIcon size={20} />
          </button>
        </div>
        <p className="text-[13px] text-[var(--ink-soft)] mb-6">
          Choose who should see this test after login. Only selected students will be able to access it.
        </p>

        {wasAlreadyAssigned && (
          <p className="text-[12.5px] text-[var(--ink-soft)] bg-[var(--surface-soft,#f6f7fb)] border border-[var(--line)] rounded-lg px-3 py-2 mb-5">
            This test is already assigned to {exam.assignedStudents?.length} student(s). Saving below replaces that
            assignment with your selection here.
          </p>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={handleSelectAll}
            className={assignToAll ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]"}
          >
            ✅ Select All Students
          </button>
          <button type="button" onClick={handleDeselectAll} className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]">
            Deselect All
          </button>
        </div>

        {!assignToAll && (
          <div className="space-y-6">
            {/* Batch Selection */}
            <div>
              <h3 className="text-[13.5px] font-semibold mb-2">Batch Selection</h3>
              {batches.length === 0 ? (
                <p className="text-[12.5px] text-[var(--ink-soft)]">No batches found yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {batches.map((batch) => (
                    <label
                      key={batch}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] cursor-pointer ${
                        selectedBatches.has(batch) ? "border-[var(--royal)] bg-[var(--royal)]/10 font-medium" : "border-[var(--line)]"
                      }`}
                    >
                      <input type="checkbox" checked={selectedBatches.has(batch)} onChange={() => toggleBatch(batch)} />
                      {batch}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Individual Student Selection */}
            <div>
              <h3 className="text-[13.5px] font-semibold mb-2">Individual Student Selection</h3>
              <div className="relative mb-3">
                <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  className="field !pl-9"
                  placeholder="Search by Student ID or Name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {searching && <p className="text-[12.5px] text-[var(--ink-soft)]">Searching...</p>}

              {!searching && search.trim() && searchResults.length === 0 && (
                <p className="text-[12.5px] text-[var(--ink-soft)]">No students match "{search.trim()}".</p>
              )}

              <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--line)] divide-y divide-[var(--line)]">
                {searchResults.length === 0 && individualList.length === 0 ? (
                  !search.trim() && <p className="text-[12.5px] text-[var(--ink-soft)] p-4">Search to find and add specific students.</p>
                ) : (
                  (searchResults.length ? searchResults : individualList).map((student) => (
                    <label key={student.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px] cursor-pointer hover:bg-[var(--line)]/20">
                      <input type="checkbox" checked={isEffectivelySelected(student)} onChange={() => toggleStudent(student)} />
                      <span className="font-medium">{student.studentIdCode || "—"}</span>
                      <span className="text-[var(--ink-soft)]">{student.name}</span>
                      {student.batch && <span className="ml-auto text-[11.5px] text-[var(--ink-soft)]">{student.batch}</span>}
                    </label>
                  ))
                )}
              </div>

              {individualList.length > 0 && (
                <p className="text-[12px] text-[var(--ink-soft)] mt-2">{individualList.length} student(s) individually added.</p>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-[12.5px] text-red-500 mt-5">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]">
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={handleSave} className="btn btn-primary btn-sm">
            {saving ? "Saving..." : "Save & Activate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAssignmentModal;
