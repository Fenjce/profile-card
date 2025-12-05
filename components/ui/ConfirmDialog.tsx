"use client";

import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme?: "light" | "dark";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "OK",
  cancelText = "Huỷ",
  onConfirm,
  onCancel,
  theme = "dark",
}: ConfirmDialogProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsActive(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsActive(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme === "dark" ? "#1e293b" : "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          transform: isActive ? "scale(1)" : "scale(0.9)",
          transition: "transform 0.2s ease",
        }}
      >
        {title && (
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: theme === "dark" ? "#f1f5f9" : "#1e293b",
            }}
          >
            {title}
          </h3>
        )}
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "15px",
            lineHeight: "1.5",
            color: theme === "dark" ? "#cbd5e1" : "#64748b",
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border:
                theme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "1px solid rgba(0, 0, 0, 0.2)",
              background: "transparent",
              color: theme === "dark" ? "#cbd5e1" : "#64748b",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#3b82f6",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#3b82f6";
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
