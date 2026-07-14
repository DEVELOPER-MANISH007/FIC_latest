import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { getIcon } from "@/constants/iconMap";

const CheckIcon = getIcon("checkCircle");
const AlertIcon = getIcon("shield");
const CloseIcon = getIcon("close");

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_STYLES: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  error: "border-red-200 bg-red-50 text-red-600",
  info: "border-[var(--line)] bg-white text-[var(--ink)]",
};

/**
 * Lightweight, dependency-free toast system (no external library needed).
 * Wrap the app once with <ToastProvider>; call useToast() anywhere to fire
 * success/error/info notifications that auto-dismiss after a few seconds.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const value: ToastContextValue = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
    info: (message) => push("info", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 max-w-[calc(100vw-2.5rem)] sm:max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-[13.5px] font-medium animate-[fadeIn_0.2s_ease] ${TYPE_STYLES[t.type]}`}
          >
            {t.type === "success" ? (
              <CheckIcon size={17} className="shrink-0 mt-0.5" />
            ) : t.type === "error" ? (
              <AlertIcon size={17} className="shrink-0 mt-0.5" />
            ) : null}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};
