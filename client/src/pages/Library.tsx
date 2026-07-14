import { useEffect, useMemo, useState } from "react";
import Reveal from "@/components/common/Reveal";
import { getIcon } from "@/constants/iconMap";
import {
  fetchPublicMaterials,
  fetchPublicMaterialSubjects,
  registerPublicDownload,
} from "@/services/api/publicMaterial.service";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import { formatFileSize, FILE_TYPE_LABEL, FILE_TYPE_COLOR } from "@/utils/studyMaterial";
import type { StudyMaterialItem } from "@/types";

const SearchIcon = getIcon("search");
const FolderIcon = getIcon("folder");
const FileIcon = getIcon("file");
const ChevronRightIcon = getIcon("chevronRight");
const DownloadIcon = getIcon("download");
const EyeIcon = getIcon("eye");
const CalendarIcon = getIcon("calendar");
const CloseIcon = getIcon("close");
const BookIcon = getIcon("bookOpen");

const NOTES_PAGE_SIZE = 9;

/**
 * Public Digital Library — Subject -> Unit -> Notes folder browsing.
 * Public visibility only; Enrolled-Only material never appears here (the
 * backend hard-scopes /api/public/materials to visibility:"public").
 * Reuses the existing public materials API only — no new backend surface.
 */
const Library = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectItems, setSubjectItems] = useState<StudyMaterialItem[]>([]);
  const [subjectItemsLoading, setSubjectItemsLoading] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [notesPage, setNotesPage] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<StudyMaterialItem[]>([]);
  const [searchPagination, setSearchPagination] = useState({ page: 1, limit: 24, total: 0, pages: 1 });
  const [searchLoading, setSearchLoading] = useState(false);

  const [previewItem, setPreviewItem] = useState<StudyMaterialItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Load the subject folder list once on mount.
  useEffect(() => {
    fetchPublicMaterialSubjects()
      .then((s) => setSubjects(s || []))
      .finally(() => setSubjectsLoading(false));
  }, []);

  // Debounce the search box into `keyword`.
  useEffect(() => {
    const t = setTimeout(() => setKeyword(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Global search mode — real server-side pagination via the existing API.
  useEffect(() => {
    if (!keyword) return;
    setSearchLoading(true);
    fetchPublicMaterials({ keyword, page: 1, limit: searchPagination.limit, sortBy: "latest" })
      .then((data) => {
        setSearchResults(data?.items || []);
        if (data?.pagination) setSearchPagination(data.pagination);
      })
      .finally(() => setSearchLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const loadSearchPage = (page: number) => {
    setSearchLoading(true);
    fetchPublicMaterials({ keyword, page, limit: searchPagination.limit, sortBy: "latest" })
      .then((data) => {
        setSearchResults(data?.items || []);
        if (data?.pagination) setSearchPagination(data.pagination);
      })
      .finally(() => setSearchLoading(false));
  };

  const openSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
    setNotesPage(1);
    setSubjectItemsLoading(true);
    fetchPublicMaterials({ subject, limit: 60, sortBy: "latest" })
      .then((data) => setSubjectItems(data?.items || []))
      .finally(() => setSubjectItemsLoading(false));
  };

  const goToLibraryRoot = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSearchInput("");
    setKeyword("");
  };

  const goToSubjectRoot = () => {
    setSelectedUnit(null);
    setNotesPage(1);
    setSearchInput("");
    setKeyword("");
  };

  // Distinct units (folders) within the currently open subject, with counts.
  const units = useMemo(() => {
    const map = new Map<string, number>();
    subjectItems.forEach((item) => {
      const unitName = item.unit || "General";
      map.set(unitName, (map.get(unitName) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [subjectItems]);

  const notesInUnit = useMemo(
    () => subjectItems.filter((item) => (item.unit || "General") === selectedUnit),
    [subjectItems, selectedUnit]
  );

  const notesPageCount = Math.max(Math.ceil(notesInUnit.length / NOTES_PAGE_SIZE), 1);
  const notesPageItems = notesInUnit.slice((notesPage - 1) * NOTES_PAGE_SIZE, notesPage * NOTES_PAGE_SIZE);

  const handleDownload = async (material: StudyMaterialItem) => {
    setDownloadingId(material._id);
    try {
      const result = await registerPublicDownload(material._id);
      const url = resolveImageUrl(result?.fileUrl || material.fileUrl);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.setAttribute("download", material.fileName || material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      const bump = (list: StudyMaterialItem[]) =>
        list.map((m) => (m._id === material._id ? { ...m, downloadCount: m.downloadCount + 1 } : m));
      setSubjectItems(bump);
      setSearchResults(bump);
    } finally {
      setDownloadingId(null);
    }
  };

  const isSearching = keyword.length > 0;

  const NoteCard = ({ m, delay = 0 }: { m: StudyMaterialItem; delay?: number }) => (
    <Reveal delay={delay} className="h-full">
      <div className="card p-6 flex flex-col gap-4 h-full">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${FILE_TYPE_COLOR[m.fileType]}`}>
            <FileIcon size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-[15.5px] leading-snug">{m.title}</h3>
            <p className="text-[12px] text-[var(--ink-soft)] truncate">{m.subject} · {m.unit}</p>
          </div>
          <span className={`text-[10.5px] font-semibold px-2 py-1 rounded-full shrink-0 ${FILE_TYPE_COLOR[m.fileType]}`}>
            {FILE_TYPE_LABEL[m.fileType]}
          </span>
        </div>

        {m.description && <p className="text-[12.5px] text-[var(--ink-soft)] line-clamp-2">{m.description}</p>}

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-[var(--ink-soft)] mt-auto pt-2 border-t border-[var(--line)]">
          <span className="flex items-center gap-1.5"><CalendarIcon size={12} /> {new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
          <span>{formatFileSize(m.fileSize)}</span>
        </div>

        <div className="flex items-center gap-2">
          {m.fileType === "pdf" && (
            <button onClick={() => setPreviewItem(m)} className="btn btn-outline btn-sm flex-1 !text-[var(--ink)] !border-[var(--line)]">
              <EyeIcon size={13} /> View
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
      </div>
    </Reveal>
  );

  return (
    <>
      {/* Library Banner */}
      <section className="grad-navy pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase text-[var(--orange-soft)] bg-white/10 px-3.5 py-1.5 rounded-full">
                <BookIcon size={13} /> Learning Resources
              </span>
              <h1 className="font-display font-bold text-3xl lg:text-[42px] text-white mt-4 leading-tight">
                Digital Notes Library
              </h1>
              <p className="text-[#C6CEEF] text-[15px] mt-3 leading-relaxed">
                Free, open access to notes, cheat sheets, and practice material — browse by subject, no login required.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-3 mt-9 max-w-2xl">
              <div className="relative flex-1">
                <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  className="field pl-11 !bg-white"
                  placeholder="Search notes by title, subject, unit..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <select
                className="field !bg-white sm:max-w-[220px]"
                value={selectedSubject || ""}
                onChange={(e) => (e.target.value ? openSubject(e.target.value) : goToLibraryRoot())}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-x">
          {/* Breadcrumb */}
          {!isSearching && (
            <div className="flex items-center flex-wrap gap-1.5 text-[13.5px] font-medium mb-8">
              <button
                onClick={goToLibraryRoot}
                className={selectedSubject ? "text-[var(--ink-soft)] hover:text-[var(--royal)]" : "text-[var(--royal)]"}
              >
                Library
              </button>
              {selectedSubject && (
                <>
                  <ChevronRightIcon size={14} className="text-[var(--ink-soft)]" />
                  <button
                    onClick={goToSubjectRoot}
                    className={selectedUnit ? "text-[var(--ink-soft)] hover:text-[var(--royal)]" : "text-[var(--royal)]"}
                  >
                    {selectedSubject}
                  </button>
                </>
              )}
              {selectedUnit && (
                <>
                  <ChevronRightIcon size={14} className="text-[var(--ink-soft)]" />
                  <span className="text-[var(--royal)]">{selectedUnit}</span>
                </>
              )}
            </div>
          )}
          {isSearching && (
            <div className="flex items-center gap-3 mb-8">
              <p className="text-[13.5px] font-medium text-[var(--ink-soft)]">
                Search results for <span className="text-[var(--ink)] font-semibold">&ldquo;{keyword}&rdquo;</span>
              </p>
              <button onClick={() => setSearchInput("")} className="text-[12.5px] font-medium text-[var(--royal)] hover:underline flex items-center gap-1">
                <CloseIcon size={12} /> Clear search
              </button>
            </div>
          )}

          {/* ---- Search results (flat, server-paginated) ---- */}
          {isSearching ? (
            searchLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => <div key={i} className="card p-6 h-48 ph" />)}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
                No notes match &ldquo;{keyword}&rdquo;. Try a different keyword.
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchResults.map((m, i) => <NoteCard key={m._id} m={m} delay={(i % 6) * 0.05} />)}
                </div>
                {searchPagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: searchPagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => loadSearchPage(p)}
                        className={`w-9 h-9 rounded-lg text-[13px] font-medium ${
                          p === searchPagination.page ? "bg-[var(--royal)] text-white" : "bg-white text-[var(--ink-soft)] border border-[var(--line)]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )
          ) : !selectedSubject ? (
            /* ---- Level 1: Subject folders ---- */
            subjectsLoading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => <div key={i} className="card p-6 h-28 ph" />)}
              </div>
            ) : subjects.length === 0 ? (
              <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
                No public notes have been added yet — check back soon.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {subjects.map((s, i) => (
                  <Reveal key={s} delay={(i % 8) * 0.04}>
                    <button
                      onClick={() => openSubject(s)}
                      className="card p-6 flex items-center gap-4 w-full text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-soft)] text-[var(--royal)] flex items-center justify-center shrink-0">
                        <FolderIcon size={26} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-[15px] truncate">{s}</p>
                        <p className="text-[12px] text-[var(--ink-soft)]">Browse notes</p>
                      </div>
                    </button>
                  </Reveal>
                ))}
              </div>
            )
          ) : !selectedUnit ? (
            /* ---- Level 2: Unit folders within a subject ---- */
            subjectItemsLoading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[1, 2, 3].map((i) => <div key={i} className="card p-6 h-28 ph" />)}
              </div>
            ) : units.length === 0 ? (
              <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">
                No public notes found under {selectedSubject} yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {units.map((u, i) => (
                  <Reveal key={u.name} delay={(i % 8) * 0.04}>
                    <button
                      onClick={() => { setSelectedUnit(u.name); setNotesPage(1); }}
                      className="card p-6 flex items-center gap-4 w-full text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FolderIcon size={26} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-[15px] truncate">{u.name}</p>
                        <p className="text-[12px] text-[var(--ink-soft)]">{u.count} note{u.count === 1 ? "" : "s"}</p>
                      </div>
                    </button>
                  </Reveal>
                ))}
              </div>
            )
          ) : (
            /* ---- Level 3: Notes within a unit ---- */
            <>
              {notesInUnit.length === 0 ? (
                <div className="card p-10 text-center text-[14px] text-[var(--ink-soft)]">No notes found in this unit.</div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {notesPageItems.map((m, i) => <NoteCard key={m._id} m={m} delay={(i % 6) * 0.05} />)}
                  </div>
                  {notesPageCount > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      {Array.from({ length: notesPageCount }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setNotesPage(p)}
                          className={`w-9 h-9 rounded-lg text-[13px] font-medium ${
                            p === notesPage ? "bg-[var(--royal)] text-white" : "bg-white text-[var(--ink-soft)] border border-[var(--line)]"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {previewItem && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-[var(--radius-lg)] max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
              <h2 className="font-display font-semibold text-[15px] truncate pr-4">{previewItem.title}</h2>
              <button onClick={() => setPreviewItem(null)} className="text-[var(--ink-soft)] hover:text-[var(--ink)] shrink-0">
                <CloseIcon size={20} />
              </button>
            </div>
            <iframe src={`${resolveImageUrl(previewItem.fileUrl)}#toolbar=1`} title={previewItem.title} className="flex-1 w-full" />
          </div>
        </div>
      )}
    </>
  );
};

export default Library;
