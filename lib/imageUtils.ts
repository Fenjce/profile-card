export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        const ctx = canvas.getContext("2d", { willReadFrequently: false });
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Fill white background first to prevent black background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Check if compressed size is acceptable (max 10MB binary)
        // Base64 is ~33% larger than binary, so 10MB binary ≈ 13.3MB base64
        const maxBase64Size = 10 * 1024 * 1024 * 1.33; // ~13.3MB base64 for 10MB binary

        // Compress until under limit
        let isPngFormat = file.type === "image/png";
        let currentQuality = isPngFormat ? 1 : quality;
        let currentWidth = width;
        let currentHeight = height;
        let attempts = 0;
        let result = "";

        while (attempts < 10) {
          // Update canvas dimensions if needed
          if (
            currentWidth !== canvas.width ||
            currentHeight !== canvas.height
          ) {
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, currentWidth, currentHeight);
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          }

          // Convert to base64
          const outputFormat =
            isPngFormat && currentQuality === 1 ? "image/png" : "image/jpeg";
          const outputQuality =
            outputFormat === "image/jpeg" ? currentQuality : undefined;
          result = canvas.toDataURL(outputFormat, outputQuality);

          const base64Size = result.length;

          if (base64Size <= maxBase64Size) {
            break; // Success
          }

          // Still too large, reduce quality or dimensions
          if (attempts < 3) {
            // First 3 attempts: reduce quality
            currentQuality = Math.max(0.3, currentQuality - 0.15);
            if (isPngFormat && currentQuality < 1) {
              // Switch to JPEG for better compression
              isPngFormat = false;
            }
          } else {
            // After 3 attempts: reduce dimensions
            if (currentWidth > 800) {
              currentWidth = Math.max(800, Math.floor(currentWidth * 0.85));
              currentHeight = Math.max(800, Math.floor(currentHeight * 0.85));
            } else if (currentWidth > 600) {
              currentWidth = Math.max(600, Math.floor(currentWidth * 0.9));
              currentHeight = Math.max(600, Math.floor(currentHeight * 0.9));
            } else {
              // Already very small, just reduce quality to minimum
              currentQuality = 0.3;
            }
          }

          attempts++;
        }

        resolve(result);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export function getFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
