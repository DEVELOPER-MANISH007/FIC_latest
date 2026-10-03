import { useEffect, useState } from "react";

/**
 * Returns true once the page has been scrolled past `threshold` px.
 * Used to switch the navbar from transparent to solid, and to
 * toggle the scroll-to-top button visibility.
 */
export const useScrollPosition = (threshold = 40) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return scrolled;
};

