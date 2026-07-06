import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/utils/cn";

const LOGIN_OPTIONS = [
  { label: "Student Login", to: "/login" },
  { label: "Admin Login", to: "/admin/login" },
] as const;

interface LoginDropdownProps {
  scrolled?: boolean;
  fullWidth?: boolean;
  onNavigate?: () => void;
}

const LoginDropdown = ({ scrolled = false, fullWidth = false, onNavigate }: LoginDropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const handleNavigate = () => {
    close();
    onNavigate?.();
  };

  return (
    <div ref={containerRef} className={cn("relative", fullWidth && "w-full")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "btn btn-sm btn-outline inline-flex items-center gap-2",
          fullWidth && "w-full justify-between !text-[var(--ink)] !border-[var(--ink)]/30 !bg-transparent",
          !fullWidth && scrolled && "!text-[var(--ink)] !border-[var(--ink)]/30 !bg-transparent"
        )}
      >
        Login
        <FiChevronDown
          className={cn("w-4 h-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Login options"
            initial={{ opacity: 0, y: fullWidth ? -4 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: fullWidth ? -4 : -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.9, 0.25, 1] }}
            className={cn(
              "overflow-hidden rounded-2xl border border-[var(--line)] bg-white",
              "shadow-[0_16px_40px_-12px_rgba(18,41,107,0.22)]",
              fullWidth ? "relative mt-2 w-full shadow-md" : "absolute top-[calc(100%+10px)] right-0 z-50 min-w-[200px]"
            )}
          >
            {LOGIN_OPTIONS.map((option, index) => (
              <Link
                key={option.to}
                to={option.to}
                role="menuitem"
                onClick={handleNavigate}
                className={cn(
                  "block px-4 py-3 text-[14px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)]",
                  index > 0 && "border-t border-[var(--line)]"
                )}
              >
                {option.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginDropdown;
