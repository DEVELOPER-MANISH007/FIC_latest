import Reveal from "@/components/common/Reveal";
import SectionEyebrow from "@/components/common/SectionEyebrow";
import AdmissionProcess from "./AdmissionProcess";
import { useWebsite } from "@/context/WebsiteContext";

/** Admission information and a link to the single public enquiry form. */
const AdmissionEnquiry = () => {
  const { settings, cmsAvailable } = useWebsite();
  const content = settings.homepage?.sections?.admission || {};
  const text = (value: string | undefined, fallback: string) => cmsAvailable ? value ?? "" : value || fallback;
  return <section id="admission" className="py-14 lg:py-20">
    <div className="container-x">
      <AdmissionProcess />
      <Reveal className="mx-auto mt-12 max-w-4xl rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-9">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <SectionEyebrow>{text(content.eyebrow, "Admission Enquiry")}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">{text(content.title, "Let's get you started")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{text(content.description, "Tell us what you would like to learn. Our team will help you choose a course and plan a campus visit.")}</p>
          </div>
          {content.enquiryButtonText && content.enquiryButtonHref && <a href={content.enquiryButtonHref} className="btn btn-primary shrink-0">{text(content.enquiryButtonText, "Send an enquiry")}</a>}
        </div>
      </Reveal>
    </div>
  </section>;
};

export default AdmissionEnquiry;
