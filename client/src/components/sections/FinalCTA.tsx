import Reveal from "@/components/common/Reveal";
import { SITE } from "@/constants/siteData";
import { useWebsite } from "@/context/WebsiteContext";

const FinalCTA = () => {
  const { settings, cmsAvailable } = useWebsite();
  const content = settings.homepage?.sections?.finalCta || {};
  const phone = settings.contact?.phones?.[0] || (cmsAvailable ? "" : SITE.phones[0]);
  const text = (value: string | undefined, fallback: string) => cmsAvailable ? value ?? "" : value || fallback;
  return (
  <section className="py-16 lg:py-20">
    <div className="container-x">
      <Reveal>
        <div className="grad-navy rounded-[var(--radius-lg)] p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute w-72 h-72 bg-[var(--orange)]/25 blur-[100px] rounded-full top-0 left-1/2 -translate-x-1/2" />
          <h2 className="font-display font-bold text-2xl lg:text-4xl text-white relative">
            {text(content.title, "Ready to start your journey?")}
          </h2>
          <p className="text-[#C6CEEF] mt-4 max-w-xl mx-auto relative">
            {text(content.description, "Book your demo class today and see the Future IT College difference for yourself.")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8 relative">
            {(content.primaryButtonHref || !cmsAvailable) && <a href={content.primaryButtonHref || "#contact"} className="btn btn-primary">
              {text(content.primaryButtonText, "Apply for Admission")}
            </a>}
            {phone && <a href={`tel:+91${phone}`} className="btn btn-outline">
              {text(content.secondaryButtonText, "Call Now")}
            </a>}
          </div>
        </div>
      </Reveal>
    </div>
  </section>
  );
};

export default FinalCTA;
