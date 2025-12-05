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

## Xóa Deployments trong GitHub

### Cách 1: Xóa qua GitHub Web Interface

1. Vào repository trên GitHub
2. Click vào tab **"Environments"** (bên cạnh Settings)
3. Click vào environment muốn xóa (ví dụ: Production)
4. Click nút **"Delete environment"** ở góc phải
5. Xác nhận xóa

### Cách 2: Xóa từng deployment

1. Vào repository trên GitHub
2. Click vào **"Deployments"** (ở sidebar bên phải)
3. Click vào deployment muốn xóa
4. Click nút **"Delete deployment"**
5. Xác nhận xóa

⚠️ **Lưu ý:** Phải xóa từng deployment một, GitHub không có tính năng xóa hàng loạt qua UI.

### Cách 3: Xóa hàng loạt bằng GitHub CLI

```bash
# Cài đặt GitHub CLI (nếu chưa có)
# Windows: winget install GitHub.cli
# hoặc tải từ: https://cli.github.com/

# Đăng nhập
gh auth login

# Xóa tất cả deployments của một environment
gh api repos/:owner/:repo/deployments \
  --jq '.[] | .id' | \
  xargs -I {} gh api -X DELETE repos/:owner/:repo/deployments/{}
```

### Cách 4: Xóa bằng GitHub API (PowerShell)

```powershell
# Thay YOUR_TOKEN, OWNER, REPO
$token = "YOUR_GITHUB_TOKEN"
$owner = "OWNER"
$repo = "REPO"

# Lấy danh sách deployments
$deployments = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/deployments" -Headers @{Authorization = "token $token"}

# Xóa từng deployment
foreach ($deployment in $deployments) {
    # Đặt deployment về inactive trước
    Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$owner/$repo/deployments/$($deployment.id)/statuses" -Headers @{Authorization = "token $token"} -Body '{"state":"inactive"}' -ContentType "application/json"

    # Xóa deployment
    Invoke-RestMethod -Method Delete -Uri "https://api.github.com/repos/$owner/$repo/deployments/$($deployment.id)" -Headers @{Authorization = "token $token"}
}
```

### Tạo GitHub Token:

1. Vào **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token"**
3. Chọn quyền: `repo` và `repo_deployments`
4. Copy token và dùng trong script

### Tips:

- Deployments từ Vercel/Netlify sẽ tự động tạo lại khi push code mới
- Nên giữ lại một vài deployments gần nhất để rollback nếu cần
- Xóa environment sẽ xóa tất cả deployments trong đó
