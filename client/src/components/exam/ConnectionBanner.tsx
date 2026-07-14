import { getIcon } from "@/constants/iconMap";

const AlertIcon = getIcon("shield");

/** Shown whenever the browser goes offline during an active exam (#9). */
const ConnectionBanner = () => (
  <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2">
    <AlertIcon size={14} /> Connection Lost — your answers are being saved locally and will sync automatically once you're back online.
  </div>
);

export default ConnectionBanner;
