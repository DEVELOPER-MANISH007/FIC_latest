import { Link } from "react-router-dom";
import { getIcon } from "@/constants/iconMap";

const ArrowRightIcon = getIcon("arrowRight");

/**
 * 404 page — kept on-brand with the same fonts, colors and button
 * styles as the rest of the site.
 */
const NotFound = () => (
  <section className="min-h-screen flex items-center justify-center grad-navy px-6">
    <div className="text-center max-w-md">
      <p className="font-num font-extrabold text-white text-7xl">404</p>
      <h1 className="font-display font-bold text-2xl text-white mt-4">Page not found</h1>
      <p className="text-[#C6CEEF] mt-3 leading-relaxed">
        The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
      </p>
      <Link to="/" className="btn btn-primary mt-8">
        Back to Home
        <ArrowRightIcon size={16} />
      </Link>
    </div>
  </section>
);

export default NotFound;

