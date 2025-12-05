import { Story } from "./types";
import { Messages } from "./messages";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year}-${hours}:${minutes}:${seconds}`;
}

export function parseDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === "") return null;

  // Hỗ trợ format mới với giây: dd/mm/yyyy-hh:mm:ss
  const newFormatWithSeconds = dateString.match(
    /^(\d{2})\/(\d{2})\/(\d{4})-(\d{2}):(\d{2}):(\d{2})$/
  );
  if (newFormatWithSeconds) {
    const [, day, month, year, hours, minutes, seconds] = newFormatWithSeconds;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );
    return isNaN(date.getTime()) ? null : date;
  }

  // Hỗ trợ format cũ không có giây: dd/mm/yyyy-hh:mm
  const newFormatMatch = dateString.match(
    /^(\d{2})\/(\d{2})\/(\d{4})-(\d{2}):(\d{2})$/
  );
  if (newFormatMatch) {
    const [, day, month, year, hours, minutes] = newFormatMatch;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      0 // Giây = 0 cho format cũ
    );
    return isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export function normalizeStory(story: Story): Story & { createdAt: string } {
  if (story.createdAt) {
    const createdAtDate = parseDate(story.createdAt);
    if (createdAtDate) {
      return { ...story, createdAt: createdAtDate.toISOString() };
    }
  }

  const now = Date.now();
  let millisecondsAgo = 0;

  if (story.daysAgo !== undefined) {
    millisecondsAgo = story.daysAgo * 24 * 60 * 60 * 1000;
  } else if (story.hoursAgo !== undefined) {
    millisecondsAgo = story.hoursAgo * 60 * 60 * 1000;
  } else if (story.minutesAgo !== undefined) {
    millisecondsAgo = story.minutesAgo * 60 * 1000;
  }

  const createdAt = new Date(now - millisecondsAgo).toISOString();

  return { ...story, createdAt };
}

export function getTimeAgo(story: Story): string {
  if (!story.createdAt) return Messages.TIME_JUST_NOW;

  const now = new Date();
  const createdDate = new Date(story.createdAt);

  // Calculate difference in milliseconds
  const diff = now.getTime() - createdDate.getTime();

  // For very recent times (less than 1 minute)
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) {
    return Messages.TIME_JUST_NOW;
  }

  // For minutes (less than 1 hour)
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${Messages.TIME_MINUTES} ${Messages.TIME_AGO(
      ""
    )}`.trim();
  }

  // For hours (less than 1 day)
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${Messages.TIME_HOURS} ${Messages.TIME_AGO("")}`.trim();
  }

  // Calculate years difference
  let years = now.getFullYear() - createdDate.getFullYear();
  let months = now.getMonth() - createdDate.getMonth();
  let days = now.getDate() - createdDate.getDate();

  // Adjust if days are negative
  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Adjust if months are negative
  if (months < 0) {
    years--;
    months += 12;
  }

  // Display years if >= 1 year
  if (years > 0) {
    return `${years} năm trước`;
  }

  // Display months if >= 1 month
  if (months > 0) {
    return `${months} tháng trước`;
  }

  // Calculate total days for weeks
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Display weeks if >= 7 days
  if (totalDays >= 7) {
    const weeks = Math.floor(totalDays / 7);
    return `${weeks} tuần trước`;
  }

  // Display days
  return `${totalDays} ${Messages.TIME_DAYS} ${Messages.TIME_AGO("")}`.trim();
}

function isStoryExpired(story: Story & { createdAt: string }): boolean {
  const now = Date.now();
  const createdAt = new Date(story.createdAt).getTime();

  // Nếu expiresIn là null hoặc -1, story không bao giờ hết hạn
  if (story.expiresIn === null || story.expiresIn === -1) return false;

  const expiresInHours = story.expiresIn !== undefined ? story.expiresIn : 24;
  const expiresAt = createdAt + expiresInHours * 60 * 60 * 1000;

  return now >= expiresAt;
}

export function getActiveStories(stories: Story[]): Story[] {
  const normalized = stories
    .map(normalizeStory)
    .filter((story) => !isStoryExpired(story));

  return normalized.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
}

export function cleanupExpiredStories(stories: Story[]): Story[] {
  return stories.filter((story) => {
    const normalized = normalizeStory(story);
    return !isStoryExpired(normalized);
  });
}
