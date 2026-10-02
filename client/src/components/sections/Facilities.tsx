import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { FACILITIES } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { useWebsite } from "@/context/WebsiteContext";

const Facilities = () => {
  const { settings } = useWebsite();
  const configured = settings.homepage?.sections?.facilities?.items;
  const facilities = Array.isArray(configured) ? configured.filter((entry: any) => entry.isActive !== false) : FACILITIES;
  return (
  <section id="facilities" className="py-16 lg:py-24 bg-[var(--bg-soft)]">
    <div className="container-x">
      <SectionHeading eyebrow="Campus & Facilities" title="A campus built for focused learning" sectionKey="facilities" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-14">
        {facilities.length ? facilities.map((item: any, i: number) => {
          const Icon = getIcon(item.icon);
          return (
            <Reveal key={item.title} delay={(i % 5) * 0.06}>
              <div className="card p-6 facility-card h-full">
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
