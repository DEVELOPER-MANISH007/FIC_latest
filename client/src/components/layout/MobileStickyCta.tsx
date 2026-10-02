import { useLocation } from "react-router-dom";
import { SITE } from "@/constants/siteData";
import { useWebsite } from "@/context/WebsiteContext";
import { getIcon } from "@/constants/iconMap";

const WhatsappIcon = getIcon("whatsapp");

const MobileStickyCta = () => {
  const { pathname } = useLocation();
  const { settings, cmsAvailable } = useWebsite();
  const admissionHref = pathname === "/" ? "#admission" : "/#admission";
  const phone = settings.contact?.phones?.[0] || (cmsAvailable ? "" : SITE.phones[0]);
  const whatsapp = settings.contact?.whatsapp || phone;
  const quickActions = settings.homepage?.quickActions || {};
  if (settings.websiteSettings?.showMobileAdmissionBar === false || quickActions.enabled === false) return null;

  return (
  <div
    id="mobileCta"
    className="lg:hidden fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[var(--line)] bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3"
  >
    {quickActions.showCall !== false && phone && <a href={`tel:+91${phone}`} className="btn btn-navy min-w-0 flex-1 btn-sm !px-1.5 text-xs sm:!px-3 sm:text-sm">
      {quickActions.mobileCallLabel || "Call"}
    </a>}
    {quickActions.showWhatsApp !== false && whatsapp && <a href={`https://wa.me/91${whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label={quickActions.whatsappLabel || "Chat on WhatsApp"} className="btn min-w-0 flex-1 btn-sm !gap-1.5 !border !border-[#25D366] !bg-white !px-1.5 text-xs !text-[#167a3b] sm:!px-3 sm:text-sm">
      <WhatsappIcon size={17} color="#25D366" /> <span className="hidden min-[360px]:inline">{quickActions.mobileWhatsappLabel || "WhatsApp"}</span><span className="sr-only">Chat on WhatsApp</span>
    </a>}
    <a href={admissionHref} className="btn btn-primary min-w-0 flex-1 btn-sm !px-1.5 text-xs sm:!px-3 sm:text-sm">
      {quickActions.mobileAdmissionLabel || "Apply"}
    </a>
  </div>
  );
};

export default MobileStickyCta;
