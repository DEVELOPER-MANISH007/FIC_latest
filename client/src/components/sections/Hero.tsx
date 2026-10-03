import { useState } from "react";
import { motion } from "framer-motion";
import { SITE, TRUST_BADGES } from "@/constants/siteData";
import { getIcon } from "@/constants/iconMap";
import HeroSlider from "./HeroSlider";
import { useWebsite } from "@/context/WebsiteContext";

const ArrowRightIcon = getIcon("arrowRight");

const Hero = () => {
  const { settings, cmsAvailable } = useWebsite();
  const [activeBanner, setActiveBanner] = useState<Record<string, any> | null>(null);
  const brand = settings.brand || {};
  const hero = settings.homepage?.hero || {};
  const badges = cmsAvailable
    ? (Array.isArray(hero.trustBadges) ? hero.trustBadges : [])
    : TRUST_BADGES;
  return (
  <section id="home" className="hero-wrap flex items-center">
    <HeroSlider onBannerChange={setActiveBanner} />
    <div className="hero-bg" />

    <div className="container-x relative z-10 pt-32 pb-20 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <span className="eyebrow on-dark">
          <span className="eyebrow-dot" /> {hero.eyebrow || `Since ${brand.establishedYear || SITE.establishedYear} · Veerapura, Aligarh`}
        </span>

        <h1 className="font-display font-extrabold text-white text-[42px] sm:text-[56px] lg:text-[68px] leading-[1.05] mt-6">
          {activeBanner?.title || hero.title || brand.name || SITE.name}
        </h1>
        <p className="text-[#B9C6FF] font-medium text-lg mt-3">{activeBanner?.subtitle || hero.subtitle || brand.alternateName || SITE.alternateName}</p>

        <p className="font-display font-semibold text-2xl sm:text-3xl mt-6 text-white">{brand.tagline || SITE.tagline}</p>

        <p className="text-[#CBD3F0] text-[16px] sm:text-[17px] leading-relaxed mt-5 max-w-xl">
          {activeBanner?.description || hero.description || brand.description || SITE.description}
        </p>

        <div className="flex flex-wrap gap-4 mt-9">
          <a href={activeBanner?.primaryCtaHref || hero.primaryButtonHref || "#contact"} className="btn btn-primary">
            {activeBanner?.primaryCtaText || hero.primaryButtonText || "Apply for Admission"}
            <ArrowRightIcon size={16} />
          </a>
          <a href={activeBanner?.secondaryCtaHref || hero.secondaryButtonHref || "#courses"} className="btn btn-outline">
            {activeBanner?.secondaryCtaText || hero.secondaryButtonText || "Explore Courses"}
          </a>
        </div>

        <div className="flex flex-wrap gap-3 mt-10">
          {badges.map((badge: string) => (
            <span key={badge} className="border border-white/25 bg-[#15213c]/75 text-white text-[12.5px] font-medium px-4 py-2 rounded-full">
              {badge}
            </span>
          ))}
        </div>
      </motion.div>
    </div>

    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
      <span className="text-white/50 text-[11px] tracking-widest uppercase">Scroll</span>
      <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] scroll-dot" />
      </div>
    </div>
  </section>
  );
};

export default Hero;
