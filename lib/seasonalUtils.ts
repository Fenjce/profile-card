export function formatSeasonalThemeDate(
  dateStr: string,
  themeId?: string
): string {
  // Convert DD-MM or DD-MM-YYYY format to readable format
  const dateParts = dateStr.split("-");
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const dayNum = parseInt(dateParts[0]);
  const monthIndex = parseInt(dateParts[1]) - 1;
  const year = dateParts[2];

  // For birthday, show with birth year and calculate age
  if (themeId === "birthday" && year) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(year);
    return `${dayNum} ${monthNames[monthIndex]} ${year} (${age} tuổi)`;
  }

  return `${dayNum} ${monthNames[monthIndex]}`;
}

export function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Spring: March 1 - May 31
  if ((month === 3 && day >= 1) || month === 4 || (month === 5 && day <= 31)) {
    return "spring";
  }

  // Summer: June 1 - August 31
  if ((month === 6 && day >= 1) || month === 7 || (month === 8 && day <= 31)) {
    return "summer";
  }

  // Autumn: September 1 - November 30
  if (
    (month === 9 && day >= 1) ||
    month === 10 ||
    (month === 11 && day <= 30)
  ) {
    return "autumn";
  }

  // Winter: December 1 - February 28/29
  return "winter";
}

export function isDateInRange(startDate: string, endDate: string): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // Parse DD-MM or DD-MM-YYYY format
  const startParts = startDate.split("-");
  const endParts = endDate.split("-");

  const startDay = parseInt(startParts[0]);
  const startMonth = parseInt(startParts[1]);
  const endDay = parseInt(endParts[0]);
  const endMonth = parseInt(endParts[1]);

  // Handle year-crossing ranges (like winter: 01-12 to 28-02)
  if (startMonth > endMonth) {
    return (
      (currentMonth === startMonth && currentDay >= startDay) ||
      currentMonth > startMonth ||
      currentMonth < endMonth ||
      (currentMonth === endMonth && currentDay <= endDay)
    );
  }

  // Normal ranges within same year
  return (
    (currentMonth === startMonth && currentDay >= startDay) ||
    (currentMonth > startMonth && currentMonth < endMonth) ||
    (currentMonth === endMonth && currentDay <= endDay)
  );
}

export function calculateAge(birthDate: string): number {
  // Parse DD-MM-YYYY format
  const parts = birthDate.split("-");
  if (parts.length !== 3) return 0;

  const birthDay = parseInt(parts[0]);
  const birthMonth = parseInt(parts[1]);
  const birthYear = parseInt(parts[2]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - birthYear;

  // Check if birthday hasn't occurred this year yet
  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age;
}

export function replaceAgeInMessage(
  message: string,
  birthDate: string
): string {
  const age = calculateAge(birthDate);
  return message.replace(/{age}/g, age.toString());
}
