import Reveal from "./Reveal";
import SectionEyebrow from "./SectionEyebrow";
import { useWebsite } from "@/context/WebsiteContext";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  variant?: "default" | "dark" | "orange";
  className?: string;
  sectionKey?: string;
}

const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  variant = "default",
  className = "",
  sectionKey,
}: SectionHeadingProps) => {
  const { settings } = useWebsite();
  const content = sectionKey ? settings.homepage?.sections?.[sectionKey] : null;
  const shownEyebrow = content?.eyebrow || eyebrow;
  const shownTitle = content?.title || title;
  const shownSubtitle = content?.subtitle || subtitle;
  return (
  <Reveal className={`${align === "center" ? "max-w-2xl mx-auto text-center" : ""} ${className}`}>
    <SectionEyebrow variant={variant}>{shownEyebrow}</SectionEyebrow>
    <h2
      className={`font-display font-bold text-3xl lg:text-[40px] mt-5 leading-tight ${
        variant === "dark" ? "text-white" : ""
      }`}
    >
      {shownTitle}
    </h2>
    {shownSubtitle && (
      <p className={`mt-4 ${variant === "dark" ? "text-[#C6CEEF]" : "text-[var(--ink-soft)]"}`}>
        {shownSubtitle}
      </p>
    )}
  </Reveal>
  );
};

export default SectionHeading;
