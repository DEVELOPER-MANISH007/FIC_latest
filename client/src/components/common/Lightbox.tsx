import { AnimatePresence, motion } from "framer-motion";
import { getIcon } from "@/constants/iconMap";

interface LightboxProps {
  src: string | null;
  alt: string;
  onClose: () => void;
}

const CloseIcon = getIcon("close");

/**
 * Fullscreen image preview modal used by the Gallery section.
 */
const Lightbox = ({ src, alt, onClose }: LightboxProps) => (
  <AnimatePresence>
    {src && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 z-[80] flex items-center justify-center p-6"
        onClick={onClose}
      >
        <button
          aria-label="Close preview"
          onClick={onClose}
          className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
        >
          <CloseIcon size={20} />
        </button>
        <motion.img
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          src={src}
          alt={alt}
          className="max-w-full max-h-full rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

export default Lightbox;

