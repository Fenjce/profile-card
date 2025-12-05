"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { InformationItem } from "@/lib/types";
import { Messages } from "@/lib/messages";
import { useToast } from "@/components/providers/ToastProvider";

interface InformationModalProps {
  information: InformationItem[];
  onClose: () => void;
  onEdit?: (information: InformationItem[]) => void;
}

const getLinkForItem = (item: InformationItem): string | null => {
  if (item.link) return item.link;
  if (!item.value) return null;

  switch (item.type) {
    case "email":
      return `mailto:${item.value}`;
    case "phone":
      return `tel:${item.value.replace(/\s+/g, "")}`;
    case "website":
      return item.value.startsWith("http")
        ? item.value
        : `https://${item.value}`;
    case "address":
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.value
      )}`;
    default:
      return null;
  }
};

export default function InformationModal({
  information,
  onClose,
  onEdit,
}: InformationModalProps) {
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalActive, setIsEditModalActive] = useState(false);
  const [editItems, setEditItems] = useState<InformationItem[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    item: InformationItem;
    link: string;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editScrollContainerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setTheme(document.body.className.includes("dark") ? "dark" : "light");
  }, []);

  const openEditModal = useCallback(() => {
    setEditItems(information.length > 0 ? [...information] : []);
    setIsEditing(true);
    setIsEditModalActive(false);
    setTimeout(() => setIsEditModalActive(true), 10);
  }, [information]);

  const closeEditModal = useCallback(() => {
    setIsEditModalActive(false);
    setTimeout(() => {
      setIsEditing(false);
      setEditItems(information.length > 0 ? [...information] : []);
    }, 500);
  }, [information]);

  const handleSaveEdit = useCallback(() => {
    if (onEdit) {
      onEdit(
        editItems.filter((item) => item.label.trim() && item.value.trim())
      );
      closeEditModal();
    }
  }, [onEdit, editItems, closeEditModal]);

  const handleAddItem = useCallback(() => {
    setEditItems((prev) => [...prev, { label: "", value: "", type: "other" }]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleItemChange = useCallback(
    (index: number, field: keyof InformationItem, value: string) => {
      setEditItems((prev) => {
        const newItems = [...prev];
        newItems[index] = { ...newItems[index], [field]: value };
        return newItems;
      });
    },
    []
  );

  const handleToggleHidden = useCallback((index: number) => {
    setEditItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], hidden: !newItems[index].hidden };
      return newItems;
    });
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setEditItems((prev) => {
      const newItems = [...prev];
      [newItems[index - 1], newItems[index]] = [
        newItems[index],
        newItems[index - 1],
      ];
      return newItems;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setEditItems((prev) => {
      if (index === prev.length - 1) return prev;
      const newItems = [...prev];
      [newItems[index], newItems[index + 1]] = [
        newItems[index + 1],
        newItems[index],
      ];
      return newItems;
    });
  }, []);

  const emptyStateStyle = useMemo(
    () => ({
      padding: "24px",
      textAlign: "center" as const,
      color:
        theme === "dark"
          ? "var(--text-secondary-dark)"
          : "var(--text-secondary-light)",
    }),
    [theme]
  );

  const itemCardStyle = useMemo(
    () => ({
      padding: "12px 40px",
      borderRadius: "12px",
      background:
        theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
      border:
        theme === "dark"
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.1)",
    }),
    [theme]
  );

  const labelStyle = useMemo(
    () => ({
      fontSize: "12px",
      fontWeight: "500" as const,
      color:
        theme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
      marginBottom: "8px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    }),
    [theme]
  );

  const editItemCardStyle = useMemo(
    () => ({
      padding: "20px",
      borderRadius: "12px",
      background:
        theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
      border:
        theme === "dark"
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.1)",
    }),
    [theme]
  );

  const inputBaseStyle = useMemo(
    () => ({
      width: "100%",
      padding: "10px 14px",
      borderRadius: "8px",
      border:
        theme === "dark"
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0, 0, 0, 0.2)",
      background:
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      color:
        theme === "dark"
          ? "var(--text-primary-dark)"
          : "var(--text-primary-light)",
      fontSize: "14px",
      outline: "none" as const,
    }),
    [theme]
  );

  const labelBaseStyle = useMemo(
    () => ({
      display: "block" as const,
      marginBottom: "6px",
      fontSize: "12px",
      fontWeight: "500" as const,
      color:
        theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
    }),
    [theme]
  );

  const handleLinkMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.opacity = "0.7";
    },
    []
  );

  const handleLinkMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.opacity = "1";
    },
    []
  );

  const handleEditButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      openEditModal();
    },
    [openEditModal]
  );

  const linkStyle = useMemo(
    () => ({
      fontSize: "16px",
      color:
        theme === "dark" ? "var(--accent-blue-light)" : "var(--accent-blue)",
      textDecoration: "none" as const,
      cursor: "pointer" as const,
      transition: "opacity 0.3s ease",
      display: "inline-block" as const,
    }),
    [theme]
  );

  const valueTextStyle = useMemo(
    () => ({
      fontSize: "16px",
      color:
        theme === "dark" ? "var(--accent-blue-light)" : "var(--accent-blue)",
    }),
    [theme]
  );

  const editButtonStyle = useMemo(
    () => ({
      width: "100%",
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
      fontWeight: "500" as const,
      cursor: "pointer" as const,
      transition: "all 0.3s ease",
    }),
    [theme]
  );

  const handleEditButtonMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background =
        theme === "dark"
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(59, 130, 246, 0.2)";
    },
    [theme]
  );

  const handleEditButtonMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background =
        theme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(59, 130, 246, 0.1)";
    },
    [theme]
  );

  const cancelButtonStyle = useMemo(
    () => ({
      flex: 1,
      padding: "12px 24px",
      borderRadius: "8px",
      border:
        theme === "dark"
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0, 0, 0, 0.2)",
      background: "transparent",
      color:
        theme === "dark"
          ? "var(--text-primary-dark)"
          : "var(--text-primary-light)",
      fontSize: "14px",
      fontWeight: "500" as const,
      cursor: "pointer" as const,
    }),
    [theme]
  );

  const saveButtonStyle = useMemo(
    () => ({
      flex: 1,
      padding: "12px 24px",
      borderRadius: "8px",
      background: "var(--accent-blue)",
      color: "white",
      border: "none" as const,
      fontSize: "14px",
      fontWeight: "500" as const,
      cursor: "pointer" as const,
      transition: "all 0.3s ease",
    }),
    []
  );

  const handleSaveButtonMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
    },
    []
  );

  const handleSaveButtonMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    },
    []
  );

  const addButtonStyle = useMemo(
    () => ({
      width: "100%",
      padding: "12px 24px",
      borderRadius: "8px",
      border:
        theme === "dark"
          ? "2px dashed rgba(255, 255, 255, 0.3)"
          : "2px dashed rgba(0, 0, 0, 0.3)",
      background: "transparent",
      color:
        theme === "dark"
          ? "var(--text-primary-dark)"
          : "var(--text-primary-light)",
      fontSize: "14px",
      fontWeight: "500" as const,
      cursor: "pointer" as const,
      transition: "all 0.3s ease",
    }),
    [theme]
  );

  const handleAddButtonMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background =
        theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    },
    [theme]
  );

  const handleAddButtonMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = "transparent";
    },
    []
  );

  const handleCopyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(Messages.INFO_COPIED, "success");
      } catch (err) {
        console.error("Failed to copy:", err);
        showToast(Messages.INFO_COPY_ERROR, "error");
      }
    },
    [showToast]
  );

  const handleItemClick = useCallback(
    (item: InformationItem, link: string | null) => {
      if (item.hidden) return;

      if (item.type === "other" && !link) {
        handleCopyToClipboard(item.value);
      } else if (link) {
        // Show confirmation dialog before opening link
        setPendingAction({ item, link });
        setShowConfirm(true);
      }
    },
    [handleCopyToClipboard]
  );

  const handleConfirmAction = useCallback(() => {
    if (!pendingAction) return;

    const { item, link } = pendingAction;
    setShowConfirm(false);

    if (item.type === "website" || item.type === "address") {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = link;
    }

    setPendingAction(null);
  }, [pendingAction]);

  const handleCancelAction = useCallback(() => {
    setShowConfirm(false);
    setPendingAction(null);
  }, []);

  const getConfirmMessage = useCallback((): string => {
    if (!pendingAction) return "";
    const { item } = pendingAction;

    switch (item.type) {
      case "phone":
        return Messages.INFO_CONFIRM_PHONE(item.value);
      case "email":
        return Messages.INFO_CONFIRM_EMAIL(item.value);
      case "website":
        return Messages.INFO_CONFIRM_WEBSITE(item.value);
      case "address":
        return Messages.INFO_CONFIRM_ADDRESS(item.value);
      default:
        return Messages.INFO_CONFIRM_LINK(item.label || item.value);
    }
  }, [pendingAction]);

  const deleteButtonStyle = useMemo(
    () => ({
      padding: "4px 8px",
      borderRadius: "6px",
      background: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      fontSize: "12px",
      cursor: "pointer" as const,
    }),
    []
  );

  const getToggleButtonStyle = useCallback(
    (hidden: boolean) => ({
      padding: "4px 8px",
      borderRadius: "6px",
      background: hidden
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(107, 114, 128, 0.1)",
      color: hidden ? "#3b82f6" : "#6b7280",
      border: hidden
        ? "1px solid rgba(59, 130, 246, 0.3)"
        : "1px solid rgba(107, 114, 128, 0.3)",
      fontSize: "12px",
      cursor: "pointer" as const,
      display: "flex" as const,
      alignItems: "center" as const,
      gap: "4px",
      transition: "all 0.2s ease",
    }),
    []
  );

  const getMoveButtonStyle = useCallback(
    (disabled: boolean) => ({
      padding: "4px 8px",
      borderRadius: "6px",
      background: disabled
        ? "rgba(107, 114, 128, 0.05)"
        : "rgba(107, 114, 128, 0.1)",
      color: disabled ? "#9ca3af" : "#6b7280",
      border: "1px solid rgba(107, 114, 128, 0.3)",
      fontSize: "12px",
      cursor: disabled ? "not-allowed" : ("pointer" as const),
      display: "flex" as const,
      alignItems: "center" as const,
      gap: "4px",
      transition: "all 0.2s ease",
      opacity: disabled ? 0.5 : 1,
    }),
    []
  );

  const hiddenValueStyle = useMemo(
    () => ({
      fontSize: "16px",
      color:
        theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)",
      filter: "blur(12px)",
      userSelect: "none" as const,
      pointerEvents: "none" as const,
      opacity: 0.2,
      position: "absolute" as const,
      width: "100%",
    }),
    [theme]
  );

  const hiddenOverlayStyle = useMemo(
    () => ({
      position: "relative" as const,
      display: "flex" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: "8px",
      pointerEvents: "none" as const,
      userSelect: "none" as const,
    }),
    []
  );

  const hiddenIconStyle = useMemo(
    () => ({
      flexShrink: 0,
      opacity: 0.6,
    }),
    []
  );

  const hiddenTextStyle = useMemo(
    () => ({
      fontSize: "13px",
      fontWeight: "500" as const,
      color:
        theme === "dark"
          ? "rgba(203, 213, 225, 0.5)"
          : "rgba(71, 85, 105, 0.5)",
      letterSpacing: "0.3px",
      opacity: 0.6,
    }),
    [theme]
  );

  const svgStrokeColor = useMemo(
    () =>
      theme === "dark"
        ? "rgba(148, 163, 184, 0.5)"
        : "rgba(100, 116, 139, 0.5)",
    [theme]
  );

  const overlayClassName = useMemo(
    () => `social-modal-overlay ${isActive ? "active" : ""}`,
    [isActive]
  );

  const backButtonClassName = useMemo(() => `modal-home-btn`, []);

  const editOverlayClassName = useMemo(
    () => `story-overlay ${isEditModalActive ? "active" : ""}`,
    [isEditModalActive]
  );

  const editCloseButtonClassName = useMemo(() => `story-close-btn`, []);

  return (
    <div
      ref={scrollContainerRef}
      className={overlayClassName}
      style={{ overflowY: "auto", overflowX: "hidden" }}
    >
      <div className="social-modal">
        <button
          className={backButtonClassName}
          onClick={onClose}
          title={Messages.MODAL_HOME}
          type="button"
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

        <div className="social-modal-icon social-modal-icon-default">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <h2 className="social-modal-title">{Messages.INFO_TITLE}</h2>

        <div className="information-modal-content">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
            }}
          >
            {information.length === 0 ? (
              <div style={emptyStateStyle}>{Messages.INFO_EMPTY}</div>
            ) : (
              information.map((item, index) => {
                const link = getLinkForItem(item);
                const hasLink = link !== null;
                const isExternalLink =
                  item.type === "website" || item.type === "address";
                const isClickable =
                  !item.hidden && (hasLink || item.type === "other");

                return (
                  <div
                    key={index}
                    style={{
                      ...itemCardStyle,
                      cursor: isClickable ? "pointer" : "default",
                      transition: isClickable ? "all 0.2s ease" : "none",
                      position: "relative",
                    }}
                    onClick={() => handleItemClick(item, link)}
                    onMouseEnter={(e) => {
                      if (isClickable) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          theme === "dark"
                            ? "0 4px 12px rgba(255, 255, 255, 0.1)"
                            : "0 4px 12px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isClickable) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <div style={labelStyle}>{item.label}</div>
                    <div
                      style={{
                        position: "relative",
                        minHeight: "24px",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {item.hidden ? (
                        <>
                          <div style={hiddenValueStyle}>{item.value}</div>
                          <div style={hiddenOverlayStyle}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={svgStrokeColor}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={hiddenIconStyle}
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <span style={hiddenTextStyle}>
                              {Messages.INFO_HIDDEN}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            ...valueTextStyle,
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {item.value}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {onEdit && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              paddingBottom: "0",
              width: "100%",
              flexShrink: 0,
              borderTop:
                theme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <button
              onClick={handleEditButtonClick}
              type="button"
              style={editButtonStyle}
              onMouseEnter={handleEditButtonMouseEnter}
              onMouseLeave={handleEditButtonMouseLeave}
            >
              ✏️ {Messages.MODAL_EDIT}
            </button>
          </div>
        )}

        {isEditing && (
          <div
            className={editOverlayClassName}
            style={{ overflowX: "hidden", zIndex: 2000 }}
          >
            <div
              ref={editScrollContainerRef}
              className="story-container"
              style={{ overflowY: "auto", overflowX: "hidden" }}
            >
              <button
                className={editCloseButtonClassName}
                onClick={closeEditModal}
                title={Messages.MODAL_BACK}
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5"></path>
                  <path d="M12 19l-7-7 7-7"></path>
                </svg>
              </button>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "30px",
                  textAlign: "center" as const,
                  color:
                    theme === "dark"
                      ? "var(--text-primary-dark)"
                      : "var(--text-primary-light)",
                }}
              >
                {Messages.INFO_EDIT_TITLE}
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  width: "100%",
                }}
              >
                {editItems.length === 0 ? (
                  <div style={emptyStateStyle}>{Messages.INFO_EMPTY_EDIT}</div>
                ) : (
                  editItems.map((item, index) => (
                    <div key={index} style={editItemCardStyle}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color:
                              theme === "dark"
                                ? "var(--text-primary-dark)"
                                : "var(--text-primary-light)",
                          }}
                        >
                          {Messages.INFO_ITEM_NUMBER(index + 1)}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() => handleMoveUp(index)}
                            type="button"
                            disabled={index === 0}
                            style={getMoveButtonStyle(index === 0)}
                            title="Move up"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 15l-6-6-6 6"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            type="button"
                            disabled={index === editItems.length - 1}
                            style={getMoveButtonStyle(
                              index === editItems.length - 1
                            )}
                            title="Move down"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 9l6 6 6-6"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleHidden(index)}
                            type="button"
                            style={getToggleButtonStyle(!!item.hidden)}
                            title={
                              item.hidden
                                ? Messages.INFO_SHOW_TOOLTIP
                                : Messages.INFO_HIDE_TOOLTIP
                            }
                          >
                            {item.hidden ? (
                              <>
                                <svg
                                  width="14"
                                  height="14"
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
                                {Messages.INFO_SHOW}
                              </>
                            ) : (
                              <>
                                <svg
                                  width="14"
                                  height="14"
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
                                {Messages.INFO_HIDE}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveItem(index)}
                            type="button"
                            style={deleteButtonStyle}
                          >
                            {Messages.MODAL_DELETE}
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <label style={labelBaseStyle}>
                            {Messages.INFO_LABEL}
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              handleItemChange(index, "label", e.target.value)
                            }
                            placeholder={Messages.INFO_LABEL_PLACEHOLDER}
                            style={inputBaseStyle}
                          />
                        </div>

                        <div>
                          <label style={labelBaseStyle}>
                            {Messages.INFO_TYPE}
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) =>
                              handleItemChange(index, "type", e.target.value)
                            }
                            style={{ ...inputBaseStyle, cursor: "pointer" }}
                          >
                            <option value="email">
                              {Messages.INFO_TYPE_EMAIL}
                            </option>
                            <option value="phone">
                              {Messages.INFO_TYPE_PHONE}
                            </option>
                            <option value="website">
                              {Messages.INFO_TYPE_WEBSITE}
                            </option>
                            <option value="address">
                              {Messages.INFO_TYPE_ADDRESS}
                            </option>
                            <option value="other">
                              {Messages.INFO_TYPE_OTHER}
                            </option>
                          </select>
                        </div>

                        <div>
                          <label style={labelBaseStyle}>
                            {Messages.INFO_VALUE}
                          </label>
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) =>
                              handleItemChange(index, "value", e.target.value)
                            }
                            placeholder={Messages.INFO_VALUE_PLACEHOLDER}
                            style={inputBaseStyle}
                          />
                        </div>

                        <div>
                          <label style={labelBaseStyle}>
                            {Messages.INFO_CUSTOM_LINK}
                          </label>
                          <input
                            type="text"
                            value={item.link || ""}
                            onChange={(e) =>
                              handleItemChange(index, "link", e.target.value)
                            }
                            placeholder={Messages.INFO_LINK_PLACEHOLDER}
                            style={inputBaseStyle}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={handleAddItem}
                  type="button"
                  style={addButtonStyle}
                  onMouseEnter={handleAddButtonMouseEnter}
                  onMouseLeave={handleAddButtonMouseLeave}
                >
                  + {Messages.INFO_ADD_ITEM}
                </button>
              </div>

              <div
                style={{
                  marginTop: "30px",
                  display: "flex",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <button
                  onClick={closeEditModal}
                  type="button"
                  style={cancelButtonStyle}
                >
                  {Messages.MODAL_CANCEL}
                </button>
                <button
                  onClick={handleSaveEdit}
                  type="button"
                  style={saveButtonStyle}
                  onMouseEnter={handleSaveButtonMouseEnter}
                  onMouseLeave={handleSaveButtonMouseLeave}
                >
                  {Messages.MODAL_SAVE}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          onClick={handleCancelAction}
        >
          <div
            style={{
              backgroundColor:
                theme === "dark"
                  ? "var(--card-bg-dark)"
                  : "var(--card-bg-light)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              boxShadow:
                theme === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.5)"
                  : "0 8px 32px rgba(0, 0, 0, 0.2)",
              border:
                theme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
                color:
                  theme === "dark"
                    ? "var(--text-primary-dark)"
                    : "var(--text-primary-light)",
              }}
            >
              {Messages.MODAL_CONFIRM}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "24px",
                color:
                  theme === "dark"
                    ? "var(--text-secondary-dark)"
                    : "var(--text-secondary-light)",
              }}
            >
              {getConfirmMessage()}
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCancelAction}
                type="button"
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(0, 0, 0, 0.2)",
                  background: "transparent",
                  color:
                    theme === "dark"
                      ? "var(--text-primary-dark)"
                      : "var(--text-primary-light)",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {Messages.INFO_CONFIRM_NO}
              </button>
              <button
                onClick={handleConfirmAction}
                type="button"
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "var(--accent-blue)",
                  color: "white",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
                {Messages.INFO_CONFIRM_YES}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
