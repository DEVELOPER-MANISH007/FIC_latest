import { useLocation } from "react-router-dom";
import { SITE } from "@/constants/siteData";

const MobileStickyCta = () => {
  const { pathname } = useLocation();
  const admissionHref = pathname === "/" ? "#admission" : "/#admission";

  return (
  <div
    id="mobileCta"
    className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--line)] z-40 flex gap-3 p-3"
  >
    <a href={`tel:+91${SITE.phones[0]}`} className="btn btn-navy flex-1 btn-sm">
      Call Now
    </a>
    <a href={admissionHref} className="btn btn-primary flex-1 btn-sm">
      Apply Now
    </a>
  </div>
  );
};

export default MobileStickyCta;
