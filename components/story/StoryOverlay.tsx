"use client";

import { useEffect, useState, useRef } from "react";
import { Story } from "@/lib/types";
import StoryItem from "./StoryItem";
import { Messages } from "@/lib/messages";
import Image from "next/image";

interface StoryOverlayProps {
  stories: Story[];
  onClose: () => void;
  userName: string;
  userAvatar: string;
}

export default function StoryOverlay({
  stories,
  onClose,
  userName,
  userAvatar,
}: StoryOverlayProps) {
  const [timeKey, setTimeKey] = useState(0);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [viewingVideoUrl, setViewingVideoUrl] = useState<string | null>(null);
  const [viewingMediaSize, setViewingMediaSize] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update time every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => setTimeKey((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Hide picture-in-picture button from video controls
  useEffect(() => {
    const hidePiPButtons = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        // Set attribute
        video.setAttribute("disablePictureInPicture", "true");
        video.setAttribute(
          "controlsList",
          "nodownload nofullscreen noremoteplayback"
        );

        // Try to hide via shadow DOM if accessible
        try {
          const shadowRoot = (video as any).webkitShadowRoot;
          if (shadowRoot) {
            const pipButton = shadowRoot.querySelector(
              ".webkit-media-controls-picture-in-picture-button"
            );
            if (pipButton) {
              (pipButton as HTMLElement).style.display = "none";
            }
          }
        } catch (e) {
          // Shadow DOM not accessible, rely on CSS
        }
      });
    };

    // Run immediately and on video load
    hidePiPButtons();
    const interval = setInterval(hidePiPButtons, 500);

    // Also listen for video elements being added
    const observer = new MutationObserver(hidePiPButtons);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [viewingVideoUrl]);

  return (
    <>
      <div className="story-overlay active">
        <div className="story-container">
          <button
            className="story-close-btn"
            onClick={onClose}
            title={Messages.MODAL_HOME}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </button>

          <div className="social-modal-icon social-modal-icon-story">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>

          <h2 className="story-modal-title">{Messages.STORY_TITLE}</h2>

          <div ref={scrollContainerRef} className="story-content">
            {stories.length === 0 ? (
              <div className="story-empty">{Messages.STORY_EMPTY}</div>
            ) : (
              stories.map((story, index) => (
                <StoryItem
                  key={index}
                  story={story}
                  index={index}
                  timeKey={timeKey}
                  userName={userName}
                  userAvatar={userAvatar}
                  onImageClick={(imageUrl, mediaSize) => {
                    setViewingImageUrl(imageUrl);
                    setViewingVideoUrl(null);
                    setViewingMediaSize(mediaSize || null);
                  }}
                  onVideoClick={(videoUrl, mediaSize) => {
                    setViewingVideoUrl(videoUrl);
                    setViewingImageUrl(null);
                    setViewingMediaSize(mediaSize || null);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {(viewingImageUrl || viewingVideoUrl) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => {
            setViewingImageUrl(null);
            setViewingVideoUrl(null);
            setViewingMediaSize(null);
          }}
        >
          <button
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              fontSize: "24px",
              zIndex: 10001,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setViewingImageUrl(null);
              setViewingVideoUrl(null);
              setViewingMediaSize(null);
            }}
          >
            ×
          </button>
          {viewingMediaSize && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                padding: "8px 16px",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                zIndex: 10001,
              }}
            >
              Dung lượng: {viewingMediaSize}
            </div>
          )}
          {viewingImageUrl && (
            <Image
              src={viewingImageUrl}
              alt="Story"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
              width={1200}
              height={800}
              onClick={(e) => e.stopPropagation()}
              unoptimized
            />
          )}
          {viewingVideoUrl && (
            <video
              src={viewingVideoUrl}
              controls
              autoPlay
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}
