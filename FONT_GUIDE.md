# 🎨 Hướng dẫn thay đổi Font cho Website

## 📍 Vị trí cần sửa

### File 1: `app/layout.tsx`

Thêm import Google Font vào `<head>` (dòng 23, sau `<html>`):

```tsx
<html lang="vi" suppressHydrationWarning>
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body className="light-mode" suppressHydrationWarning>
```

### File 2: `app/globals.css`

Thay đổi font-family (dòng 37-39):

```css
html,
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  /* ... các dòng khác giữ nguyên */
}
```

---

## 🎯 Danh sách Font đề xuất

### 1. **Inter** ⭐ (Khuyên dùng - Modern, Clean)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 2. **Poppins** (Friendly, Rounded)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 3. **Montserrat** (Elegant, Professional)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 4. **Nunito** (Soft, Friendly)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 5. **Raleway** (Elegant, Thin)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Raleway", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 6. **Work Sans** (Clean, Modern)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 7. **DM Sans** (Geometric, Clean)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 8. **Outfit** (Modern, Rounded)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 9. **Plus Jakarta Sans** (Modern, Professional)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
  sans-serif;
```

---

### 10. **Manrope** (Geometric, Clean)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 11. **Rubik** (Rounded, Friendly)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 12. **Space Grotesk** (Modern, Tech)

**Google Font Link:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**CSS:**

```css
font-family: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

## 📝 Ví dụ hoàn chỉnh với font Inter

### File: `app/layout.tsx`

```tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import DisableZoom from "@/components/ui/DisableZoom";
import { ToastProvider } from "@/components/providers/ToastProvider";

export const metadata: Metadata = {
  title: "Profile Card",
  description: "Beautiful profile card with stories",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="light-mode" suppressHydrationWarning>
        <DisableZoom />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

### File: `app/globals.css` (dòng 36-40)

```css
html,
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  height: 100vh;
  width: 100vw;
  /* ... các dòng khác giữ nguyên */
}
```

---

## 💡 Tips

1. **Khuyên dùng:** Inter, Poppins, hoặc Montserrat - 3 font này rất phổ biến và đẹp
2. **Nếu muốn thử nhiều font:** Chỉ cần thay đổi 2 chỗ (layout.tsx và globals.css)
3. **Performance:** Chỉ import 1 font tại 1 thời điểm để trang load nhanh hơn
4. **Fallback fonts:** Luôn giữ `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` để đảm bảo có font dự phòng

---

## 🎨 Preview các font

- **Inter**: Hiện đại, dễ đọc, phù hợp mọi loại website
- **Poppins**: Bo tròn, thân thiện, phù hợp profile cá nhân
- **Montserrat**: Thanh lịch, chuyên nghiệp, phù hợp portfolio
- **Nunito**: Mềm mại, dễ chịu, phù hợp blog cá nhân
- **Raleway**: Mảnh mai, thanh lịch, phù hợp creative portfolio
