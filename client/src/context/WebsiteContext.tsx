import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "@/services/api/axiosInstance";
import type { ApiResponse } from "@/types";
import { resolveImageUrl } from "@/services/api/axiosInstance";

export type WebsiteBundle = {
  cmsAvailable: boolean;
  settings: Record<string, any>;
  banners: Record<string, any>[];
  notices: Record<string, any>[];
  courses: Record<string, any>[];
  faculty: Record<string, any>[];
  gallery: Record<string, any>[];
  testimonials: Record<string, any>[];
};

const EMPTY_BUNDLE: WebsiteBundle = { cmsAvailable: false, settings: {}, banners: [], notices: [], courses: [], faculty: [], gallery: [], testimonials: [] };
const WebsiteContext = createContext<WebsiteBundle>(EMPTY_BUNDLE);

export const WebsiteProvider = ({ children }: { children: ReactNode }) => {
  const [bundle, setBundle] = useState<WebsiteBundle>(EMPTY_BUNDLE);
  useEffect(() => {
    let active = true;
    const refresh = () => api.get<ApiResponse<WebsiteBundle>>("/website")
      .then(({ data }) => { if (active && data.data) setBundle({ ...EMPTY_BUNDLE, ...data.data, cmsAvailable: true }); })
      .catch(() => { /* existing static site content remains as the offline fallback */ });
    refresh();
    window.addEventListener("fic:website-refresh", refresh);
    return () => { active = false; window.removeEventListener("fic:website-refresh", refresh); };
  }, []);
  useEffect(() => {
    const seo = bundle.settings?.seo;
    const brand = bundle.settings?.brand;
    if (seo?.title) document.title = seo.title;
    const description = seo?.description || brand?.description;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
      meta.setAttribute("content", description);
    }
    const setMeta = (name: string, content: string | undefined, property = false) => {
      if (!content) return;
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) { meta = document.createElement("meta"); meta.setAttribute(property ? "property" : "name", name); document.head.appendChild(meta); }
      meta.setAttribute("content", content);
    };
    setMeta("keywords", seo?.keywords);
    setMeta("og:title", seo?.title || brand?.name, true);
    setMeta("og:description", description, true);
    setMeta("og:image", seo?.ogImage ? resolveImageUrl(seo.ogImage) : undefined, true);
    if (seo?.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
      canonical.setAttribute("href", seo.canonicalUrl);
    }
    if (brand?.favicon) {
      let icon = document.querySelector('link[rel="icon"]');
      if (!icon) { icon = document.createElement("link"); icon.setAttribute("rel", "icon"); document.head.appendChild(icon); }
      const favicon = brand.favicon.startsWith("/uploads") && import.meta.env.VITE_SERVER_URL
        ? `${import.meta.env.VITE_SERVER_URL}${brand.favicon}`
        : brand.favicon;
      icon.setAttribute("href", favicon);
    }
    if (brand?.primaryColor) document.documentElement.style.setProperty("--royal", brand.primaryColor);
    if (brand?.secondaryColor) document.documentElement.style.setProperty("--navy", brand.secondaryColor);
  }, [bundle.settings]);
  const value = useMemo(() => bundle, [bundle]);
  return <WebsiteContext.Provider value={value}>{children}</WebsiteContext.Provider>;
};

export const useWebsite = () => useContext(WebsiteContext);
