import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, SITE } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import LoginDropdown from "@/components/layout/LoginDropdown";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils/cn";

const MenuIcon = getIcon("menu");
const CloseIcon = getIcon("close");

const Navbar = () => {
  const scrolled = useScrollPosition(40);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header id="navbar" className={cn("fixed top-0 left-0 right-0 z-50", scrolled && "solid")}>
      <nav className="container-x flex items-center justify-between gap-4 py-3.5 min-h-[72px]">
        <a href="#home" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Future IT College logo" className="w-11 h-11 rounded-xl object-cover shadow-lg bg-white" />
          <div className="leading-tight">
            <p className={cn("font-display font-bold text-[15px]", scrolled ? "text-[var(--ink)]" : "text-white")}>
              Future IT College
            </p>
            <p className={cn("text-[10.5px] tracking-wide opacity-80", scrolled ? "text-[var(--ink)]" : "text-white")}>
              Dinesh Computer Center
            </p>
          </div>
        </a>

        <div className="hidden lg:flex flex-1 items-center justify-center gap-8 px-6">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link whitespace-nowrap">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <LoginDropdown scrolled={scrolled} />
          <a href="#admission" className="btn btn-sm btn-primary shadow-[0_14px_30px_-10px_rgba(255,122,41,0.55)]">
            Apply for Admission
          </a>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "lg:hidden w-11 h-11 rounded-xl flex items-center justify-center border shrink-0",
            scrolled ? "border-[var(--ink)]/30 text-[var(--ink)]" : "border-white/40 text-white"
          )}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
        >
          <MenuIcon size={22} />
        </button>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--navy)]/60"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.2, 0.9, 0.25, 1] }}
              className="absolute top-0 right-0 h-full w-[78%] max-w-xs bg-white shadow-2xl flex flex-col p-6 pt-20 gap-1"
            >
              <button
                onClick={closeDrawer}
                aria-label="Close menu"
                className="self-end w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--line)] mb-4"
              >
                <CloseIcon size={18} />
              </button>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeDrawer}
                  className="py-3 font-medium border-b border-[var(--line)]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-5 space-y-3">
                <LoginDropdown fullWidth onNavigate={closeDrawer} />
                <a href="#admission" onClick={closeDrawer} className="btn btn-primary w-full">
                  Apply for Admission
                </a>
                <a href={`tel:+91${SITE.phones[0]}`} onClick={closeDrawer} className="btn btn-navy w-full">
                  Call Now
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
