"use client";

import Image from "next/image";
import { Story } from "@/lib/types";
import { getTimeAgo } from "@/lib/utils";

interface StoryItemProps {
  story: Story;
  index: number;
  timeKey?: number;
  userName: string;
  userAvatar: string;
  onImageClick?: (imageUrl: string, mediaSize?: string) => void;
  onVideoClick?: (videoUrl: string, mediaSize?: string) => void;
}

export default function StoryItem({
  story,
  index,
  timeKey,
  userName,
  userAvatar,
  onImageClick,
  onVideoClick,
}: StoryItemProps) {
  return (
    <div
      className="story-item"
      style={{ "--item-index": index } as React.CSSProperties}
    >
      <div className="story-item-header">
        <Image
          src={userAvatar || "https://via.placeholder.com/50"}
          alt={userName}
          className="story-item-avatar"
          width={50}
          height={50}
          unoptimized
        />
        <div className="story-item-info">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="story-item-author">{userName}</div>
            {story.pinned && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  color: "var(--accent-blue)",
                  flexShrink: 0,
                }}
              >
                <title>Story đã được pin</title>
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
              </svg>
            )}
          </div>
          <div className="story-item-time">{getTimeAgo(story)}</div>
        </div>
      </div>
      <div className="story-item-body">
        {story.content && (
          <div className="story-item-content">{story.content}</div>
        )}
        {story.image && (
          <Image
            src={story.image}
            alt="Story"
            className="story-item-image"
            width={800}
            height={400}
            style={{
              maxHeight: "400px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            onClick={() => {
              if (onImageClick && story.image) {
                onImageClick(story.image, story.mediaSize || undefined);
              }
            }}
            unoptimized
          />
        )}
        {story.video && (
          <video
            src={story.video}
            className="story-item-image"
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              cursor: "pointer",
              borderRadius: "12px",
            }}
            onClick={() => {
              if (onVideoClick && story.video) {
                onVideoClick(story.video, story.mediaSize || undefined);
              }
            }}
            controls={false}
            muted
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
          />
        )}
      </div>
    </div>
  );
}
