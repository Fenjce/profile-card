"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Đợi animation fade out
      }, toast.duration || 2000);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getToastStyle = () => {
    const baseStyle = {
      position: "fixed" as const,
      top: "20px",
      left: "50%",
      transform: isVisible
        ? "translateX(-50%) translateY(0)"
        : "translateX(-50%) translateY(-100px)",
      zIndex: 10000,
      padding: "12px 24px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500" as const,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      pointerEvents: "none" as const,
      maxWidth: "90%",
      wordBreak: "break-word" as const,
    };

    switch (toast.type) {
      case "success":
        return {
          ...baseStyle,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        };
      case "error":
        return {
          ...baseStyle,
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        };
      default:
        return {
          ...baseStyle,
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case "error":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      default:
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  return (
    <div style={getToastStyle()}>
      {getIcon()}
      <span>{toast.message}</span>
    </div>
  );
}

