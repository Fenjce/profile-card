# Git Guide

## Xóa tất cả commit và chỉ giữ lại commit cuối

Khi bạn muốn xóa toàn bộ lịch sử commit và bắt đầu lại với trạng thái hiện tại:

### Các bước thực hiện:

```bash
# 1. Tạo một nhánh mới không có lịch sử
git checkout --orphan new-branch

# 2. Thêm tất cả các file hiện tại
git add -A

# 3. Tạo commit đầu tiên
git commit -m "Initial commit"

# 4. Xóa nhánh cũ (thường là main hoặc master)
git branch -D main

# 5. Đổi tên nhánh hiện tại thành main
git branch -m main

# 6. Force push lên remote (nếu cần)
git push -f origin main
```

### Lưu ý quan trọng:

- ⚠️ Lệnh này sẽ **xóa hoàn toàn** lịch sử commit cũ
- ⚠️ Nếu đang làm việc nhóm, cần thông báo cho mọi người vì họ sẽ phải clone lại repo
- ⚠️ Nên backup trước khi thực hiện
- ⚠️ Force push (`-f`) sẽ ghi đè lên remote repository

### Cách an toàn hơn (với backup):

```bash
# Tạo tag backup trước
git tag backup-before-reset

# Sau đó mới thực hiện các bước trên
```

### Khôi phục nếu cần:

```bash
# Nếu đã tạo tag backup, có thể quay lại
git checkout backup-before-reset
```

## Không commit những file không cần thiết

### Sử dụng .gitignore

File `.gitignore` giúp Git bỏ qua các file/folder không cần commit. Đặt file này ở thư mục gốc của project.

#### Ví dụ .gitignore cho Next.js project:

```gitignore
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
```

### Các pattern thường dùng:

```gitignore
# Ignore file cụ thể
config.json

# Ignore tất cả file có extension
*.log
*.tmp

# Ignore folder
node_modules/
dist/

# Ignore file trong tất cả thư mục
**/*.log

# Ngoại lệ (không ignore)
!important.log
```

### Xóa file đã commit nhưng giờ muốn ignore:

```bash
# Xóa file khỏi Git nhưng giữ lại trên máy
git rm --cached filename

# Xóa folder khỏi Git nhưng giữ lại trên máy
git rm -r --cached foldername

# Sau đó commit
git commit -m "Remove ignored files"
```

### Kiểm tra file nào sẽ bị ignore:

```bash
# Kiểm tra một file cụ thể
git check-ignore -v filename

# Xem tất cả file bị ignore
git status --ignored
```

### Tips:

- Luôn thêm `.gitignore` ngay từ đầu project
- Không commit file nhạy cảm như `.env`, API keys, passwords
- Không commit file build như `node_modules/`, `dist/`, `.next/`
- Không commit file IDE như `.vscode/`, `.idea/`

## Cấu hình Git Push mặc định

### Thiết lập push tự động lên nhánh hiện tại

Để không phải gõ `git push origin main` mỗi lần, chỉ cần gõ `git push`:

```bash
# Cấu hình push mặc định cho nhánh hiện tại
git config --global push.default current

# Hoặc cấu hình cho từng repo
git config push.default current
```

### Thiết lập upstream tự động

Khi push lần đầu, Git sẽ tự động thiết lập upstream:

```bash
# Cấu hình tự động set upstream
git config --global push.autoSetupRemote true
```

### Workflow đơn giản hóa

Sau khi cấu hình, workflow của bạn sẽ như sau:

```bash
# 1. Thêm tất cả thay đổi
git add .

# 2. Commit với message
git commit -m "your message"

# 3. Push (không cần chỉ định origin và branch)
git push
```

### Alias để làm việc nhanh hơn

Tạo các alias để gõ lệnh nhanh hơn:

```bash
# Cấu hình alias
git config --global alias.ac '!git add . && git commit -m'
git config --global alias.acp '!git add . && git commit -m "$1" && git push'

# Sử dụng:
git ac "your message"        # add + commit
git acp "your message"       # add + commit + push
```

### Script nhanh (Windows)

Tạo file `quick-push.bat` trong thư mục project:

```batch
@echo off
git add .
git commit -m "%*"
git push
echo.
echo ✅ Pushed successfully!
pause
```

Sử dụng:

```bash
quick-push "your commit message"
```

### Script nhanh (PowerShell)

Tạo file `quick-push.ps1`:

```powershell
param([string]$message = "Update")

git add .
git commit -m $message
git push

Write-Host "`n✅ Pushed successfully!" -ForegroundColor Green
```

Sử dụng:

```powershell
.\quick-push.ps1 "your message"
# hoặc
.\quick-push.ps1  # sẽ dùng message mặc định "Update"
```

### Kiểm tra cấu hình hiện tại

```bash
# Xem tất cả cấu hình
git config --list

# Xem cấu hình push
git config push.default
git config push.autoSetupRemote
```

### Các tùy chọn push.default

```bash
# current - push nhánh hiện tại lên nhánh cùng tên (khuyến nghị)
git config --global push.default current

# simple - push nhánh hiện tại lên upstream (mặc định)
git config --global push.default simple

# upstream - push lên nhánh upstream đã cấu hình
git config --global push.default upstream

# matching - push tất cả nhánh có tên trùng
git config --global push.default matching
```

### Tips:

- ✅ Dùng `push.default current` để đơn giản nhất
- ✅ Bật `push.autoSetupRemote true` để tự động setup upstream
- ✅ Tạo alias hoặc script để làm việc nhanh hơn
- ⚠️ Luôn kiểm tra `git status` trước khi commit
- ⚠️ Viết commit message có ý nghĩa, tránh "update", "fix"
