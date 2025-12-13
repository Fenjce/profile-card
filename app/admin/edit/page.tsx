"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { profileConfig as defaultConfig } from "@/lib/config";
import {
  getActiveStories,
  getTimeAgo,
  cleanupExpiredStories,
  normalizeStory,
} from "@/lib/utils";
import {
  isAuthenticated,
  logout,
  initAuth,
  getAdminToken,
  updateToken,
} from "@/lib/auth";
import { fetchConfig, saveConfig } from "@/lib/api";
import Image from "next/image";
import SocialModal from "@/components/modals/SocialModal";
import AvatarEditModal from "@/components/modals/AvatarEditModal";
import NewStoryModal from "@/components/modals/NewStoryModal";
import EditStoryModal from "@/components/modals/EditStoryModal";
import { Social, Story, InformationItem, ProfileConfig } from "@/lib/types";
import InformationModal from "@/components/modals/InformationModal";
import { useToast } from "@/components/providers/ToastProvider";
import { Messages } from "@/lib/messages";
import LogModal from "@/components/modals/LogModal";
import SeasonalThemeModal from "@/components/modals/SeasonalThemeModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// Social Icon Helper
const getSocialIconSVG = (icon: string) => {
  const iconMap: Record<string, JSX.Element> = {
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="none" className="instagram-icon-svg">
        <defs>
          <linearGradient
            id="instagram-gradient-edit"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <path
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
          className="instagram-icon-path"
          style={{ fill: "url(#instagram-gradient-edit)" }}
        ></path>
      </svg>
    ),
    dribbble: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.442 16.539c-.175.39-.549.728-1.033.903-.606.22-1.676.328-2.846.328-1.17 0-2.24-.109-2.846-.328-.484-.175-.858-.513-1.033-.903-.22-.606-.328-1.676-.328-2.846 0-1.17.109-2.24.328-2.846.175-.39.549-.728 1.033-.903.606-.22 1.676-.328 2.846-.328 1.17 0 2.24.109 2.846.328.484.175.858.513 1.033.903.22.606.328 1.676.328 2.846 0 1.17-.109 2.24-.328 2.846z"></path>
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
      </svg>
    ),
    github: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
      </svg>
    ),
    devto: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.21 1.26 4.33.07.06.12.1.24.1.1 0 .12-.02.12-.1 0-.05.3-1.15.66-2.45l.66-2.35.75.03.75.02v1.28l-1.2.04-1.22.03v1.77l.75.03.72.04v1.28h-1.52v1.77h2.47v-1.28l-.75-.03-.75-.04v-1.28l1.22-.03 1.2-.04v-1.77l-1.2-.04-1.22-.03v-1.28z"></path>
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
      </svg>
    ),
    discord: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2518-.1913.3718-.2894a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.097.246.1951.3728.2894a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"></path>
      </svg>
    ),
    default: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    ),
  };
  return iconMap[icon] || iconMap.default;
};

