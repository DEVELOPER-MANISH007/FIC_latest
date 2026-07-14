import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "@/components/student/StudentLayout";
import { getIcon } from "@/constants/iconMap";
import { fetchMaterials, fetchMaterialSubjects, registerDownload, type MaterialFilters } from "@/services/api/studyMaterial.service";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import { formatFileSize, FILE_TYPE_LABEL, FILE_TYPE_COLOR } from "@/utils/studyMaterial";
import { useToast } from "@/context/ToastContext";
import type { StudyMaterialItem } from "@/types";

const SearchIcon = getIcon("search");
const FileIcon = getIcon("file");
const EyeIcon = getIcon("eye");
const DownloadIcon = getIcon("download");
const CalendarIcon = getIcon("calendar");
const HardDriveIcon = getIcon("hardDrive");
const CloseIcon = getIcon("close");
const LockIcon = getIcon("lock");

/**
 * Student "Study Material" screen — browse/search/filter by Subject,
 * preview PDFs inline, and download files.
 *
 * Public material and the student's own Enrolled-Only material (matched
 * against their registered course) are fully unlocked. Enrolled-Only
 * material for other courses still shows up here — not hidden — but as a
 * locked card with an "available only for enrolled students" message and
 * an Enroll CTA, per the 3-state access model:
 *   not logged in -> redirected to /login by ProtectedRoute
 *   logged in, not enrolled -> locked card + Enroll CTA (this page)
 *   logged in, enrolled -> full view/download access
 */
const StudentStudyMaterial = () => {
  const toast = useToast();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [items, setItems] = useState<StudyMaterialItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [sortBy, setSortBy] = useState<MaterialFilters["sortBy"]>("latest");

  const [previewItem, setPreviewItem] = useState<StudyMaterialItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterialSubjects().then((s) => setSubjects(s || [])).catch(() => {});
  }, []);

  const load = (page = 1) => {
    setLoading(true);
    fetchMaterials({ page, limit: pagination.limit, keyword, subject: subjectFilter, sortBy })
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

  const handleDownload = async (material: StudyMaterialItem) => {
    setDownloadingId(material._id);
    try {
      const result = await registerDownload(material._id);
      const url = resolveImageUrl(result?.fileUrl || material.fileUrl);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.setAttribute("download", material.fileName || material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setItems((prev) => prev.map((m) => (m._id === material._id ? { ...m, downloadCount: m.downloadCount + 1 } : m)));
    } catch (err: any) {
      if (err?.response?.status === 403) {
        toast.error("This material is available only for enrolled students.");
      } else {
        toast.error("Could not start the download. Please try again.");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <StudentLayout title="Study Material">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-xs w-full">
          <SearchIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            className="field pl-10"
            placeholder="Search materials..."
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

        <select className="field max-w-[150px] ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value as MaterialFilters["sortBy"])}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 h-48 ph" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
          No study material found. Try adjusting your search or filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((m) => (
            <div key={m._id} className={`card p-6 flex flex-col gap-4 ${m.locked ? "opacity-90" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${m.locked ? "bg-[var(--bg-soft)] text-[var(--ink-soft)]" : FILE_TYPE_COLOR[m.fileType]}`}>
                  {m.locked ? <LockIcon size={18} /> : <FileIcon size={19} />}
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
                {!m.locked && <span className="flex items-center gap-1.5"><HardDriveIcon size={12} /> {formatFileSize(m.fileSize)}</span>}
                {!m.locked && <span className="flex items-center gap-1.5"><DownloadIcon size={12} /> {m.downloadCount}</span>}
              </div>

              {m.locked ? (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5">
                  <p className="text-[12px] text-amber-700 font-medium flex items-start gap-2">
                    <LockIcon size={13} className="shrink-0 mt-0.5" />
                    This material is available only for enrolled students.
                  </p>
                  <Link to="/#admission" className="btn btn-primary btn-sm w-full mt-3">
                    Enroll Now
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {m.fileType === "pdf" && (
                    <button onClick={() => setPreviewItem(m)} className="btn btn-outline btn-sm flex-1 !text-[var(--ink)] !border-[var(--line)]">
                      <EyeIcon size={13} /> Preview
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(m)}
                    disabled={downloadingId === m._id}
                    className={`btn btn-primary btn-sm ${m.fileType === "pdf" ? "flex-1" : "w-full"}`}
                  >
                    <DownloadIcon size={13} /> {downloadingId === m._id ? "..." : "Download"}
                  </button>
                </div>
              )}
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

      {previewItem && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-[var(--radius-lg)] max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
              <h2 className="font-display font-semibold text-[15px] truncate pr-4">{previewItem.title}</h2>
              <button onClick={() => setPreviewItem(null)} className="text-[var(--ink-soft)] hover:text-[var(--ink)] shrink-0">
                <CloseIcon size={20} />
              </button>
            </div>
            <iframe
              src={`${resolveImageUrl(previewItem.fileUrl)}#toolbar=1`}
              title={previewItem.title}
              className="flex-1 w-full"
            />
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentStudyMaterial;
