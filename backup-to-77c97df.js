// Backup tính năng mới trước khi checkout về 77c97df
const fs = require("fs");
const path = require("path");

const filesToBackup = [
  "lib/aiMessageGenerator.ts",
  "components/ui/SeasonalMessage.tsx",
  "components/modals/SeasonalThemeModal.tsx",
  "lib/messages.ts",
  "lib/types.ts", // Backup type changes
  "lib/config.ts", // Backup config changes
];

const backupDir = "./backup-77c97df";

// Tạo thư mục backup
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Backup từng file
filesToBackup.forEach((file) => {
  if (fs.existsSync(file)) {
    const backupPath = path.join(backupDir, file);
    const backupDirPath = path.dirname(backupPath);

    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    fs.copyFileSync(file, backupPath);
    console.log(`✅ Backed up: ${file}`);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log("\n🎉 Backup to 77c97df completed!");
