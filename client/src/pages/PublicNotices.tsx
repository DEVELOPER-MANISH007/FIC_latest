import { useWebsite } from "@/context/WebsiteContext";

const PublicNotices = () => {
  const { notices, cmsLoading } = useWebsite();
  return <section className="container-x min-h-[70vh] py-32">
    <p className="eyebrow">Institute updates</p>
    <h1 className="font-display text-4xl font-bold mt-3">Notices & announcements</h1>
    <p className="text-[var(--ink-soft)] mt-3">Important updates from Future IT College.</p>
    {cmsLoading ? <div className="grid gap-4 mt-10 max-w-4xl" aria-busy="true" aria-label="Loading notices">
      {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-36 rounded-xl bg-[var(--bg-soft)] animate-pulse motion-reduce:animate-none" />)}
      <span className="sr-only">Loading institute notices…</span>
    </div> : <div className="grid gap-4 mt-10 max-w-4xl">
      {notices.length ? notices.map((notice) => <article key={notice._id} className="card p-6">
        <div className="flex flex-wrap gap-3 items-center text-xs text-[var(--ink-soft)]"><span className="uppercase font-semibold text-[var(--royal)]">{notice.category}</span><time>{notice.publishAt ? new Date(notice.publishAt).toLocaleDateString() : ""}</time>{notice.pinned && <span className="text-[var(--orange)]">Pinned</span>}</div>
        <h2 className="font-display text-xl font-semibold mt-3">{notice.title}</h2>
        <p className="text-[var(--ink-soft)] mt-2 whitespace-pre-line">{notice.body || notice.summary}</p>
        {notice.link && <a className="text-[var(--royal)] mt-4 inline-block font-medium" href={notice.link}>Read more →</a>}
        {notice.attachment && <a className="text-[var(--royal)] mt-4 ml-4 inline-block font-medium" href={notice.attachment} target="_blank" rel="noreferrer">Open attachment →</a>}
      </article>) : <div className="card p-8 text-[var(--ink-soft)]">There are no current notices. Please check back soon.</div>}
    </div>}
  </section>;
};

export default PublicNotices;
