import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "outline" | "navy";

interface CommonProps {
  variant?: Variant;
  size?: "md" | "sm";
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a"; href: string };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  outline: "btn-outline",
  navy: "btn-navy",
};

/**
 * Shared button/link component reproducing the original .btn styles.
 * Renders an <a> when `as="a"` (with a required href), otherwise a <button>.
 */
const Button = ({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) => {
  const classes = cn("btn", variantClass[variant], size === "sm" && "btn-sm", className);

  if (rest.as === "a") {
    const { as, ...anchorProps } = rest as ButtonAsAnchor;
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { as, ...buttonProps } = rest as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button;

