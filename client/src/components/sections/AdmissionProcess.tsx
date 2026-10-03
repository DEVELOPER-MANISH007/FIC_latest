import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import { ADMISSION_PROCESS } from "@/constants/siteData";
import { useWebsite } from "@/context/WebsiteContext";

const AdmissionProcess = () => {
  const { settings } = useWebsite();
  const process = settings.homepage?.sections?.admission?.process || {};
  const configuredSteps = process.steps;
  const steps = Array.isArray(configuredSteps) ? configuredSteps.filter((item: any) => item.isActive !== false) : ADMISSION_PROCESS;
  return <div className="relative">
    <SectionHeading eyebrow={process.eyebrow || "Admission Process"} title={process.title || "Six simple steps to get started"} />
    <div className="mt-16 relative">
      <div className="roadmap-line lg:hidden" />
      <div className="hidden lg:block roadmap-line-h" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-10">
        {steps.length ? steps.map((item: any, index: number) => (
          <Reveal key={item.step || item.title} delay={(index % 6) * 0.06}>
            <div className="flex lg:flex-col items-start lg:items-center gap-5 lg:text-center">
              <div className="rm-dot active">{item.step || index + 1}</div>
              <h3 className="font-display font-semibold text-[14px]">{item.title}</h3>
            </div>
          </Reveal>
        )) : <p className="card p-6 text-center text-[var(--ink-soft)]">Admission steps are being updated.</p>}
      </div>
    </div>
  </div>;
};

export default AdmissionProcess;
