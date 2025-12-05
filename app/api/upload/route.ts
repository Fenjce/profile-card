import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra token trước khi xử lý
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { 
          error: "No token found",
          message: "BLOB_READ_WRITE_TOKEN is not configured. Please configure it in your environment variables."
        },
        { status: 503 } // Service Unavailable thay vì 500
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const filename = formData.get("filename") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const blob = await put(filename || file.name, file, {
      access: "public",
      addRandomSuffix: true,
      token: token, // Pass token explicitly
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    // Kiểm tra nếu lỗi do thiếu token
    if (error.message && error.message.includes("No token found")) {
      return NextResponse.json(
        { 
          error: "No token found",
          message: "BLOB_READ_WRITE_TOKEN is not configured. Please configure it in your environment variables."
        },
        { status: 503 }
      );
    }

    // Chỉ log error nếu không phải lỗi thiếu token
    if (!error.message?.includes("No token found")) {
      console.error("Upload error:", error);
    }
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

