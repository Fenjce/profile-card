import { ProfileConfig } from "./types";
import { profileConfig as defaultConfig } from "./config";

const API_BASE = "/api/config";

export async function fetchConfig(): Promise<ProfileConfig> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(API_BASE, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch config: ${response.status} ${response.statusText}`
      );
    }

    const config = await response.json();

    if (!config || !config.user) {
      console.warn("API returned invalid config, using default");
      return defaultConfig;
    }

    return config;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("API fetch timeout, using default config");
    } else {
      console.error("Error fetching config from API:", error);
    }
    return defaultConfig;
  }
}

let isSaving = false;
let saveQueue: Array<{
  config: ProfileConfig;
  adminToken: string;
  resolve: (value: {
    success: boolean;
    localStorage_only?: boolean;
    message?: string;
  }) => void;
  reject: (reason?: any) => void;
}> = [];

async function processSaveQueue() {
  if (isSaving || saveQueue.length === 0) return;

  isSaving = true;
  const { config, adminToken, resolve } = saveQueue.shift()!;

  try {
    const response = await fetch(API_BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error saving config:", error);
      resolve({ success: false, message: error.message || error.error });
    } else {
      const result = await response.json();
      if (result.localStorage_only) {
        console.warn("Upstash rate limit reached:", result.message);
        resolve({
          success: true,
          localStorage_only: true,
          message: result.message,
        });
      } else {
        resolve({ success: true });
      }
    }
  } catch (error) {
    console.error("Error saving config to API:", error);
    resolve({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    isSaving = false;
    setTimeout(() => processSaveQueue(), 100);
  }
}

export async function saveConfig(
  config: ProfileConfig,
  adminToken: string
): Promise<{
  success: boolean;
  localStorage_only?: boolean;
  message?: string;
}> {
  return new Promise((resolve) => {
    saveQueue = saveQueue.filter((item) => item.adminToken !== adminToken);
    saveQueue.push({ config, adminToken, resolve, reject: () => {} });
    processSaveQueue();
  });
}

export async function checkApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(API_BASE, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}
