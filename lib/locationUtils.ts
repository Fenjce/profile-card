export interface LocationData {
  city: string;
  country: string;
  countryCode: string;
  query: string;
}

interface LocationCache {
  [ip: string]: {
    data: LocationData;
    timestamp: number;
  };
}

const locationCache: LocationCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const TIMEOUT_MS = 2000; // 2 seconds

// Clean up expired cache entries
function cleanupCache() {
  const now = Date.now();
  Object.keys(locationCache).forEach((ip) => {
    if (now - locationCache[ip].timestamp > CACHE_DURATION) {
      delete locationCache[ip];
    }
  });
}

export async function detectLocation(ip: string): Promise<LocationData | null> {
  // Check cache first
  if (locationCache[ip]) {
    const cached = locationCache[ip];
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    } else {
      delete locationCache[ip];
    }
  }

  // Skip detection for unknown/local IPs
  if (
    !ip ||
    ip === "Unknown" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("127.")
  ) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,query`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === "fail") {
      return null;
    }

    const locationData: LocationData = {
      city: data.city || "Unknown",
      country: data.country || "Unknown",
      countryCode: data.countryCode || "XX",
      query: data.query || ip,
    };

    // Cache the result
    locationCache[ip] = {
      data: locationData,
      timestamp: Date.now(),
    };

    // Cleanup old cache entries periodically
    if (Math.random() < 0.1) {
      cleanupCache();
    }

    return locationData;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`Location detection timeout for IP: ${ip}`);
    } else {
      console.error("Location detection error:", error);
    }
    return null;
  }
}
