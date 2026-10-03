import { useEffect, useState, useCallback } from "react";

/**
 * Countdown hook driven by an absolute server-issued `expiresAt`
 * timestamp (rather than a local duration) so the timer is always
 * correct even after a page refresh or the browser being closed and
 * reopened — the remaining time is recomputed from the server's clock
 * reference on every tick.
 */
export const useExamTimer = (expiresAt: string | null, onExpire: () => void) => {
  const computeRemaining = useCallback(() => {
    if (!expiresAt) return 0;
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(diff, 0);
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(computeRemaining);

  useEffect(() => {
    setRemaining(computeRemaining());
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const next = computeRemaining();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { remaining, formatted, isLow: remaining <= 60 };
};

