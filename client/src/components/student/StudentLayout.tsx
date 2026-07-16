import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getIcon } from "@/constants/iconMap";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils/cn";

const GridIcon = getIcon("grid");
const UserIcon = getIcon("users2");
const FileTextIcon = getIcon("fileText");
const CheckCircleIcon = getIcon("checkCircle");
const AwardIcon = getIcon("award");
const TrendingUpIcon = getIcon("trendingUp");
const ShieldIcon = getIcon("shield");
const LogOutIcon = getIcon("arrowRight");
const MenuIcon = getIcon("menu");
const CloseIcon = getIcon("close");
const FolderIcon = getIcon("folder");

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: GridIcon, end: true },
  { to: "/dashboard/profile", label: "My Profile", icon: UserIcon },
  { to: "/dashboard/tests", label: "Available Tests", icon: FileTextIcon },
  { to: "/dashboard/attempted", label: "Attempted Tests", icon: CheckCircleIcon },
  { to: "/dashboard/study-material", label: "Study Material", icon: FolderIcon },
  { to: "/dashboard/my-notes", label: "My Notes", icon: FileTextIcon },
  { to: "/dashboard/results", label: "Results", icon: AwardIcon },
  { to: "/dashboard/performance", label: "Performance", icon: TrendingUpIcon },
  { to: "/dashboard/change-password", label: "Change Password", icon: ShieldIcon },
];

/**
 * Student Dashboard shell — left sidebar navigation matching the
 * existing admin panel design language (grad-navy sidebar, same cards).
 */
const StudentLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sidebarContent = (
    <>
      <Link to="/" className="flex items-center gap-3 px-2 mb-10">
        <img src={logo} alt="Future IT College logo" className="w-10 h-10 rounded-xl object-cover bg-white" />
        <div>
          <p className="font-display font-bold text-white text-[14px]">Student Portal</p>
          <p className="text-[10.5px] text-[#9AA4D4]">Future IT College</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-medium transition",
                isActive ? "bg-white/12 text-white" : "text-[#B9C1E8] hover:bg-white/8 hover:text-white"
              )
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          {student?.photo ? (
            <img
              src={resolveImageUrl(student.photo)}
              alt={`${student.name} profile`}
              className="w-9 h-9 rounded-full object-cover bg-white"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white font-semibold text-[13px]">
              {student?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[12.5px] text-white font-medium truncate">{student?.name}</p>
            <p className="text-[11px] text-[#8188B8] truncate">{student?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-sm w-full">
          <LogOutIcon size={14} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-soft)] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 grad-navy shrink-0 py-8 px-5">{sidebarContent}</aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            className="absolute inset-0 bg-black/50 w-full h-full"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] h-full grad-navy py-8 px-5 overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              aria-label="Close navigation"
            >
              <CloseIcon size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-[var(--line)] px-6 py-5 flex items-center justify-between lg:hidden">
          <p className="font-display font-bold">{title}</p>
          <button onClick={() => setMobileOpen(true)} aria-label="Open navigation menu">
            <MenuIcon size={22} />
          </button>
        </header>
        <main className="p-6 lg:p-10">
          <h1 className="font-display font-bold text-2xl mb-8 hidden lg:block">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
