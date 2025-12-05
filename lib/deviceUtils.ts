// Device detection utilities

export interface DeviceInfo {
  device: "Mobile" | "Tablet" | "Desktop";
  browser: string;
  os: string;
  deviceIcon: string;
}

export function getDeviceType(
  userAgent: string
): "Mobile" | "Tablet" | "Desktop" {
  if (!userAgent) return "Desktop";

  if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
    return "Mobile";
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    return "Tablet";
  }
  return "Desktop";
}

export function parseUserAgent(ua?: string): DeviceInfo {
  if (!ua) {
    return {
      device: "Desktop",
      browser: "Unknown",
      os: "Unknown",
      deviceIcon: "💻",
    };
  }

  // Detect OS
  let os = "Unknown";
  if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
  else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
  else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace("_", ".")}` : "macOS";
  } else if (ua.includes("Android")) {
    const match = ua.match(/Android (\d+\.?\d*)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    const match = ua.match(/OS (\d+_\d+)/);
    os = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
  } else if (ua.includes("Linux")) os = "Linux";

  // Detect Browser
  let browser = "Unknown";
  if (ua.includes("Edg/")) {
    const match = ua.match(/Edg\/(\d+)/);
    browser = match ? `Edge ${match[1]}` : "Edge";
  } else if (ua.includes("Chrome/") && !ua.includes("Edg")) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = match ? `Chrome ${match[1]}` : "Chrome";
  } else if (ua.includes("Firefox/")) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = match ? `Firefox ${match[1]}` : "Firefox";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    const match = ua.match(/Version\/(\d+)/);
    browser = match ? `Safari ${match[1]}` : "Safari";
  } else if (ua.includes("Opera") || ua.includes("OPR/")) {
    browser = "Opera";
  }

  // Detect Device Type
  const device = getDeviceType(ua);

  // Get device icon
  const deviceIcon =
    device === "Mobile" ? "📱" : device === "Tablet" ? "📱" : "💻";

  return { device, browser, os, deviceIcon };
}
