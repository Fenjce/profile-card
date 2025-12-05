"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Toast, { ToastMessage } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "info",
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" = "info",
      duration: number = 2000
    ) => {
      const id = `toast-${toastIdCounter++}`;
      setToast({ id, message, type, duration });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

