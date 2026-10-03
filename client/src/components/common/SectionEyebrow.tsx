import { cn } from "@/utils/cn";

interface SectionEyebrowProps {
  children: string;
  variant?: "default" | "dark" | "orange";
}

const SectionEyebrow = ({ children, variant = "default" }: SectionEyebrowProps) => (
  <span
    className={cn(
      "eyebrow",
      variant === "dark" && "on-dark",
      variant === "orange" && "on-orange"
    )}
  >
    <span className="eyebrow-dot" />
    {children}
  </span>
);

export default SectionEyebrow;

