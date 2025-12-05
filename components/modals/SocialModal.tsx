"use client";

import { useEffect, useState, useRef } from "react";
import { Social } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const ICON_MAP: Record<string, JSX.Element> = {
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" className="instagram-icon-svg">
      <defs>
        <linearGradient
          id="instagram-gradient-modal"
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

interface SocialModalProps {
  social: Social | null;
  onClose: () => void;
  onEdit?: (data: {
    url: string;
    title?: string;
    content?: string;
    buttonText?: string;
    icon?: string;
  }) => void;
  onDelete?: () => void | Promise<void>;
}

const SOCIAL_NAMES: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  dribbble: "Dribbble",
  linkedin: "LinkedIn",
  github: "GitHub",
  devto: "Dev.to",
  facebook: "Facebook",
  discord: "Discord",
};

// Tự động map title sang icon
const getIconFromTitle = (title: string): string => {
  const lowerTitle = title.toLowerCase().trim();

  // Kiểm tra các từ khóa
  if (lowerTitle.includes("twitter") || lowerTitle.includes("x.com"))
    return "twitter";
  if (lowerTitle.includes("instagram")) return "instagram";
  if (lowerTitle.includes("dribbble")) return "dribbble";
  if (lowerTitle.includes("linkedin")) return "linkedin";
  if (lowerTitle.includes("github")) return "github";
  if (lowerTitle.includes("dev.to") || lowerTitle.includes("devto"))
    return "devto";
  if (lowerTitle.includes("facebook") || lowerTitle.includes("fb"))
    return "facebook";
  if (lowerTitle.includes("discord")) return "discord";

  // Trả về icon mặc định nếu không khớp với bất kỳ từ khóa nào
  return "default";
};

