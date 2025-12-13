"use client";

import { useState, useEffect } from "react";
import { SeasonalTheme } from "@/lib/types";

interface SeasonalMessageProps {
  theme: SeasonalTheme;
}

export default function SeasonalMessage({ theme }: SeasonalMessageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const [visibleChars, setVisibleChars] = useState(0);
  const [currentMessage] = useState(
    () => theme.messages[Math.floor(Math.random() * theme.messages.length)]
  );

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsLoaded(true);
      let charIndex = 0;
      const charTimer = setInterval(() => {
        if (charIndex <= currentMessage.length) {
          setVisibleChars(charIndex++);
        } else {
          clearInterval(charTimer);
        }
      }, 60);
      return () => clearInterval(charTimer);
    }, 500);
    return () => clearTimeout(startTimer);
  }, [currentMessage]);

  const handleClose = () => {
    setShouldShow(false);
  };

  if (!shouldShow) return null;

  const renderAnimatedText = () =>
    currentMessage.split("").map((char, index) => (
      <span
        key={index}
        className={`seasonal-char ${index < visibleChars ? "visible" : ""}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {char}
      </span>
    ));

  return (
    <div
      className={`seasonal-message ${isLoaded ? "loaded" : ""}`}
      data-season={theme.id}
      onClick={handleClose}
      style={{
        background: theme.backgroundColor,
        color: theme.textColor,
        cursor: "pointer",
      }}
    >
      <div className="seasonal-message-content">
        <span
          className="seasonal-text"
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            hyphens: "auto",
          }}
        >
          {isLoaded ? renderAnimatedText() : ""}
        </span>
      </div>
    </div>
  );
}
