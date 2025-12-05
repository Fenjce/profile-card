import { getFileSize } from "./imageUtils";

export async function processVideo(
  file: File,
  maxSizeMB: number = 10
): Promise<string> {
  return new Promise((resolve, reject) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const fileSizeMB = file.size / (1024 * 1024);

    // If file is already small enough, just convert
    if (file.size <= maxSizeBytes) {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => reject(new Error("Failed to read video file"));
      reader.readAsDataURL(file);
      return;
    }

    // Need to compress video - try MediaRecorder compression
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder || !(video as any).captureStream) {
        URL.revokeObjectURL(objectUrl);
        // Fallback: just check size and convert
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const base64Size = base64.length;
          const binarySize = (base64Size * 3) / 4;

          if (binarySize > maxSizeBytes) {
            reject(
              new Error(
                `Video quá lớn (${fileSizeMB.toFixed(
                  2
                )} MB). Trình duyệt không hỗ trợ nén tự động. Vui lòng nén video trước khi upload hoặc chọn video nhỏ hơn ${maxSizeMB} MB.`
              )
            );
            return;
          }

          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read video file"));
        reader.readAsDataURL(file);
        return;
      }

      // Try compression with MediaRecorder
      const stream = (video as any).captureStream();
      const chunks: Blob[] = [];
      let currentBitrate = 2000000; // Start with 2Mbps
      let attempt = 0;
      const maxAttempts = 5;

      const tryCompress = () => {
        // Clear previous chunks
        chunks.length = 0;

        // Determine MIME type (prefer webm with vp9, fallback to webm with vp8)
        let mimeType = "video/webm;codecs=vp9";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm;codecs=vp8";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/webm";
          }
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: currentBitrate,
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const blobSize = blob.size;

          if (blobSize <= maxSizeBytes || attempt >= maxAttempts) {
            // Success or max attempts reached
            const reader = new FileReader();
            reader.onload = (event) => {
              URL.revokeObjectURL(objectUrl);
              resolve(event.target?.result as string);
            };
            reader.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              reject(new Error("Failed to read compressed video"));
            };
            reader.readAsDataURL(blob);
          } else {
            // Still too large, reduce bitrate and try again
            attempt++;
            currentBitrate = Math.max(500000, Math.floor(currentBitrate * 0.7)); // Reduce by 30%
            video.currentTime = 0; // Reset video position
            tryCompress();
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Lỗi khi nén video. Vui lòng thử lại."));
        };

        // Play and record
        video.currentTime = 0;
        video.play();
        mediaRecorder.start();

        // Stop recording after video ends or 60 seconds max
        const stopRecording = () => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            video.pause();
            video.currentTime = 0;
          }
        };

        video.addEventListener("ended", stopRecording, { once: true });
        const timeoutId = setTimeout(stopRecording, 60000); // 60 seconds max

        // Clean up timeout when recording stops
        const originalStop = mediaRecorder.stop.bind(mediaRecorder);
        mediaRecorder.stop = () => {
          clearTimeout(timeoutId);
          originalStop();
        };
      };

      tryCompress();
    };

    video.onerror = (e) => {
      console.error("Video load error:", e);
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error("Không thể tải video. Vui lòng kiểm tra định dạng file.")
      );
    };
  });
}

export function getMediaSize(data: string | File): string {
  if (typeof data === "string") {
    const base64Size = data.length;
    const binarySize = (base64Size * 3) / 4;
    return getFileSize(binarySize);
  }
  return getFileSize(data.size);
}
