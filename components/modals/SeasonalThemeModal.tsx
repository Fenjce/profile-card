"use client";

import { useState, useEffect } from "react";
import { SeasonalTheme } from "@/lib/types";
import { formatSeasonalThemeDate } from "../../lib/seasonalUtils";

interface SeasonalThemeModalProps {
  themes: SeasonalTheme[];
  onClose: () => void;
  onSave: (themes: SeasonalTheme[]) => void;
  theme: "light" | "dark";
}

export default function SeasonalThemeModal({
  themes,
  onClose,
  onSave,
  theme,
}: SeasonalThemeModalProps) {
  const [isActive, setIsActive] = useState(false);
  const [editingThemes, setEditingThemes] = useState<SeasonalTheme[]>(themes);
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultTheme = {
    name: "",
    startDate: "",
    endDate: "",
    messages: [""],
    backgroundColor:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)",
    textColor: "#ffffff",
    enabled: true,
  };
  const [newTheme, setNewTheme] =
    useState<Partial<SeasonalTheme>>(defaultTheme);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleTheme = (id: string) => {
    setEditingThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleUpdateTheme = (id: string, updates: Partial<SeasonalTheme>) => {
    setEditingThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteTheme = (id: string) => {
    setEditingThemes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTheme = () => {
    if (
      !newTheme.name ||
      !newTheme.startDate ||
      !newTheme.endDate ||
      !newTheme.messages ||
      newTheme.messages.length === 0 ||
      !newTheme.messages[0]
    ) {
      return;
    }

    const theme: SeasonalTheme = {
      id: `custom-${Date.now()}`,
      name: newTheme.name,
      startDate: newTheme.startDate,
      endDate: newTheme.endDate,
      messages: newTheme.messages.filter((msg) => msg.trim() !== ""),
      backgroundColor:
        newTheme.backgroundColor ||
        "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)",
      textColor: newTheme.textColor || "#ffffff",
      enabled: true,
    };

    setEditingThemes((prev) => [...prev, theme]);
    setNewTheme(defaultTheme);
    setShowAddForm(false);
  };

  const handleSave = () => {
    onSave(editingThemes);
    onClose();
  };

  return (
    <div className={`social-modal-overlay ${isActive ? "active" : ""}`}>
      <div
        className="social-modal"
        style={{
          maxWidth: "600px",
          maxHeight: "none",
          overflowY: "visible",
          height: "auto",
          minHeight: "auto",
          padding: "80px 25px 40px",
        }}
      >
        {/* Close Button */}
        <button
          className="social-modal-back-btn"
          onClick={onClose}
          title="Về trang chính"
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

        <h2 className="social-modal-title">Quản lý Theme Mùa</h2>

        {/* AI API Key Setting */}
        <div
          className={`card ${theme}`}
          style={{ marginBottom: "16px", padding: "12px 16px" }}
        >
          <div style={{ marginBottom: "8px" }}>
            <div
              className={`text-primary ${theme}`}
              style={{
                fontWeight: "600",
                fontSize: "13px",
                marginBottom: "6px",
              }}
            >
              🤖 AI API Key (Tùy chọn)
            </div>
            <input
              type="password"
              placeholder="Hugging Face API Key - để trống sẽ dùng free tier"
              value={localStorage.getItem("huggingface_api_key") || ""}
              onChange={(e) => {
                if (e.target.value) {
                  localStorage.setItem("huggingface_api_key", e.target.value);
                } else {
                  localStorage.removeItem("huggingface_api_key");
                }
              }}
              className={`input ${theme}`}
              style={{ fontSize: "12px", padding: "6px 10px" }}
            />
            <div
              className={`text-secondary ${theme}`}
              style={{ fontSize: "10px", marginTop: "3px" }}
            >
              API key để AI tự tạo câu chúc mới mỗi lần load trang. Lấy miễn phí
              tại:{" "}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-blue)" }}
              >
                huggingface.co/settings/tokens
              </a>
            </div>
          </div>
        </div>

        <div
          className="social-modal-content"
          style={{
            marginTop: "10px",
            padding: "0",
            minHeight: "auto",
            overflow: "visible",
          }}
        >
          {/* Existing Themes */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginTop: "0px",
            }}
          >
            {editingThemes.map((seasonalTheme) => (
              <div key={seasonalTheme.id} className={`card ${theme}`}>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "12px" }}
                >
                  <div className="flex items-center gap-8" style={{ flex: 1 }}>
                    <div>
                      <div
                        className={`text-primary ${theme}`}
                        style={{ fontWeight: "600", fontSize: "14px" }}
                      >
                        {seasonalTheme.name}
                      </div>
                      <div
                        className={`text-secondary ${theme}`}
                        style={{ fontSize: "12px" }}
                      >
                        {formatSeasonalThemeDate(
                          seasonalTheme.startDate,
                          seasonalTheme.id
                        )}{" "}
                        -{" "}
                        {formatSeasonalThemeDate(
                          seasonalTheme.endDate,
                          seasonalTheme.id
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-8"
                    style={{ marginLeft: "auto" }}
                  >
                    {seasonalTheme.id.startsWith("custom-") && (
                      <button
                        onClick={() => handleDeleteTheme(seasonalTheme.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid #ef4444",
                          color: "#ef4444",
                          width: "32px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          height: "32px",
                        }}
                        title="Xóa theme"
                      >
                        🗑️
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleTheme(seasonalTheme.id)}
                      style={{
                        fontSize: "12px",
                        padding: "6px 12px",
                        minWidth: "50px",
                        height: "32px",
                        background: "transparent",
                        border: seasonalTheme.enabled
                          ? "1px solid #10b981"
                          : "1px solid #6b7280",
                        color: seasonalTheme.enabled ? "#10b981" : "#6b7280",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {seasonalTheme.enabled ? "Bật" : "Tắt"}
                    </button>
                  </div>
                </div>

                <div
                  className={`text-secondary ${theme}`}
                  style={{ fontSize: "13px", marginBottom: "12px" }}
                >
                  {seasonalTheme.messages
                    ? seasonalTheme.messages[0]
                    : "No messages"}
                  {seasonalTheme.messages &&
                    seasonalTheme.messages.length > 1 &&
                    ` (+${seasonalTheme.messages.length - 1} more)`}
                </div>

                {/* Preview */}
                <div
                  style={{
                    background: seasonalTheme.backgroundColor,
                    color: seasonalTheme.textColor,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>
                    {seasonalTheme.messages
                      ? seasonalTheme.messages[0]
                      : "No messages"}
                  </span>
                </div>

                {/* Edit Fields */}
                <div
                  className="flex flex-col gap-8"
                  style={{ marginTop: "12px" }}
                >
                  <input
                    type="text"
                    placeholder="Tin nhắn chính"
                    value={
                      seasonalTheme.messages ? seasonalTheme.messages[0] : ""
                    }
                    onChange={(e) => {
                      const newMessages = [...(seasonalTheme.messages || [""])];
                      newMessages[0] = e.target.value;
                      handleUpdateTheme(seasonalTheme.id, {
                        messages: newMessages,
                      });
                    }}
                    className={`input ${theme}`}
                    style={{ fontSize: "13px", padding: "8px 12px" }}
                  />
                  <div className="flex gap-8">
                    <input
                      type="text"
                      placeholder={
                        seasonalTheme.id === "birthday"
                          ? "DD-MM-YYYY (VD: 15-02-2001)"
                          : "DD-MM (VD: 01-03)"
                      }
                      value={seasonalTheme.startDate}
                      onChange={(e) => {
                        handleUpdateTheme(seasonalTheme.id, {
                          startDate: e.target.value,
                        });
                      }}
                      className={`input ${theme}`}
                      style={{ fontSize: "13px", padding: "8px 12px", flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder={
                        seasonalTheme.id === "birthday"
                          ? "DD-MM-YYYY (VD: 15-02-2001)"
                          : "DD-MM (VD: 31-05)"
                      }
                      value={seasonalTheme.endDate}
                      onChange={(e) => {
                        handleUpdateTheme(seasonalTheme.id, {
                          endDate: e.target.value,
                        });
                      }}
                      className={`input ${theme}`}
                      style={{ fontSize: "13px", padding: "8px 12px", flex: 1 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Theme */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
              style={{ marginTop: "12px", width: "100%" }}
            >
              ➕ Thêm Theme Mới
            </button>
          ) : (
            <div className={`card ${theme}`} style={{ marginTop: "20px" }}>
              <h3
                className={`text-primary ${theme}`}
                style={{ marginBottom: "16px", fontSize: "16px" }}
              >
                ➕ Thêm Theme Mới
              </h3>

              <div className="flex flex-col gap-12">
                <input
                  type="text"
                  placeholder="Tên theme (VD: Tết Trung Thu)"
                  value={newTheme.name}
                  onChange={(e) =>
                    setNewTheme((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`input ${theme}`}
                />

                <input
                  type="text"
                  placeholder="Tin nhắn (VD: 🥮 Chúc mừng Tết Trung Thu!)"
                  value={newTheme.messages ? newTheme.messages[0] : ""}
                  onChange={(e) =>
                    setNewTheme((prev) => ({
                      ...prev,
                      messages: [e.target.value],
                    }))
                  }
                  className={`input ${theme}`}
                />

                <div className="flex gap-8">
                  <input
                    type="text"
                    placeholder="Ngày bắt đầu (DD-MM hoặc DD-MM-YYYY)"
                    value={newTheme.startDate || ""}
                    onChange={(e) => {
                      setNewTheme((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }));
                    }}
                    className={`input ${theme}`}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Ngày kết thúc (DD-MM hoặc DD-MM-YYYY)"
                    value={newTheme.endDate || ""}
                    onChange={(e) => {
                      setNewTheme((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }));
                    }}
                    className={`input ${theme}`}
                    style={{ flex: 1 }}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`btn btn-secondary ${theme}`}
                  >
                    Hủy
                  </button>
                  <button onClick={handleAddTheme} className="btn btn-primary">
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: "24px" }}>
          <button onClick={onClose} className={`btn btn-secondary ${theme}`}>
            Hủy
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
}
