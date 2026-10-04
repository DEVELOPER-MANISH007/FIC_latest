import Reveal from "@/components/common/Reveal";
import SectionEyebrow from "@/components/common/SectionEyebrow";
import { getIcon } from "@/constants/iconMap";
import { INDUSTRY_COURSES } from "@/data/courses";
import { useWebsite } from "@/context/WebsiteContext";

const CheckIcon = getIcon("checkCircle");
const IndustryCourses = () => {
  const { settings, cmsAvailable } = useWebsite();
  const content = settings.homepage?.sections?.industryCourses || {};
  const text = (value: string | undefined, fallback: string) => cmsAvailable ? value ?? "" : value || fallback;
  const cards = INDUSTRY_COURSES;
  const highlights = Array.isArray(content.highlights) ? content.highlights : cmsAvailable ? [] : ["Hands-on software practice", "Instructor-led learning", "Project-based training", "Career guidance"];

  return <section id="industry-training" className="py-16 lg:py-20 bg-[#142343] text-white">
    <div className="container-x grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      <Reveal>
        <SectionEyebrow variant="orange">{text(content.eyebrow, "Industry Training")}</SectionEyebrow>
        <h2 className="font-display font-bold text-3xl lg:text-[40px] mt-5 leading-tight">{text(content.title, "Learn tools used across industries")}</h2>
        <p className="text-white/80 mt-5 leading-relaxed">{text(content.subtitle, "Practical software skills with structured, instructor-led learning.")}</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {highlights.map((item: string) => <div key={item} className="flex items-center gap-3"><CheckIcon size={18} color="var(--orange-soft)" /><span className="text-sm font-medium">{item}</span></div>)}
        </div>
        {(content.buttonHref || !cmsAvailable) && <a href={content.buttonHref || "#contact"} className="btn btn-primary mt-8">{text(content.buttonText, "Ask about industry courses")}</a>}
      </Reveal>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((course, index) => {
          const Icon = getIcon(course.icon || "monitor");
          return <Reveal key={course.title} delay={index * 0.08}>
            <article className="h-full rounded-xl border border-white/15 bg-white p-6 text-[var(--ink)] shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-soft)] text-[var(--royal)] flex items-center justify-center mb-4"><Icon size={24} /></div>
              {course.badge && <span className="badge-new">{course.badge}</span>}
              <h3 className="font-display font-semibold text-lg mt-3">{course.title}</h3>
              {course.subjects?.length ? <p className="text-sm text-[var(--ink-soft)] mt-2">Subjects: {course.subjects.join(", ")}</p> : null}
            </article>
          </Reveal>;
        })}
        {!cards.length && <p className="sm:col-span-2 rounded-xl bg-white p-6 text-[var(--ink-soft)]">Industry course details are being updated. Contact the institute to learn more.</p>}
      </div>
    </div>
  </section>;
};

export default IndustryCourses;
