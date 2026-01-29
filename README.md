# 👤 Profile Card

Ứng dụng thẻ hồ sơ cá nhân hiện đại với giao diện đẹp mắt và tính năng quản lý nội dung linh hoạt.

## ✨ Tính năng

**📋 Hiển thị hồ sơ**

- Thẻ hồ sơ cá nhân với avatar, tên, chức danh và tiểu sử
- 🌓 Chế độ sáng/tối tự động
- 📱 Giao diện responsive trên mọi thiết bị

**📸 Quản lý Stories**

- ➕ Tạo, chỉnh sửa và xóa stories
- 🖼️ Hiển thị ảnh và mô tả cho mỗi story
- ⏰ Tự động xóa stories hết hạn

**🔗 Liên kết Xã Hội**

- 🌐 Kết nối đến các nền tảng xã hội
- 🎨 Hiển thị biểu tượng tùy chỉnh
- 📲 Modal hiển thị chi tiết liên kết

**ℹ️ Thông tin Chi Tiết**

- 📞 Hiển thị thông tin liên hệ đầy đủ
- ✏️ Quản lý thông tin từ admin panel
- 🔄 Cập nhật thông tin theo thời gian thực

**🔐 Quản lý Admin**

- 🔑 Đăng nhập bảo mật
- 📝 Chỉnh sửa thông tin hồ sơ
- 📚 Quản lý stories và liên kết xã hội
- 📊 Xem lịch sử truy cập

**📈 Theo dõi Truy cập**

- 📍 Ghi lại thông tin khách truy cập
- 🗺️ Phát hiện vị trí địa lý
- 💻 Phân loại thiết bị (Mobile, Tablet, Desktop)

## 🛠️ Công nghệ

Xây dựng với Next.js 14, React 18, TypeScript và các công nghệ hiện đại khác.

## 📋 Yêu cầu

Node.js 18+ và npm/yarn

## 🚀 Cài đặt

```bash
npm install
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🔑 Biến Môi Trường

Để sử dụng đầy đủ tính năng, cấu hình các biến môi trường sau:

- `UPSTASH_REDIS_REST_URL` - URL Redis từ Upstash
- `UPSTASH_REDIS_REST_TOKEN` - Token Redis từ Upstash
- `NEXT_PUBLIC_HUGGINGFACE_API_KEY` - API key từ Hugging Face (tùy chọn)

Nếu không cấu hình, ứng dụng sẽ sử dụng localStorage làm mặc định.

## 🌍 Triển khai

Ứng dụng được tối ưu hóa để triển khai trên Vercel. Chỉ cần kết nối repository và Vercel sẽ tự động build và deploy.

## 📄 License

Private
