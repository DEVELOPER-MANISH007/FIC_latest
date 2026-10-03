import { useLocation } from "react-router-dom";
import { SITE } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import logo from "@/assets/images/logo.png";
import { useWebsite } from "@/context/WebsiteContext";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";

const SOCIAL_ICONS: Record<string, typeof FaInstagram> = { instagram: FaInstagram, facebook: FaFacebookF, youtube: FaYoutube, linkedin: FaLinkedinIn };

const Footer = () => {
  const { pathname } = useLocation();
  const { settings, cmsAvailable } = useWebsite();
  const brand = settings.brand || {};
  const contact = settings.contact || {};
  const footer = settings.footer || {};
  const footerLogo = footer.logo || brand.footerLogo || brand.logo || "";
  const footerLogoSrc = footerLogo.startsWith("/uploads") ? resolveImageUrl(footerLogo) : footerLogo || logo;
  const email = contact.email || (cmsAvailable ? "" : SITE.email);
  const locationName = brand.locationName || (cmsAvailable ? "" : SITE.locationName);
  const address = contact.address || (cmsAvailable ? {} : SITE.address);
  const mapUrl = contact.mapUrl || (cmsAvailable ? "" : SITE.mapUrl);
  const phones = cmsAvailable
    ? (Array.isArray(contact.phones) ? contact.phones : [])
    : (contact.phones?.length ? contact.phones : SITE.phones);
  const socials = settings.socials?.filter((item: any) => item.visible && item.href) || [];
  const footerLinks = (footer.links?.filter((item: any) => item.visible !== false).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))) || ["Courses", "Facilities", "Gallery", "Admission", "Contact"].map((label) => ({ label, href: `#${label.toLowerCase()}` }));
  const sectionHref = (hash: string) => (pathname === "/" ? hash : `/${hash}`);
  const normalizeHref = (href: string) => href.startsWith("#") ? sectionHref(href) : href;

  return (
  <footer className="grad-navy relative overflow-hidden pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-12 sm:pt-16 lg:pb-8">
    <div className="container-x relative">
      <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <img src={footerLogoSrc} alt={`${brand.name || SITE.name} logo`} className="w-10 h-10 rounded-xl object-cover bg-white" onError={(event) => { event.currentTarget.src = logo; }} />
            <div className="min-w-0">
              <p className="font-display font-bold text-white text-[15px] [overflow-wrap:anywhere]">{brand.name || (cmsAvailable ? "" : SITE.name)}</p>
              {locationName && <p className="text-[10.5px] text-[#9AA4D4] [overflow-wrap:anywhere]">{locationName}</p>}
            </div>
          </div>
          <p className="text-[13px] text-[#9AA4D4] mt-5 leading-relaxed">
            {footer.tagline || (cmsAvailable ? "" : `Practical, career-focused computer education since ${brand.establishedYear || SITE.establishedYear}.`)}
          </p>
          <div className="flex gap-3 mt-5">
            {socials.map((social: any) => {
              const Icon = SOCIAL_ICONS[String(social.label).toLowerCase()] || getIcon("globe");
              return <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white hover:bg-white/16 transition"
              >
                <Icon size={15} />
              </a>
            })}
          </div>
        </div>

        <div className="min-w-0">
          <p className="font-display font-semibold text-white text-[14px] mb-4">{footer.quickLinksTitle || (cmsAvailable ? "" : "Quick Links")}</p>
          <ul className="space-y-3 text-[13.5px] text-[#9AA4D4]">
            {footerLinks.map((link: any) => <li key={`${link.label}-${link.href}`}><a href={normalizeHref(link.href)} className="hover:text-white transition">{link.label}</a></li>)}
          </ul>
        </div>

        <div className="min-w-0">
          <p className="font-display font-semibold text-white text-[14px] mb-4">Contact</p>
          <ul className="space-y-3 text-[13.5px] text-[#9AA4D4]">
            {phones.map((phone: string) => (
              <li key={phone} className="[overflow-wrap:anywhere]">{phone}</li>
            ))}
            {email && <li className="[overflow-wrap:anywhere]">{email}</li>}
          </ul>
        </div>

        <div className="min-w-0">
          <p className="font-display font-semibold text-white text-[14px] mb-4">Location</p>
          <p className="text-[13.5px] leading-relaxed text-[#9AA4D4] [overflow-wrap:anywhere]">
            {locationName}
            {(address.city || address.state || address.pincode) && <><br />{[address.city, address.state, address.pincode].filter(Boolean).join(" – ")}</>}
          </p>
          {mapUrl && <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[var(--orange-soft)] font-medium mt-3 inline-block hover:underline"
          >
            View on Google Maps →
          </a>}
        </div>
      </div>

      <div className="mt-10 flex min-w-0 flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 sm:mt-12 sm:flex-row sm:items-center">
        <p className="text-[12px] text-[#8188B8] [overflow-wrap:anywhere]">{(footer.copyright || (cmsAvailable ? "" : "© {year} Future IT College. All rights reserved.")).replace("{year}", String(new Date().getFullYear())).replace("Future IT College", brand.name || (cmsAvailable ? "" : SITE.name))}</p>
        {locationName && <p className="text-[12px] text-[#8188B8] [overflow-wrap:anywhere]">{locationName}</p>}
      </div>
    </div>
  </footer>
  );
};

export default Footer;
