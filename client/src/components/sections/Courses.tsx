import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { getIcon } from "@/constants/iconMap";
import { COURSES_FALLBACK } from "@/constants/siteData";
import type { Course } from "@/types";
import { useWebsite } from "@/context/WebsiteContext";
import { resolveImageUrl } from "@/services/api/axiosInstance";

const ArrowRightIcon = getIcon("arrowRight");

const Courses = () => {
  const { settings, courses: cmsCourses, cmsAvailable } = useWebsite();
  const content = settings.homepage?.sections?.courses || {};
  const courses = (cmsAvailable ? cmsCourses : COURSES_FALLBACK) as Course[];
  const visibleCourses = courses.filter((course) => course.category !== "industry");

  return (
    <section id="courses" className="py-16 lg:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow={content.eyebrow || "Popular Courses"}
          title={content.title || "Courses built for every learner"}
          subtitle={content.subtitle || "From foundational computer literacy to professional programming and design software."}
          sectionKey="courses"
        />

        {visibleCourses.length > 0 ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {visibleCourses.map((course, i) => {
            const c = course as Course;
            const Icon = getIcon(c.icon);
            return (
              <Reveal key={c.title} delay={(i % 6) * 0.06}>
                <div className="card p-6 h-full flex flex-col">
                  {c.image && <img src={c.image.startsWith("/uploads") ? resolveImageUrl(c.image) : c.image} alt={c.title} className="w-full h-40 object-cover rounded-lg mb-5" loading="lazy" />}
                  <div className="flex items-start justify-between">
                    <div className="icon-wrap">
                      <Icon size={24} />
                    </div>
                  {c.badge && <span className="badge-new">{c.badge}</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-5"><h3 className="font-display font-semibold text-lg">{c.shortTitle || c.title}</h3><span className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">{c.category}</span></div>
                  <p className="text-[13.5px] text-[var(--ink-soft)] mt-2 leading-relaxed">{c.description}</p>
                  {(c.duration || c.eligibility || c.feeDisplay) && <dl className="grid grid-cols-2 gap-2 mt-4 text-xs text-[var(--ink-soft)]">{c.duration && <div><dt className="font-semibold text-[var(--ink)]">Duration</dt><dd>{c.duration}</dd></div>}{c.eligibility && <div><dt className="font-semibold text-[var(--ink)]">Eligibility</dt><dd>{c.eligibility}</dd></div>}{c.feeDisplay && <div className="col-span-2"><dt className="font-semibold text-[var(--ink)]">Fees</dt><dd>{c.feeDisplay}</dd></div>}</dl>}
                  {c.features?.length ? <ul className="mt-4 list-disc pl-5 text-xs text-[var(--ink-soft)] space-y-1">{c.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}
                  {c.subjects?.length ? <p className="mt-3 text-xs text-[var(--ink-soft)]"><span className="font-semibold text-[var(--ink)]">Subjects:</span> {c.subjects.slice(0, 4).join(", ")}</p> : null}
                  {c.batches?.length ? <p className="mt-1 text-xs text-[var(--ink-soft)]"><span className="font-semibold text-[var(--ink)]">Batches:</span> {c.batches.join(", ")}</p> : null}
                  <a
                    href={c.ctaHref || "#admission"}
                    className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--royal)] mt-auto pt-5 hover:underline"
                  >
                    {c.ctaLabel || "Learn More"}
                    <ArrowRightIcon size={14} />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div> : <div className="mt-12 rounded-xl bg-[var(--bg-soft)] px-6 py-10 text-center text-[var(--ink-soft)]">Course information will be updated soon. Please contact the institute for current courses.</div>}
      </div>
    </section>
  );
};

export default Courses;
