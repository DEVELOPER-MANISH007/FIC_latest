import Reveal from "@/components/common/Reveal";
import SectionEyebrow from "@/components/common/SectionEyebrow";
import { getIcon } from "@/constants/iconMap";
import { useWebsite } from "@/context/WebsiteContext";

const LaptopIcon = getIcon("laptop");

const LaptopProgram = () => {
  const { settings, cmsAvailable } = useWebsite();
  const content = settings.homepage?.sections?.laptopProgram || {};
  const text = (value: string | undefined, fallback: string) => cmsAvailable ? value ?? "" : value || fallback;
  return (
  <section className="py-16 lg:py-20">
    <div className="container-x">
      <Reveal>
        <div className="card p-10 lg:p-14 rounded-[var(--radius-lg)] grid lg:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--royal)]/10 to-[var(--orange)]/12 flex items-center justify-center text-[var(--royal)] shrink-0">
            <LaptopIcon size={34} />
          </div>
          <div>
            <SectionEyebrow>{text(content.eyebrow, "Support Program")}</SectionEyebrow>
            <h2 className="font-display font-bold text-2xl lg:text-3xl mt-3">
              {text(content.title, "Affordable Refurbished Laptop Assistance")}
            </h2>
            <p className="text-[var(--ink-soft)] mt-4 leading-relaxed max-w-2xl">
              {text(content.description, "Students who need a personal computer for learning may receive guidance in purchasing quality refurbished laptops at reasonable prices. Speak with our team to learn more about current options.")}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
  );
};

export default LaptopProgram;
