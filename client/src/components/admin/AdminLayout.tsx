import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getIcon } from "@/constants/iconMap";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils/cn";

const GridIcon = getIcon("grid");
const FileTextIcon = getIcon("fileText");
const LayersIcon = getIcon("layers");
const UsersIcon = getIcon("users");
const AwardIcon = getIcon("award");
const TrendingUpIcon = getIcon("trendingUp");
const LogOutIcon = getIcon("arrowRight");
const MenuIcon = getIcon("menu");
const CheckFileIcon = getIcon("checkFile");
const MailIcon = getIcon("mail");

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: GridIcon },
  { to: "/admin/admissions", label: "Admission Forms", icon: CheckFileIcon },
  { to: "/admin/enquiries", label: "Enquiry Forms", icon: MailIcon },
  { to: "/admin/questions", label: "Question Bank", icon: FileTextIcon },
  { to: "/admin/categories", label: "Categories", icon: LayersIcon },
  { to: "/admin/exams", label: "Tests", icon: AwardIcon },
  { to: "/admin/students", label: "Students", icon: UsersIcon },
  { to: "/admin/results", label: "Results", icon: TrendingUpIcon },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUpIcon },
];

const AdminLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-soft)] flex">
      <aside className="hidden lg:flex flex-col w-64 grad-navy shrink-0 py-8 px-5">
        <div className="flex items-center gap-3 px-2 mb-10">
          <img src={logo} alt="Future IT College logo" className="w-10 h-10 rounded-xl object-cover bg-white" />
          <div>
            <p className="font-display font-bold text-white text-[14px]">Admin Panel</p>
            <p className="text-[10.5px] text-[#9AA4D4]">Future IT College</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
          <p className="text-[12.5px] text-white font-medium px-2">{admin?.name}</p>
          <p className="text-[11px] text-[#8188B8] px-2 mb-4">{admin?.email}</p>
          <button onClick={handleLogout} className="btn btn-outline btn-sm w-full">
            <LogOutIcon size={14} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-[var(--line)] px-6 py-5 flex items-center justify-between lg:hidden">
          <p className="font-display font-bold">{title}</p>
          <MenuIcon size={22} />
        </header>
        <main className="p-6 lg:p-10">
          <h1 className="font-display font-bold text-2xl mb-8 hidden lg:block">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
