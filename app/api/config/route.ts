import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { ProfileConfig } from "@/lib/types";
import { profileConfig as defaultConfig } from "@/lib/config";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const CONFIG_KEY = "profile_config";
const REDIS_TIMEOUT = 5000; // 5 seconds

// Helper: Tạo Redis client từ env vars
function getRedisClient(): Redis | null {
	try {
		console.log("[Config] Checking Redis connection...");
		console.log("[Config] UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL ? "SET" : "NOT SET");
		console.log("[Config] UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "SET" : "NOT SET");
		console.log("[Config] KV_REST_API_URL:", process.env.KV_REST_API_URL ? "SET" : "NOT SET");
		console.log("[Config] KV_REST_API_TOKEN:", process.env.KV_REST_API_TOKEN ? "SET" : "NOT SET");

		// Ưu tiên: Thử dùng Redis.fromEnv() - tự động đọc từ UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN
		if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
			console.log("[Config] Using UPSTASH env vars");
			try {
				return Redis.fromEnv();
			} catch {
				return new Redis({
					url: process.env.UPSTASH_REDIS_REST_URL,
					token: process.env.UPSTASH_REDIS_REST_TOKEN,
				});
			}
		}

		// Fallback: Thử các env var khác
		const url = process.env.KV_REST_API_URL || process.env.KV_REDIS_URL || process.env.KV_URL;
		const token = process.env.KV_REST_API_TOKEN || process.env.KV_REDIS_TOKEN || process.env.KV_TOKEN;

		if (url && token) {
			console.log("[Config] Using KV env vars");
			let finalUrl = url;
			if (url.startsWith("redis://") || url.startsWith("rediss://")) {
				try {
					const parsed = new URL(url);
					if (parsed.hostname.includes("upstash.io")) {
						finalUrl = `https://${parsed.hostname}`;
					}
				} catch {
					// Ignore parse errors
				}
			}

			return new Redis({ url: finalUrl, token });
		}

		console.log("[Config] No Redis credentials found");
		return null;
	} catch {
		console.log("[Config] Error creating Redis client");
		return null;
	}
}

// Helper: Tạo timeout promise
function createTimeoutPromise<T>(timeout: number = REDIS_TIMEOUT): Promise<T> {
	return new Promise<T>((_, reject) => {
		setTimeout(() => reject(new Error("Redis timeout")), timeout);
	});
}

// Helper: Lấy admin credentials từ Redis hoặc defaultConfig
async function getAdminCredentials(redis: Redis | null): Promise<{ username: string; password: string }> {
	if (!redis) {
		return {
			username: defaultConfig.admin.username,
			password: defaultConfig.admin.password,
		};
	}

	try {
		const savedConfig = await Promise.race([redis.get<ProfileConfig>(CONFIG_KEY), createTimeoutPromise<ProfileConfig | null>()]);

		// Chỉ dùng credentials từ Redis nếu có đầy đủ
		if (savedConfig?.admin?.username && savedConfig?.admin?.password) {
			return {
				username: savedConfig.admin.username,
				password: savedConfig.admin.password,
			};
		}

		// Nếu Redis có config nhưng không có admin credentials, log warning
		if (savedConfig && (!savedConfig.admin || !savedConfig.admin.username || !savedConfig.admin.password)) {
			console.warn("Config in Redis exists but missing admin credentials, using default");
		}
	} catch (error) {
		console.error("Error fetching admin credentials from Redis:", error);
		// Fallback to default on error
	}

	// Fallback về default config chỉ khi Redis không có config hoặc lỗi
	return {
		username: defaultConfig.admin.username,
		password: defaultConfig.admin.password,
	};
}

// Helper: Kiểm tra xem error có phải là rate limit/quota không
function isRateLimitError(error: any): boolean {
	const errorMessage = (error?.message || String(error) || "").toLowerCase();
	const rateLimitKeywords = [
		"rate limit",
		"too many requests",
		"quota",
		"daily limit",
		"limit exceeded",
		"429",
		"timeout",
		"connection",
		"econnrefused",
		"econnreset",
		"ratelimited",
	];

	return rateLimitKeywords.some((keyword) => errorMessage.includes(keyword));
}

/**
 * GET /api/config
 * Retrieves profile configuration from Redis or returns default config
 *
 * Error Handling:
 * - Gracefully handles Redis connection failures
 * - Returns default config as fallback
 * - Logs warnings for debugging
 * - Sets cache headers for all response paths
 */
export async function GET() {
	console.log("[Config GET] Request received");
	try {
		const redis = getRedisClient();
		console.log("[Config GET] Redis client:", redis ? "CONNECTED" : "NOT CONNECTED");

		if (!redis) {
			console.warn("[Config GET] Redis not configured, returning default config");
			const response = NextResponse.json(defaultConfig);
			// Add cache headers for default config
			response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
			return response;
		}

		try {
			const config = (await Promise.race([
				redis.get<ProfileConfig>(CONFIG_KEY),
				createTimeoutPromise<ProfileConfig | null>(),
			])) as ProfileConfig | null;

			// Kiểm tra xem config có hợp lệ không
			if (config && config.user) {
				// Kiểm tra xem có phải là default config không (có thể do lỗi trước đó)
				const isDefaultConfig = config.user.name === defaultConfig.user.name && config.user.title === defaultConfig.user.title;

				if (isDefaultConfig) {
					console.warn("[Config GET] Config in Redis is default config, might be corrupted. Returning it anyway.");
				}

				const response = NextResponse.json(config);
				// Add cache headers: cache for 60 seconds, allow stale content for 5 minutes
				response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
				return response;
			}

			// Nếu config không hợp lệ hoặc null, trả về default
			console.warn("[Config GET] No valid config found in Redis, returning default config");
			const response = NextResponse.json(defaultConfig);
			// Add cache headers for default config
			response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
			return response;
		} catch (redisError) {
			console.error("[Config GET] Error fetching config from Redis:", redisError);
			const response = NextResponse.json(defaultConfig);
			// Add cache headers even on error
			response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
			return response;
		}
	} catch (error) {
		console.error("[Config GET] Unexpected error:", error);
		const response = NextResponse.json(defaultConfig);
		response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
		return response;
	}
}

/**
 * PUT /api/config
 * Updates profile configuration in Redis with authentication
 *
 * Error Handling:
 * - Validates authentication header format
 * - Verifies credentials against admin credentials
 * - Validates request body structure
 * - Handles Redis connection failures
 * - Implements retry logic for transient failures
 * - Logs all errors for debugging
 */
export async function PUT(request: NextRequest) {
	try {
		// Kiểm tra authentication header
		const authHeader = request.headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			console.warn("[Config PUT] Missing or invalid authorization header");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Decode token
		let username: string, password: string;
		try {
			const decoded = atob(authHeader.replace("Bearer ", ""));
			const parts = decoded.split(":");
			// Token format: username:password:timestamp
			// Chỉ cần username và password, bỏ qua timestamp
			if (parts.length < 2) {
				console.warn("[Config PUT] Invalid token format: insufficient parts");
				return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
			}
			[username, password] = parts;
			// Nếu có timestamp (parts.length >= 3), bỏ qua nó
		} catch (error) {
			console.error("[Config PUT] Error decoding token:", error);
			return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
		}

		// Lấy Redis client (dùng lại cho cả auth và save)
		const redis = getRedisClient();

		// Verify credentials với admin credentials từ Redis hoặc defaultConfig
		let adminUsername: string, adminPassword: string;
		try {
			const credentials = await getAdminCredentials(redis);
			adminUsername = credentials.username;
			adminPassword = credentials.password;
		} catch (error) {
			console.error("[Config PUT] Error fetching admin credentials:", error);
			return NextResponse.json({ error: "Failed to verify credentials" }, { status: 500 });
		}

		// Debug logging (chỉ trong development)
		if (process.env.NODE_ENV === "development") {
			console.log("[Config PUT] Auth check:", {
				providedUsername: username,
				providedPassword: password ? "***" : undefined,
				adminUsername,
				adminPassword: adminPassword ? "***" : undefined,
				match: username === adminUsername && password === adminPassword,
			});
		}

		if (username !== adminUsername || password !== adminPassword) {
			console.error("[Config PUT] Invalid credentials provided");
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		// Parse request body
		let config: ProfileConfig;
		try {
			config = await request.json();
		} catch (error) {
			console.error("[Config PUT] Invalid JSON in request body:", error);
			return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
		}

		// Validate request body structure
		if (!config?.user) {
			console.error("[Config PUT] Invalid config structure: missing user field");
			return NextResponse.json({ error: "Invalid config structure" }, { status: 400 });
		}

		// Đảm bảo config có đầy đủ admin credentials
		if (!config.admin || !config.admin.username || !config.admin.password) {
			console.error("[Config PUT] Config missing admin credentials");
			return NextResponse.json({ error: "Config must include admin credentials" }, { status: 400 });
		}

		// Lưu vào Redis
		if (!redis) {
			console.error("[Config PUT] Redis not configured");
			return NextResponse.json(
				{
					error: "Redis not configured. Please connect Upstash Redis database.",
				},
				{ status: 503 },
			);
		}

		try {
			// Retry logic: thử lại 3 lần nếu lỗi
			let lastError: any = null;
			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					await Promise.race([redis.set(CONFIG_KEY, config), createTimeoutPromise<never>()]);
					// Thành công, return ngay
					console.log("[Config PUT] Config saved successfully");
					return NextResponse.json({ success: true, config });
				} catch (retryError: any) {
					lastError = retryError;
					console.warn(`[Config PUT] Attempt ${attempt + 1} failed:`, retryError?.message);

					// Nếu không phải rate limit, thử lại sau 500ms
					if (!isRateLimitError(retryError) && attempt < 2) {
						await new Promise((resolve) => setTimeout(resolve, 500));
						continue;
					}
					// Nếu là rate limit hoặc đã thử 3 lần, break
					break;
				}
			}

			// Xử lý rate limit/quota errors sau khi retry
			if (isRateLimitError(lastError)) {
				console.warn("[Config PUT] Upstash rate limit/quota exceeded after retries:", lastError?.message);
				return NextResponse.json({
					success: true,
					config,
					localStorage_only: true,
					message: "Upstash quota/rate limit reached. Please try again later.",
				});
			}

			console.error("[Config PUT] Error saving config to Redis after retries:", lastError);
			return NextResponse.json(
				{
					error: "Failed to save config to Redis",
					message: lastError?.message || "Unknown error",
				},
				{ status: 500 },
			);
		} catch (error: any) {
			// Handle unexpected errors
			console.error("[Config PUT] Unexpected error in save operation:", error);
			return NextResponse.json({ error: "Failed to save config", message: error?.message }, { status: 500 });
		}
	} catch (error: any) {
		console.error("[Config PUT] Unexpected error:", error);
		return NextResponse.json({ error: "Failed to save config", message: error?.message }, { status: 500 });
	}
}

// POST - Cập nhật config (fallback)
export async function POST(request: NextRequest) {
	return PUT(request);
}
