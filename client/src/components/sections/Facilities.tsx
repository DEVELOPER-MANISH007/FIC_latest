import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { FACILITIES } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { useWebsite } from "@/context/WebsiteContext";
import { resolveImageUrl } from "@/services/api/axiosInstance";

const Facilities = () => {
  const { settings, cmsAvailable } = useWebsite();
  const content = settings.homepage?.sections?.facilities || {};
  const configured = content.items;
  const facilities = (Array.isArray(configured) ? configured : cmsAvailable ? [] : FACILITIES)
    .filter((entry: any) => entry.isActive !== false)
    .slice()
    .sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return (
  <section id="facilities" className="py-16 lg:py-24 bg-[var(--bg-soft)]">
    <div className="container-x">
      <SectionHeading eyebrow={content.eyebrow || "Campus & Facilities"} title={content.title || "A campus built for focused learning"} sectionKey="facilities" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-14">
        {facilities.length ? facilities.map((item: any, i: number) => {
          const Icon = getIcon(item.icon);
          return (
            <Reveal key={item.title} delay={(i % 5) * 0.06}>
              <div className="card p-6 facility-card h-full">
                {item.image && <img src={resolveImageUrl(item.image)} alt={item.title || "Institute facility"} className="mb-4 aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" onError={(event) => { event.currentTarget.remove(); }} />}
                <div className="icon-wrap mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-display font-semibold text-[15px]">{item.title}</h3>
                {item.description && <p className="text-xs text-[var(--ink-soft)] mt-2">{item.description}</p>}
              </div>
            </Reveal>
          );
        }) : <p className="sm:col-span-2 lg:col-span-5 card p-6 text-center text-[var(--ink-soft)]">Campus information is being updated.</p>}
      </div>
    </div>
  </section>
  );
};

export default Facilities;
