import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api/axiosInstance";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import { useToast } from "@/context/ToastContext";

type AnyRecord = Record<string, any>;
type Resource = "banners" | "notices" | "courses" | "faculty" | "gallery" | "testimonials";
const RESOURCE_LABELS: Record<Resource, string> = { banners: "Hero banners", notices: "Notices", courses: "Courses", faculty: "Faculty", gallery: "Gallery", testimonials: "Testimonials" };
const RESOURCE_FIELDS: Record<Resource, { key: string; label: string; type?: string }[]> = {
  banners: [{key:"title",label:"Title"},{key:"subtitle",label:"Subtitle"},{key:"description",label:"Description",type:"textarea"},{key:"image",label:"Desktop image URL"},{key:"mobileImage",label:"Mobile image URL"},{key:"primaryCtaText",label:"Main button"},{key:"primaryCtaHref",label:"Main button link"},{key:"secondaryCtaText",label:"Second button"},{key:"secondaryCtaHref",label:"Second button link"},{key:"startAt",label:"Start date",type:"date"},{key:"endAt",label:"End date",type:"date"},{key:"order",label:"Display order",type:"number"},{key:"isActive",label:"Visible",type:"boolean"}],
  notices: [{key:"title",label:"Title"},{key:"summary",label:"Short summary",type:"textarea"},{key:"body",label:"Full notice",type:"textarea"},{key:"category",label:"Category",type:"noticeCategory"},{key:"priority",label:"Priority",type:"priority"},{key:"link",label:"Link"},{key:"attachment",label:"Attachment URL"},{key:"publishAt",label:"Publish date",type:"date"},{key:"expiresAt",label:"Expiry date",type:"date"},{key:"pinned",label:"Pin to top",type:"boolean"},{key:"isActive",label:"Published",type:"boolean"}],
  courses: [{key:"title",label:"Course name"},{key:"shortTitle",label:"Short name"},{key:"description",label:"Description",type:"textarea"},{key:"icon",label:"Icon key"},{key:"duration",label:"Duration"},{key:"eligibility",label:"Eligibility"},{key:"feeDisplay",label:"Fee display"},{key:"image",label:"Image URL"},{key:"category",label:"Category",type:"courseCategory"},{key:"features",label:"Features (one per line)",type:"list"},{key:"subjects",label:"Subjects (one per line)",type:"list"},{key:"batches",label:"Batches (one per line)",type:"list"},{key:"ctaLabel",label:"Button label"},{key:"ctaHref",label:"Button link"},{key:"badge",label:"Badge"},{key:"order",label:"Display order",type:"number"},{key:"featured",label:"Featured",type:"boolean"},{key:"isActive",label:"Visible",type:"boolean"}],
  faculty: [{key:"name",label:"Name"},{key:"designation",label:"Position"},{key:"subject",label:"Subject"},{key:"qualification",label:"Qualification"},{key:"experience",label:"Experience"},{key:"specialization",label:"Specialization"},{key:"bio",label:"Biography",type:"textarea"},{key:"image",label:"Image URL"},{key:"order",label:"Display order",type:"number"},{key:"isActive",label:"Visible",type:"boolean"}],
  gallery: [{key:"title",label:"Title"},{key:"category",label:"Category",type:"galleryCategory"},{key:"caption",label:"Caption",type:"textarea"},{key:"eventName",label:"Event name"},{key:"eventDate",label:"Event date",type:"date"},{key:"image",label:"Image URL"},{key:"order",label:"Display order",type:"number"},{key:"isFeatured",label:"Featured",type:"boolean"},{key:"isActive",label:"Visible",type:"boolean"}],
  testimonials: [{key:"name",label:"Student name"},{key:"role",label:"Course or batch"},{key:"quote",label:"Review",type:"textarea"},{key:"rating",label:"Rating (1–5)",type:"number"},{key:"image",label:"Photo URL"},{key:"order",label:"Display order",type:"number"},{key:"isActive",label:"Published",type:"boolean"}],
};
const SETTINGS_GROUPS = ["brand", "navbar", "homepage", "contact", "socials", "footer", "seo", "websiteSettings"];
const SETTING_LABELS: Record<string, string> = { brand: "General / Branding", navbar: "Navbar", homepage: "Homepage", contact: "Contact", socials: "Social Links", footer: "Footer", seo: "SEO", websiteSettings: "Website Settings" };
const humanize = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const mediaPreviewUrl = (value: string) => value.startsWith("/uploads") ? resolveImageUrl(value) : value;

