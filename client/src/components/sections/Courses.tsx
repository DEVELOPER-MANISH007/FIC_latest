import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { getIcon } from "@/constants/iconMap";
import { COURSE_CATALOG } from "@/data/courses";
import { useWebsite } from "@/context/WebsiteContext";

const ArrowRightIcon = getIcon("arrowRight");
const COURSE_CATEGORY_LABELS: Record<string, string> = {
  general: "Computer & Office",
  office: "Computer & Office",
  programming: "Programming & Coding",
  professional: "Professional IT",
  industry: "Industry-Level / Engineering",
  design: "Design & Multimedia",
};

const Courses = () => {
  const { settings } = useWebsite();
  const content = settings.homepage?.sections?.courses || {};
  const visibleCourses = COURSE_CATALOG.filter((course) => course.category !== "industry");

  return (
    <section id="courses" className="py-16 lg:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow={content.eyebrow || "Popular Courses"}
          title={content.title || "Courses built for every learner"}
          subtitle={content.subtitle || "From foundational computer literacy to programming and applied data skills."}
          sectionKey="courses"
        />

        {visibleCourses.length > 0 ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {visibleCourses.map((course, i) => {
            const Icon = getIcon(course.icon);
            return (
              <Reveal key={course.title} delay={(i % 6) * 0.06}>
                <div className="card p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="icon-wrap">
                      <Icon size={24} />
                    </div>
                  {course.badge && <span className="badge-new">{course.badge}</span>}
                  </div>
                  <div className="mt-5 flex flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 font-display font-semibold text-lg leading-snug">{course.title}</h3>
                    {course.category && <span className="shrink-0 text-[10px] tracking-wide text-[var(--ink-soft)]">{COURSE_CATEGORY_LABELS[course.category] || course.category}</span>}
                  </div>
                  {course.subjects?.length ? <p className="mt-3 text-xs text-[var(--ink-soft)]"><span className="font-semibold text-[var(--ink)]">Subjects:</span> {course.subjects.join(", ")}</p> : null}
                  {course.ctaHref && course.ctaLabel && <a
                    href={course.ctaHref}
                    className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--royal)] mt-auto pt-5 hover:underline"
                  >
                    {course.ctaLabel}
                    <ArrowRightIcon size={14} />
                  </a>}
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
