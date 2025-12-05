"use client";

interface PollingIndicatorProps {
  isPolling: boolean;
  theme: "light" | "dark";
}

export default function PollingIndicator({
  isPolling,
  theme,
}: PollingIndicatorProps) {
  if (!isPolling) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: theme === "dark" ? "#3b82f6" : "#2563eb",
        boxShadow: `0 0 10px ${theme === "dark" ? "#3b82f6" : "#2563eb"}`,
        animation: "pulse 1.5s ease-in-out infinite",
        zIndex: 9999,
        opacity: 0.6,
      }}
      title="Đang kiểm tra cập nhật..."
    />
  );
}