const AdminWebsite = () => {
  const toast = useToast();
  const [tab, setTab] = useState("Overview");
  const [settings, setSettings] = useState<AnyRecord>({});
  const [items, setItems] = useState<AnyRecord[]>([]);
  const [arrayDrafts, setArrayDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [resourceError, setResourceError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const resource = tab in RESOURCE_LABELS ? tab as Resource : null;

  const loadSettings = async () => {
    setSettingsError("");
    try {
      const { data } = await api.get("/admin/website/settings");
      setSettings(data.data?.data || {});
    } catch (error: any) {
      setSettingsError(error.response?.data?.message || "Website settings could not be loaded.");
      throw error;
    }
  };
  const loadResource = async (name: Resource) => {
    setLoading(true);
    setResourceError("");
    try { const { data } = await api.get(`/admin/website/${name}`); setItems(data.data || []); }
    catch (error: any) { const message = error.response?.data?.message || `Could not load ${RESOURCE_LABELS[name].toLowerCase()}`; setResourceError(message); toast.error(message); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadSettings().catch((error: any) => toast.error(error.response?.data?.message || "Could not load website content")); }, []);
  useEffect(() => { setEditing(null); if (resource) loadResource(resource); }, [resource]);

  const updatePath = (path: string[], value: any) => setSettings((current) => {
    const next = clone(current); let node = next;
    path.slice(0, -1).forEach((key) => { node[key] = { ...(node[key] || {}) }; node = node[key]; });
    node[path[path.length - 1]] = value; return next;
  });
  const saveSettings = async () => {
    setSaving(true);
    try { await api.put("/admin/website/settings", { data: settings }); window.dispatchEvent(new Event("fic:website-refresh")); toast.success("Website content saved and refreshed."); }
    catch (error: any) { toast.error(error.response?.data?.message || "Could not save website content"); }
    finally { setSaving(false); }
  };
  const startNew = () => setEditing({ order: items.length + 1, isActive: true, ...(resource === "notices" ? { publishAt: new Date().toISOString().slice(0, 10), category: "General" } : {}), ...(resource === "courses" ? { icon: "monitor", category: "office" } : {}), ...(resource === "gallery" ? { category: "Campus" } : {}), ...(resource === "testimonials" ? { rating: 5 } : {}) });
  const saveItem = async () => {
    if (!resource || !editing) return;
    const required: Record<Resource, string[]> = {
      banners: ["title", "image"], notices: ["title"], courses: ["title"],
      faculty: ["name", "designation", "qualification", "image"], gallery: ["title", "category", "image"],
      testimonials: ["name", "quote"],
    };
    const missing = required[resource].filter((key) => !String(editing[key] ?? "").trim());
    if (missing.length) { toast.error(`Please complete: ${missing.map(humanize).join(", ")}.`); return; }
    setSaving(true);
    try {
      const payload = { ...editing };
      if (resource === "courses") {
        payload.description = String(payload.description || "").trim() || `Practical training in ${String(payload.title).trim()}.`;
        payload.icon = String(payload.icon || "").trim() || "monitor";
        payload.category = payload.category || "office";
      }
      if (resource === "notices") { if (payload.publishAt) payload.publishAt = new Date(payload.publishAt).toISOString(); if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt).toISOString(); else payload.expiresAt = null; }
      if (resource === "gallery") { if (payload.eventDate) payload.eventDate = new Date(payload.eventDate).toISOString(); else payload.eventDate = null; }
      if (resource === "banners") { for (const key of ["startAt", "endAt"]) { if (payload[key]) payload[key] = new Date(payload[key]).toISOString(); else payload[key] = null; } }
      if (editing._id) await api.put(`/admin/website/${resource}/${editing._id}`, payload); else await api.post(`/admin/website/${resource}`, payload);
      toast.success("Website item saved"); setEditing(null); await loadResource(resource); window.dispatchEvent(new Event("fic:website-refresh"));
    } catch (error: any) { toast.error(error.response?.data?.message || "Could not save this item"); }
    finally { setSaving(false); }
  };
  const deleteItem = async (item: AnyRecord) => {
    if (!resource || !item._id || !window.confirm(`Delete “${item.title || item.name || RESOURCE_LABELS[resource]}”?`)) return;
    try { await api.delete(`/admin/website/${resource}/${item._id}`); toast.success("Item deleted"); await loadResource(resource); window.dispatchEvent(new Event("fic:website-refresh")); }
    catch (error: any) { toast.error(error.response?.data?.message || "Could not delete this item"); }
  };
  const upload = async (event: ChangeEvent<HTMLInputElement>, onUrl: (url: string) => void) => {
    const file = event.target.files?.[0]; if (!file) return;
    const accepted = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!accepted.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("Choose a JPG, PNG, WebP or GIF image smaller than 5 MB."); event.target.value = ""; return;
    }
    const form = new FormData(); form.append("image", file); form.append("folder", resource || "branding");
    setUploading(file.name); setUploadProgress(0);
    try { const { data } = await api.post("/admin/website/upload", form, { onUploadProgress: (event) => setUploadProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0) }); onUrl(data.data.url); toast.success("Image uploaded and ready to save"); }
    catch (error: any) { toast.error(error.response?.data?.message || "Image upload failed; check Cloudinary configuration"); }
    finally { setUploading(""); setUploadProgress(0); event.target.value = ""; }
  };

  const nav = ["Overview", ...SETTINGS_GROUPS.map((group) => SETTING_LABELS[group]), "Facilities", ...Object.entries(RESOURCE_LABELS).map(([, label]) => label), "Media library"];
  const tabResource = Object.entries(RESOURCE_LABELS).find(([, label]) => label === tab)?.[0] as Resource | undefined;
  const activeGroup = SETTINGS_GROUPS.find((group) => SETTING_LABELS[group] === tab) || null;
  const facilitySettings = settings.homepage?.sections?.facilities;
  const currentItems = useMemo(() => items, [items]);

  const renderSettingsFields = (node: any, path: string[] = []): ReactNode => {
    if (node === null || typeof node !== "object") {
      const key = path[path.length - 1] || "value";
      const boolean = typeof node === "boolean";
      const number = typeof node === "number";
      const image = /(logo|favicon|image|photo|ogImage)/i.test(key);
      const url = image || /(url|href|src|map)/i.test(key);
      return <div key={path.join(".")} className="block"><span className="text-sm font-medium text-[var(--ink-soft)]">{humanize(key)}</span>
        {image ? <ImagePicker value={String(node ?? "")} uploading={uploading} progress={uploadProgress} onChange={(value) => updatePath(path, value)} onUpload={(event) => upload(event, (value) => updatePath(path, value))} /> : boolean ? <select className="input mt-2" value={String(node)} onChange={(e) => updatePath(path, e.target.value === "true")}><option value="true">Enabled</option><option value="false">Disabled</option></select> : <input className="input mt-2" type={number ? "number" : "text"} value={node ?? ""} onChange={(e) => updatePath(path, number ? Number(e.target.value) : e.target.value)} />}
        {url && !image && <span className="mt-2 text-xs text-[var(--ink-soft)]">Use a full web address or a safe site link.</span>}
      </div>;
    }
    if (Array.isArray(node)) {
      const draftKey = path.join(".");
      const simpleList = node.every((entry) => entry === null || ["string", "number", "boolean"].includes(typeof entry));
      if (simpleList) return <label key={draftKey} className="block md:col-span-2"><span className="text-sm font-medium text-[var(--ink-soft)]">{humanize(path[path.length - 1] || "items")} · one per line</span><textarea className="input mt-2 min-h-24" value={arrayDrafts[draftKey] ?? node.join("\n")} onChange={(e) => {
        const value = e.target.value; setArrayDrafts((current) => ({ ...current, [draftKey]: value }));
        updatePath(path, value.split("\n").map((line) => line.trim()).filter(Boolean));
      }} /></label>;
      const updateEntry = (index: number, key: string, value: any) => {
        const next = [...node]; next[index] = { ...next[index], [key]: value }; updatePath(path, next);
      };
      return <div key={draftKey} className="md:col-span-2 space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{humanize(path[path.length - 1] || "items")}</h3><button type="button" className="text-sm font-medium text-[var(--royal)]" onClick={() => updatePath(path, [...node, Object.fromEntries(Object.entries(node[0] || { label: "", title: "", value: "", href: "", visible: true, order: node.length + 1 }).map(([key, value]) => [key, key === "order" ? node.length + 1 : key === "visible" || key === "enabled" ? true : typeof value === "number" ? 0 : ""]))])}>Add item</button></div>
        {node.map((entry, index) => <div key={index} className="rounded-xl border border-[var(--line)] bg-white p-4"><div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-[var(--ink-soft)]">Item {index + 1}</span><button type="button" className="text-xs text-red-600" onClick={() => updatePath(path, node.filter((_: any, i: number) => i !== index))}>Remove</button></div><div className="grid sm:grid-cols-2 gap-3">{Object.entries(entry || {}).map(([key, value]) => <div key={key} className="block"><span className="text-xs font-medium text-[var(--ink-soft)]">{humanize(key)}</span>{/(image|photo|logo)/i.test(key) ? <ImagePicker value={String(value ?? "")} uploading={uploading} progress={uploadProgress} onChange={(next) => updateEntry(index, key, next)} onUpload={(event) => upload(event, (next) => updateEntry(index, key, next))} compact /> : typeof value === "boolean" ? <select className="input mt-1" value={String(value)} onChange={(e) => updateEntry(index, key, e.target.value === "true")}><option value="true">Shown</option><option value="false">Hidden</option></select> : typeof value === "number" ? <input className="input mt-1" type="number" value={value} onChange={(e) => updateEntry(index, key, Number(e.target.value))} /> : <input className="input mt-1" value={String(value ?? "")} onChange={(e) => updateEntry(index, key, e.target.value)} />}</div>)}</div></div>)}
        {!node.length && <p className="rounded-xl bg-[var(--bg-soft)] p-4 text-sm text-[var(--ink-soft)]">No items yet. Use “Add item” to create one.</p>}
      </div>;
    }
    return <div key={path.join(".")} className={path.length === 1 ? "md:col-span-2 rounded-2xl border border-[var(--line)] p-5" : "grid md:grid-cols-2 gap-4"}>{path.length === 1 && <h3 className="font-display font-semibold mb-4">{humanize(path[0])}</h3>}{Object.entries(node).map(([key, value]) => renderSettingsFields(value, [...path, key]))}</div>;
  };

  const fieldControl = (field: { key: string; label: string; type?: string }) => {
    const value = editing?.[field.key] ?? (field.type === "boolean" ? false : field.type === "number" ? 0 : field.type === "list" ? [] : "");
    const set = (next: any) => setEditing((current) => ({ ...current, [field.key]: next }));
    const choices: Record<string, { value: string; label: string }[]> = {
      courseCategory: [
        ...(editing?.category === "general" ? [{ value: "general", label: "General (legacy course)" }] : []),
        { value: "office", label: "Computer & Office" },
        { value: "programming", label: "Programming & Coding" },
        { value: "professional", label: "Professional IT" },
        { value: "industry", label: "Industry-Level / Engineering" },
        { value: "design", label: "Design & Multimedia" },
      ],
      noticeCategory: ["Admission", "Exam", "Result", "Holiday", "Course", "General", "Important"].map((choice) => ({ value: choice, label: choice })),
      priority: ["normal", "important", "urgent"].map((choice) => ({ value: choice, label: choice })),
      galleryCategory: ["Campus", "Classroom", "Lab", "Events", "Workshops", "Seminars", "Students", "Achievements", "Computer Lab", "Smart Classroom", "Practical Sessions", "Institute Building", "Students Learning", "Other"].map((choice) => ({ value: choice, label: choice })),
    };
    if (field.type && choices[field.type]) return <select className="input mt-2" value={value || choices[field.type][0].value} onChange={(e) => set(e.target.value)}>{choices[field.type].map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>;
    if (field.type === "boolean") return <select className="input mt-2" value={String(Boolean(value))} onChange={(e) => set(e.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select>;
    if (field.type === "textarea" || field.type === "list") return <textarea className="input mt-2 min-h-24" value={field.type === "list" ? (Array.isArray(value) ? value.join("\n") : "") : value} onChange={(e) => set(field.type === "list" ? e.target.value.split("\n").map((v) => v.trim()).filter(Boolean) : e.target.value)} />;
    if (/(image|photo)/i.test(field.key)) return <ImagePicker value={String(value ?? "")} uploading={uploading} progress={uploadProgress} onChange={set} onUpload={(event) => upload(event, set)} />;
    return <input className="input mt-2" type={field.type || "text"} value={typeof value === "string" && field.type === "date" ? value.slice(0, 10) : value} onChange={(e) => set(field.type === "number" ? Number(e.target.value) : e.target.value)} />;
  };

  return <AdminLayout title="Website Management">
    <div className="rounded-2xl bg-[#142343] text-white p-6 md:p-8 mb-6"><p className="text-sm text-white/75">Public website</p><h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Manage the institute website</h2><p className="text-white/80 mt-2 max-w-2xl">Update the information families see: institute details, homepage, courses, notices, photos and contact details.</p></div>
    <div className="flex gap-2 overflow-x-auto pb-3 mb-4">{nav.map((label) => <button key={label} onClick={() => { setTab(label); setEditing(null); }} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${tab === label ? "bg-[var(--royal)] text-white" : "bg-white text-[var(--ink-soft)] border border-[var(--line)]"}`}>{label}</button>)}</div>
    {tab === "Overview" ? <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{Object.entries(RESOURCE_LABELS).map(([name, label]) => <button key={name} onClick={() => setTab(label)} className="card p-5 text-left hover:-translate-y-0.5 transition"><p className="text-sm text-[var(--ink-soft)]">Manage</p><h3 className="font-display font-semibold text-lg mt-1">{label}</h3><p className="text-sm text-[var(--royal)] mt-4">Open manager →</p></button>)}{SETTINGS_GROUPS.map((group) => <button key={group} onClick={() => setTab(SETTING_LABELS[group])} className="card p-5 text-left hover:-translate-y-0.5 transition"><p className="text-sm text-[var(--ink-soft)]">Website settings</p><h3 className="font-display font-semibold text-lg mt-1">{SETTING_LABELS[group]}</h3><p className="text-sm text-[var(--royal)] mt-4">Edit settings →</p></button>)}</div> : null}
    {activeGroup && <section className="card p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><h2 className="font-display text-xl font-bold">{SETTING_LABELS[activeGroup]}</h2><p className="text-sm text-[var(--ink-soft)] mt-1">Changes update the public site configuration.</p></div><button className="btn btn-primary" disabled={saving || Boolean(uploading) || !settings[activeGroup]} onClick={saveSettings}>{saving ? "Saving…" : "Save changes"}</button></div>{settingsError ? <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{settingsError} <button className="ml-2 underline font-medium" onClick={() => loadSettings().catch(() => {})}>Try again</button></div> : <div className="grid md:grid-cols-2 gap-5">{settings[activeGroup] ? renderSettingsFields(settings[activeGroup], [activeGroup]) : <p className="text-sm text-[var(--ink-soft)]">Loading website settings…</p>}</div>}</section>}
    {tab === "Facilities" && <section className="card p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><h2 className="font-display text-xl font-bold">Facilities & infrastructure</h2><p className="text-sm text-[var(--ink-soft)] mt-1">Edit facility cards, add photos, change order, and control visibility.</p></div><button className="btn btn-primary" disabled={saving || Boolean(uploading) || !facilitySettings} onClick={saveSettings}>{saving ? "Saving…" : "Save facilities"}</button></div>{settingsError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{settingsError}<button className="ml-2 underline" onClick={() => loadSettings().catch(() => {})}>Try again</button></div> : facilitySettings ? renderSettingsFields(facilitySettings, ["homepage", "sections", "facilities"]) : <p role="status">Loading facilities…</p>}</section>}
    {tabResource && <section className="card p-5 md:p-7"><div className="flex flex-wrap justify-between items-center gap-3 mb-5"><div><h2 className="font-display text-xl font-bold">{RESOURCE_LABELS[tabResource]}</h2><p className="text-sm text-[var(--ink-soft)] mt-1">{currentItems.length} item(s). Public pages show published items.</p></div><button className="btn btn-primary" onClick={startNew}>Add {RESOURCE_LABELS[tabResource].replace(/s$/, "")}</button></div>
      {editing && <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] p-5 mb-6"><h3 className="font-semibold mb-4">{editing._id ? "Edit item" : "New item"}</h3><div className="grid md:grid-cols-2 gap-4">{RESOURCE_FIELDS[tabResource].map((field) => <div key={field.key} className="block"><span className="text-sm font-medium">{field.label}</span>{fieldControl(field)}</div>)}</div><div className="flex gap-3 mt-5"><button className="btn btn-primary" onClick={saveItem} disabled={saving || Boolean(uploading)}>{saving ? "Saving…" : "Save item"}</button><button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button></div></div>}
      {loading ? <p className="py-8 text-center text-[var(--ink-soft)]" role="status">Loading content…</p> : resourceError ? <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">{resourceError}<button className="ml-2 underline font-medium" onClick={() => loadResource(tabResource)}>Try again</button></div> : currentItems.length ? <div className="divide-y divide-[var(--line)]">{currentItems.map((item) => <div key={item._id} className="py-4 flex items-center gap-4">{item.image && <img src={resolveImageUrl(item.image)} alt="" className="h-14 w-14 rounded-lg object-cover border border-[var(--line)]" onError={(event) => { event.currentTarget.classList.add("hidden"); }} />}<div className="min-w-0 flex-1"><p className="font-semibold truncate">{item.title || item.name || item.label || "Untitled"}</p><p className="text-xs text-[var(--ink-soft)] truncate">{item.category || item.designation || item.description || item.quote || "Website content"}</p></div><span className={`text-xs rounded-full px-2.5 py-1 ${item.isActive === false ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>{item.isActive === false ? "Hidden" : "Published"}</span><button className="text-sm text-[var(--royal)] font-medium" onClick={() => setEditing({ ...item })}>Edit</button><button className="text-sm text-red-600 font-medium" onClick={() => deleteItem(item)}>Delete</button></div>)}</div> : <div className="rounded-xl bg-[var(--bg-soft)] p-8 text-center text-[var(--ink-soft)]">Nothing here yet. Add the first website item.</div>}
    </section>}
    {tab === "Media library" && <MediaLibrary onUpload={upload} uploading={uploading} progress={uploadProgress} />}
  </AdminLayout>;
};

const ImagePicker = ({ value, uploading, progress, onChange, onUpload, compact = false }: { value: string; uploading: string; progress: number; onChange: (value: string) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void; compact?: boolean }) => {
  const [broken, setBroken] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<AnyRecord[]>([]);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryLoading, setLibraryLoading] = useState(false);
  const toast = useToast();
  const preview = value ? resolveImageUrl(value) : "";
  const openLibrary = async () => {
    setLibraryOpen((open) => !open);
    if (libraryAssets.length) return;
    setLibraryLoading(true);
    try { const { data } = await api.get("/admin/website/media"); setLibraryAssets(data.data || []); }
    catch (error: any) { toast.error(error.response?.data?.message || "Could not load media library"); }
    finally { setLibraryLoading(false); }
  };
  const matches = libraryAssets.filter((asset) => `${asset.originalName} ${asset.altText} ${asset.url}`.toLowerCase().includes(libraryQuery.toLowerCase()));
  return <div className={`mt-2 ${compact ? "space-y-2" : "grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start"}`}>
    <div className="min-w-0"><input className="input" type="text" value={value} onChange={(event) => { setBroken(false); onChange(event.target.value); }} placeholder="Image URL or upload below" />
      {preview && !broken ? <img src={mediaPreviewUrl(value)} alt="Selected website image preview" className={`mt-2 rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] object-contain ${compact ? "h-24 max-w-full" : "h-28 w-full"}`} onError={() => setBroken(true)} /> : value ? <p role="alert" className="mt-2 text-xs text-amber-700">This image URL could not be previewed. Check the address or choose another image.</p> : <p className="mt-2 text-xs text-[var(--ink-soft)]">No image selected. The website will use its normal fallback where available.</p>}
    </div>
    <div className="flex flex-col gap-2"><label className="btn btn-outline cursor-pointer text-center">{uploading ? `Uploading ${progress}%` : "Replace / upload"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={Boolean(uploading)} onChange={onUpload} /></label><button type="button" className="text-xs font-medium text-[var(--royal)] underline" onClick={openLibrary}>Choose from media</button>{value && <button type="button" className="text-xs text-red-600" onClick={() => { setBroken(false); onChange(""); }}>Remove / reset</button>}</div>
    {libraryOpen && <div className="col-span-full rounded-xl border border-[var(--line)] bg-white p-3 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Choose an uploaded image</p><button type="button" aria-label="Close media picker" className="text-xs text-[var(--ink-soft)] underline" onClick={() => setLibraryOpen(false)}>Close</button></div><input className="input mt-2" placeholder="Search media" value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} />{libraryLoading ? <p className="py-3 text-sm" role="status">Loading media…</p> : matches.length ? <div className="mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">{matches.map((asset) => <button type="button" key={asset._id} className="rounded-lg border border-[var(--line)] p-2 text-left hover:border-[var(--royal)]" onClick={() => { setBroken(false); onChange(asset.url); setLibraryOpen(false); }}><img src={mediaPreviewUrl(asset.url)} alt="" className="mb-1 aspect-video w-full rounded object-cover" /><span className="block truncate text-xs">{asset.originalName}</span><span className="block text-[10px] text-[var(--ink-soft)]">{asset.usedIn?.length ? `Used in ${asset.usedIn.length} place(s)` : "Unused"}</span></button>)}</div> : <p className="py-3 text-sm text-[var(--ink-soft)]">No matching media found. Upload an image to add it to the library.</p>}</div>}
  </div>;
};

const MediaLibrary = ({ onUpload, uploading, progress }: { onUpload: (event: ChangeEvent<HTMLInputElement>, onUrl: (url: string) => void) => void; uploading: string; progress: number }) => {
  const [assets, setAssets] = useState<AnyRecord[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [query, setQuery] = useState(""); const toast = useToast();
  const load = () => { setLoading(true); setError(""); return api.get("/admin/website/media").then(({ data }) => setAssets(data.data || [])).catch((e) => { const message = e.response?.data?.message || "Could not load media"; setError(message); toast.error(message); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const deleteAsset = async (asset: AnyRecord) => { const usedIn = asset.usedIn || []; if (usedIn.length) { toast.error(`Remove this image from ${usedIn[0]} before deleting it.`); return; } if (!window.confirm("Delete this unused image from the media library and its managed storage?")) return; try { await api.delete(`/admin/website/media/${asset._id}`); await load(); toast.success("Unused image deleted"); } catch (e: any) { toast.error(e.response?.data?.message || "Could not delete image"); } };
  const filtered = assets.filter((asset) => `${asset.originalName} ${asset.altText} ${asset.folder} ${asset.url}`.toLowerCase().includes(query.toLowerCase()) || (query.toLowerCase() === "unused" && !asset.usedIn?.length));
  return <section className="card p-5 md:p-7"><div className="flex flex-wrap items-center justify-between gap-3 mb-5"><div><h2 className="font-display text-xl font-bold">Media library</h2><p className="text-sm text-[var(--ink-soft)] mt-1">Images uploaded for public website content (JPG, PNG, WebP or GIF; up to 5 MB).</p></div><label className={`btn btn-primary ${uploading ? "opacity-60 cursor-wait" : "cursor-pointer"}`}>{uploading ? `Uploading ${progress}%` : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={Boolean(uploading)} onChange={(event) => onUpload(event, () => setTimeout(load, 300))} /></label></div><input className="input mb-5 max-w-md" aria-label="Search media" placeholder="Search by name, URL, or type “unused”…" value={query} onChange={(event) => setQuery(event.target.value)} />{loading ? <p role="status">Loading media…</p> : error ? <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">{error}<button className="ml-2 underline font-medium" onClick={load}>Try again</button></div> : filtered.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map((asset) => <article key={asset._id} className="rounded-xl border border-[var(--line)] overflow-hidden min-w-0"><img src={mediaPreviewUrl(asset.url)} alt={asset.altText || asset.originalName} className="w-full aspect-[4/3] object-cover bg-[var(--bg-soft)]" onError={(event) => { event.currentTarget.alt = "Image preview unavailable"; event.currentTarget.classList.add("opacity-40"); }} /><div className="p-3 space-y-2"><p className="text-sm font-medium truncate" title={asset.originalName}>{asset.originalName}</p><p className="text-xs text-[var(--ink-soft)]">{asset.usedIn?.length ? `Used in ${asset.usedIn.length} place(s)` : "Unused"}</p>{asset.usedIn?.length > 0 && <p className="text-xs text-[var(--ink-soft)] line-clamp-2">{asset.usedIn.slice(0, 3).join(" · ")}</p>}<div className="flex flex-wrap gap-3 text-xs"><a href={mediaPreviewUrl(asset.url)} target="_blank" rel="noreferrer" className="text-[var(--royal)] underline">Preview / open</a><button type="button" className="text-[var(--royal)] underline" onClick={() => navigator.clipboard.writeText(asset.url).then(() => toast.success("Image URL copied")).catch(() => toast.error("Could not copy the image URL"))}>Copy URL</button><button type="button" disabled={Boolean(asset.usedIn?.length)} className="text-red-600 underline disabled:opacity-40" onClick={() => deleteAsset(asset)}>{asset.usedIn?.length ? "In use" : "Delete unused"}</button></div></div></article>)}</div> : <p className="rounded-xl bg-[var(--bg-soft)] p-8 text-center text-[var(--ink-soft)]">{assets.length ? "No media matches your search." : "No images uploaded yet."}</p>}</section>;
};

export default AdminWebsite;
