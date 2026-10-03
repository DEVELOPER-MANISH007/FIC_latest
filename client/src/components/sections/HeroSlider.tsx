import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getIcon } from "@/constants/iconMap";
import { HERO_IMAGES } from "@/assets/hero-images";
import { useWebsite } from "@/context/WebsiteContext";
import { resolveImageUrl } from "@/services/api/axiosInstance";

const ChevronLeftIcon = getIcon("chevronLeft");
const ChevronRightIcon = getIcon("chevronRight");

const AUTOPLAY_MS = 5000;

const isUsableImagePath = (value: unknown): value is string => {
  if (typeof value !== "string" || !value.trim()) return false;
  const path = value.trim();
  return path.startsWith("/") || /^https?:\/\//i.test(path);
};

const imageUrl = (path: string) => path.startsWith("/uploads") ? resolveImageUrl(path) : path;

/**
 * Fullscreen background image slider for the Hero section.
 * Renders BEHIND the existing `.hero-bg` gradient overlay, so all
 * hero text/buttons/overlays/spacing are completely unaffected —
 * this component only owns the background photography.
 */
const HeroSlider = ({ onBannerChange }: { onBannerChange?: (banner: Record<string, any> | null) => void }) => {
  const { banners, cmsAvailable } = useWebsite();
  // Keep CMS banners (including records without an image) so their content and
  // display order stay CMS-driven. Use the existing bundled institute photos
  // only as a safe image fallback.
  const slides = useMemo(() => cmsAvailable ? banners : [], [banners, cmsAvailable]);
  const images = useMemo(
    () => slides.length
      ? slides.map((banner, slideIndex) => isUsableImagePath(banner.image) ? imageUrl(banner.image.trim()) : HERO_IMAGES[slideIndex % HERO_IMAGES.length])
      : HERO_IMAGES,
    [slides]
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideCount = images.length;
  const activeIndex = index < slideCount ? index : 0;
  const fallbackImage = HERO_IMAGES[activeIndex % HERO_IMAGES.length];
  useEffect(() => { onBannerChange?.(slides[activeIndex] || null); }, [slides, activeIndex, onBannerChange]);
  useEffect(() => { if (index >= slideCount) setIndex(0); }, [index, slideCount]);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slideCount) + slideCount) % slideCount);
    },
    [slideCount]
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay — infinite loop, paused on hover (desktop only, via mouse events).
  useEffect(() => {
    if (paused || slideCount <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slideCount);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slideCount]);

  if (slideCount === 0) return null;

  return (
    <div
      className="hero-slider"
      style={{ backgroundImage: `url("${fallbackImage}")`, backgroundSize: "cover", backgroundPosition: "center 35%" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-hidden="true"
    >
      <AnimatePresence initial={false}>
        <picture key={slides[activeIndex]?._id || activeIndex}>
        {isUsableImagePath(slides[activeIndex]?.mobileImage) && <source media="(max-width: 640px)" srcSet={imageUrl(slides[activeIndex].mobileImage.trim())} />}
        <motion.img
          key={slides[activeIndex]?._id || activeIndex}
          src={images[activeIndex]}
          alt=""
          className="hero-slide-img"
          loading="eager"
          decoding="async"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.dataset.fallbackApplied === "true") return;
            image.dataset.fallbackApplied = "true";
            image.parentElement?.querySelector("source")?.setAttribute("srcset", fallbackImage);
            image.removeAttribute("srcset");
            image.src = fallbackImage;
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        </picture>
      </AnimatePresence>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="hero-slider-arrow hero-slider-arrow--left"
            onClick={goPrev}
          >
            <ChevronLeftIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="hero-slider-arrow hero-slider-arrow--right"
            onClick={goNext}
          >
            <ChevronRightIcon size={18} />
          </button>

          <div className="hero-slider-dots" role="tablist" aria-label="Hero slides">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === activeIndex}
                className={`hero-slider-dot ${i === activeIndex ? "is-active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
