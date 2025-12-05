"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { profileConfig as defaultConfig } from "@/lib/config";
import { getActiveStories, cleanupExpiredStories } from "@/lib/utils";
import { fetchConfig } from "@/lib/api";
import { ProfileConfig, Social } from "@/lib/types";
import { Messages } from "@/lib/messages";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SocialIcon from "@/components/ui/SocialIcon";
import StoryOverlay from "@/components/story/StoryOverlay";
import SocialModal from "@/components/modals/SocialModal";
import InformationModal from "@/components/modals/InformationModal";
import ProfileCardSkeleton from "@/components/ui/ProfileCardSkeleton";
import SmoothTransition from "@/components/ui/SmoothTransition";
import { useConfigPolling } from "@/hooks/useConfigPolling";

const STORY_CLOSE_TIMEOUT = 800;

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isStoryClosing, setIsStoryClosing] = useState(false);
  const [initialConfig, setInitialConfig] = useState<ProfileConfig | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSocial, setSelectedSocial] = useState<Social | null>(null);
  const [isSocialModalClosing, setIsSocialModalClosing] = useState(false);
  const [isInformationModalOpen, setIsInformationModalOpen] = useState(false);
  const [isInformationModalClosing, setIsInformationModalClosing] =
    useState(false);

  // Use polling hook for real-time updates
  const { config, isPolling } = useConfigPolling(initialConfig, {
    interval: 3000, // Poll every 3 seconds
    enabled: true,
  });

  useEffect(() => {
    let isMounted = true;
    const FETCH_TIMEOUT = 3000; // 3 giây

    localStorage.removeItem("theme");
    setTheme("dark");
    document.body.className = "dark-mode";

    // Xóa localStorage config để bảo mật
    localStorage.removeItem("profileConfig");

    const loadConfigFromAPI = async () => {
      setIsLoading(true);

      try {
        // Tạo timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Fetch timeout")), FETCH_TIMEOUT);
        });

        // Race giữa fetch và timeout
        const apiConfig = await Promise.race([fetchConfig(), timeoutPromise]);

        if (!isMounted) return;

        // Xử lý config từ API
        if (apiConfig && apiConfig.user) {
          const cleanedStories = cleanupExpiredStories(apiConfig.stories || []);
          if (cleanedStories.length !== apiConfig.stories?.length) {
            apiConfig.stories = cleanedStories;
          }
          // Ensure information field exists
          if (!apiConfig.information) {
            apiConfig.information = [];
          }

          setInitialConfig(apiConfig);
        } else {
          // API trả về invalid data
          console.warn("API returned invalid config, using default");
          setInitialConfig(defaultConfig);
        }
      } catch (error) {
        // Timeout hoặc error
        if (error instanceof Error && error.message === "Fetch timeout") {
          console.warn("Fetch timeout after 3s, using default config");
        } else {
          console.error("Error loading config from API:", error);
        }

        if (isMounted) {
          setInitialConfig(defaultConfig);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Luôn load từ API trước (Upstash)
    loadConfigFromAPI();

    return () => {
      isMounted = false;
    };
  }, []);

  // Log visitor
  useEffect(() => {
    const logVisit = async () => {
      try {
        await fetch("/api/logs", {
          method: "POST",
        });
      } catch (error) {
        console.error("Error logging visit:", error);
      }
    };

    logVisit();
  }, []);

  const activeStories = useMemo(
    () => (config ? getActiveStories(config.stories) : []),
    [config]
  );

  const cardClass = useMemo(
    () =>
      `profile-card ${
        isStoryOpen
          ? "story-open"
          : isStoryClosing
          ? "story-closing"
          : selectedSocial
          ? "social-open"
          : isSocialModalClosing
          ? "social-closing"
          : isInformationModalOpen
          ? "information-open"
          : isInformationModalClosing
          ? "information-closing"
          : ""
      }`,
    [
      isStoryOpen,
      isStoryClosing,
      selectedSocial,
      isSocialModalClosing,
      isInformationModalOpen,
      isInformationModalClosing,
    ]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      document.body.className = `${newTheme}-mode`;
      return newTheme;
    });
  }, []);

  const openStories = useCallback(() => {
    setIsStoryOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeStories = useCallback(() => {
    setIsStoryOpen(false);
    setIsStoryClosing(true);
    document.body.style.overflow = "";
    setTimeout(() => setIsStoryClosing(false), STORY_CLOSE_TIMEOUT);
  }, []);

  const openSocialModal = useCallback((social: Social) => {
    setSelectedSocial(social);
    setIsSocialModalClosing(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeSocialModal = useCallback(() => {
    setSelectedSocial(null);
    setIsSocialModalClosing(true);
    document.body.style.overflow = "";
    setTimeout(() => setIsSocialModalClosing(false), STORY_CLOSE_TIMEOUT);
  }, []);

  return (
    <div className="container">
      <div className={cardClass}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        {isLoading || !config ? (
          <ProfileCardSkeleton theme={theme} />
        ) : (
          <SmoothTransition
            transitionKey={JSON.stringify(config)}
            duration={300}
          >
            <div className="avatar-section">
              <div className="avatar-container">
                <Image
                  src={config.user.avatar}
                  alt="Profile"
                  className="avatar"
                  width={140}
                  height={140}
                  onClick={openStories}
                  style={{ cursor: "pointer" }}
                  unoptimized
                  priority
                />
                <div
                  className={`avatar-border ${
                    activeStories.length > 0 ? "has-story" : ""
                  }`}
                ></div>
              </div>
            </div>

            <div className="user-info-section">
              <h1 className="name">{config.user.name}</h1>
              <p className="title">{config.user.title}</p>
              <p className="content">{config.user.content}</p>
            </div>

            <div className="email-section">
              <button
                onClick={() => {
                  setIsInformationModalOpen(true);
                  setIsInformationModalClosing(false);
                  document.body.style.overflow = "hidden";
                }}
                className="email-btn"
                style={{ border: "none", cursor: "pointer" }}
              >
                <span>{Messages.INFO_BUTTON}</span>
              </button>
            </div>

            <div className="social-section">
              {config.social.map((social, index) => (
                <SocialIcon
                  key={index}
                  icon={social.icon}
                  url={social.url}
                  name={social.name}
                  index={index}
                  onClick={() => openSocialModal(social)}
                />
              ))}
            </div>
          </SmoothTransition>
        )}

        {isStoryOpen && config && (
          <StoryOverlay
            stories={activeStories}
            onClose={closeStories}
            userName={config.user.name}
            userAvatar={config.user.avatar}
          />
        )}

        {selectedSocial && (
          <SocialModal social={selectedSocial} onClose={closeSocialModal} />
        )}

        {isInformationModalOpen &&
          config &&
          config.information &&
          config.information.length > 0 && (
            <InformationModal
              information={config.information}
              onClose={() => {
                setIsInformationModalOpen(false);
                setIsInformationModalClosing(true);
                document.body.style.overflow = "";
                setTimeout(
                  () => setIsInformationModalClosing(false),
                  STORY_CLOSE_TIMEOUT
                );
              }}
            />
          )}
      </div>
    </div>
  );
}
