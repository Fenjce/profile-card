import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { LogEntry } from "@/lib/types";
import { detectLocation } from "@/lib/locationUtils";

const LOG_KEY = "visitor_logs";
const MAX_LOGS = 100; // Giới hạn 100 log gần nhất

export async function GET() {
  try {
    const logs = (await kv.get<LogEntry[]>(LOG_KEY)) || [];
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ logs: [] });
  }
}

// Helper function to detect device type from user agent
function getDeviceType(userAgent: string): string {
  if (!userAgent) return "Unknown";

  if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
    return "Mobile";
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    return "Tablet";
  }
  return "Desktop";
}

export async function POST(request: NextRequest) {
  try {
    // Lấy thông tin từ request
    const body = await request.json().catch(() => ({}));
    const type = body.type || "visit";
    const username = body.username;

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "Unknown";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    const cleanIp = ip.split(",")[0].trim();
    const deviceType = getDeviceType(userAgent);

    // Detect location (with timeout)
    let locationData = null;
    try {
      locationData = await detectLocation(cleanIp);
    } catch (error) {
      console.error("Location detection failed:", error);
    }

    // Lấy logs hiện tại
    const logs = (await kv.get<LogEntry[]>(LOG_KEY)) || [];

    // Tìm log với IP trùng VÀ device type trùng
    const existingLogIndex = logs.findIndex((log) => {
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
        existingLog.country = locationData.country;
        existingLog.location = `${locationData.city}, ${locationData.country}`;
      }

      // Xóa log cũ và thêm vào đầu
      logs.splice(existingLogIndex, 1);
      logs.unshift(existingLog);
    } else {
      // Tạo log entry mới (IP mới hoặc device type khác)
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        ip: cleanIp,
        userAgent,
        type,
        username,
        city: locationData?.city,
        country: locationData?.country,
        location: locationData
          ? `${locationData.city}, ${locationData.country}`
          : undefined,
      };

      // Thêm log mới vào đầu
      logs.unshift(logEntry);
    }

    // Giới hạn số lượng logs
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS);
    }

    // Lưu lại
    await kv.set(LOG_KEY, logs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving log:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Xóa tất cả logs
    await kv.del(LOG_KEY);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting logs:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
