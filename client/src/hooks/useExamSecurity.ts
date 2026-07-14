import { useCallback, useEffect, useRef, useState } from "react";
import type { ViolationType } from "@/types";

interface UseExamSecurityOptions {
  /** Master on/off — pass false once the exam is submitted to release all restrictions. */
  active: boolean;
  fullscreenRequired: boolean;
  tabSwitchDetectionEnabled: boolean;
  onViolation: (type: ViolationType, meta?: string) => void;
}

/** Violations severe enough to immediately pause the exam behind a blocking
 *  "OK to continue" dialog — leaving the exam window in some form. Lighter
 *  violations (copy/paste attempts, devtools heuristic) are still detected,
 *  blocked, and counted, but don't halt the test. */
const PAUSING_VIOLATIONS: ViolationType[] = ["tab-switch", "window-blur", "fullscreen-exit"];

/**
 * Secure Exam Mode — the browser-side half of anti-cheating. Every
 * violation this hook detects is reported to the server (via onViolation),
 * which is the sole authority on violation counting / auto-submit; this
 * hook never decides that on its own, since a person with devtools open
 * could otherwise just tamper with client-side counters.
 *
 * As acknowledged by the spec: browsers cannot be *completely* locked down
 * (a determined user with OS-level screen recording, a second device, etc.
 * can't be stopped by any web page). This implements the strongest
 * practical browser-based measures — fullscreen enforcement, tab/visibility
 * monitoring with an immediate pause-and-warn flow, blocking the common
 * copy/paste/devtools shortcuts and right-click, and a devtools-open
 * heuristic — while staying usable.
 */
export const useExamSecurity = ({ active, fullscreenRequired, tabSwitchDetectionEnabled, onViolation }: UseExamSecurityOptions) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedReason, setPausedReason] = useState<ViolationType | null>(null);
  const devtoolsWarned = useRef(false);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    const request = el.requestFullscreen || (el as any).webkitRequestFullscreen || (el as any).msRequestFullscreen;
    if (request) {
      request.call(el).catch(() => {
        // Some browsers block programmatic fullscreen outside a direct user
        // gesture — the resume flow lets the student retry by clicking OK.
      });
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const raiseViolation = useCallback(
    (type: ViolationType, meta?: string) => {
      if (PAUSING_VIOLATIONS.includes(type)) {
        setIsPaused(true);
        setPausedReason(type);
      }
      onViolation(type, meta);
    },
    [onViolation]
  );

  /** Called when the student clicks "OK" on the security warning dialog (#2, #3). */
  const resume = useCallback(() => {
    setIsPaused(false);
    setPausedReason(null);
    if (fullscreenRequired && !document.fullscreenElement) {
      requestFullscreen();
    }
  }, [fullscreenRequired, requestFullscreen]);

  // ---- Fullscreen enforcement + monitoring (#6) ----
  useEffect(() => {
    if (!active || !fullscreenRequired) return;

    requestFullscreen();

    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) raiseViolation("fullscreen-exit");
    };

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fullscreenRequired]);

  // ---- Tab switching / visibility / blur detection (#1) ----
  useEffect(() => {
    if (!active || !tabSwitchDetectionEnabled) return;

    const onVisibilityChange = () => {
      if (document.hidden) raiseViolation("tab-switch", "visibilitychange");
    };
    const onBlur = () => raiseViolation("window-blur", "blur");

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tabSwitchDetectionEnabled]);

  // ---- Block right-click, copy/paste/cut, drag-drop, text selection, common shortcuts (#8) ----
  useEffect(() => {
    if (!active) return;

    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      raiseViolation("copy-paste-attempt", e.type);
    };
    const onDragDrop = (e: DragEvent) => e.preventDefault();
    const onSelectStart = (e: Event) => e.preventDefault();

    const BLOCKED_COMBOS: Array<(e: KeyboardEvent) => boolean> = [
      (e) => (e.ctrlKey || e.metaKey) && ["c", "v", "x", "a", "p", "s"].includes(e.key.toLowerCase()),
      (e) => e.key === "F12",
      (e) => (e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()),
    ];
    const onKeyDown = (e: KeyboardEvent) => {
      if (BLOCKED_COMBOS.some((test) => test(e))) {
        e.preventDefault();
        raiseViolation("copy-paste-attempt", `key:${e.key}`);
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopyPaste);
    document.addEventListener("paste", onCopyPaste);
    document.addEventListener("cut", onCopyPaste);
    document.addEventListener("dragstart", onDragDrop);
    document.addEventListener("drop", onDragDrop);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopyPaste);
      document.removeEventListener("paste", onCopyPaste);
      document.removeEventListener("cut", onCopyPaste);
      document.removeEventListener("dragstart", onDragDrop);
      document.removeEventListener("drop", onDragDrop);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ---- Basic DevTools-open heuristic (#8) ----
  // Not foolproof (acknowledged in the spec) — a large outer/inner window
  // size gap is a reasonable signal that a docked devtools panel is open.
  // Counted as a violation but doesn't pause the exam on its own.
  useEffect(() => {
    if (!active) return;
    const THRESHOLD = 160;
    const interval = setInterval(() => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      if (widthGap > THRESHOLD || heightGap > THRESHOLD) {
        if (!devtoolsWarned.current) {
          devtoolsWarned.current = true;
          raiseViolation("devtools-detected", `gap:${widthGap}x${heightGap}`);
        }
      } else {
        devtoolsWarned.current = false;
      }
    }, 1500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ---- Warn before refresh/close (#7 from the earlier phase — kept) ----
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      onViolation("refresh-attempt", "beforeunload");
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { isFullscreen, isPaused, pausedReason, resume, requestFullscreen, exitFullscreen };
};