export default function SocialModal({
  social,
  onClose,
  onEdit,
  onDelete,
}: SocialModalProps) {
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalActive, setIsEditModalActive] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editButtonText, setEditButtonText] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    buttonText?: string;
  }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editScrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.body.classList.contains("dark-mode");
      setTheme(isDark ? "dark" : "light");
    };
    detectTheme();
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsActive(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (social) {
      setEditUrl(social.url);
      setEditTitle(social.title || SOCIAL_NAMES[social.icon] || social.name);
      setEditContent(
        social.content ||
          `Kết nối với tôi trên ${SOCIAL_NAMES[social.icon] || social.name}`
      );
      setEditButtonText(
        social.buttonText ||
          `Truy cập ${SOCIAL_NAMES[social.icon] || social.name}`
      );
      setEditIcon(social.icon);
    }
  }, [social]);

  // Tự động cập nhật icon khi title thay đổi
  useEffect(() => {
    if (editTitle.trim()) {
      const newIcon = getIconFromTitle(editTitle);
      setEditIcon(newIcon);
    }
  }, [editTitle]);

  if (!social) return null;

  const displayTitle = social.title || SOCIAL_NAMES[social.icon] || social.name;
  const displayContent =
    social.content ||
    `Kết nối với tôi trên ${SOCIAL_NAMES[social.icon] || social.name}`;

  // Kiểm tra xem có URL không
  const hasUrl = social.url && social.url.trim() !== "";
  const displayButtonText = hasUrl
    ? social.buttonText ||
      `Truy cập ${SOCIAL_NAMES[social.icon] || social.name}`
    : "Đường link không tồn tại";

  const handleAccess = () => {
    if (hasUrl) {
      window.open(social.url, "_blank", "noopener,noreferrer");
    }
  };

  const openEditModal = () => {
    // Cập nhật lại các giá trị edit từ social prop hiện tại (có thể đã được cập nhật sau khi save)
    if (social) {
      setEditUrl(social.url);
      setEditTitle(social.title || SOCIAL_NAMES[social.icon] || social.name);
      setEditContent(
        social.content ||
          `Kết nối với tôi trên ${SOCIAL_NAMES[social.icon] || social.name}`
      );
      setEditButtonText(
        social.buttonText ||
          `Truy cập ${SOCIAL_NAMES[social.icon] || social.name}`
      );
      setEditIcon(social.icon);
    }
    setIsEditing(true);
    setIsEditModalActive(false);
    setTimeout(() => setIsEditModalActive(true), 10);
  };

  const closeEditModal = () => {
    setIsEditModalActive(false);
    setErrors({});
    setTimeout(() => {
      setIsEditing(false);
      // Reset values
      setEditUrl(social.url);
      setEditTitle(social.title || SOCIAL_NAMES[social.icon] || social.name);
      setEditContent(
        social.content ||
          `Kết nối với tôi trên ${SOCIAL_NAMES[social.icon] || social.name}`
      );
      setEditButtonText(
        social.buttonText ||
          `Truy cập ${SOCIAL_NAMES[social.icon] || social.name}`
      );
      setEditIcon(social.icon);
    }, 500);
  };

  const handleSaveEdit = () => {
    const newErrors: {
      title?: string;
      content?: string;
      buttonText?: string;
      url?: string;
    } = {};

    // Validation
    if (!editTitle.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    }
    if (!editContent.trim()) {
      newErrors.content = "Nội dung không được để trống";
    }
    if (!editButtonText.trim()) {
      newErrors.buttonText = "Text nút không được để trống";
    }
    // URL có thể để trống, không cần validation

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (onEdit) {
      onEdit({
        url: editUrl.trim(),
        title: editTitle.trim(),
        content: editContent.trim(),
        buttonText: editButtonText.trim(),
        icon: editIcon,
      });
      closeEditModal();
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`social-modal-overlay ${isActive ? "active" : ""}`}
      style={{ overflowY: "auto", overflowX: "hidden" }}
    >
      <div className="social-modal">
        {/* Home Button */}
        <button
          className="modal-home-btn"
          onClick={onClose}
          title="Về trang chủ"
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

        {/* Icon */}
        <div
          className={`social-modal-icon social-modal-icon-${
            social.icon || "default"
          }`}
        >
          {ICON_MAP[social.icon || "default"] || ICON_MAP.default}
        </div>

        {/* Title */}
        <h2 className="social-modal-title">{displayTitle}</h2>

        {/* Content */}
        <div className="social-modal-content">
          <p className="social-modal-text">{displayContent}</p>
        </div>

        {/* Footer */}
        <div className="social-modal-footer">
          <button
            className="social-modal-access-btn"
            onClick={handleAccess}
            disabled={!hasUrl}
            style={{
              opacity: hasUrl ? 1 : 0.6,
              cursor: hasUrl ? "pointer" : "not-allowed",
            }}
          >
            {displayButtonText}
          </button>
          {(onEdit || onDelete) && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "10px",
                width: "100%",
              }}
            >
              {onEdit && (
                <button
                  onClick={openEditModal}
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(59, 130, 246, 0.1)",
                    color: theme === "dark" ? "white" : "var(--accent-blue)",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid rgba(59, 130, 246, 0.3)",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(59, 130, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(59, 130, 246, 0.1)";
                  }}
                >
                  ✏️ Chỉnh sửa
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background:
                      theme === "dark"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(239, 68, 68, 0.1)",
                    color: theme === "dark" ? "white" : "#ef4444",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(239, 68, 68, 0.4)"
                        : "1px solid rgba(239, 68, 68, 0.3)",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(239, 68, 68, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(239, 68, 68, 0.1)";
                  }}
                >
                  🗑️ Xóa
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Full Screen */}
      {isEditing && (
        <div
          className={`story-overlay ${isEditModalActive ? "active" : ""}`}
          style={{ zIndex: 2000 }}
        >
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

          {/* Icon Preview - Absolute position like social modal icon */}
          <div
            className={`social-modal-icon social-modal-icon-${
              editIcon || "default"
            }`}
          >
            {ICON_MAP[editIcon || "default"] || ICON_MAP.default}
          </div>

          <div className="story-container">
            <div
              ref={editScrollContainerRef}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "30px 20px",
                overflowY: "auto",
                overflowX: "hidden",
                maxHeight: "100%",
              }}
            >
              <h2
                style={{
                  color:
                    theme === "dark"
                      ? "var(--text-primary-dark)"
                      : "var(--text-primary-light)",
                  fontSize: "20px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Chỉnh sửa Social
              </h2>

              <div
                style={{
                  width: "100%",
                  maxWidth: "380px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {/* Title Input */}
                <div style={{ width: "100%" }}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                      if (errors.title)
                        setErrors({ ...errors, title: undefined });
                    }}
                    placeholder="Tiêu đề"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: errors.title
                        ? "1px solid rgba(239, 68, 68, 0.8)"
                        : theme === "dark"
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
                  {errors.title && (
                    <p
                      style={{
                        color: "rgba(239, 68, 68, 0.9)",
                        fontSize: "12px",
                        marginTop: "4px",
                        marginLeft: "4px",
                      }}
                    >
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Content Textarea */}
                <div style={{ width: "100%" }}>
                  <textarea
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      if (errors.content)
                        setErrors({ ...errors, content: undefined });
                    }}
                    placeholder="Nội dung"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: errors.content
                        ? "1px solid rgba(239, 68, 68, 0.8)"
                        : theme === "dark"
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
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                  {errors.content && (
                    <p
                      style={{
                        color: "rgba(239, 68, 68, 0.9)",
                        fontSize: "12px",
                        marginTop: "4px",
                        marginLeft: "4px",
                      }}
                    >
                      {errors.content}
                    </p>
                  )}
                </div>

                {/* Button Text Input */}
                <div style={{ width: "100%" }}>
                  <input
                    type="text"
                    value={editButtonText}
                    onChange={(e) => {
                      setEditButtonText(e.target.value);
                      if (errors.buttonText)
                        setErrors({ ...errors, buttonText: undefined });
                    }}
                    placeholder="Text nút truy cập"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: errors.buttonText
                        ? "1px solid rgba(239, 68, 68, 0.8)"
                        : theme === "dark"
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
                  {errors.buttonText && (
                    <p
                      style={{
                        color: "rgba(239, 68, 68, 0.9)",
                        fontSize: "12px",
                        marginTop: "4px",
                        marginLeft: "4px",
                      }}
                    >
                      {errors.buttonText}
                    </p>
                  )}
                </div>

                {/* URL Input */}
                <div style={{ width: "100%" }}>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="URL (có thể để trống)"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
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
                </div>

                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    marginTop: "5px",
                  }}
                >
                  <button
                    onClick={closeEditModal}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
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
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "var(--accent-blue)",
                      color: "white",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        message="Bạn có chắc chắn muốn xóa social này?"
        confirmText="Xóa"
        cancelText="Huỷ"
        onConfirm={async () => {
          if (onDelete) {
            await onDelete();
            onClose();
          }
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        theme={theme}
      />
    </div>
  );
}
