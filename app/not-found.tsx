"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { profileConfig } from "@/lib/config";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      localStorage.removeItem("theme");
      setTheme("dark");
      document.body.className = "dark-mode";
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      document.body.className = `${newTheme}-mode`;
    }
  }, [theme]);

  return (
    <div className="container">
      <div className="profile-card">
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
            minHeight: "400px",
          }}
        >
          <div
            style={{
              fontSize: "120px",
              fontWeight: "bold",
              lineHeight: "1",
              marginBottom: "20px",
              color:
                theme === "dark"
                  ? "var(--text-primary-dark)"
                  : "var(--text-primary-light)",
              opacity: 0.8,
            }}
          >
            404
          </div>

          <h1
            style={{
              fontSize: "28px",
              marginBottom: "15px",
              color:
                theme === "dark"
                  ? "var(--text-primary-dark)"
                  : "var(--text-primary-light)",
            }}
          >
            Trang không tồn tại
          </h1>

          <p
            style={{
              fontSize: "16px",
              marginBottom: "30px",
              color:
                theme === "dark"
                  ? "var(--text-secondary-dark)"
                  : "var(--text-secondary-light)",
              maxWidth: "400px",
            }}
          >
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="/"
              style={{
                padding: "12px 30px",
                borderRadius: "12px",
                background: "var(--accent-blue)",
                color: "white",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.3s ease",
                display: "inline-block",
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
              Về trang chủ
            </Link>

            <button
              onClick={() => router.back()}
              style={{
                padding: "12px 30px",
                borderRadius: "12px",
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
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
