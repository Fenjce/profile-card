import { NextRequest, NextResponse } from "next/server";
import { LogEntry } from "@/lib/types";
import { detectLocation } from "@/lib/locationUtils";

const LOG_KEY = "visitor_logs";
const MAX_LOGS = 100; // Giới hạn 100 log gần nhất

/**
 * Helper: Kiểm tra xem có Vercel KV không
 */
function hasVercelKV(): boolean {
	return !!(process.env.KV_REST_API_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_REST_URL);
}

/**
 * Helper: Lazy load kv client chỉ khi cần
 */
let kvClient: any = null;
async function getKVClient(): Promise<any> {
	if (!hasVercelKV()) return null;
	if (kvClient) return kvClient;

	try {
		const { kv } = await import("@vercel/kv");
		kvClient = kv;
		return kv;
	} catch (error) {
		console.error("[Logs] Failed to load Vercel KV:", error);
		return null;
	}
}

/**
 * Helper: Detect device type from user agent
 */
function getDeviceType(userAgent: string): string {
	if (!userAgent) return "Unknown";

	if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
		return "Mobile";
	} else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
		return "Tablet";
	}
	return "Desktop";
}

/**
 * GET /api/logs
 * Retrieves visitor logs from Vercel KV
 *
 * Error Handling:
 * - Gracefully handles missing KV configuration
 * - Returns empty logs array as fallback
 * - Logs errors for debugging
 */
export async function GET() {
	try {
		const kv = await getKVClient();
		if (!kv) {
			console.warn("[Logs GET] Vercel KV not available, returning empty logs");
			return NextResponse.json({ logs: [] });
		}

		try {
			const logs = (await (kv.get as any)(LOG_KEY)) || [];
			console.log("[Logs GET] Retrieved logs successfully");
			return NextResponse.json({ logs });
		} catch (error) {
			console.error("[Logs GET] Error fetching logs from KV:", error);
			return NextResponse.json({ logs: [] });
		}
	} catch (error) {
		console.error("[Logs GET] Unexpected error:", error);
		return NextResponse.json({ logs: [] });
	}
}

/**
 * POST /api/logs
 * Records visitor logs with location detection
 *
 * Error Handling:
 * - Validates request body
 * - Handles location detection failures gracefully
 * - Handles KV connection failures
 * - Logs errors for debugging
 */
export async function POST(request: NextRequest) {
	try {
		const kv = await getKVClient();
		if (!kv) {
			console.warn("[Logs POST] Vercel KV not available, skipping log save");
			return NextResponse.json({ success: true });
		}

		// Parse request body
		let body: any;
		try {
			body = await request.json().catch(() => ({}));
		} catch (error) {
			console.error("[Logs POST] Error parsing request body:", error);
			return NextResponse.json({ success: false }, { status: 400 });
		}

		const type = body.type || "visit";
		const username = body.username;

		// Extract IP and user agent
		const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
		const userAgent = request.headers.get("user-agent") || "Unknown";

		if (!ip || ip === "Unknown") {
			console.warn("[Logs POST] Could not determine client IP");
		}

		const cleanIp = ip.split(",")[0].trim();
		const deviceType = getDeviceType(userAgent);

		// Detect location (with timeout and error handling)
		let locationData = null;
		try {
			locationData = await detectLocation(cleanIp);
		} catch (error) {
			console.warn("[Logs POST] Location detection failed:", error);
			// Continue without location data
		}

		try {
			// Lấy logs hiện tại
			const logs = (await (kv.get as any)(LOG_KEY)) || [];

			// Tìm log với IP trùng VÀ device type trùng
			const existingLogIndex = logs.findIndex((log: any) => {
				const logDeviceType = getDeviceType(log.userAgent || "");
				return log.ip === cleanIp && logDeviceType === deviceType;
			});

			if (existingLogIndex !== -1) {
				// Nếu tìm thấy IP + Device trùng, cập nhật timestamp và di chuyển lên đầu
				const existingLog = logs[existingLogIndex];
				existingLog.timestamp = new Date().toISOString();
				existingLog.type = type;
				existingLog.username = username;
				existingLog.userAgent = userAgent;

				// Cập nhật location nếu có
				if (locationData) {
					existingLog.city = locationData.city;
					existingLog.region = locationData.region;
					existingLog.country = locationData.country;
					existingLog.timezone = locationData.timezone;
					existingLog.isp = locationData.isp;

					// Format location string
					const locationParts = [locationData.city];
					if (locationData.region) locationParts.push(locationData.region);
					locationParts.push(locationData.country);
					existingLog.location = locationParts.join(", ");
				}

				// Xóa log cũ và thêm vào đầu
				logs.splice(existingLogIndex, 1);
				logs.unshift(existingLog);
			} else {
				// Tạo log entry mới (IP mới hoặc device type khác)
				let location = undefined;
				if (locationData) {
					const locationParts = [locationData.city];
					if (locationData.region) locationParts.push(locationData.region);
					locationParts.push(locationData.country);
					location = locationParts.join(", ");
				}

				const logEntry: LogEntry = {
					timestamp: new Date().toISOString(),
					ip: cleanIp,
					userAgent,
					type,
					username,
					city: locationData?.city,
					region: locationData?.region,
					country: locationData?.country,
					timezone: locationData?.timezone,
					isp: locationData?.isp,
					location,
				};

				// Thêm log mới vào đầu
				logs.unshift(logEntry);
			}

			// Giới hạn số lượng logs
			if (logs.length > MAX_LOGS) {
				logs.splice(MAX_LOGS);
			}

			// Lưu lại
			try {
				await kv.set(LOG_KEY, logs);
				console.log("[Logs POST] Log saved successfully");
			} catch (error) {
				console.error("[Logs POST] Error saving logs to KV:", error);
				return NextResponse.json({ success: false }, { status: 500 });
			}

			return NextResponse.json({ success: true });
		} catch (error) {
			console.error("[Logs POST] Error processing logs:", error);
			return NextResponse.json({ success: false }, { status: 500 });
		}
	} catch (error) {
		console.error("[Logs POST] Unexpected error:", error);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}

/**
 * DELETE /api/logs
 * Clears all visitor logs
 *
 * Error Handling:
 * - Handles KV connection failures
 * - Logs errors for debugging
 */
export async function DELETE() {
	try {
		const kv = await getKVClient();
		if (!kv) {
			console.warn("[Logs DELETE] Vercel KV not available, skipping log delete");
			return NextResponse.json({ success: true });
		}

		try {
			// Xóa tất cả logs
			await kv.del(LOG_KEY);
			console.log("[Logs DELETE] All logs deleted successfully");
			return NextResponse.json({ success: true });
		} catch (error) {
			console.error("[Logs DELETE] Error deleting logs from KV:", error);
			return NextResponse.json({ success: false }, { status: 500 });
		}
	} catch (error) {
		console.error("[Logs DELETE] Unexpected error:", error);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}
