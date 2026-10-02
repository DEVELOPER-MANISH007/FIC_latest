import Reveal from "@/components/common/Reveal";
import SectionEyebrow from "@/components/common/SectionEyebrow";
import { getIcon } from "@/constants/iconMap";
import office from "@/assets/images/office.jpg";
import { useWebsite } from "@/context/WebsiteContext";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import directorFallback from "@/assets/images/director.jpg";

const AwardIcon = getIcon("award");
const CheckIcon = getIcon("checkCircle");

const HIGHLIGHTS = [
  "Practical + theory learning model",
  "Career-oriented course design",
  "Modern teaching methods",
  "Thousands of students trained",
];

const About = () => {
  const { settings } = useWebsite();
  const content = settings.homepage?.sections?.about || {};
  const directorMessage = content.directorMessage || {};
  const highlights = Array.isArray(content.items) ? content.items : HIGHLIGHTS;
  return (
  <section id="about" className="py-16 lg:py-24">
    <div className="container-x grid lg:grid-cols-2 gap-14 items-center">
      <Reveal className="relative">
        <div className="relative rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-soft)] aspect-[4/5]">
          <img
            src={content.image?.startsWith("/uploads") ? resolveImageUrl(content.image) : content.image || office}
            alt="Director guiding students at Future IT College"
            className="w-full h-full object-cover"
            style={{ objectPosition: "50% 20%" }}
            loading="lazy"
          />
        </div>
        <div className="hidden sm:flex card absolute mt-[-90px] ml-6 lg:ml-10 max-w-[240px] p-5 items-center gap-4 rounded-[var(--radius-md)] relative z-10 bg-white">
          <div className="w-12 h-12 rounded-xl bg-[var(--orange)]/12 flex items-center justify-center text-[var(--orange)]">
            <AwardIcon size={22} />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none">{content.establishedYear || settings.brand?.establishedYear || 2016}</p>
            <p className="text-[12px] text-[var(--ink-soft)] mt-1">{content.establishedLabel || "Serving Veerapura since"}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <SectionEyebrow>{content.eyebrow || "About Future IT College"}</SectionEyebrow>
        <h2 className="font-display font-bold text-3xl lg:text-[40px] leading-[1.15] mt-5">
          {content.title || "Practical, career-focused education built for real classrooms"}
        </h2>
        <p className="text-[var(--ink-soft)] leading-relaxed mt-5">
          {content.description || `Future IT College, known locally as Dinesh Computer Center, has been serving students in Veerapura and
          the wider Aligarh region since 2016. Over the years, thousands of students have trained here — from
          school students taking their first computer class to working professionals upgrading their skills.`}
        </p>
        <p className="text-[var(--ink-soft)] leading-relaxed mt-4">
          {content.secondaryDescription || `Our approach pairs solid theoretical foundations with hands-on practical training, using modern
          teaching methods that keep pace with how the industry actually works today. Every course is designed
          with one goal in mind: helping students build real, usable skills for their careers.`}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {highlights.map((item: string) => (
            <div key={item} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--royal)]/10 flex items-center justify-center text-[var(--royal)] shrink-0 mt-0.5">
                <CheckIcon size={16} />
              </div>
              <p className="text-[14.5px] font-medium">{item}</p>
            </div>
          ))}
        </div>
        {directorMessage.enabled && directorMessage.message && <blockquote className="mt-8 rounded-2xl border-l-4 border-[var(--orange)] bg-[var(--bg-soft)] p-5">
          <img src={directorMessage.image ? (directorMessage.image.startsWith("/uploads") ? resolveImageUrl(directorMessage.image) : directorMessage.image) : directorFallback} alt={directorMessage.name || "Institute director"} className="float-right ml-4 h-16 w-16 rounded-full object-cover" loading="lazy" />
          <p className="font-display font-semibold">{directorMessage.title || "Director's Message"}</p>
          <p className="text-[var(--ink-soft)] leading-relaxed mt-2">“{directorMessage.message}”</p>
          {directorMessage.name && <footer className="text-sm font-semibold mt-3">{directorMessage.name}</footer>}
        </blockquote>}
      </Reveal>
    </div>
  </section>
  );
};

export default About;
