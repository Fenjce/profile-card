"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, isAuthenticated, initAuth } from "@/lib/auth";
import { profileConfig } from "@/lib/config";
import { useToast } from "@/components/providers/ToastProvider";
import { Messages } from "@/lib/messages";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(true);
      return;
    }

    initAuth();

    if (isAuthenticated()) {
      router.replace("/admin/edit");
      return;
    }

    setIsLoading(false);

    localStorage.removeItem("theme");
    setTheme("dark");
    if (typeof document !== "undefined") {
      document.body.className = "dark-mode";
    }
  }, [router]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      document.body.className = `${newTheme}-mode`;
    }
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (success) {
        showToast(Messages.LOGIN_SUCCESS, "success");
        setTimeout(() => {
          window.location.href = "/admin/edit";
        }, 500);
      } else {
        setError(Messages.LOGIN_ERROR_DETAIL);
        showToast(Messages.LOGIN_ERROR, "error");
      }
    } catch (error) {
      setError(Messages.LOGIN_GENERAL_ERROR);
      showToast(Messages.LOGIN_GENERAL_ERROR, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>{Messages.LOADING}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-card">
        {/* Home button - góc trái */}
        <Link href="/" className="story-close-btn" title="Về trang chủ">
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
        </Link>

        {/* Title - ở giữa */}
        <h1 className="login-title">{Messages.LOGIN_TITLE}</h1>

        {/* Theme toggle - góc phải */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
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

        <div className="login-content">
          <p
            style={{
              fontSize: "14px",
              marginBottom: "30px",
              color:
                theme === "dark"
                  ? "var(--text-secondary-dark)"
                  : "var(--text-secondary-light)",
            }}
          >
            {Messages.LOGIN_SUBTITLE}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  fontSize: "14px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={Messages.LOGIN_USERNAME_PLACEHOLDER}
                required
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
                autoFocus
              />
            </div>

            <div style={{ marginBottom: "30px", position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={Messages.LOGIN_PASSWORD_PLACEHOLDER}
                required
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
                onClick={() => setShowPassword(!showPassword)}
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
                  showPassword
                    ? Messages.LOGIN_HIDE_PASSWORD
                    : Messages.LOGIN_SHOW_PASSWORD
                }
              >
                {showPassword ? (
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

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: "12px",
                background: isSubmitting
                  ? "rgba(59, 130, 246, 0.5)"
                  : "var(--accent-blue)",
                color: "white",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginBottom: "15px",
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(59, 130, 246, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? Messages.LOGIN_LOADING : Messages.LOGIN_BUTTON}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
