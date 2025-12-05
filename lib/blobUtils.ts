export async function uploadToBlob(
  data: string | File,
  filename: string
): Promise<string> {
  let file: File;

  if (typeof data === "string") {
    if (!data.startsWith("data:")) throw new Error("Invalid data format");
    const response = await fetch(data);
    const blob = await response.blob();
    const mimeType = data.split(";")[0].split(":")[1];
    file = new File([blob], filename, { type: mimeType });
  } else {
    file = data;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", filename);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.error || "Upload failed";

    if (
      response.status === 503 ||
      errorMessage.includes("No token found") ||
      errorMessage.includes("token")
    ) {
      console.warn("Vercel Blob token not found, using base64 instead");
      if (typeof data === "string") return data;
      throw new Error(
        "Cannot convert File to base64, please configure BLOB_READ_WRITE_TOKEN"
      );
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.url;
}

export const isBase64 = (str: string): boolean =>
  str.startsWith("data:image") || str.startsWith("data:video");

export const shouldUploadToBlob = (str: string): boolean => isBase64(str);
