import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getIcon } from "@/constants/iconMap";
import { HERO_IMAGES } from "@/assets/hero-images";
import { useWebsite } from "@/context/WebsiteContext";
import { resolveImageUrl } from "@/services/api/axiosInstance";

const ChevronLeftIcon = getIcon("chevronLeft");
const ChevronRightIcon = getIcon("chevronRight");

const AUTOPLAY_MS = 5000;

/**
 * Fullscreen background image slider for the Hero section.
 * Renders BEHIND the existing `.hero-bg` gradient overlay, so all
 * hero text/buttons/overlays/spacing are completely unaffected —
 * this component only owns the background photography.
 */
const HeroSlider = ({ onBannerChange }: { onBannerChange?: (banner: Record<string, any> | null) => void }) => {
  const { banners, cmsAvailable } = useWebsite();
  const slides = banners.filter((banner) => banner.image);
  const images = cmsAvailable ? slides.map((banner) => banner.image) : HERO_IMAGES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideCount = images.length;
  useEffect(() => { onBannerChange?.(slides[index] || null); }, [slides, index, onBannerChange]);
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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-hidden="true"
    >
      <AnimatePresence initial={false}>
        <picture key={index}>
        {slides[index]?.mobileImage && <source media="(max-width: 640px)" srcSet={slides[index].mobileImage.startsWith("/uploads") ? resolveImageUrl(slides[index].mobileImage) : slides[index].mobileImage} />}
        <motion.img
          key={index}
          src={images[index]?.startsWith("/uploads") ? resolveImageUrl(images[index]) : images[index]}
          alt=""
          className="hero-slide-img"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
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
                aria-selected={i === index}
                className={`hero-slider-dot ${i === index ? "is-active" : ""}`}
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
