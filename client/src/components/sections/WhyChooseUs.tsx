import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { WHY_CHOOSE_US } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { useWebsite } from "@/context/WebsiteContext";

const WhyChooseUs = () => {
  const { settings } = useWebsite();
  const configured = settings.homepage?.sections?.whyChooseUs?.items;
  const features = Array.isArray(configured) ? configured.filter((entry: any) => entry.isActive !== false) : WHY_CHOOSE_US;
  return (
  <section className="py-16 lg:py-24 bg-[var(--bg-soft)]">
    <div className="container-x">
      <SectionHeading
        sectionKey="whyChooseUs"
        eyebrow="Why Choose Us"
        title="Everything you need for a strong start"
        subtitle="A learning environment built around students — practical, affordable and genuinely supportive."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
        {features.length ? features.map((item: any, i: number) => {
          const Icon = getIcon(item.icon);
          return (
            <Reveal key={item.title} delay={(i % 3) * 0.08}>
              <div className="card p-7 facility-card h-full">
                <div className="icon-wrap mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="font-display font-semibold text-lg">{item.title}</h3>
                <p className="text-[13.5px] text-[var(--ink-soft)] mt-2 leading-relaxed">{item.description || item.desc}</p>
              </div>
            </Reveal>
          );
        }) : <p className="sm:col-span-2 lg:col-span-3 card p-6 text-center text-[var(--ink-soft)]">Institute information is being updated. Please contact us if you have questions.</p>}
      </div>
    </div>
  </section>
  );
};

export default WhyChooseUs;
