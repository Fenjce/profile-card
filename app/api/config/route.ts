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
    // Ưu tiên: Thử dùng Redis.fromEnv() - tự động đọc từ UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
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
    const url =
      process.env.KV_REST_API_URL ||
      process.env.KV_REDIS_URL ||
      process.env.KV_URL;
    const token =
      process.env.KV_REST_API_TOKEN ||
      process.env.KV_REDIS_TOKEN ||
      process.env.KV_TOKEN;

    if (url && token) {
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

    return null;
  } catch {
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
async function getAdminCredentials(
  redis: Redis | null
): Promise<{ username: string; password: string }> {
  if (!redis) {
    return {
      username: defaultConfig.admin.username,
      password: defaultConfig.admin.password,
    };
  }

  try {
    const savedConfig = await Promise.race([
      redis.get<ProfileConfig>(CONFIG_KEY),
      createTimeoutPromise<ProfileConfig | null>(),
    ]);

    // Chỉ dùng credentials từ Redis nếu có đầy đủ
    if (savedConfig?.admin?.username && savedConfig?.admin?.password) {
      return {
        username: savedConfig.admin.username,
        password: savedConfig.admin.password,
      };
    }

    // Nếu Redis có config nhưng không có admin credentials, log warning
    if (
      savedConfig &&
      (!savedConfig.admin ||
        !savedConfig.admin.username ||
        !savedConfig.admin.password)
    ) {
      console.warn(
        "Config in Redis exists but missing admin credentials, using default"
      );
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

// GET - Lấy config (public, ai cũng xem được)
export async function GET() {
  const redis = getRedisClient();

  if (!redis) {
    console.warn("Redis not configured, returning default config");
    return NextResponse.json(defaultConfig);
  }

  try {
    const config = (await Promise.race([
      redis.get<ProfileConfig>(CONFIG_KEY),
      createTimeoutPromise<ProfileConfig | null>(),
    ])) as ProfileConfig | null;

    // Kiểm tra xem config có hợp lệ không
    if (config && config.user) {
      // Kiểm tra xem có phải là default config không (có thể do lỗi trước đó)
      const isDefaultConfig =
        config.user.name === defaultConfig.user.name &&
        config.user.title === defaultConfig.user.title;

      if (isDefaultConfig) {
        console.warn(
          "Config in Redis is default config, might be corrupted. Returning it anyway."
        );
      }

      return NextResponse.json(config);
    }

    // Nếu config không hợp lệ hoặc null, trả về default
    console.warn("No valid config found in Redis, returning default config");
    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error("Error fetching config from Redis:", error);
    return NextResponse.json(defaultConfig);
  }
}

// PUT - Cập nhật config (cần authentication)
export async function PUT(request: NextRequest) {
  try {
    // Kiểm tra authentication header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 401 }
        );
      }
      [username, password] = parts;
      // Nếu có timestamp (parts.length >= 3), bỏ qua nó
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    // Lấy Redis client (dùng lại cho cả auth và save)
    const redis = getRedisClient();

    // Verify credentials với admin credentials từ Redis hoặc defaultConfig
    const { username: adminUsername, password: adminPassword } =
      await getAdminCredentials(redis);

    // Debug logging (chỉ trong development)
    if (process.env.NODE_ENV === "development") {
      console.log("Auth check:", {
        providedUsername: username,
        providedPassword: password ? "***" : undefined,
        adminUsername,
        adminPassword: adminPassword ? "***" : undefined,
        match: username === adminUsername && password === adminPassword,
      });
    }

    if (username !== adminUsername || password !== adminPassword) {
      console.error("Invalid credentials:", {
        providedUsername: username,
        adminUsername,
        passwordsMatch: password === adminPassword,
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Parse và validate request body
    const config: ProfileConfig = await request.json();
    if (!config?.user) {
      return NextResponse.json(
        { error: "Invalid config structure" },
        { status: 400 }
      );
    }

    // Đảm bảo config có đầy đủ admin credentials
    if (!config.admin || !config.admin.username || !config.admin.password) {
      return NextResponse.json(
        { error: "Config must include admin credentials" },
        { status: 400 }
      );
    }

    // Lưu vào Redis
    if (!redis) {
      return NextResponse.json(
        {
          error: "Redis not configured. Please connect Upstash Redis database.",
        },
        { status: 500 }
      );
    }

    try {
      // Retry logic: thử lại 3 lần nếu lỗi
      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await Promise.race([
            redis.set(CONFIG_KEY, config),
            createTimeoutPromise<never>(),
          ]);
          // Thành công, return ngay
          return NextResponse.json({ success: true, config });
        } catch (retryError: any) {
          lastError = retryError;
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
        console.warn(
          "Upstash rate limit/quota exceeded after retries:",
          lastError?.message
        );
        return NextResponse.json({
          success: true,
          config,
          localStorage_only: true,
          message: "Upstash quota/rate limit reached. Please try again later.",
        });
      }

      console.error("Error saving config to Redis after retries:", lastError);
      return NextResponse.json(
        {
          error: "Failed to save config to Redis",
          message: lastError?.message || "Unknown error",
        },
        { status: 500 }
      );
    } catch (error: any) {
      // Handle unexpected errors
      console.error("Unexpected error in PUT handler:", error);
      return NextResponse.json(
        { error: "Failed to save config", message: error?.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save config", message: error?.message },
      { status: 500 }
    );
  }
}

// POST - Cập nhật config (fallback)
export async function POST(request: NextRequest) {
  return PUT(request);
}
