import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  fetchAdminExamById,
  createExam,
  updateExam,
  addExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  duplicateExamQuestion,
  importExamQuestions,
  type ExamQuestionPayload,
} from "@/services/api/adminExam.service";
import type { ExamConfig, QuestionBankItem } from "@/types";

interface ConfigState {
  name: string;
  category: string;
  durationMinutes: number;
  passingPercentage: number;
  description: string;
  isActive: boolean;
}

const EMPTY_QUESTION: ExamQuestionPayload = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  difficulty: "Medium",
  marks: 1,
  explanation: "",
};

/**
 * Test Builder — creates/edits one Test with its OWN questions.
 * Questions added here (manually or via CSV) belong to this test only.
 */
const AdminTestBuilder = () => {
  const { examId: id } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [examId, setExamId] = useState<string | null>(id || null);
  const [config, setConfig] = useState<ConfigState>({
    name: "",
    category: "",
    durationMinutes: 15,
    passingPercentage: 60,
    description: "",
    isActive: true,
  });
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qForm, setQForm] = useState<ExamQuestionPayload>(EMPTY_QUESTION);
  const [qError, setQError] = useState("");
  const [qSaving, setQSaving] = useState(false);

  // CSV import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string>("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchAdminExamById(id)
      .then((exam) => {
        setConfig({
          name: exam.name,
          category: exam.category || "",
          durationMinutes: exam.durationMinutes,
          passingPercentage: exam.passingPercentage,
          description: exam.description || "",
          isActive: exam.isActive,
        });
        setQuestions((exam.questions || []).filter((q): q is QuestionBankItem => typeof q !== "string"));
      })
      .catch(() => setError("Could not load this test"))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return questions;
    const term = search.trim().toLowerCase();
    return questions.filter((q) => q.question.toLowerCase().includes(term));
  }, [questions, search]);

  /** Creates the test on first save; updates it afterwards. */
  const persistConfig = async (): Promise<string | null> => {
    setError("");
    if (!config.name.trim()) {
      setError("Test name is required");
      return null;
    }
    const payload = {
      name: config.name,
      category: config.category,
      durationMinutes: config.durationMinutes,
      passingPercentage: config.passingPercentage,
      description: config.description,
      isActive: config.isActive,
      difficulty: "Mixed" as const,
    };
    if (examId) {
      await updateExam(examId, payload);
      return examId;
    }
    const created = await createExam(payload);
    if (!created?._id) return null;
    setExamId(created._id);
    // Move onto the edit URL so refreshes keep the builder state
    window.history.replaceState(null, "", `/admin/exams/${created._id}/builder`);
    return created._id;
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const savedId = await persistConfig();
      if (savedId) setNotice("Test details saved. Now add questions below.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not save the test");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTest = async () => {
    setSaving(true);
    try {
      const savedId = await persistConfig();
      if (savedId) navigate("/admin/exams");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not save the test");
    } finally {
      setSaving(false);
    }
  };

  /** Ensures the exam exists before question operations. */
  const requireExamId = async (): Promise<string | null> => {
    if (examId) return examId;
    try {
      return await persistConfig();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Save the test details first");
      return null;
    }
  };

  const openAddQuestion = async () => {
    const idReady = await requireExamId();
    if (!idReady) return;
    setEditingId(null);
    setQForm(EMPTY_QUESTION);
    setQError("");
    setShowQuestionForm(true);
  };

  const openEditQuestion = (q: QuestionBankItem) => {
    setEditingId(q._id);
    setQForm({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      marks: q.marks,
      explanation: q.explanation || "",
    });
    setQError("");
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async () => {
    if (!examId) return;
    setQError("");
    const requiredMissing = !qForm.question?.trim() || !qForm.optionA?.trim() || !qForm.optionB?.trim() || !qForm.optionC?.trim() || !qForm.optionD?.trim();
    if (requiredMissing) {
      setQError("Question text and all four options are required");
      return;
    }
    setQSaving(true);
    try {
      if (editingId) {
        const updated = await updateExamQuestion(examId, editingId, qForm);
        if (updated) setQuestions((list) => list.map((q) => (q._id === editingId ? updated : q)));
      } else {
        const created = await addExamQuestion(examId, qForm);
        if (created) setQuestions((list) => [...list, created]);
      }
      setQForm(EMPTY_QUESTION);
      setEditingId(null);
      // Keep the form open so the admin can continue adding questions
      if (editingId) setShowQuestionForm(false);
    } catch (err: any) {
      setQError(err?.response?.data?.message || "Could not save the question");
    } finally {
      setQSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!examId) return;
    if (!confirm("Remove this question from the test?")) return;
    await deleteExamQuestion(examId, questionId);
    setQuestions((list) => list.filter((q) => q._id !== questionId));
  };

  const handleDuplicateQuestion = async (questionId: string) => {
    if (!examId) return;
    const copy = await duplicateExamQuestion(examId, questionId);
    if (copy) setQuestions((list) => [...list, copy]);
  };

  const handleImportCsv = async (file: File) => {
    const idReady = await requireExamId();
    if (!idReady) return;
    setImporting(true);
    setImportSummary("");
    try {
      const summary = await importExamQuestions(idReady, file);
      if (summary) {
        const fresh = (summary.exam.questions || []).filter((q): q is QuestionBankItem => typeof q !== "string");
        setQuestions(fresh);
        let text = `Imported ${summary.importedCount} question${summary.importedCount === 1 ? "" : "s"} into this test.`;
        if (summary.failedCount) {
          text += ` ${summary.failedCount} row(s) failed:`;
          text += summary.failed.map((f) => ` Row ${f.row}: ${f.reason}`).join(";");
        }
        setImportSummary(text);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "Import failed";
      setImportSummary(message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Test Builder">
        <div className="card p-8 h-40 ph" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew && !examId ? "Create Test" : "Edit Test"}>
      {/* Step 1 — Test configuration */}
      <div className="card p-6 mb-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">Step 1 — Test Details</h2>
          <button onClick={() => navigate("/admin/exams")} className="text-[13px] text-[var(--ink-soft)] hover:underline">
            Back to Tests
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="f-label" htmlFor="tb-name">Test Name</label>
            <input id="tb-name" className="field" value={config.name} onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))} />
          </div>
          <div>
            <label className="f-label" htmlFor="tb-category">Category</label>
            <input id="tb-category" className="field" placeholder="e.g. Basic Computer" value={config.category} onChange={(e) => setConfig((c) => ({ ...c, category: e.target.value }))} />
          </div>
          <div>
            <label className="f-label" htmlFor="tb-duration">Duration (minutes)</label>
            <input id="tb-duration" className="field" type="number" min={1} value={config.durationMinutes} onChange={(e) => setConfig((c) => ({ ...c, durationMinutes: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="f-label" htmlFor="tb-passing">Passing Marks (%)</label>
            <input id="tb-passing" className="field" type="number" min={0} max={100} value={config.passingPercentage} onChange={(e) => setConfig((c) => ({ ...c, passingPercentage: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="f-label" htmlFor="tb-total">Total Questions</label>
            <input id="tb-total" className="field bg-[var(--bg-soft)]" value={questions.length} readOnly aria-readonly />
          </div>
          <div>
            <label className="f-label" htmlFor="tb-status">Status</label>
            <select id="tb-status" className="field" value={config.isActive ? "active" : "inactive"} onChange={(e) => setConfig((c) => ({ ...c, isActive: e.target.value === "active" }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="f-label" htmlFor="tb-desc">Description</label>
          <textarea id="tb-desc" className="field" rows={2} value={config.description} onChange={(e) => setConfig((c) => ({ ...c, description: e.target.value }))} />
        </div>

        {error && <p className="text-[12.5px] text-red-500">{error}</p>}
        {notice && <p className="text-[12.5px] text-green-600">{notice}</p>}

        <button onClick={handleSaveConfig} disabled={saving || !config.name.trim()} className="btn btn-navy btn-sm">
          {saving ? "Saving..." : examId ? "Update Test Details" : "Save & Continue to Questions"}
        </button>
      </div>

      {/* Step 2 — Questions */}
      <div className="card p-6 mb-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-lg">
            Step 2 — Questions <span className="text-[13px] font-normal text-[var(--ink-soft)]">({questions.length} in this test)</span>
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={openAddQuestion} className="btn btn-primary btn-sm">+ Add Question</button>
            <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]">
              {importing ? "Importing..." : "Import CSV"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              aria-label="Import questions from CSV or Excel file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportCsv(file);
              }}
            />
          </div>
        </div>

        <p className="text-[12.5px] text-[var(--ink-soft)]">
          CSV columns: Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D), Difficulty, Marks, Explanation.
          Imported questions belong to this test only.
        </p>

        {importSummary && <p className="text-[12.5px] font-medium text-[var(--royal)]">{importSummary}</p>}

        {/* Inline question form */}
        {showQuestionForm && (
          <div className="rounded-xl border border-[var(--line)] p-5 space-y-4 bg-[var(--bg-soft)]">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-[15px]">{editingId ? "Edit Question" : `Add Question #${questions.length + 1}`}</h3>
              <button onClick={() => { setShowQuestionForm(false); setEditingId(null); }} className="text-[var(--ink-soft)] hover:text-[var(--ink)]" aria-label="Close question form">✕</button>
            </div>

            <div>
              <label className="f-label" htmlFor="qf-question">Question</label>
              <textarea id="qf-question" className="field" rows={2} value={qForm.question || ""} onChange={(e) => setQForm((f) => ({ ...f, question: e.target.value }))} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {(["A", "B", "C", "D"] as const).map((letter) => (
                <div key={letter}>
                  <label className="f-label" htmlFor={`qf-option${letter}`}>Option {letter}</label>
                  <input
                    id={`qf-option${letter}`}
                    className="field"
                    value={(qForm[`option${letter}` as keyof ExamQuestionPayload] as string) || ""}
                    onChange={(e) => setQForm((f) => ({ ...f, [`option${letter}`]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="f-label" htmlFor="qf-correct">Correct Answer</label>
                <select id="qf-correct" className="field" value={qForm.correctAnswer} onChange={(e) => setQForm((f) => ({ ...f, correctAnswer: e.target.value as "A" | "B" | "C" | "D" }))}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="f-label" htmlFor="qf-difficulty">Difficulty</label>
                <select id="qf-difficulty" className="field" value={qForm.difficulty} onChange={(e) => setQForm((f) => ({ ...f, difficulty: e.target.value as "Easy" | "Medium" | "Hard" }))}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="f-label" htmlFor="qf-marks">Marks</label>
                <input id="qf-marks" className="field" type="number" step={0.5} min={0} value={qForm.marks ?? 1} onChange={(e) => setQForm((f) => ({ ...f, marks: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <label className="f-label" htmlFor="qf-explanation">Explanation (optional)</label>
              <textarea id="qf-explanation" className="field" rows={2} value={qForm.explanation || ""} onChange={(e) => setQForm((f) => ({ ...f, explanation: e.target.value }))} />
            </div>

            {qError && <p className="text-[12.5px] text-red-500">{qError}</p>}

            <button onClick={handleSaveQuestion} disabled={qSaving} className="btn btn-primary btn-sm">
              {qSaving ? "Saving..." : editingId ? "Update Question" : "Save & Add Next"}
            </button>
          </div>
        )}

        {/* Search */}
        {questions.length > 0 && (
          <div>
            <label className="sr-only" htmlFor="qf-search">Search questions</label>
            <input id="qf-search" className="field" placeholder="Search questions in this test..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        )}

        {/* Question preview list */}
        {filteredQuestions.length === 0 ? (
          <p className="text-[13.5px] text-[var(--ink-soft)] py-4">
            {questions.length === 0 ? "No questions in this test yet. Add manually or import a CSV." : "No questions match your search."}
          </p>
        ) : (
          <ol className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <li key={q._id} className="rounded-xl border border-[var(--line)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-[14px]">
                    <span className="text-[var(--ink-soft)] mr-2">Q{questions.indexOf(q) + 1 || idx + 1}.</span>
                    {q.question}
                  </p>
                  <div className="flex items-center gap-3 shrink-0 text-[12.5px] font-semibold">
                    <button onClick={() => openEditQuestion(q)} className="text-[var(--royal)] hover:underline">Edit</button>
                    <button onClick={() => handleDuplicateQuestion(q._id)} className="text-[var(--ink-soft)] hover:underline">Duplicate</button>
                    <button onClick={() => handleDeleteQuestion(q._id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 mt-3 text-[13px]">
                  {(["A", "B", "C", "D"] as const).map((letter) => (
                    <div
                      key={letter}
                      className={`px-3 py-1.5 rounded-lg border ${letter === q.correctAnswer ? "border-green-400 bg-green-50" : "border-[var(--line)]"}`}
                    >
                      <span className="font-semibold">{letter}.</span> {q[`option${letter}` as keyof QuestionBankItem] as string}
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-[var(--ink-soft)] mt-2">
                  {q.difficulty} · {q.marks} mark{q.marks === 1 ? "" : "s"}
                  {q.explanation ? ` · Explanation: ${q.explanation}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Save Test */}
      <div className="flex justify-end">
        <button onClick={handleSaveTest} disabled={saving || !config.name.trim()} className="btn btn-primary">
          {saving ? "Saving..." : "Save Test"}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminTestBuilder;
