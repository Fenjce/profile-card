import { useEffect, useRef, useState, useCallback } from "react";
import { ProfileConfig } from "@/lib/types";
import { fetchConfig } from "@/lib/api";

interface UseConfigPollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 3000)
  enabled?: boolean; // Enable/disable polling (default: true)
  onConfigChange?: (
    newConfig: ProfileConfig,
    oldConfig: ProfileConfig | null
  ) => void; // Callback when config changes
}

export function useConfigPolling(
  initialConfig: ProfileConfig | null,
  options: UseConfigPollingOptions = {}
) {
  const { interval = 3000, enabled = true, onConfigChange } = options;
  const [config, setConfig] = useState<ProfileConfig | null>(initialConfig);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastConfigRef = useRef<string | null>(null);
  const failureCountRef = useRef(0);
  const currentIntervalRef = useRef(interval);

  // Check if tab is visible
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const pollConfig = useCallback(async () => {
    if (!enabled || !isTabVisible) return;

    setIsPolling(true);
    try {
      const newConfig = await fetchConfig();

      // Compare configs using JSON stringify
      const newConfigStr = JSON.stringify(newConfig);
      if (lastConfigRef.current !== newConfigStr) {
        const oldConfig = config;
        lastConfigRef.current = newConfigStr;
        setConfig(newConfig);

        // Call onChange callback if provided
        if (onConfigChange && oldConfig) {
          onConfigChange(newConfig, oldConfig);
        }

        // Reset failure count on success
        failureCountRef.current = 0;
        currentIntervalRef.current = interval;
      }
    } catch (error) {
      console.error("Polling error:", error);

      // Increment failure count
      failureCountRef.current += 1;

      // Exponential backoff: double interval after 5 failures
      if (failureCountRef.current >= 5) {
        currentIntervalRef.current = Math.min(interval * 2, 30000); // Max 30s
      }
    } finally {
      setIsPolling(false);
    }
  }, [enabled, isTabVisible, interval, config, onConfigChange]);

  useEffect(() => {
    if (!enabled || !isTabVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial poll when tab becomes visible
    if (isTabVisible) {
      pollConfig();
    }

    // Set up polling interval
    intervalRef.current = setInterval(pollConfig, currentIntervalRef.current);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isTabVisible, pollConfig]);

  // Update initial config
  useEffect(() => {
    if (initialConfig && !lastConfigRef.current) {
      lastConfigRef.current = JSON.stringify(initialConfig);
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  return { config, isPolling };
}
