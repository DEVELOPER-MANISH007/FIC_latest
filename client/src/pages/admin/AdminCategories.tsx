import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchCategories, createCategory, deleteCategory } from "@/services/api/category.service";
import type { Category } from "@/types";

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => fetchCategories().then((c) => setCategories(c || []));
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createCategory({ name, description });
      setName("");
      setDescription("");
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not create category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This only works if no questions use it.")) return;
    try {
      await deleteCategory(id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not delete category");
    }
  };

  return (
    <AdminLayout title="Question Categories">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <form onSubmit={handleCreate} className="card p-6 h-fit space-y-4">
          <h2 className="font-display font-semibold text-lg">Add Category</h2>
          <div>
            <label className="f-label">Name</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cyber Security" />
          </div>
          <div>
            <label className="f-label">Description (optional)</label>
            <textarea className="field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {error && <p className="text-[12.5px] text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4">All Categories ({categories.length})</h2>
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-soft)]">
                <div>
                  <p className="font-medium text-[14px]">{c.name}</p>
                  {c.description && <p className="text-[12px] text-[var(--ink-soft)]">{c.description}</p>}
                </div>
                <button onClick={() => handleDelete(c._id)} className="text-[12.5px] text-red-500 font-medium hover:underline">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;

