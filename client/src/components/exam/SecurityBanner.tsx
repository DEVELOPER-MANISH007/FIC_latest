import { useEffect, useState } from "react";
import { getIcon } from "@/constants/iconMap";

const AlertIcon = getIcon("shield");

interface Props {
  /** Bump this (e.g. with Date.now()) each time a violation fires to re-trigger the banner. */
  triggerKey: number;
}

/** Fixed warning banner (#4) — reappears on each violation, auto-hides after a few seconds. */
const SecurityBanner = ({ triggerKey }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!triggerKey) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [triggerKey]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[96] bg-amber-500 text-white text-center py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 shadow-md">
      <AlertIcon size={14} /> Security Violation Detected — Please stay in fullscreen and do not switch browser tabs.
    </div>
  );
};

export default SecurityBanner;
