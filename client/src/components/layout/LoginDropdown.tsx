import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

interface LoginDropdownProps {
  scrolled?: boolean;
  fullWidth?: boolean;
  onNavigate?: () => void;
  onStudentLogin?: () => void;
  label?: string;
}

/** Clear portal entry points: student sign-in is the primary action; admins have a dedicated route. */
const LoginDropdown = ({ scrolled = false, fullWidth = false, onNavigate, onStudentLogin, label = "Student Login" }: LoginDropdownProps) => (
  <div className={cn("flex items-center gap-3", fullWidth && "w-full flex-col")}>
    <button
      type="button"
      onClick={() => { onStudentLogin?.(); onNavigate?.(); }}
      className={cn(
        "btn btn-sm btn-outline",
        fullWidth && "w-full justify-center !text-[var(--ink)] !border-[var(--ink)]/30 !bg-transparent",
        !fullWidth && scrolled && "!text-[var(--ink)] !border-[var(--ink)]/30 !bg-transparent"
      )}
    >
      {label}
    </button>
    <Link to="/admin/login" onClick={onNavigate} className={cn("text-xs font-medium underline-offset-4 hover:underline", fullWidth ? "text-[var(--ink-soft)]" : scrolled ? "text-[var(--ink-soft)]" : "text-white/80")}>
      Admin Login
    </Link>
  </div>
);

export default LoginDropdown;
