import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useWebsite } from "@/context/WebsiteContext";

const WhatsappIcon = getIcon("whatsapp");
const PhoneIcon = getIcon("phone");
const ChevronUpIcon = getIcon("chevronUp");

const FloatingButtons = () => {
  const showScrollTop = useScrollPosition(600);
  const { settings, cmsAvailable } = useWebsite();
  const quickActions = settings.homepage?.quickActions || {};
  const contact = settings.contact || {};
  const phone = contact.phones?.[0] || (cmsAvailable ? "" : SITE.phones[0]);
  const whatsapp = contact.whatsapp || phone;
  const mobileActionBarEnabled = settings.websiteSettings?.showMobileAdmissionBar !== false && quickActions.enabled !== false;
  if (settings.websiteSettings?.showFloatingContact === false || quickActions.enabled === false) return null;

  return (
    <div id="floatingButtons" className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-30 flex flex-col gap-2.5 transition-[visibility] lg:bottom-8 lg:right-5 lg:gap-3">
      {quickActions.showWhatsApp !== false && whatsapp && <a
        href={`https://wa.me/91${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={quickActions.whatsappLabel || "Chat on WhatsApp"}
        className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-110 sm:h-[52px] sm:w-[52px] ${mobileActionBarEnabled ? "hidden lg:flex" : ""}`}
      >
        <WhatsappIcon size={24} color="#fff" />
      </a>}
      {quickActions.showCall !== false && phone && <a
        href={`tel:+91${phone}`}
        aria-label={`Call ${settings.brand?.name || "Future IT College"}`}
        className="hidden h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--royal)] shadow-lg transition hover:scale-110 lg:flex"
      >
        <PhoneIcon size={22} color="#fff" />
      </a>}
      <AnimatePresence>
        {quickActions.showScrollTop !== false && showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white shadow-lg transition hover:scale-110 sm:h-[52px] sm:w-[52px] lg:flex"
          >
            <ChevronUpIcon size={20} color="var(--navy)" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingButtons;
