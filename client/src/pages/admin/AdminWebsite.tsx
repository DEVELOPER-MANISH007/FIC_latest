import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import api from "@/services/api/axiosInstance";
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
  const startNew = () => setEditing({ order: items.length + 1, isActive: true, ...(resource === "notices" ? { publishAt: new Date().toISOString().slice(0, 10), category: "General" } : {}), ...(resource === "courses" ? { icon: "monitor", category: "general" } : {}), ...(resource === "gallery" ? { category: "Campus" } : {}), ...(resource === "testimonials" ? { rating: 5 } : {}) });
  const saveItem = async () => {
    if (!resource || !editing) return;
    setSaving(true);
    try {
      const payload = { ...editing };
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
    const form = new FormData(); form.append("image", file); form.append("folder", resource || "branding");
    try { const { data } = await api.post("/admin/website/upload", form); onUrl(data.data.url); toast.success("Image uploaded"); }
    catch (error: any) { toast.error(error.response?.data?.message || "Image upload failed; check Cloudinary configuration"); }
    event.target.value = "";
  };

  const nav = ["Overview", ...SETTINGS_GROUPS.map((group) => SETTING_LABELS[group]), ...Object.entries(RESOURCE_LABELS).map(([, label]) => label), "Media library"];
  const tabResource = Object.entries(RESOURCE_LABELS).find(([, label]) => label === tab)?.[0] as Resource | undefined;
  const activeGroup = SETTINGS_GROUPS.find((group) => SETTING_LABELS[group] === tab) || null;
  const currentItems = useMemo(() => items, [items]);

  const renderSettingsFields = (node: any, path: string[] = []): ReactNode => {
    if (node === null || typeof node !== "object") {
      const key = path[path.length - 1] || "value";
      const boolean = typeof node === "boolean";
      const number = typeof node === "number";
      const url = /(logo|favicon|image|url|href|src|map)/i.test(key);
      return <label key={path.join(".")} className="block"><span className="text-sm font-medium text-[var(--ink-soft)]">{humanize(key)}</span>
        {boolean ? <select className="input mt-2" value={String(node)} onChange={(e) => updatePath(path, e.target.value === "true")}><option value="true">Enabled</option><option value="false">Disabled</option></select> : <input className="input mt-2" type={number ? "number" : "text"} value={node ?? ""} onChange={(e) => updatePath(path, number ? Number(e.target.value) : e.target.value)} />}
        {url && <span className="mt-2 flex items-center gap-3"><input type="file" accept="image/*" className="text-xs" onChange={(e) => upload(e, (value) => updatePath(path, value))} /><span className="text-xs text-[var(--ink-soft)]">Upload image</span></span>}
      </label>;
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
        {node.map((entry, index) => <div key={index} className="rounded-xl border border-[var(--line)] bg-white p-4"><div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-[var(--ink-soft)]">Item {index + 1}</span><button type="button" className="text-xs text-red-600" onClick={() => updatePath(path, node.filter((_: any, i: number) => i !== index))}>Remove</button></div><div className="grid sm:grid-cols-2 gap-3">{Object.entries(entry || {}).map(([key, value]) => <label key={key} className="block"><span className="text-xs font-medium text-[var(--ink-soft)]">{humanize(key)}</span>{typeof value === "boolean" ? <select className="input mt-1" value={String(value)} onChange={(e) => updateEntry(index, key, e.target.value === "true")}><option value="true">Shown</option><option value="false">Hidden</option></select> : typeof value === "number" ? <input className="input mt-1" type="number" value={value} onChange={(e) => updateEntry(index, key, Number(e.target.value))} /> : <input className="input mt-1" value={String(value ?? "")} onChange={(e) => updateEntry(index, key, e.target.value)} />}</label>)}</div></div>)}
        {!node.length && <p className="rounded-xl bg-[var(--bg-soft)] p-4 text-sm text-[var(--ink-soft)]">No items yet. Use “Add item” to create one.</p>}
      </div>;
    }
    return <div key={path.join(".")} className={path.length === 1 ? "md:col-span-2 rounded-2xl border border-[var(--line)] p-5" : "grid md:grid-cols-2 gap-4"}>{path.length === 1 && <h3 className="font-display font-semibold mb-4">{humanize(path[0])}</h3>}{Object.entries(node).map(([key, value]) => renderSettingsFields(value, [...path, key]))}</div>;
  };

  const fieldControl = (field: { key: string; label: string; type?: string }) => {
    const value = editing?.[field.key] ?? (field.type === "boolean" ? false : field.type === "number" ? 0 : field.type === "list" ? [] : "");
    const set = (next: any) => setEditing((current) => ({ ...current, [field.key]: next }));
    const choices: Record<string, string[]> = { courseCategory: ["general", "programming", "office", "industry"], noticeCategory: ["Admission", "Exam", "Result", "Holiday", "Course", "General", "Important"], priority: ["normal", "important", "urgent"], galleryCategory: ["Campus", "Classroom", "Lab", "Events", "Workshops", "Seminars", "Students", "Achievements", "Computer Lab", "Smart Classroom", "Practical Sessions", "Institute Building", "Students Learning", "Other"] };
    if (field.type && choices[field.type]) return <select className="input mt-2" value={value || choices[field.type][0]} onChange={(e) => set(e.target.value)}>{choices[field.type].map((choice) => <option key={choice} value={choice}>{choice}</option>)}</select>;
    if (field.type === "boolean") return <select className="input mt-2" value={String(Boolean(value))} onChange={(e) => set(e.target.value === "true")}><option value="true">Yes</option><option value="false">No</option></select>;
    if (field.type === "textarea" || field.type === "list") return <textarea className="input mt-2 min-h-24" value={field.type === "list" ? (Array.isArray(value) ? value.join("\n") : "") : value} onChange={(e) => set(field.type === "list" ? e.target.value.split("\n").map((v) => v.trim()).filter(Boolean) : e.target.value)} />;
    return <><input className="input mt-2" type={field.type || "text"} value={typeof value === "string" && field.type === "date" ? value.slice(0, 10) : value} onChange={(e) => set(field.type === "number" ? Number(e.target.value) : e.target.value)} />{/(image|photo)/i.test(field.key) && <input className="mt-2 block text-xs" type="file" accept="image/*" onChange={(e) => upload(e, set)} />}</>;
  };

  return <AdminLayout title="Website Management">
    <div className="rounded-2xl bg-[#142343] text-white p-6 md:p-8 mb-6"><p className="text-sm text-white/75">Public website</p><h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Manage the institute website</h2><p className="text-white/80 mt-2 max-w-2xl">Update the information families see: institute details, homepage, courses, notices, photos and contact details.</p></div>
    <div className="flex gap-2 overflow-x-auto pb-3 mb-4">{nav.map((label) => <button key={label} onClick={() => { setTab(label); setEditing(null); }} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${tab === label ? "bg-[var(--royal)] text-white" : "bg-white text-[var(--ink-soft)] border border-[var(--line)]"}`}>{label}</button>)}</div>
    {tab === "Overview" ? <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{Object.entries(RESOURCE_LABELS).map(([name, label]) => <button key={name} onClick={() => setTab(label)} className="card p-5 text-left hover:-translate-y-0.5 transition"><p className="text-sm text-[var(--ink-soft)]">Manage</p><h3 className="font-display font-semibold text-lg mt-1">{label}</h3><p className="text-sm text-[var(--royal)] mt-4">Open manager →</p></button>)}{SETTINGS_GROUPS.map((group) => <button key={group} onClick={() => setTab(SETTING_LABELS[group])} className="card p-5 text-left hover:-translate-y-0.5 transition"><p className="text-sm text-[var(--ink-soft)]">Website settings</p><h3 className="font-display font-semibold text-lg mt-1">{SETTING_LABELS[group]}</h3><p className="text-sm text-[var(--royal)] mt-4">Edit settings →</p></button>)}</div> : null}
    {activeGroup && <section className="card p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><h2 className="font-display text-xl font-bold">{SETTING_LABELS[activeGroup]}</h2><p className="text-sm text-[var(--ink-soft)] mt-1">Changes update the public site configuration.</p></div><button className="btn btn-primary" disabled={saving || !settings[activeGroup]} onClick={saveSettings}>{saving ? "Saving…" : "Save changes"}</button></div>{settingsError ? <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{settingsError} <button className="ml-2 underline font-medium" onClick={() => loadSettings().catch(() => {})}>Try again</button></div> : <div className="grid md:grid-cols-2 gap-5">{settings[activeGroup] ? renderSettingsFields(settings[activeGroup], [activeGroup]) : <p className="text-sm text-[var(--ink-soft)]">Loading website settings…</p>}</div>}</section>}
    {tabResource && <section className="card p-5 md:p-7"><div className="flex flex-wrap justify-between items-center gap-3 mb-5"><div><h2 className="font-display text-xl font-bold">{RESOURCE_LABELS[tabResource]}</h2><p className="text-sm text-[var(--ink-soft)] mt-1">{currentItems.length} item(s). Public pages show published items.</p></div><button className="btn btn-primary" onClick={startNew}>Add {RESOURCE_LABELS[tabResource].replace(/s$/, "")}</button></div>
      {editing && <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)] p-5 mb-6"><h3 className="font-semibold mb-4">{editing._id ? "Edit item" : "New item"}</h3><div className="grid md:grid-cols-2 gap-4">{RESOURCE_FIELDS[tabResource].map((field) => <label key={field.key} className="block"><span className="text-sm font-medium">{field.label}</span>{fieldControl(field)}</label>)}</div><div className="flex gap-3 mt-5"><button className="btn btn-primary" onClick={saveItem} disabled={saving}>{saving ? "Saving…" : "Save item"}</button><button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button></div></div>}
      {loading ? <p className="py-8 text-center text-[var(--ink-soft)]" role="status">Loading content…</p> : resourceError ? <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">{resourceError}<button className="ml-2 underline font-medium" onClick={() => loadResource(tabResource)}>Try again</button></div> : currentItems.length ? <div className="divide-y divide-[var(--line)]">{currentItems.map((item) => <div key={item._id} className="py-4 flex items-center gap-4"><div className="min-w-0 flex-1"><p className="font-semibold truncate">{item.title || item.name || item.label || "Untitled"}</p><p className="text-xs text-[var(--ink-soft)] truncate">{item.category || item.designation || item.description || item.quote || "Website content"}</p></div><span className={`text-xs rounded-full px-2.5 py-1 ${item.isActive === false ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>{item.isActive === false ? "Hidden" : "Published"}</span><button className="text-sm text-[var(--royal)] font-medium" onClick={() => setEditing({ ...item })}>Edit</button><button className="text-sm text-red-600 font-medium" onClick={() => deleteItem(item)}>Delete</button></div>)}</div> : <div className="rounded-xl bg-[var(--bg-soft)] p-8 text-center text-[var(--ink-soft)]">Nothing here yet. Add the first website item.</div>}
    </section>}
    {tab === "Media library" && <MediaLibrary onUpload={upload} />}
  </AdminLayout>;
};

const MediaLibrary = ({ onUpload }: { onUpload: (event: ChangeEvent<HTMLInputElement>, onUrl: (url: string) => void) => void }) => {
  const [assets, setAssets] = useState<AnyRecord[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const toast = useToast();
  const load = () => { setLoading(true); setError(""); return api.get("/admin/website/media").then(({ data }) => setAssets(data.data || [])).catch((e) => { const message = e.response?.data?.message || "Could not load media"; setError(message); toast.error(message); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const deleteAsset = async (id: string) => { if (!window.confirm("Remove this media record? The stored image itself is retained.")) return; try { await api.delete(`/admin/website/media/${id}`); await load(); toast.success("Media record removed"); } catch (e: any) { toast.error(e.response?.data?.message || "Could not remove media"); } };
  return <section className="card p-5 md:p-7"><div className="flex items-center justify-between gap-3 mb-6"><div><h2 className="font-display text-xl font-bold">Media library</h2><p className="text-sm text-[var(--ink-soft)] mt-1">Upload and reuse images on the institute website (maximum 5 MB each).</p></div><label className="btn btn-primary cursor-pointer">Upload image<input type="file" accept="image/*" className="hidden" onChange={(event) => onUpload(event, () => setTimeout(load, 600))} /></label></div>{loading ? <p role="status">Loading media…</p> : error ? <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">{error}<button className="ml-2 underline font-medium" onClick={load}>Try again</button></div> : assets.length ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{assets.map((asset) => <article key={asset._id} className="rounded-xl border border-[var(--line)] overflow-hidden"><img src={asset.url} alt={asset.altText || asset.originalName} className="w-full aspect-square object-cover" /><div className="p-3"><p className="text-xs truncate">{asset.originalName}</p><button className="text-xs text-red-600 mt-2" onClick={() => deleteAsset(asset._id)}>Remove record</button></div></article>)}</div> : <p className="rounded-xl bg-[var(--bg-soft)] p-8 text-center text-[var(--ink-soft)]">No images uploaded yet.</p>}</section>;
};

export default AdminWebsite;
