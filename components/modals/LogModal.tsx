"use client";

import { useEffect, useState } from "react";
import { Messages } from "@/lib/messages";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LogEntry } from "@/lib/types";
import { parseUserAgent } from "@/lib/deviceUtils";
import { formatLogDate } from "@/lib/dateUtils";

interface LogModalProps {
  onClose: () => void;
  theme: "light" | "dark";
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function LogModal({ onClose, theme, showToast }: LogModalProps) {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs");
        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs || []);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleDeleteAll = async () => {
    try {
      const response = await fetch("/api/logs", { method: "DELETE" });
      if (response.ok) {
        setLogs([]);
        showToast?.("Đã xóa tất cả lịch sử truy cập", "success");
      } else {
        showToast?.("Không thể xóa lịch sử truy cập", "error");
      }
    } catch (error) {
      console.error("Error deleting logs:", error);
      showToast?.("Lỗi khi xóa lịch sử truy cập", "error");
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`social-modal-overlay ${isActive ? "active" : ""}`}>
      <div className="social-modal">
        {/* Close Button */}
        <button
          className={`modal-close-btn ${theme}`}
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
            width="22"
            height="22"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="icon-btn"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            color: "#ef4444",
            zIndex: 1001,
          }}
          title="Xóa tất cả logs"
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
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>

        <h2 className="social-modal-title">Lịch sử truy cập</h2>

        <div className="information-modal-content">
          {isLoading ? (
            <div className={`loading-state ${theme}`}>Đang tải...</div>
          ) : logs.length === 0 ? (
            <div className={`empty-state ${theme}`}>
              Chưa có lượt truy cập nào
            </div>
          ) : (
            <div className="flex flex-col" style={{ width: "100%" }}>
              {logs.map((log, index) => {
                const deviceInfo = parseUserAgent(log.userAgent);
                const isExpanded = expandedIndex === index;
                const isLogin = log.type === "login";

                return (
                  <div
                    key={index}
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className={`log-item ${theme} ${isLogin ? "login" : ""}`}
                  >
                    {/* Compact View */}
                    <div className="log-item-compact">
                      <div className={`device-icon ${theme}`}>
                        {deviceInfo.deviceIcon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className={`text-primary ${theme}`}
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          {formatLogDate(log.timestamp)}
                        </div>
                        <div
                          className={`text-secondary ${theme} text-truncate`}
                          style={{ fontSize: "13px" }}
                        >
                          {log.location || log.ip || "Unknown"}
                        </div>
                      </div>

                      <svg
                        className={`log-expand-icon ${theme} ${
                          isExpanded ? "expanded" : ""
                        }`}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className={`log-item-expanded ${theme}`}>
                        {/* Type Badge */}
                        <div
                          className="flex items-center gap-8"
                          style={{ marginBottom: "8px" }}
                        >
                          <span className={`badge primary ${theme}`}>
                            {isLogin ? "🔐 LOGIN" : "👁️ VISIT"}
                          </span>
                          {isLogin && log.username && (
                            <span
                              className={`text-primary ${theme}`}
                              style={{ fontSize: "12px", fontWeight: "500" }}
                            >
                              {log.username}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col gap-8">
                          {log.ip && (
                            <div
                              className={`text-secondary ${theme}`}
                              style={{ fontSize: "12px" }}
                            >
                              <strong>📍 IP:</strong> {log.ip}
                            </div>
                          )}

                          {log.location && (
                            <div
                              className={`text-secondary ${theme}`}
                              style={{ fontSize: "12px" }}
                            >
                              <strong>🌍 Vị trí:</strong> {log.location}
                            </div>
                          )}

                          {log.timezone && (
                            <div
                              className={`text-secondary ${theme}`}
                              style={{ fontSize: "12px" }}
                            >
                              <strong>🕐 Múi giờ:</strong> {log.timezone}
                            </div>
                          )}

                          {log.isp && (
                            <div
                              className={`text-secondary ${theme}`}
                              style={{ fontSize: "12px" }}
                            >
                              <strong>📡 Nhà mạng:</strong> {log.isp}
                            </div>
                          )}

                          <div
                            className={`text-secondary ${theme}`}
                            style={{ fontSize: "12px" }}
                          >
                            <strong>💻 Thiết bị:</strong> {deviceInfo.device}
                          </div>

                          <div
                            className={`text-secondary ${theme}`}
                            style={{ fontSize: "12px" }}
                          >
                            <strong>🌐 Trình duyệt:</strong>{" "}
                            {deviceInfo.browser}
                          </div>

                          <div
                            className={`text-secondary ${theme}`}
                            style={{ fontSize: "12px" }}
                          >
                            <strong>⚙️ Hệ điều hành:</strong> {deviceInfo.os}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          message="Bạn có chắc chắn muốn xóa tất cả lịch sử truy cập không?"
          confirmText="Xóa"
          cancelText="Huỷ"
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteConfirm(false)}
          theme={theme}
        />
      </div>
    </div>
  );
}
