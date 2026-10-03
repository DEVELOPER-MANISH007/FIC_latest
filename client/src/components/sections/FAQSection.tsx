import { useState } from "react";
import SectionHeading from "@/components/common/SectionHeading";
import Reveal from "@/components/common/Reveal";
import { FAQS } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { cn } from "@/utils/cn";
import { useWebsite } from "@/context/WebsiteContext";

const PlusIcon = getIcon("plus");

const FAQSection = () => {
  const { settings, cmsAvailable } = useWebsite();
  const content = settings.homepage?.sections?.faqs || {};
  const faqs = Array.isArray(content.items) ? content.items : cmsAvailable ? [] : FAQS;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 lg:py-24">
      <div className="container-x max-w-3xl">
        <SectionHeading eyebrow={content.eyebrow || "FAQ"} title={content.title || "Common questions"} sectionKey="faqs" />

        <Reveal className="mt-12">
          {faqs.length ? faqs.map((faq: any, i: number) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question} className="border-b border-[var(--line)]">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full cursor-pointer flex justify-between items-center py-[22px] font-medium text-left"
                  aria-expanded={isOpen}
                >
                  {faq.question}
                  <span className={cn("shrink-0 transition-transform duration-300", isOpen && "rotate-45")}>
                    <PlusIcon size={18} />
                  </span>
                </button>
                <div
                  className="faq-a overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "220px" : "0px", paddingBottom: isOpen ? "22px" : "0px" }}
                >
                  {faq.answer}
                </div>
              </div>
            );
          }) : <p className="rounded-xl bg-[var(--bg-soft)] p-5 text-sm text-[var(--ink-soft)]">There are no questions listed right now. Contact the institute and we will be happy to help.</p>}
        </Reveal>
      </div>
    </section>
  );
};

export default FAQSection;
