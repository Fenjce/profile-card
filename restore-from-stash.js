// Restore tính năng mới từ stash
const fs = require("fs");
const path = require("path");

// Tạo thư mục backup từ stash
const backupDir = "./backup-from-stash";

const filesToRestore = [
  "lib/aiMessageGenerator.ts",
  "components/ui/SeasonalMessage.tsx",
  "components/modals/SeasonalThemeModal.tsx",
  "lib/messages.ts",
];

console.log("📦 Preparing to restore features from stash...");
console.log("Files to restore:", filesToRestore);
console.log("\n✅ Ready to restore! Run: git stash pop");
console.log("Then run: node restore-from-stash.js");
