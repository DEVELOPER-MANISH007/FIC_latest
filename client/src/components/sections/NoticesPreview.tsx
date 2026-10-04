import { Link } from "react-router-dom";
import SectionHeading from "@/components/common/SectionHeading";
import { useWebsite } from "@/context/WebsiteContext";

const NoticesPreview = () => {
  const { notices, cmsLoading } = useWebsite();
  const items = notices.slice(0, 3);
  return <section id="notices" className="py-14 lg:py-20">
    <div className="container-x">
      <SectionHeading sectionKey="notices" eyebrow="Institute Notices" title="Latest updates" subtitle="Notices and announcements from the institute." />
      {cmsLoading ? <div className="grid md:grid-cols-3 gap-4 mt-10" aria-busy="true" aria-label="Loading notices">
        {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-40 rounded-xl bg-[var(--bg-soft)] animate-pulse motion-reduce:animate-none" />)}
        <span className="sr-only">Loading institute notices…</span>
      </div> : <div className="grid md:grid-cols-3 gap-4 mt-10">
        {items.length ? items.map((notice) => <article key={notice._id} className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-[var(--royal)]">{notice.category}</span><time className="text-xs text-[var(--ink-soft)]">{new Date(notice.publishAt).toLocaleDateString()}</time></div>
          <h3 className="font-display font-semibold text-lg mt-3">{notice.title}</h3><p className="text-sm text-[var(--ink-soft)] mt-2 line-clamp-3">{notice.summary || notice.body}</p>
          {notice.link && <a className="inline-block mt-3 text-sm font-medium text-[var(--royal)]" href={notice.link}>Details →</a>}
        </article>) : <div className="md:col-span-3 rounded-xl bg-[var(--bg-soft)] p-6 text-center text-sm text-[var(--ink-soft)]">There are no new notices at this time.</div>}
      </div>}
      <div className="text-center mt-6"><Link to="/notices" className="inline-flex items-center rounded-lg border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--navy)] hover:border-[var(--royal)]">All notices</Link></div>
    </div>
  </section>;
};

export default NoticesPreview;
