import { useEffect, type RefObject } from "react";

/** Calls `handler` when the user clicks or taps outside `ref`. */
export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) return;
      handler();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [ref, handler, enabled]);
};
