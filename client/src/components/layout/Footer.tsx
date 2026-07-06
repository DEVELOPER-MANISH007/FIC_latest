import { SITE } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import logo from "@/assets/images/logo.png";

const InstagramIcon = getIcon("checkCircle");

const Footer = () => (
  <footer className="grad-navy pt-16 pb-8 relative overflow-hidden">
    <div className="container-x relative">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Future IT College logo" className="w-10 h-10 rounded-xl object-cover bg-white" />
            <div>
              <p className="font-display font-bold text-white text-[15px]">Future IT College</p>
              <p className="text-[10.5px] text-[#9AA4D4]">{SITE.locationName}</p>
            </div>
          </div>
          <p className="text-[13px] text-[#9AA4D4] mt-5 leading-relaxed">
            Practical, career-focused computer education since {SITE.establishedYear}.
          </p>
          <div className="flex gap-3 mt-5">
            {["Instagram", "Facebook", "YouTube"].map((label) => (
              <a
                key={label}
                href="#"
                aria-label={`${label} (coming soon)`}
                className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white hover:bg-white/16 transition"
              >
                <InstagramIcon size={15} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display font-semibold text-white text-[14px] mb-4">Quick Links</p>
          <ul className="space-y-3 text-[13.5px] text-[#9AA4D4]">
            <li><a href="#courses" className="hover:text-white transition">Courses</a></li>
            <li><a href="#facilities" className="hover:text-white transition">Facilities</a></li>
            <li><a href="#gallery" className="hover:text-white transition">Gallery</a></li>
            <li><a href="#admission" className="hover:text-white transition">Admission</a></li>
            <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        <div>
          <p className="font-display font-semibold text-white text-[14px] mb-4">Contact</p>
          <ul className="space-y-3 text-[13.5px] text-[#9AA4D4]">
            {SITE.phones.map((phone) => (
              <li key={phone}>{phone}</li>
            ))}
            <li>{SITE.email}</li>
          </ul>
        </div>

        <div>
          <p className="font-display font-semibold text-white text-[14px] mb-4">Location</p>
          <p className="text-[13.5px] text-[#9AA4D4] leading-relaxed">
            {SITE.locationName}
            <br />
            {SITE.address.city}, {SITE.address.state} – {SITE.address.pincode}
          </p>
          <a
            href={SITE.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[var(--orange-soft)] font-medium mt-3 inline-block hover:underline"
          >
            View on Google Maps →
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-[12px] text-[#8188B8]">© {new Date().getFullYear()} Future IT College. All rights reserved.</p>
        <p className="text-[12px] text-[#8188B8]">{SITE.locationName}</p>
      </div>
    </div>
  </footer>
);

export default Footer;
