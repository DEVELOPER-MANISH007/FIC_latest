import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import QuestionFormModal from "@/components/admin/QuestionFormModal";
import ImportExcelModal from "@/components/admin/ImportExcelModal";
import { fetchCategories } from "@/services/api/category.service";
import {
  fetchQuestions,
  deleteQuestion,
  duplicateQuestion,
  bulkDeleteQuestions,
  exportQuestionsExcel,
  type QuestionFilters,
} from "@/services/api/adminQuestion.service";
import type { Category, QuestionBankItem } from "@/types";

const AdminQuestions = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuestionFilters>({ page: 1, limit: 20 });
  const [editing, setEditing] = useState<QuestionBankItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchQuestions(filters).then((data) => {
      setQuestions(data?.items || []);
      setTotal(data?.pagination.total || 0);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCategories().then((c) => setCategories(c || []));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await deleteQuestion(id);
    load();
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !confirm(`Delete ${selected.length} selected question(s)?`)) return;
    await bulkDeleteQuestions(selected);
    setSelected([]);
    load();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateQuestion(id);
    load();
  };

  return (
    <AdminLayout title="Question Bank Management">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-[13.5px] text-[var(--ink-soft)]">{total} question(s) total</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportQuestionsExcel()} className="btn btn-outline btn-sm !text-[var(--ink)] !border-[var(--line)]">
            Export Excel
          </button>
          <button onClick={() => setShowImport(true)} className="btn btn-navy btn-sm">
            Import Excel
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn btn-primary btn-sm"
          >
            + Create Question
          </button>
        </div>
      </div>

      <div className="card p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          className="field"
          placeholder="Search keyword..."
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value, page: 1 }))}
        />
        <select className="field" onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined, page: 1 }))}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select className="field" onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value || undefined, page: 1 }))}>
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select className="field" onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-4">
          <p className="text-[13.5px] text-red-600 font-medium">{selected.length} selected</p>
          <button onClick={handleBulkDelete} className="text-[13px] text-red-600 font-semibold hover:underline">
            Bulk Delete
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="h-64 ph" />
        ) : (
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="p-4 w-10"></th>
                <th className="p-4">Question</th>
                <th className="p-4">Category</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Marks</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(q._id)} onChange={() => toggleSelect(q._id)} />
                  </td>
                  <td className="p-4 max-w-xs truncate">{q.question}</td>
                  <td className="p-4 text-[var(--ink-soft)]">
                    {typeof q.category === "string" ? q.category : q.category?.name || "—"}
                  </td>
                  <td className="p-4">{q.difficulty}</td>
                  <td className="p-4">{q.marks}</td>
                  <td className="p-4">
                    <span className={q.status === "Active" ? "text-green-600" : "text-[var(--ink-soft)]"}>{q.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditing(q);
                          setShowForm(true);
                        }}
                        className="text-[var(--royal)] font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDuplicate(q._id)} className="text-[var(--ink-soft)] font-medium hover:underline">
                        Duplicate
                      </button>
                      <button onClick={() => handleDelete(q._id)} className="text-red-500 font-medium hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--ink-soft)]">
                    No questions found. Try adjusting filters or import from Excel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <QuestionFormModal
          question={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
      {showImport && (
        <ImportExcelModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            load();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminQuestions;

