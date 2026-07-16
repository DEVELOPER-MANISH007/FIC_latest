import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import { cn } from "@/utils/cn";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Notes", to: "/dashboard/my-notes" },
  { label: "Profile", to: "/dashboard/profile" },
  { label: "Change Password", to: "/dashboard/change-password" },
] as const;

interface UserMenuProps {
  scrolled?: boolean;
  fullWidth?: boolean;
  onNavigate?: () => void;
}

/**
 * Replaces the Login dropdown once a student is signed in — shows their
 * name/avatar with a dropdown to Dashboard, My Notes, Profile, Change
 * Password, and Logout. Reacts instantly to auth state (no refresh needed)
 * since it reads straight from AuthContext.
 */
const UserMenu = ({ scrolled = false, fullWidth = false, onNavigate }: UserMenuProps) => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    close();
    onNavigate?.();
    navigate("/");
  };

  if (!student) return null;

  const firstName = student.name?.split(" ")[0] || "Student";
  const initials = (student.name || "S")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        {student.photo ? (
          <img src={resolveImageUrl(student.photo)} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-[var(--royal)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </span>
        )}
        <span className="max-w-[110px] truncate">{firstName}</span>
        <FiChevronDown className={cn("w-4 h-4 shrink-0 transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Student menu"
            initial={{ opacity: 0, y: fullWidth ? -4 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: fullWidth ? -4 : -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.9, 0.25, 1] }}
            className={cn(
              "overflow-hidden rounded-2xl border border-[var(--line)] bg-white",
              "shadow-[0_16px_40px_-12px_rgba(18,41,107,0.22)]",
              fullWidth ? "relative mt-2 w-full shadow-md" : "absolute top-[calc(100%+10px)] right-0 z-50 min-w-[210px]"
            )}
          >
            <div className="px-4 py-3 border-b border-[var(--line)]">
              <p className="text-[13.5px] font-semibold text-[var(--ink)] truncate">{student.name}</p>
              <p className="text-[11.5px] text-[var(--ink-soft)] truncate">{student.email}</p>
            </div>
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={handleNavigate}
                className="block px-4 py-3 text-[14px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-soft)] border-t border-[var(--line)]"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-[14px] font-medium text-red-500 transition-colors hover:bg-red-50 border-t border-[var(--line)]"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
