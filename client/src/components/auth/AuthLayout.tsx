import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/logo.png";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "student" | "admin";
}

/**
 * Shared shell for all student/admin auth screens — reuses the exact
 * same navy gradient, card, and typography tokens as the rest of the
 * site (see DemoClass / IndustryCourses sections) so it feels native.
 */
const AuthLayout = ({ title, subtitle, children, footer, variant = "student" }: AuthLayoutProps) => (
  <section className={`min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16 ${variant === "admin" ? "bg-[#eef2f6]" : "grad-navy"}`}>
    <div className="w-full max-w-md">
      <Link to="/" className="flex items-center justify-center gap-3 mb-8">
        <img src={logo} alt="Future IT College logo" className="w-12 h-12 rounded-xl object-cover bg-white" />
        <div className="text-left">
          <p className="font-display font-bold text-white text-[15px]">Future IT College</p>
          <p className="text-[10.5px] text-[#9AA4D4]">Dinesh Computer Center</p>
        </div>
      </Link>

      <div className={`card relative overflow-hidden rounded-[var(--radius-md)] bg-white p-6 sm:p-8 lg:p-9 ${variant === "admin" ? "border-t-4 border-t-[var(--navy)]" : ""}`}>
        {variant === "admin" && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--royal)]">Secure administration portal</p>}
        <h1 className="font-display font-bold text-2xl">{title}</h1>
        <p className="text-[13.5px] text-[var(--ink-soft)] mt-1.5">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>

      {footer && <div className="text-center mt-6">{footer}</div>}
    </div>
  </section>
);

export default AuthLayout;
