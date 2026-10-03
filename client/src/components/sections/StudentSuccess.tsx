import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { STUDENT_SUCCESS } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { useWebsite } from "@/context/WebsiteContext";

const StudentSuccess = () => {
  const { settings, cmsAvailable } = useWebsite();
  const configured = settings.homepage?.sections?.studentSuccess?.items;
  const items = Array.isArray(configured) ? configured.filter((entry: any) => entry.isActive !== false) : cmsAvailable ? [] : STUDENT_SUCCESS;
  return (
  <section className="py-16 lg:py-20 bg-[var(--bg-soft)]">
    <div className="container-x">
      <SectionHeading eyebrow="Student Success" title="Built on consistency, not claims" sectionKey="studentSuccess" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {items.length ? items.map((item: any, i: number) => {
          const Icon = getIcon(item.icon);
          return (
            <Reveal key={item.label} delay={(i % 3) * 0.08}>
              <div className="card p-7 flex items-center gap-4">
                <div className="icon-wrap shrink-0">
                  <Icon size={22} />
                </div>
                <p className="font-medium text-[14.5px]">{item.label || item.title}</p>
              </div>
            </Reveal>
          );
        }) : <p className="sm:col-span-2 lg:col-span-3 card p-6 text-center text-[var(--ink-soft)]">Student achievement information is being updated.</p>}
      </div>
    </div>
  </section>
  );
};

export default StudentSuccess;
