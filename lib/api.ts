import { ProfileConfig } from "./types";
import { profileConfig as defaultConfig } from "./config";
import { retryWithBackoff } from "./retry";

const API_BASE = "/api/config";
const API_STATUS = "/api/config/status";

// Cache for environment status check
let cachedIsVercelEnvironment: boolean | null = null;
let lastStatusCheckTime = 0;
const STATUS_CACHE_TTL = 60000; // 1 minute

// Helper: Kiểm tra xem có Vercel/Upstash không (client-side)
async function isVercelEnvironment(): Promise<boolean> {
	// Return cached value if still valid
	if (cachedIsVercelEnvironment !== null && Date.now() - lastStatusCheckTime < STATUS_CACHE_TTL) {
		return cachedIsVercelEnvironment;
	}

	try {
		const response = await fetch(API_STATUS, { cache: "default" });
		if (response.ok) {
			const data = await response.json();
			cachedIsVercelEnvironment = data.isConfigured === true;
			lastStatusCheckTime = Date.now();
			return cachedIsVercelEnvironment;
		}
	} catch (error) {
		console.warn("Error checking Vercel environment status:", error);
	}

	// Fallback: assume not configured
	cachedIsVercelEnvironment = false;
	lastStatusCheckTime = Date.now();
	return false;
}

// Helper: Lấy config từ localStorage
function getConfigFromLocalStorage(): ProfileConfig | null {
	if (typeof window === "undefined") return null;
	try {
		const stored = localStorage.getItem("profileConfig");
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && parsed.user) {
				return parsed;
			}
		}
	} catch (error) {
		console.error("Error reading from localStorage:", error);
	}
	return null;
}

// Helper: Lưu config vào localStorage
function saveConfigToLocalStorage(config: ProfileConfig): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem("profileConfig", JSON.stringify(config));
	} catch (error) {
		console.error("Error saving to localStorage:", error);
	}
}

export async function fetchConfig(): Promise<ProfileConfig> {
	// Check if Vercel environment is configured
	const hasVercel = await isVercelEnvironment();

	// Nếu không có Vercel, dùng localStorage
	if (!hasVercel) {
		const localConfig = getConfigFromLocalStorage();
		if (localConfig) {
			console.log("Using config from localStorage");
			return localConfig;
		}
		console.log("No config in localStorage, using default");
		return defaultConfig;
	}

	// Nếu có Vercel, thử fetch từ API với retry logic
	const result = await retryWithBackoff(
		async () => {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			try {
				const response = await fetch(API_BASE, {
					// Use cache: 'default' to respect Cache-Control headers
					// This enables browser caching with stale-while-revalidate pattern
					cache: "default",
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
				}

				const config = await response.json();

				if (!config || !config.user) {
					console.warn("API returned invalid config, using default");
					return defaultConfig;
				}

				// Lưu vào localStorage làm backup
				if (typeof window !== "undefined") {
					saveConfigToLocalStorage(config);
				}

				return config;
			} finally {
				clearTimeout(timeoutId);
			}
		},
		{
			maxRetries: 3,
			initialDelayMs: 100,
			maxDelayMs: 2000,
			shouldRetry: (error: any) => {
				// Retry on network errors and timeouts
				if (error instanceof TypeError) {
					return true;
				}
				if (error?.name === "AbortError") {
					return true;
				}
				if (error?.message?.includes("timeout")) {
					return true;
				}
				// Don't retry on invalid config
				return false;
			},
		},
	);

	if (result.success) {
		return result.data!;
	}

	// Fallback to localStorage
	const localConfig = getConfigFromLocalStorage();
	if (localConfig) {
		console.log("API failed after retries, using config from localStorage");
		return localConfig;
	}

	console.error("API failed after retries, using default config");
	return defaultConfig;
}

let isSaving = false;
let saveQueue: Array<{
	config: ProfileConfig;
	adminToken: string;
	resolve: (value: { success: boolean; localStorage_only?: boolean; message?: string }) => void;
	reject: (reason?: any) => void;
}> = [];

async function processSaveQueue() {
	if (isSaving || saveQueue.length === 0) return;

	isSaving = true;
	const { config, adminToken, resolve } = saveQueue.shift()!;

	// Check if Vercel environment is configured
	const hasVercel = await isVercelEnvironment();

	// Nếu không có Vercel, chỉ lưu vào localStorage
	if (!hasVercel) {
		try {
			saveConfigToLocalStorage(config);
			console.log("Config saved to localStorage");
			resolve({ success: true, localStorage_only: true });
		} catch (error) {
			console.error("Error saving to localStorage:", error);
			resolve({
				success: false,
				message: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			isSaving = false;
			setTimeout(() => processSaveQueue(), 100);
		}
		return;
	}

	// Nếu có Vercel, lưu vào API với retry logic
	const result = await retryWithBackoff(
		async () => {
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
				throw new Error(error.message || error.error || "Failed to save config");
			}

			return response.json();
		},
		{
			maxRetries: 3,
			initialDelayMs: 100,
			maxDelayMs: 2000,
			shouldRetry: (error: any) => {
				// Retry on network errors
				if (error instanceof TypeError) {
					return true;
				}
				// Retry on server errors
				if (error?.status >= 500) {
					return true;
				}
				// Retry on rate limit
				if (error?.status === 429) {
					return true;
				}
				// Don't retry on auth errors
				if (error?.status === 401) {
					return false;
				}
				return false;
			},
		},
	);

	try {
		if (result.success) {
			const apiResult = result.data!;
			// Lưu backup vào localStorage
			if (typeof window !== "undefined") {
				saveConfigToLocalStorage(config);
			}
			if (apiResult.localStorage_only) {
				console.warn("Upstash rate limit reached:", apiResult.message);
				resolve({
					success: true,
					localStorage_only: true,
					message: apiResult.message,
				});
			} else {
				resolve({ success: true });
			}
		} else {
			console.error("Error saving config to API after retries:", result.lastError);
			resolve({
				success: false,
				message: result.lastError instanceof Error ? result.lastError.message : "Unknown error",
			});
		}
	} catch (error) {
		console.error("Error processing save result:", error);
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
	adminToken: string,
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
	const result = await retryWithBackoff(() => fetch(API_BASE, { cache: "default" }), {
		maxRetries: 2,
		initialDelayMs: 50,
		maxDelayMs: 1000,
	});

	if (!result.success) {
		return false;
	}

	return result.data!.ok;
}