export default function EditPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [config, setConfig] = useState<ProfileConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isStoryClosing, setIsStoryClosing] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [timeKey, setTimeKey] = useState(0);
  const storyContentRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isEditModalActive, setIsEditModalActive] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<Social | null>(null);
  const [isSocialModalClosing, setIsSocialModalClosing] = useState(false);
  const [isAvatarEditModalOpen, setIsAvatarEditModalOpen] = useState(false);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isManualSave, setIsManualSave] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordModalActive, setIsPasswordModalActive] = useState(false);
  const [isPasswordModalScrolled, setIsPasswordModalScrolled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [viewingVideoUrl, setViewingVideoUrl] = useState<string | null>(null);
  const [viewingMediaSize, setViewingMediaSize] = useState<string | null>(null);
  const [isInformationModalOpen, setIsInformationModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteStoryConfirm, setShowDeleteStoryConfirm] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [isInformationModalClosing, setIsInformationModalClosing] =
    useState(false);
  const [isSeasonalThemeModalOpen, setIsSeasonalThemeModalOpen] =
    useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false); // Track if config has been loaded from API
  const CONTENT_MAX_LENGTH = 140;

  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const contentHiddenRef = useRef<HTMLParagraphElement>(null);
  const passwordModalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(true);
      return;
    }

    initAuth();

    if (!isAuthenticated()) {
      router.replace("/admin/login");
      return;
    }

    setIsLoading(false);

    localStorage.removeItem("theme");
    setTheme("dark");
    document.body.className = "dark-mode";

    const loadConfig = async () => {
      // Xóa localStorage config để bảo mật
      localStorage.removeItem("profileConfig");

      try {
        const apiConfig = await fetchConfig();
        if (apiConfig && apiConfig.user) {
          // Kiểm tra xem có phải là default config không
          const isDefaultConfig =
            apiConfig.user.name === defaultConfig.user.name &&
            apiConfig.user.title === defaultConfig.user.title;

          // Nếu là default config, không set vào state (tránh auto-save)
          if (isDefaultConfig) {
            console.warn(
              "API returned default config, not loading to avoid overwriting"
            );
            setIsConfigLoaded(false);
            return;
          }

          const cleanedStories = cleanupExpiredStories(apiConfig.stories || []);
          if (cleanedStories.length !== apiConfig.stories?.length) {
            apiConfig.stories = cleanedStories;
            // Nếu có stories bị xóa, cần save lại lên Upstash
            const token = getAdminToken();
            if (token && isAuthenticated()) {
              await saveConfig(apiConfig, token).catch(() => {});
            }
          }
          // Ensure information field exists
          if (!apiConfig.information) {
            apiConfig.information = [];
          }
          setConfig(apiConfig);
          setIsConfigLoaded(true); // Mark as loaded
          return;
        }
      } catch (error) {
        console.error("Error loading config from API:", error);
        // Nếu API lỗi, không set default config để tránh auto-save
        setIsConfigLoaded(false);
      }
    };

    loadConfig();
  }, [router]);

  useEffect(() => {
    if (isLoading || typeof window === "undefined") {
      return;
    }

    // Không auto-save nếu config chưa được load từ API
    if (!isConfigLoaded) {
      return;
    }

    if (isManualSave) {
      setIsManualSave(false);
      return;
    }

    // Kiểm tra xem config có phải là default config không
    const isDefaultConfig =
      config.user.name === defaultConfig.user.name &&
      config.user.title === defaultConfig.user.title;

    // KHÔNG auto-save nếu là default config (tránh ghi đè config thật)
    if (isDefaultConfig) {
      return;
    }

    // Tăng debounce lên 2000ms để giảm số lần gọi API
    const timeoutId = setTimeout(async () => {
      // Không lưu vào localStorage nữa, chỉ lưu lên Upstash
      const token = getAdminToken();
      if (token && isAuthenticated()) {
        await saveConfig(config, token).catch((error) => {
          console.error("Auto-save failed:", error);
        });
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [config, isLoading, isManualSave, isConfigLoaded]);

  useEffect(() => {
    if (!isStoryOpen) return;
    const interval = setInterval(() => {
      setTimeKey((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isStoryOpen]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      document.body.className = `${newTheme}-mode`;
      return newTheme;
    });
  }, []);

  const activeStories = useMemo(
    () => getActiveStories(config.stories),
    [config.stories]
  );

  const openStories = useCallback(() => {
    setIsStoryOpen(true);
    setCurrentStoryIndex(0);
    document.body.style.overflow = "hidden";
  }, []);

  const closeStories = useCallback(() => {
    setIsStoryOpen(false);
    setIsStoryClosing(true);
    document.body.style.overflow = "";
    setTimeout(() => {
      setIsStoryClosing(false);
    }, 800);
  }, []);

  const navigateStory = useCallback(
    (direction: number) => {
      setCurrentStoryIndex((prev) => {
        const newIndex = prev + direction;
        if (newIndex < 0) return 0;
        if (newIndex >= activeStories.length) return activeStories.length - 1;
        return newIndex;
      });
    },
    [activeStories.length]
  );

  const openEditModal = useCallback((field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
    setIsEditModalActive(false);
    setTimeout(() => setIsEditModalActive(true), 10);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalActive(false);
    setTimeout(() => {
      setEditingField(null);
      setEditValue("");
    }, 500);
  }, []);

  // Handle scroll for Password Modal
  useEffect(() => {
    const scrollContainer = passwordModalScrollRef.current;
    if (!scrollContainer || !isPasswordModalOpen) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      setIsPasswordModalScrolled(scrollTop > 50);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isPasswordModalOpen]);

  useEffect(() => {
    if (editingField !== "content" || !isEditModalActive) return;
    const input = contentInputRef.current;
    const hidden = contentHiddenRef.current;
    if (!input || !hidden) return;

    const adjustHeight = () => {
      hidden.textContent = input.value || "\u00A0";
      input.style.height = `${hidden.offsetHeight}px`;
    };

    adjustHeight();
    input.addEventListener("input", adjustHeight);
    return () => input.removeEventListener("input", adjustHeight);
  }, [editValue, editingField, isEditModalActive]);

  const saveEdit = useCallback(() => {
    if (!editingField) return;

    if (editingField === "name") {
      setConfig((prev) => ({
        ...prev,
        user: { ...prev.user, name: editValue },
      }));
    } else if (editingField === "title") {
      setConfig((prev) => ({
        ...prev,
        user: { ...prev.user, title: editValue },
      }));
    } else if (editingField === "content") {
      const cleanedValue = editValue
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .join("\n");
      setConfig((prev) => ({
        ...prev,
        user: { ...prev.user, content: cleanedValue },
      }));
    }
    closeEditModal();
  }, [editingField, editValue, closeEditModal]);

  const openSocialModal = useCallback((social: Social) => {
    setSelectedSocial(social);
    setIsSocialModalClosing(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeSocialModal = useCallback(() => {
    setSelectedSocial(null);
    setIsSocialModalClosing(true);
    document.body.style.overflow = "";
    setTimeout(() => setIsSocialModalClosing(false), 800);
  }, []);

  const handleMoveSocialUp = useCallback(
    async (index: number) => {
      if (index === 0) return;

      setIsManualSave(true);
      const newSocial = [...config.social];
      [newSocial[index - 1], newSocial[index]] = [
        newSocial[index],
        newSocial[index - 1],
      ];
      const updatedConfig = { ...config, social: newSocial };
      setConfig(updatedConfig);

      const token = getAdminToken();
      if (token && isAuthenticated()) {
        await saveConfig(updatedConfig, token).catch((error) => {
          console.error("Error saving to API:", error);
        });
      }
    },
    [config]
  );

  const handleMoveSocialDown = useCallback(
    async (index: number) => {
      if (index === config.social.length - 1) return;

      setIsManualSave(true);
      const newSocial = [...config.social];
      [newSocial[index], newSocial[index + 1]] = [
        newSocial[index + 1],
        newSocial[index],
      ];
      const updatedConfig = { ...config, social: newSocial };
      setConfig(updatedConfig);

      const token = getAdminToken();
      if (token && isAuthenticated()) {
        await saveConfig(updatedConfig, token).catch((error) => {
          console.error("Error saving to API:", error);
        });
      }
    },
    [config]
  );

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const confirmLogout = useCallback(() => {
    logout();
    router.replace("/admin/login");
    window.location.href = "/admin/login";
  }, [router]);

  const confirmDeleteStory = useCallback(() => {
    if (!storyToDelete) return;

    const normalizedActiveStory = normalizeStory(storyToDelete);
    const activeCreatedAt = normalizedActiveStory.createdAt;

    setConfig((prev) => {
      const storyIndex = prev.stories.findIndex((s) => {
        const normalized = normalizeStory(s);
        if (normalized.createdAt && activeCreatedAt) {
          const timeDiff = Math.abs(
            new Date(normalized.createdAt).getTime() -
              new Date(activeCreatedAt).getTime()
          );
          return timeDiff < 1000;
        }
        return (
          s.content === storyToDelete.content && s.image === storyToDelete.image
        );
      });

      if (storyIndex !== -1) {
        const newStories = prev.stories.filter(
          (_, index) => index !== storyIndex
        );
        return { ...prev, stories: newStories };
      }

      return prev;
    });

    setStoryToDelete(null);
    setShowDeleteStoryConfirm(false);
    showToast("Đã xóa story", "success");
  }, [storyToDelete, showToast]);

  const handleChangePassword = useCallback(async (): Promise<boolean> => {
    setPasswordError("");

    // Validate
    if (!currentPassword.trim()) {
      setPasswordError(Messages.PASSWORD_EMPTY);
      return false;
    }
    if (!newPassword.trim()) {
      setPasswordError(Messages.PASSWORD_EMPTY);
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordError(Messages.PASSWORD_TOO_SHORT);
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(Messages.PASSWORD_MISMATCH);
      return false;
    }
    if (currentPassword !== config.admin.password) {
      setPasswordError(Messages.PASSWORD_WRONG);
      return false;
    }

    try {
      setIsManualSave(true);
      const updatedConfig = {
        ...config,
        admin: {
          ...config.admin,
          password: newPassword,
        },
      };

      // Cập nhật state trước
      setConfig(updatedConfig);

      // Không lưu vào localStorage nữa, chỉ lưu lên Upstash
      // Thử save với token cũ trước
      const oldToken = getAdminToken();
      let apiSaved = false;

      if (oldToken && isAuthenticated()) {
        try {
          const result = await saveConfig(updatedConfig, oldToken);
          apiSaved = result.success;

          // Nếu save thành công với token cũ, update token mới
          if (apiSaved) {
            updateToken(updatedConfig.admin.username, newPassword);
          } else if (result.message?.includes("Invalid credentials")) {
            // Nếu token cũ không hợp lệ (có thể password đã được đổi trước đó)
            // Thử lại với token mới (password mới)
            updateToken(updatedConfig.admin.username, newPassword);
            const newToken = getAdminToken();
            if (newToken) {
              const retryResult = await saveConfig(updatedConfig, newToken);
              apiSaved = retryResult.success;
            }
          }

          if (result.localStorage_only && result.message) {
            console.warn("Upstash rate limit:", result.message);
          }
        } catch (error) {
          console.error("Error saving password to API:", error);
          // Nếu lỗi, vẫn update token để thử lại lần sau
          updateToken(updatedConfig.admin.username, newPassword);
        }
      } else {
        // Nếu không có token, tạo token mới và thử save
        updateToken(updatedConfig.admin.username, newPassword);
        const newToken = getAdminToken();
        if (newToken) {
          try {
            const result = await saveConfig(updatedConfig, newToken);
            apiSaved = result.success;
          } catch (error) {
            console.error("Error saving password to API:", error);
          }
        }
      }

      setIsManualSave(false);

      if (apiSaved) {
        showToast(Messages.PASSWORD_CHANGE_SUCCESS, "success");
        // Đợi 1 giây để user thấy toast, sau đó logout và redirect về login
        setTimeout(() => {
          logout();
          router.replace("/admin/login");
        }, 1500);
      } else {
        showToast(Messages.PASSWORD_CHANGE_ERROR, "error");
        // Revert config về trạng thái cũ nếu save thất bại
        setConfig(config);
      }

      return apiSaved;
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(Messages.PASSWORD_CHANGE_ERROR);
      showToast(Messages.PASSWORD_CHANGE_ERROR, "error");
      setIsManualSave(false);
      return false;
    }
  }, [currentPassword, newPassword, confirmPassword, config, showToast]);

  const cardClassName = useMemo(
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

  if (isLoading || (typeof window !== "undefined" && !isAuthenticated())) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => {
            setIsPasswordModalOpen(true);
            setIsPasswordModalScrolled(false);
            setIsPasswordModalActive(false);
            setTimeout(() => setIsPasswordModalActive(true), 10);
            document.body.style.overflow = "hidden";
          }}
          style={{
            padding: "10px 20px",
            background: "rgba(59, 130, 246, 0.1)",
            border: "2px solid #3b82f6",
            borderRadius: "8px",
            color: "#3b82f6",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
          }}
        >
          Đổi mật khẩu
        </button>
        <button
          onClick={() => setIsSeasonalThemeModalOpen(true)}
          style={{
            padding: "10px 20px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "2px solid #22c55e",
            borderRadius: "8px",
            color: "#22c55e",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(34, 197, 94, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(34, 197, 94, 0.1)";
          }}
        >
          Sửa Season
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "2px solid #ef4444",
            borderRadius: "8px",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          }}
        >
          Logout
        </button>
      </div>

      <div className={cardClassName}>
        {/* Log Button - Top Left */}
        <button
          onClick={() => setIsLogModalOpen(true)}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 10,
            opacity: 0.6,
            color:
              theme === "dark"
                ? "var(--text-primary-dark)"
                : "var(--text-primary-light)",
          }}
          title="Xem lịch sử truy cập"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.6";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          style={{ left: "auto", right: "20px" }}
        >
          <svg
            className="sun-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg
            className="moon-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <div className="avatar-section">
          <div className="avatar-container">
            <div style={{ position: "relative" }}>
              <Image
                src={config.user.avatar}
                alt="Profile"
                className="avatar"
                width={140}
                height={140}
                onClick={() => setIsAvatarEditModalOpen(true)}
                style={{ cursor: "pointer" }}
                unoptimized
                title="Click to edit avatar"
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "var(--accent-blue)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "16px",
                  border: `2px solid ${
                    theme === "dark"
                      ? "var(--card-bg-dark)"
                      : "var(--card-bg-light)"
                  }`,
                  cursor: "pointer",
                  zIndex: 3,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openStories();
                }}
                title="View Stories"
              >
                📖
              </div>
            </div>
            <div className="avatar-border"></div>
          </div>
        </div>

        <div className="user-info-section">
          <div style={{ marginBottom: "8px" }}>
            <h1
              className="name"
              onClick={() => openEditModal("name", config.user.name || "")}
              style={{
                cursor: "pointer",
                margin: 0,
                minHeight: "1.2em",
                color: config.user.name
                  ? theme === "dark"
                    ? "var(--text-primary-dark)"
                    : "inherit"
                  : theme === "dark"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
              }}
              title="Click to edit"
            >
              {config.user.name || (
                <span style={{ fontStyle: "italic" }}>Thêm tên</span>
              )}
            </h1>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <p
              className="title"
              onClick={() => openEditModal("title", config.user.title || "")}
              style={{
                cursor: "pointer",
                margin: 0,
                minHeight: "1.2em",
                color: config.user.title
                  ? theme === "dark"
                    ? "var(--text-secondary-dark)"
                    : "inherit"
                  : theme === "dark"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
              }}
              title="Click to edit"
            >
              {config.user.title || (
                <span style={{ fontStyle: "italic" }}>Thêm tiêu đề</span>
              )}
            </p>
          </div>

          <div>
            <p
              className="content"
              onClick={() =>
                openEditModal("content", config.user.content || "")
              }
              style={{
                cursor: "pointer",
                margin: 0,
                minHeight: "1.5em",
                color: config.user.content
                  ? theme === "dark"
                    ? "var(--text-secondary-dark)"
                    : "inherit"
                  : theme === "dark"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
              }}
              title="Click to edit"
            >
              {config.user.content || (
                <span style={{ fontStyle: "italic" }}>Thêm nội dung</span>
              )}
            </p>
          </div>
        </div>

        <div className="email-section">
          <button
            onClick={() => {
              setIsInformationModalOpen(true);
              setIsInformationModalClosing(false);
            }}
            className="email-btn"
            style={{
              border: "none",
              cursor: "pointer",
              minHeight: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>Thông tin cá nhân</span>
          </button>
        </div>

        <div className="social-section">
          {config.social.length < 6 && (
            <button
              onClick={() => {
                const newSocial: Social = {
                  name: `Social ${config.social.length + 1}`,
                  url: "",
                  icon: "default",
                  title: "",
                  content: "",
                  buttonText: "",
                };
                setConfig((prev) => ({
                  ...prev,
                  social: [...prev.social, newSocial],
                }));
                setSelectedSocial(newSocial);
              }}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border:
                  theme === "dark"
                    ? "2px dashed rgba(255, 255, 255, 0.3)"
                    : "2px dashed rgba(0, 0, 0, 0.3)",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(0, 0, 0, 0.6)",
                fontSize: "24px",
                fontWeight: "300",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(0, 0, 0, 0.6)";
                e.currentTarget.style.color =
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.9)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)";
                e.currentTarget.style.color =
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(0, 0, 0, 0.6)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title="Thêm link mới (Tối đa 6)"
            >
              +
            </button>
          )}
          {config.social.map((social, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              {/* Button trái */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMoveSocialUp(index);
                }}
                disabled={index === 0}
                style={{
                  position: "absolute",
                  left: "-12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    index === 0
                      ? "rgba(107, 114, 128, 0.2)"
                      : "rgba(59, 130, 246, 0.3)",
                  border: "none",
                  cursor: index === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "auto",
                  zIndex: 10,
                }}
                className="social-icon-control-left"
                title="Move left"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6"></path>
                </svg>
              </button>

              <a
                href={social.url}
                className="social-icon"
                data-icon={social.icon}
                title={`${social.name} - Click to view`}
                onClick={(e) => {
                  e.preventDefault();
                  openSocialModal(social);
                }}
                style={{ "--social-index": index } as React.CSSProperties}
              >
                {getSocialIconSVG(social.icon)}
              </a>

              {/* Button phải */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMoveSocialDown(index);
                }}
                disabled={index === config.social.length - 1}
                style={{
                  position: "absolute",
                  right: "-12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    index === config.social.length - 1
                      ? "rgba(107, 114, 128, 0.2)"
                      : "rgba(59, 130, 246, 0.3)",
                  border: "none",
                  cursor:
                    index === config.social.length - 1
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "auto",
                  zIndex: 10,
                }}
                className="social-icon-control-right"
                title="Move right"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {isStoryOpen && (
        <div className="story-overlay active">
          <div className="story-container">
            <button
              className="story-close-btn"
              onClick={closeStories}
              title="Quay lại"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              className="story-add-btn"
              onClick={() => setIsNewStoryModalOpen(true)}
              title="Thêm story mới"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            <div ref={storyContentRef} className="story-content">
              {activeStories.length === 0 ? (
                <div className="story-empty">Chưa có tin tức nào</div>
              ) : (
                activeStories.map((story, index) => (
                  <div
                    key={index}
                    className="story-item"
                    style={{ "--item-index": index } as React.CSSProperties}
                  >
                    <div className="story-item-header">
                      <Image
                        src={
                          config.user.avatar || "https://via.placeholder.com/50"
                        }
                        alt={config.user.name}
                        className="story-item-avatar"
                        width={50}
                        height={50}
                        unoptimized
                      />
                      <div className="story-item-info">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div className="story-item-author">
                            {config.user.name}
                          </div>
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
                        <div className="story-item-time">
                          {getTimeAgo(story)}
                        </div>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const normalizedActiveStory = normalizeStory(story);
                            const activeCreatedAt =
                              normalizedActiveStory.createdAt;

                            if (!activeCreatedAt) {
                              console.error("Story không có createdAt:", story);
                              return;
                            }

                            let originalStory = config.stories.find((s) => {
                              const normalized = normalizeStory(s);
                              if (normalized.createdAt && activeCreatedAt) {
                                const timeDiff = Math.abs(
                                  new Date(normalized.createdAt).getTime() -
                                    new Date(activeCreatedAt).getTime()
                                );
                                return timeDiff < 1000;
                              }
                              return false;
                            });

                            if (!originalStory) {
                              originalStory = config.stories.find((s) => {
                                return (
                                  s.content === story.content &&
                                  s.image === story.image
                                );
                              });
                            }

                            if (originalStory) {
                              setEditingStory(originalStory);
                            } else {
                              console.error("Không tìm thấy story gốc:", story);
                            }
                          }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: "var(--accent-blue)",
                            color: "white",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.8";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                          title="Chỉnh sửa story"
                        >
                          {Messages.STORY_EDIT_BUTTON}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStoryToDelete(story);
                            setShowDeleteStoryConfirm(true);
                          }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: "rgba(239, 68, 68, 0.9)",
                            color: "white",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.8";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                          title="Xóa story"
                        >
                          {Messages.MODAL_DELETE}
                        </button>
                      </div>
                    </div>
                    <div className="story-item-body">
                      {story.content && (
                        <div className="story-item-content">
                          {story.content}
                        </div>
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
                            setViewingImageUrl(story.image || null);
                            setViewingVideoUrl(null);
                            setViewingMediaSize(story.mediaSize || null);
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
                            setViewingVideoUrl(story.video || null);
                            setViewingImageUrl(null);
                            setViewingMediaSize(story.mediaSize || null);
                          }}
                          controls={false}
                          muted
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedSocial && (
        <SocialModal
          social={selectedSocial}
          onClose={closeSocialModal}
          onEdit={async (data: {
            url: string;
            title?: string;
            content?: string;
            buttonText?: string;
            icon?: string;
          }) => {
            const socialIndex = config.social.findIndex(
              (s) =>
                s.name === selectedSocial.name && s.icon === selectedSocial.icon
            );
            if (socialIndex === -1) return;

            setIsManualSave(true);

            const newSocial = [...config.social];
            newSocial[socialIndex] = {
              ...newSocial[socialIndex],
              url: data.url || "",
              title: data.title,
              content: data.content,
              buttonText: data.buttonText,
              icon: data.icon || newSocial[socialIndex].icon,
            };
            const updatedConfig = { ...config, social: newSocial };
            setConfig(updatedConfig);
            setSelectedSocial(newSocial[socialIndex]);

            // Không lưu vào localStorage nữa, chỉ lưu lên Upstash
            // Cố gắng lưu vào API (có admin)
            const token = getAdminToken();
            if (token && isAuthenticated()) {
              await saveConfig(updatedConfig, token).catch((error) => {
                console.error("Error saving to API:", error);
              });
            }
          }}
          onDelete={async () => {
            const socialIndex = config.social.findIndex(
              (s) =>
                s.name === selectedSocial.name && s.icon === selectedSocial.icon
            );
            if (socialIndex === -1) return;

            setIsManualSave(true);
            const newSocial = config.social.filter(
              (_, index) => index !== socialIndex
            );
            const updatedConfig = { ...config, social: newSocial };
            setConfig(updatedConfig);
            setSelectedSocial(null);

            // Không lưu vào localStorage nữa, chỉ lưu lên Upstash
            // Cố gắng lưu vào API (có admin)
            const token = getAdminToken();
            if (token && isAuthenticated()) {
              await saveConfig(updatedConfig, token).catch((error) => {
                console.error("Error saving to API:", error);
              });
            }
          }}
        />
      )}

      {isAvatarEditModalOpen && (
        <AvatarEditModal
          currentAvatar={config.user.avatar}
          originalAvatar={config.user.originalAvatar}
          onSave={({
            cropped,
            original,
          }: {
            cropped: string;
            original?: string;
          }) => {
            setConfig((prev) => ({
              ...prev,
              user: {
                ...prev.user,
                avatar: cropped,
                originalAvatar: original || cropped,
              },
            }));
          }}
          onClose={() => setIsAvatarEditModalOpen(false)}
          theme={theme as "light" | "dark"}
        />
      )}

      {isNewStoryModalOpen && (
        <NewStoryModal
          userName={config.user.name}
          userAvatar={config.user.avatar}
          onSave={(story: Story) => {
            setConfig((prev) => {
              let newStories = [...prev.stories];

              // Nếu story mới được pin, unpin tất cả story khác
              if (story.pinned) {
                newStories = newStories.map((s) => ({ ...s, pinned: false }));
              }

              // Thêm story mới vào đầu
              newStories = [story, ...newStories];

              return {
                ...prev,
                stories: newStories,
              };
            });
          }}
          onClose={() => setIsNewStoryModalOpen(false)}
          theme={theme as "light" | "dark"}
          showToast={showToast}
        />
      )}

      {editingStory && (
        <EditStoryModal
          story={editingStory}
          userName={config.user.name}
          userAvatar={config.user.avatar}
          onSave={(updatedStory: Story) => {
            setConfig((prev) => {
              const normalizedEditing = normalizeStory(editingStory);
              const editingCreatedAt = normalizedEditing.createdAt;

              const storyIndex = prev.stories.findIndex((s) => {
                const normalized = normalizeStory(s);
                if (normalized.createdAt && editingCreatedAt) {
                  const timeDiff = Math.abs(
                    new Date(normalized.createdAt).getTime() -
                      new Date(editingCreatedAt).getTime()
                  );
                  return timeDiff < 1000;
                }
                return (
                  s.content === editingStory.content &&
                  s.image === editingStory.image
                );
              });

              if (storyIndex !== -1) {
                let newStories = [...prev.stories];

                // Nếu story được pin, unpin tất cả story khác
                if (updatedStory.pinned) {
                  newStories = newStories.map((s, index) =>
                    index !== storyIndex ? { ...s, pinned: false } : s
                  );
                }

                newStories[storyIndex] = updatedStory;
                return { ...prev, stories: newStories };
              }

              return prev;
            });
            setEditingStory(null);
          }}
          onDelete={async () => {
            const normalizedEditing = normalizeStory(editingStory);
            const editingCreatedAt = normalizedEditing.createdAt;

            // Tính toán config mới trước
            const storyIndex = config.stories.findIndex((s) => {
              const normalized = normalizeStory(s);
              if (normalized.createdAt && editingCreatedAt) {
                const timeDiff = Math.abs(
                  new Date(normalized.createdAt).getTime() -
                    new Date(editingCreatedAt).getTime()
                );
                return timeDiff < 1000;
              }
              return (
                s.content === editingStory.content &&
                s.image === editingStory.image
              );
            });

            if (storyIndex !== -1) {
              const newStories = config.stories.filter(
                (_, index) => index !== storyIndex
              );
              const updatedConfig = { ...config, stories: newStories };

              // Set manual save để tránh auto-save conflict
              setIsManualSave(true);

              // Cập nhật state
              setConfig(updatedConfig);

              // Không lưu vào localStorage nữa, chỉ lưu lên Upstash
              try {
                const token = getAdminToken();
                if (token && isAuthenticated()) {
                  await saveConfig(updatedConfig, token).catch(() => {});
                }

                // Reset manual save sau khi lưu xong
                setIsManualSave(false);
              } catch (error) {
                console.error("Error saving after delete:", error);
                setIsManualSave(false);
              }
            }

            setEditingStory(null);
          }}
          onClose={() => setEditingStory(null)}
          theme={theme as "light" | "dark"}
          showToast={showToast}
        />
      )}

      {editingField && (
        <div className={`story-overlay ${isEditModalActive ? "active" : ""}`}>
          <div className="story-container">
            <button
              className="story-close-btn"
              onClick={closeEditModal}
              title="Đóng"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "40px 20px",
              }}
            >
              <h2
                style={{
                  color:
                    theme === "dark"
                      ? "var(--text-primary-dark)"
                      : "var(--text-primary-light)",
                  fontSize: "24px",
                  marginBottom: "30px",
                  textAlign: "center",
                }}
              >
                {editingField === "name" && "Chỉnh sửa Tên"}
                {editingField === "title" && "Chỉnh sửa Tiêu đề"}
                {editingField === "content" && "Chỉnh sửa Nội dung"}
              </h2>

              {editingField === "content" ? (
                <div style={{ width: "100%" }}>
                  <div style={{ position: "relative", width: "100%" }}>
                    <p
                      ref={contentHiddenRef}
                      className="content"
                      style={{
                        visibility: "hidden",
                        margin: 0,
                        padding: "14px 20px",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        minHeight: "100px",
                        width: "100%",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        boxSizing: "border-box",
                      }}
                    >
                      {editValue || "\u00A0"}
                    </p>
                    <textarea
                      ref={contentInputRef}
                      value={editValue}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= CONTENT_MAX_LENGTH) {
                          setEditValue(newValue);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const lines = editValue.split("\n");
                          const actualLineCount = lines.filter(
                            (line, index) =>
                              index < lines.length - 1 || line.trim() !== ""
                          ).length;
                          if (actualLineCount >= 3) {
                            e.preventDefault();
                            return;
                          }
                        }
                      }}
                      maxLength={CONTENT_MAX_LENGTH}
                      placeholder="Nhập nội dung..."
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        padding: "14px 20px",
                        borderRadius: "12px",
                        border:
                          theme === "dark"
                            ? "2px solid rgba(255, 255, 255, 0.3)"
                            : "2px solid rgba(0, 0, 0, 0.2)",
                        background:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        color:
                          theme === "dark"
                            ? "var(--text-primary-dark)"
                            : "var(--text-primary-light)",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        fontFamily: "inherit",
                        resize: "none",
                        overflow: "hidden",
                        minHeight: "100px",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        textAlign: "center",
                        boxSizing: "border-box",
                      }}
                      autoFocus
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      textAlign: "right",
                      color:
                        editValue.length >= CONTENT_MAX_LENGTH
                          ? "#ef4444"
                          : theme === "dark"
                          ? "var(--text-secondary-dark)"
                          : "var(--text-secondary-light)",
                      fontWeight:
                        editValue.length >= CONTENT_MAX_LENGTH ? "600" : "400",
                    }}
                  >
                    {editValue.length}/{CONTENT_MAX_LENGTH}
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") closeEditModal();
                  }}
                  placeholder={
                    editingField === "name"
                      ? "Nhập tên..."
                      : editingField === "title"
                      ? "Nhập tiêu đề..."
                      : "Nhập URL avatar..."
                  }
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: "12px",
                    border:
                      theme === "dark"
                        ? "2px solid rgba(255, 255, 255, 0.3)"
                        : "2px solid rgba(0, 0, 0, 0.2)",
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                    color:
                      theme === "dark"
                        ? "var(--text-primary-dark)"
                        : "var(--text-primary-light)",
                    fontSize: "16px",
                    marginBottom: "20px",
                    textAlign: "center",
                  }}
                  autoFocus
                />
              )}

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={closeEditModal}
                  style={{
                    padding: "12px 30px",
                    borderRadius: "8px",
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    color:
                      theme === "dark"
                        ? "var(--text-primary-dark)"
                        : "var(--text-primary-light)",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid rgba(0, 0, 0, 0.2)",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    padding: "12px 30px",
                    borderRadius: "8px",
                    background: "var(--accent-blue)",
                    color: "white",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(59, 130, 246, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div
          className={`story-overlay ${isPasswordModalActive ? "active" : ""}`}
        >
          <button
            className={`story-close-btn ${
              isPasswordModalScrolled ? "hidden" : ""
            }`}
            onClick={() => {
              setIsPasswordModalActive(false);
              setIsPasswordModalScrolled(false);
              document.body.style.overflow = "";
              setTimeout(() => {
                setIsPasswordModalOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }, 500);
            }}
            title="Đóng"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2
            className={`password-modal-title ${
              isPasswordModalScrolled ? "hidden" : ""
            }`}
          >
            Đổi mật khẩu
          </h2>

          <div className="story-container">
            <div
              ref={passwordModalScrollRef}
              className="password-modal-content"
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  margin: "0 auto",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color:
                        theme === "dark"
                          ? "var(--text-secondary-dark)"
                          : "var(--text-secondary-light)",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Mật khẩu hiện tại
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Nhập mật khẩu hiện tại"
                      style={{
                        width: "100%",
                        padding: "12px 45px 12px 16px",
                        borderRadius: "10px",
                        border:
                          theme === "dark"
                            ? "1px solid rgba(255, 255, 255, 0.3)"
                            : "1px solid rgba(0, 0, 0, 0.2)",
                        background:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        color:
                          theme === "dark"
                            ? "var(--text-primary-dark)"
                            : "var(--text-primary-light)",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color:
                          theme === "dark"
                            ? "var(--text-secondary-dark)"
                            : "var(--text-secondary-light)",
                      }}
                      title={
                        showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showCurrentPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color:
                        theme === "dark"
                          ? "var(--text-secondary-dark)"
                          : "var(--text-secondary-light)",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Mật khẩu mới
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      style={{
                        width: "100%",
                        padding: "12px 45px 12px 16px",
                        borderRadius: "10px",
                        border:
                          theme === "dark"
                            ? "1px solid rgba(255, 255, 255, 0.3)"
                            : "1px solid rgba(0, 0, 0, 0.2)",
                        background:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        color:
                          theme === "dark"
                            ? "var(--text-primary-dark)"
                            : "var(--text-primary-light)",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color:
                          theme === "dark"
                            ? "var(--text-secondary-dark)"
                            : "var(--text-secondary-light)",
                      }}
                      title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showNewPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color:
                        theme === "dark"
                          ? "var(--text-secondary-dark)"
                          : "var(--text-secondary-light)",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Nhập lại mật khẩu mới"
                      style={{
                        width: "100%",
                        padding: "12px 45px 12px 16px",
                        borderRadius: "10px",
                        border:
                          theme === "dark"
                            ? "1px solid rgba(255, 255, 255, 0.3)"
                            : "1px solid rgba(0, 0, 0, 0.2)",
                        background:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        color:
                          theme === "dark"
                            ? "var(--text-primary-dark)"
                            : "var(--text-primary-light)",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color:
                          theme === "dark"
                            ? "var(--text-secondary-dark)"
                            : "var(--text-secondary-light)",
                      }}
                      title={
                        showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "14px",
                      marginTop: "-5px",
                    }}
                  >
                    {passwordError}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() => {
                      setIsPasswordModalActive(false);
                      document.body.style.overflow = "";
                      setTimeout(() => {
                        setIsPasswordModalOpen(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError("");
                      }, 500);
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: "8px",
                      background:
                        theme === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                      color:
                        theme === "dark"
                          ? "var(--text-primary-dark)"
                          : "var(--text-primary-light)",
                      border:
                        theme === "dark"
                          ? "1px solid rgba(255, 255, 255, 0.2)"
                          : "1px solid rgba(0, 0, 0, 0.2)",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={async () => {
                      const success = await handleChangePassword();
                      if (success) {
                        setIsPasswordModalActive(false);
                        setIsPasswordModalScrolled(false);
                        document.body.style.overflow = "";
                        setTimeout(() => {
                          setIsPasswordModalOpen(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError("");
                        }, 500);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: "8px",
                      background: "var(--accent-blue)",
                      color: "white",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(59, 130, 246, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Information Modal */}
      {isInformationModalOpen && (
        <InformationModal
          information={config.information || []}
          onClose={() => {
            setIsInformationModalOpen(false);
            setIsInformationModalClosing(true);
            document.body.style.overflow = "";
            setTimeout(() => setIsInformationModalClosing(false), 800);
          }}
          onEdit={async (information: InformationItem[]) => {
            setIsManualSave(true);
            const updatedConfig = {
              ...config,
              information: information,
            };
            setConfig(updatedConfig);

            // Không lưu vào localStorage nữa, chỉ lưu lên Upstash
            // Cố gắng lưu vào API (có admin)
            const token = getAdminToken();
            if (token && isAuthenticated()) {
              await saveConfig(updatedConfig, token).catch((error) => {
                console.error("Error saving to API:", error);
              });
            }

            setIsInformationModalOpen(false);
            setIsInformationModalClosing(true);
            document.body.style.overflow = "";
            setTimeout(() => setIsInformationModalClosing(false), 800);
          }}
        />
      )}

      {/* Log Modal */}
      {isLogModalOpen && (
        <LogModal
          onClose={() => {
            setIsLogModalOpen(false);
            document.body.style.overflow = "";
          }}
          theme={theme as "light" | "dark"}
          showToast={showToast}
        />
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        message="Bạn có chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Huỷ"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        theme={theme as "light" | "dark"}
      />

      <ConfirmDialog
        isOpen={showDeleteStoryConfirm}
        message="Bạn có chắc chắn muốn xóa story này?"
        confirmText="Xóa"
        cancelText="Huỷ"
        onConfirm={confirmDeleteStory}
        onCancel={() => {
          setShowDeleteStoryConfirm(false);
          setStoryToDelete(null);
        }}
        theme={theme as "light" | "dark"}
      />

      {/* Seasonal Theme Modal */}
      {isSeasonalThemeModalOpen && (
        <SeasonalThemeModal
          themes={config.seasonalThemes || []}
          onSave={async (themes) => {
            setIsManualSave(true);
            const updatedConfig = {
              ...config,
              seasonalThemes: themes,
            };
            setConfig(updatedConfig);
            try {
              const token = getAdminToken();
              if (token && isAuthenticated()) {
                await saveConfig(updatedConfig, token);
              }
              showToast("Cập nhật seasonal themes thành công!", "success");
            } catch (error) {
              console.error("Error saving seasonal themes:", error);
              showToast("Lỗi khi lưu seasonal themes", "error");
            }
          }}
          onClose={() => setIsSeasonalThemeModalOpen(false)}
          theme={theme as "light" | "dark"}
        />
      )}
    </div>
  );
}
