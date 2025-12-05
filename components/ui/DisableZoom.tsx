"use client";

import { useEffect } from "react";

export default function DisableZoom() {
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      const timeSince = now - (window.lastTouchEnd || 0);
      if (timeSince < 300 && timeSince > 0) {
        e.preventDefault();
      }
      window.lastTouchEnd = now;
    };

    document.addEventListener("touchstart", preventZoom, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, {
      passive: false,
    });
    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener("gesturechange", (e) => e.preventDefault());
    document.addEventListener("gestureend", (e) => e.preventDefault());

    return () => {
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);
      document.removeEventListener("gesturestart", (e) => e.preventDefault());
      document.removeEventListener("gesturechange", (e) => e.preventDefault());
      document.removeEventListener("gestureend", (e) => e.preventDefault());
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    lastTouchEnd?: number;
  }
}
