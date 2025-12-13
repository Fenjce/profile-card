import { ProfileConfig } from "./types";

export const profileConfig: ProfileConfig = {
  user: {
    name: "null",
    title: "Lỏ Developer",
    content:
      "A kiddo who love to code and often do things that no one asks me to do but I find fun.",
    avatar:
      "https://i.pinimg.com/1200x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg",
  },

  information: [
    {
      label: "Email",
      value: "@gmail.com",
      type: "email",
    },
    {
      label: "Số điện thoại",
      value: "+84 123 456 789",
      type: "phone",
    },
    {
      label: "Địa chỉ",
      value: "Hà Nội, Việt Nam",
      type: "address",
    },
  ],

  social: [
    {
      name: "Facebook",
      url: "https://facebook.com/yourprofile",
      icon: "facebook",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/yourprofile",
      icon: "instagram",
    },
    {
      name: "Discord",
      url: "https://discord.com/yourprofile",
      icon: "discord",
    },
    {
      name: "GitHub",
      url: "https://github.com/yourprofile",
      icon: "github",
    },
  ],

  admin: {
    username: "admin",
    password: "admin",
  },

  stories: [],

  seasonalThemes: [
    {
      id: "spring",
      name: "Mùa Xuân",
      enabled: true,
      startDate: "03-01",
      endDate: "05-31",
      messages: ["🌸 Chào mừng mùa xuân! Hoa nở rộ khắp nơi"],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 182, 193, 0.9) 0%, rgba(144, 238, 144, 0.9) 100%)",
      textColor: "#1e293b",
    },
  ],
  stories: [
    {
      createdAt: "09/12/2025-13:54:56",
      content: "Join my discord or contact me: Fenjce #2025",
      image:
        "https://lz6lqtpmbu3sjwrh.public.blob.vercel-storage.com/story-image-1765263292357-9nJN53B4shnmdcLkU8KqiPKJQmYy6F.jpg",
      mediaSize: "1.07 MB",
      expiresIn: -1,
      pinned: true,
    },
    {
      createdAt: "01/12/2025-00:00:00",
      content: "my dream car",
      image:
        "https://lz6lqtpmbu3sjwrh.public.blob.vercel-storage.com/story-image-1764743541656-aCitRZyGhyYSCPpXEsltneFh7BXdrw.jpg",
      mediaSize: "68.11 KB",
      expiresIn: -1,
      pinned: false,
    },
  ],

  seasonalThemes: [
    {
      id: "spring",
      name: "Mùa Xuân",
      enabled: true,
      startDate: "03-01", // 1 tháng 3
      endDate: "05-31", // 31 tháng 5
      messages: ["🌸 Chào mừng mùa xuân! Hoa nở rộ khắp nơi"],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 182, 193, 0.9) 0%, rgba(144, 238, 144, 0.9) 100%)",
      textColor: "#1e293b",
    },
    {
      id: "summer",
      name: "Mùa Hè",
      enabled: true,
      startDate: "06-01", // 1 tháng 6
      endDate: "08-31", // 31 tháng 8
      messages: ["☀️ Mùa hè rực rỡ! Tận hưởng những ngày nắng đẹp"],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%)",
      textColor: "#1e293b",
    },
    {
      id: "autumn",
      name: "Mùa Thu",
      enabled: true,
      startDate: "09-01", // 1 tháng 9
      endDate: "11-30", // 30 tháng 11
      messages: ["🍂 Mùa thu lãng mạn! Lá vàng rơi khắp phố phường"],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 140, 0, 0.9) 0%, rgba(139, 69, 19, 0.9) 100%)",
      textColor: "#ffffff",
    },
    {
      id: "winter",
      name: "Mùa Đông",
      enabled: true,
      startDate: "12-01", // 1 tháng 12
      endDate: "02-28", // 28 tháng 2
      messages: ["❄️ Mùa đông lạnh giá! Tuyết trắng phủ khắp nơi"],
      backgroundColor:
        "linear-gradient(135deg, rgba(173, 216, 230, 0.9) 0%, rgba(240, 248, 255, 0.9) 100%)",
      textColor: "#1e293b",
    },
    {
      id: "lunar-new-year",
      name: "Tết Nguyên Đán",
      enabled: true,
      startDate: "01-20", // Tùy chỉnh theo năm
      endDate: "02-05", // Tùy chỉnh theo năm
      messages: ["🧧 Chúc Mừng Năm Mới! Vạn sự như ý, an khang thịnh vượng!"],
      backgroundColor:
        "linear-gradient(135deg, rgba(220, 20, 60, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)",
      textColor: "#ffffff",
    },
    {
      id: "christmas",
      name: "Giáng Sinh",
      enabled: true,
      startDate: "12-20", // 20 tháng 12
      endDate: "12-26", // 26 tháng 12
      messages: [
        "🎄 Chúc Mừng Giáng Sinh! Chúc bạn có một mùa lễ ấm áp và hạnh phúc!",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(220, 20, 60, 0.9) 0%, rgba(34, 139, 34, 0.9) 100%)",
      textColor: "#ffffff",
    },
    {
      id: "birthday",
      name: "Sinh Nhật",
      enabled: true,
      startDate: "02-15", // Sinh nhật thật
      endDate: "02-15", // Chỉ 1 ngày
      messages: [
        "🎂 Chúc Mừng Sinh Nhật! Chúc bạn tuổi mới nhiều sức khỏe và hạnh phúc!",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 192, 203, 0.9) 0%, rgba(255, 20, 147, 0.9) 100%)",
      textColor: "#ffffff",
    },
  ],
};
