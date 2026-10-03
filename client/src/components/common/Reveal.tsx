import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}

/**
 * Wraps children in a fade-up-on-scroll animation using Framer
 * Motion's whileInView, replicating the original site's ".reveal"
 * scroll-triggered effect.
 */
const Reveal = ({ children, delay = 0, className = "", y = 28 }: RevealProps) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.8, delay, ease: [0.2, 0.9, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default Reveal;

