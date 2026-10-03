import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, SITE } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import LoginDropdown from "@/components/layout/LoginDropdown";
import UserMenu from "@/components/layout/UserMenu";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/images/logo.png";
import { cn } from "@/utils/cn";
import { useWebsite } from "@/context/WebsiteContext";
import { resolveImageUrl } from "@/services/api/axiosInstance";

const StudentLogin = lazy(() => import("@/pages/student/StudentLogin"));

const MenuIcon = getIcon("menu");
const CloseIcon = getIcon("close");

const Navbar = () => {
  const scrolled = useScrollPosition(40);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { student } = useAuth();
  const { settings, cmsAvailable } = useWebsite();
  const brand = settings.brand || {};
  const navbar = settings.navbar || {};
  const links = navbar.items?.filter((link: any) => link.visible !== false).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)) || NAV_LINKS;
  const instituteName = brand.name || SITE.name;
  const instituteLocation = brand.locationName || SITE.locationName;
  const phone = settings.contact?.phones?.[0] || (cmsAvailable ? "" : SITE.phones[0]);
  const onHome = pathname === "/";

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-menu-open");
    drawerCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((item) => item.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("mobile-menu-open");
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === "undefined") return;
    const sections = links.filter((link: any) => link.href.startsWith("#")).map((link: any) => document.getElementById(link.href.slice(1))).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActiveSection(`#${current.target.id}`);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.15, 0.4] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onHome, links]);

  // Section anchors (e.g. "#courses") only resolve on the home page — from
  // any other route, point them at "/#courses" so they still land in the
  // right section instead of doing nothing.
  const sectionHref = (hash: string) => (onHome ? hash : `/${hash}`);
  const normalizeHref = (href: string) => href.startsWith("#") ? sectionHref(href) : href;

  return (
    <header id="navbar" className={cn("fixed left-0 right-0 z-50 transition-[top]", settings.homepage?.announcement?.enabled && settings.websiteSettings?.showHomepageAnnouncement !== false ? "top-9" : "top-0", scrolled && "solid")}>
      <nav className="container-x flex items-center justify-between gap-2 sm:gap-4 py-3.5 min-h-[72px]">
        <a href={sectionHref("#home")} className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[calc(100%-3.5rem)] xl:max-w-[220px] xl:shrink-0">
          <img src={(brand.logo || "").startsWith("/uploads") ? resolveImageUrl(brand.logo) : brand.logo || logo} alt={`${instituteName} logo`} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-lg bg-white shrink-0" />
          <div className="leading-tight min-w-0">
            <p className={cn("font-display font-bold text-[14px] sm:text-[15px] truncate", scrolled ? "text-[var(--ink)]" : "text-white")}>
              {instituteName}
            </p>
            <p className={cn("hidden max-w-[180px] truncate text-[10.5px] tracking-wide opacity-80 sm:block", scrolled ? "text-[var(--ink)]" : "text-white")}>
              {instituteLocation}
            </p>
          </div>
        </a>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 px-4 xl:flex">
          {links.map((link: any) =>
            link.href.startsWith("/") ? (
              <Link key={link.href} to={link.href} className={cn("nav-link whitespace-nowrap", pathname === link.href && "is-active")}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={normalizeHref(link.href)} className={cn("nav-link whitespace-nowrap", onHome && (activeSection === link.href || (!activeSection && link.href === "#home")) && "is-active")}>
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          {student ? <UserMenu scrolled={scrolled} /> : <LoginDropdown scrolled={scrolled} onStudentLogin={() => setStudentLoginOpen(true)} label={navbar.studentLoginLabel || "Student Login"} />}
          <a href={normalizeHref(navbar.admissionCtaHref || "#admission")} className="btn btn-sm btn-primary shadow-[0_14px_30px_-10px_rgba(255,122,41,0.55)]">
            {navbar.admissionCtaLabel || "Apply for Admission"}
          </a>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "xl:hidden w-11 h-11 rounded-lg flex items-center justify-center border shrink-0",
            scrolled ? "border-[var(--ink)]/30 text-[var(--ink)]" : "border-white/40 text-white"
          )}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
        >
          <MenuIcon size={22} />
        </button>
      </nav>

      {typeof document !== "undefined" && createPortal(<AnimatePresence>
        {drawerOpen && (
          <div className="xl:hidden fixed inset-0 z-[80]" role="presentation">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--navy)]/65"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.2, 0.9, 0.25, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              ref={drawerRef}
              className="fixed inset-y-0 right-0 flex h-[100dvh] w-[min(88vw,24rem)] flex-col gap-1 overflow-y-auto overscroll-contain bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-[var(--ink)] shadow-2xl sm:px-6"
            >
              <button
                ref={drawerCloseRef}
                onClick={closeDrawer}
                aria-label="Close menu"
                className="self-end w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--line)] mb-4"
              >
                <CloseIcon size={18} />
              </button>
              {links.map((link: any) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeDrawer}
                    className="min-h-12 break-words py-3 font-medium text-[var(--ink)] border-b border-[var(--line)]"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={normalizeHref(link.href)}
                    onClick={closeDrawer}
                    className="min-h-12 break-words py-3 font-medium text-[var(--ink)] border-b border-[var(--line)]"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="mt-5 space-y-3">
                {student ? <UserMenu fullWidth onNavigate={closeDrawer} /> : <LoginDropdown fullWidth onNavigate={closeDrawer} onStudentLogin={() => setStudentLoginOpen(true)} label={navbar.studentLoginLabel || "Student Login"} />}
                <a href={normalizeHref(navbar.admissionCtaHref || "#admission")} onClick={closeDrawer} className="btn btn-primary w-full">
                  {navbar.admissionCtaLabel || "Apply for Admission"}
                </a>
                {phone && <a href={`tel:+91${phone}`} onClick={closeDrawer} className="btn btn-navy w-full">
                  {navbar.callCtaLabel || "Call Now"}
                </a>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>, document.body)}
      {studentLoginOpen && <Suspense fallback={null}><StudentLogin modal onClose={() => setStudentLoginOpen(false)} /></Suspense>}
    </header>
  );
};

export default Navbar;
