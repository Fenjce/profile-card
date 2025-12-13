"use client";

import { useState, useEffect } from "react";
import { SeasonalTheme } from "../../lib/types";
import { generateRandomMessage } from "../../lib/autoMessageGenerator";

interface SeasonalMessageProps {
  theme: SeasonalTheme;
}

export default function SeasonalMessage({ theme }: SeasonalMessageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const [visibleChars, setVisibleChars] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Đang tạo câu chúc...");
  const [isGenerating, setIsGenerating] = useState(true);

  // Generate AI message when component mounts
  useEffect(() => {
    const generateMessage = async () => {
      try {
        setIsGenerating(true);
        // Try to get API key from localStorage or environment
        const apiKey =
          localStorage.getItem("huggingface_api_key") ||
          process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
        const message = await generateRandomMessage(theme, apiKey);
        setCurrentMessage(message);
      } catch (error) {
        console.error("Failed to generate message:", error);
        // Fallback to existing messages
        const fallbackMessage =
          theme.messages[Math.floor(Math.random() * theme.messages.length)];
        setCurrentMessage(fallbackMessage);
      } finally {
        setIsGenerating(false);
      }
    };

    generateMessage();
  }, [theme]);

  useEffect(() => {
    // Only start animation when message is ready and not generating
    if (!isGenerating && currentMessage !== "Đang tạo câu chúc...") {
      const startTimer = setTimeout(() => {
        setIsLoaded(true);
        let charIndex = 0;
        const charTimer = setInterval(() => {
          if (charIndex <= currentMessage.length) {
            setVisibleChars(charIndex++);
          } else {
            clearInterval(charTimer);
          }
        }, 20);
        return () => clearInterval(charTimer);
      }, 200);
      return () => clearTimeout(startTimer);
    }
  }, [currentMessage, isGenerating]);

  const handleClose = () => {
    setShouldShow(false);
  };

  if (!shouldShow) return null;

  const renderAnimatedText = () => {
    // Split by words for more natural animation
    const words = currentMessage.split(" ");
    let charCount = 0;

    return words.map((word, wordIndex) => {
      const wordStart = charCount;
      charCount += word.length + (wordIndex < words.length - 1 ? 1 : 0); // +1 for space

      return (
        <span key={wordIndex}>
          {word.split("").map((char, charIndex) => {
            const globalIndex = wordStart + charIndex;
            return (
              <span
                key={charIndex}
                className={`seasonal-char ${
                  globalIndex < visibleChars ? "visible" : ""
                }`}
              >
                {char}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span
              className={`seasonal-char ${
                wordStart + word.length < visibleChars ? "visible" : ""
              }`}
            >
              {" "}
            </span>
          )}
        </span>
      );
    });
  };

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
        {theme.icon && (
          <span
            className="seasonal-icon"
            style={{ fontSize: "18px", marginRight: "8px" }}
          >
            {theme.icon}
          </span>
        )}
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
