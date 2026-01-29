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
      startDate: "01-03",
      endDate: "31-05",
      messages: [
        "Chào mừng mùa xuân! Hoa nở rộ khắp nơi",
        "Xuân về mang theo niềm vui và hy vọng",
        "Mùa xuân tươi mới! Hạnh phúc nở rộ như hoa",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 182, 193, 0.9) 0%, rgba(144, 238, 144, 0.9) 100%)",
      textColor: "#1e293b",
      icon: "🌸",
    },
    {
      id: "summer",
      name: "Mùa Hè",
      enabled: true,
      startDate: "01-06",
      endDate: "31-08",
      messages: [
        "Mùa hè rực rỡ! Tận hưởng những ngày nắng đẹp",
        "Hè vui vẻ! Những kỷ niệm đẹp đang chờ đón",
        "Mùa hè năng động! Tràn đầy sức sống",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%)",
      textColor: "#1e293b",
      icon: "☀️",
    },
    {
      id: "autumn",
      name: "Mùa Thu",
      enabled: true,
      startDate: "01-09",
      endDate: "30-11",
      messages: [
        "Mùa thu lãng mạn! Lá vàng rơi khắp phố phường",
        "Thu về yên bình! Sắc màu đẹp của cuộc sống",
        "Mùa thu thơ mộng! Thời gian để suy ngẫm",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 140, 0, 0.9) 0%, rgba(139, 69, 19, 0.9) 100%)",
      textColor: "#ffffff",
      icon: "🍂",
    },
    {
      id: "winter",
      name: "Mùa Đông",
      enabled: true,
      startDate: "01-12",
      endDate: "28-02",
      messages: [
        "Mùa đông lạnh giá! Tuyết trắng phủ khắp nơi",
        "Đông ấm áp! Tình người gần gũi hơn",
        "Mùa đông yên bình! Bình an trong từng khoảnh khắc",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(173, 216, 230, 0.9) 0%, rgba(240, 248, 255, 0.9) 100%)",
      textColor: "#1e293b",
      icon: "❄️",
    },
    {
      id: "lunar-new-year",
      name: "Tết Nguyên Đán",
      enabled: true,
      startDate: "20-01",
      endDate: "05-02",
      messages: [
        "Chúc Mừng Năm Mới! Vạn sự như ý, an khang thịnh vượng!",
        "Tết đến xuân về! Chúc năm mới nhiều may mắn",
        "Năm mới hạnh phúc! Gia đình sum vầy, sức khỏe dồi dào",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(220, 20, 60, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)",
      textColor: "#ffffff",
      icon: "🧧",
    },
    {
      id: "christmas",
      name: "Giáng Sinh",
      enabled: true,
      startDate: "20-12",
      endDate: "26-12",
      messages: [
        "Chúc Mừng Giáng Sinh! Chúc bạn có một mùa lễ ấm áp và hạnh phúc!",
        "Noel an lành! Niềm vui và yêu thương tràn ngập",
        "Giáng sinh ấm áp! Chúc mọi điều tốt đẹp đến với bạn",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(220, 20, 60, 0.9) 0%, rgba(34, 139, 34, 0.9) 100%)",
      textColor: "#ffffff",
      icon: "🎄",
    },
    {
      id: "birthday",
      name: "Sinh Nhật",
      enabled: true,
      startDate: "15-02-2001",
      endDate: "15-02-2001",
      messages: [
        "Chúc Mừng Sinh Nhật {age} tuổi! Chúc bạn tuổi mới nhiều sức khỏe và hạnh phúc!",
        "Sinh nhật vui vẻ! {age} tuổi rồi, một năm mới tràn đầy thành công",
        "Happy Birthday! {age} tuổi với những ước mơ thành hiện thực",
      ],
      backgroundColor:
        "linear-gradient(135deg, rgba(255, 192, 203, 0.9) 0%, rgba(255, 20, 147, 0.9) 100%)",
      textColor: "#ffffff",
      icon: "🎂",
    },
  ],
};
