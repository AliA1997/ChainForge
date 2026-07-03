"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

export type ToastKind = "info" | "pending" | "success" | "error";

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
  /** When set, renders a link to the tx on the active chain's explorer. */
  explorerUrl?: string;
  sticky?: boolean;
}

interface ToastApi {
  push: (toast: Omit<Toast, "id">) => number;
  update: (id: number, patch: Partial<Omit<Toast, "id">>) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToasts(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToasts must be used inside <ToastProvider>");
  return api;
}

const KIND_STYLES: Record<ToastKind, string> = {
  info: "border-zinc-700",
  pending: "border-amber-600/60",
  success: "border-emerald-600/60",
  error: "border-red-600/60",
};

const KIND_ICONS: Record<ToastKind, string> = {
  info: "ℹ",
  pending: "⏳",
  success: "✓",
  error: "✕",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-4), { ...toast, id }]);
      if (!toast.sticky) setTimeout(() => dismiss(id), 7000);
      return id;
    },
    [dismiss],
  );

  const update = useCallback(
    (id: number, patch: Partial<Omit<Toast, "id">>) => {
      setToasts((current) => current.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      if (patch.sticky === false || (patch.kind && patch.kind !== "pending")) {
        setTimeout(() => dismiss(id), 7000);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ push, update, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`card pointer-events-auto border p-3 text-sm shadow-xl ${KIND_STYLES[toast.kind]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className={toast.kind === "pending" ? "animate-pulse" : ""}>
                  {KIND_ICONS[toast.kind]}
                </span>
                <div>
                  <p className="font-medium text-zinc-100">{toast.title}</p>
                  {toast.detail && (
                    <p className="mt-0.5 break-all text-xs text-zinc-400">{toast.detail}</p>
                  )}
                  {toast.explorerUrl && (
                    <a
                      href={toast.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-indigo-400 hover:underline"
                    >
                      View on explorer ↗
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-zinc-600 hover:text-zinc-300"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
