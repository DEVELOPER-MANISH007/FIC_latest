import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StudyMaterialFormModal from "@/components/admin/StudyMaterialFormModal";
import { getIcon } from "@/constants/iconMap";
import {
  fetchAdminMaterials,
  fetchAdminMaterialSubjects,
  deleteMaterial,
  type AdminMaterialFilters,
} from "@/services/api/adminStudyMaterial.service";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import { formatFileSize, FILE_TYPE_LABEL, FILE_TYPE_COLOR } from "@/utils/studyMaterial";
import { useToast } from "@/context/ToastContext";
import type { StudyMaterialItem } from "@/types";

const SearchIcon = getIcon("search");
const PlusIcon = getIcon("plus");
const FileIcon = getIcon("file");
const EditIcon = getIcon("edit");
const TrashIcon = getIcon("trash");
const DownloadIcon = getIcon("download");
const CalendarIcon = getIcon("calendar");
const HardDriveIcon = getIcon("hardDrive");
const EyeIcon = getIcon("eye");

const SORT_OPTIONS: { value: AdminMaterialFilters["sortBy"]; label: string }[] = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "downloads", label: "Most Downloaded" },
  { value: "title", label: "Title (A-Z)" },
];

const AdminStudyMaterials = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [items, setItems] = useState<StudyMaterialItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [sortBy, setSortBy] = useState<AdminMaterialFilters["sortBy"]>("latest");

  const [editing, setEditing] = useState<StudyMaterialItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadSubjects = () => fetchAdminMaterialSubjects().then((s) => setSubjects(s || []));

  useEffect(() => {
    loadSubjects();
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    fetchAdminMaterials({ page, limit: pagination.limit, keyword, subject: subjectFilter, sortBy })
      .then((data) => {
        setItems(data?.items || []);
        if (data?.pagination) setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, subjectFilter, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this study material permanently?")) return;
    try {
      await deleteMaterial(id);
      toast.success("Study material deleted");
      load(pagination.page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not delete study material");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (material: StudyMaterialItem) => {
    setEditing(material);
    setShowModal(true);
  };

  const handleSaved = () => {
    setShowModal(false);
    load(pagination.page);
    loadSubjects();
  };

  return (
    <AdminLayout title="Study Material Management">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-xs w-full">
          <SearchIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            className="field pl-10"
            placeholder="Search by title, subject, unit..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select className="field max-w-[180px]" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select className="field max-w-[170px]" value={sortBy} onChange={(e) => setSortBy(e.target.value as AdminMaterialFilters["sortBy"])}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button onClick={openCreate} className="btn btn-primary btn-sm ml-auto">
          <PlusIcon size={14} /> Upload Material
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 h-52 ph" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
          No study materials found. Try adjusting your filters, or upload the first one.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((m) => (
            <div key={m._id} className="card p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${FILE_TYPE_COLOR[m.fileType]}`}>
                  <FileIcon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold text-[15px] leading-snug" title={m.title}>{m.title}</h3>
                  <p className="text-[12px] text-[var(--ink-soft)] truncate">{m.subject} · {m.unit}</p>
                </div>
                <span className={`text-[10.5px] font-semibold px-2 py-1 rounded-full shrink-0 ${FILE_TYPE_COLOR[m.fileType]}`}>
                  {FILE_TYPE_LABEL[m.fileType]}
                </span>
              </div>

              {m.description && <p className="text-[12.5px] text-[var(--ink-soft)] line-clamp-2">{m.description}</p>}

              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full w-fit ${m.visibility === "enrolled" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-700"}`}>
                {m.visibility === "enrolled" ? "Enrolled Only" : "Public"}
              </span>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-[var(--ink-soft)] mt-auto pt-2 border-t border-[var(--line)]">
                <span className="flex items-center gap-1.5"><CalendarIcon size={12} /> {new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
                <span className="flex items-center gap-1.5"><HardDriveIcon size={12} /> {formatFileSize(m.fileSize)}</span>
                <span className="flex items-center gap-1.5"><DownloadIcon size={12} /> {m.downloadCount}</span>
              </div>

              <div className="flex items-center gap-2">
                <a href={resolveImageUrl(m.fileUrl)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm flex-1 !text-[var(--ink)] !border-[var(--line)]">
                  <EyeIcon size={13} /> View
                </a>
                <button onClick={() => openEdit(m)} className="btn btn-outline btn-sm !text-[var(--royal)] !border-[var(--line)]">
                  <EditIcon size={13} />
                </button>
                <button onClick={() => handleDelete(m._id)} className="btn btn-outline btn-sm !text-red-500 !border-[var(--line)]">
                  <TrashIcon size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => load(p)}
              className={`w-9 h-9 rounded-lg text-[13px] font-medium ${
                p === pagination.page ? "bg-[var(--royal)] text-white" : "bg-white text-[var(--ink-soft)] border border-[var(--line)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <StudyMaterialFormModal material={editing} onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}
    </AdminLayout>
  );
};

export default AdminStudyMaterials;
