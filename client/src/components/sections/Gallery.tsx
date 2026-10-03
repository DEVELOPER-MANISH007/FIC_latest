import { useState } from "react";
import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import Lightbox from "@/components/common/Lightbox";
import { resolveImageUrl } from "@/services/api/axiosInstance";
import type { GalleryItem } from "@/types";
import { useWebsite } from "@/context/WebsiteContext";

import lab from "@/assets/images/lab.jpg";
import classroom from "@/assets/images/classroom.jpg";
import practical from "@/assets/images/practical.jpg";
import building from "@/assets/images/building.jpg";
import office from "@/assets/images/office.jpg";

const FALLBACK: GalleryItem[] = [
  { title: "Computer Lab", category: "Computer Lab", image: lab },
  { title: "Smart Classroom", category: "Smart Classroom", image: classroom },
  { title: "Practical Sessions", category: "Practical Sessions", image: practical },
  { title: "Institute Building", category: "Institute Building", image: building },
  { title: "Students Learning", category: "Students Learning", image: office },
];

const Gallery = () => {
  const { gallery: cmsGallery, cmsAvailable } = useWebsite();
  const items = (cmsAvailable ? cmsGallery : FALLBACK) as GalleryItem[];
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = (src: string, alt: string) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };

  return (
    <section id="gallery" className="py-16 lg:py-24 bg-[var(--bg-soft)]">
      <div className="container-x">
        <SectionHeading eyebrow="Gallery" title="A glimpse inside the campus" sectionKey="gallery" />

        {items.length ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {items.map((item, i) => {
            const imgSrc = item.image?.startsWith("/uploads") ? resolveImageUrl(item.image) : item.image;
            return (
              <Reveal key={`${item.category}-${i}`} delay={(i % 6) * 0.06}>
                <div
                  className="gal-item aspect-square"
                  onClick={() => openLightbox(imgSrc, item.title || `${item.category} at Future IT College`)}
                >
                  <img src={imgSrc} alt={item.caption || item.title || `${item.category} at Future IT College`} loading="lazy" onError={(event) => { if (event.currentTarget.dataset.fallback !== "true") { event.currentTarget.dataset.fallback = "true"; event.currentTarget.src = FALLBACK[i % FALLBACK.length].image; } }} />
                  <div className="gal-overlay">
                    <span className="text-center text-white text-[12.5px] font-medium">{item.caption || item.eventName || item.title || item.category}{item.eventDate ? ` · ${new Date(item.eventDate).toLocaleDateString()}` : ""}{item.isFeatured ? " · Featured" : ""}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}

        </div> : <div className="mt-12 rounded-xl bg-white px-6 py-10 text-center text-[var(--ink-soft)]">Campus photos will be added soon.</div>}
      </div>

      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
    </section>
  );
};

export default Gallery;
