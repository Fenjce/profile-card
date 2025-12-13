export interface User {
  name: string;
  title: string;
  content: string;
  avatar: string;
  originalAvatar?: string; // Ảnh gốc chưa crop, dùng để edit lại
}

export interface InformationItem {
  label: string; // Tên hiển thị (ví dụ: "Email", "Số điện thoại")
  value: string; // Giá trị (ví dụ: "example@email.com", "+84 123 456 789")
  type: "email" | "phone" | "address" | "website" | "other"; // Loại thông tin
  link?: string; // Link tùy chỉnh (nếu có)
  hidden?: boolean; // Ẩn thông tin (hiển thị mờ ở trang chính)
}

export interface Social {
  name: string;
  url: string;
  icon: string;
  title?: string; // Tiêu đề hiển thị trong modal (optional)
  content?: string; // Nội dung hiển thị trong modal (optional)
  buttonText?: string; // Text của nút truy cập (optional)
}

export interface Story {
  // author và avatar không còn lưu trong story, tự động lấy từ config.user
  createdAt?: string; // Thời gian tạo (ISO string hoặc format khác như "2025-01-15 10:00:00")
  hoursAgo?: number; // Số giờ trước (tùy chọn, dễ dùng hơn)
  minutesAgo?: number; // Số phút trước (tùy chọn)
  daysAgo?: number; // Số ngày trước (tùy chọn)
  expiresIn?: number | null; // Số giờ hết hạn, -1 để không hết hạn
  pinned?: boolean; // Story được pin lên đầu
  content?: string;
  image?: string;
  video?: string;
  mediaSize?: string; // File size for display (e.g., "2.5 MB")
}

export interface SeasonalTheme {
  id: string;
  name: string;
  enabled: boolean;
  startDate: string; // MM-DD format
  endDate: string; // MM-DD format
  messages: string[]; // Array of messages
  backgroundColor?: string;
  textColor?: string;
}
export interface ProfileConfig {
  user: User;
  information: InformationItem[]; // Thông tin cá nhân
  social: Social[];
  admin: {
    username: string;
    password: string;
  };
  stories: Story[];
}

export interface LogEntry {
  timestamp: string;
  ip?: string;
  userAgent?: string;
  location?: string;
  type: "visit" | "login";
  username?: string;
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  isp?: string;
}
