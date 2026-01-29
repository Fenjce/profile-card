import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/upload
 * Uploads files to Vercel Blob storage
 *
 * Error Handling:
 * - Validates environment configuration
 * - Validates request body and file
 * - Handles upload failures with proper status codes
 * - Logs errors for debugging
 * - Returns user-friendly error messages
 */
export async function POST(request: NextRequest) {
	try {
		// Validate token configuration
		const token = process.env.BLOB_READ_WRITE_TOKEN;
		if (!token) {
			console.error("[Upload] BLOB_READ_WRITE_TOKEN is not configured");
			return NextResponse.json(
				{
					error: "No token found",
					message: "BLOB_READ_WRITE_TOKEN is not configured. Please configure it in your environment variables.",
				},
				{ status: 503 }, // Service Unavailable
			);
		}

		// Parse form data
		let formData: FormData;
		try {
			formData = await request.formData();
		} catch (error) {
			console.error("[Upload] Error parsing form data:", error);
			return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
		}

		const file = formData.get("file") as File;
		const filename = formData.get("filename") as string;

		// Validate file
		if (!file) {
			console.warn("[Upload] No file provided in request");
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Validate file size (limit to 50MB)
		const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
		if (file.size > MAX_FILE_SIZE) {
			console.warn(`[Upload] File size exceeds limit: ${file.size} bytes`);
			return NextResponse.json(
				{ error: "File size exceeds maximum allowed size (50MB)" },
				{ status: 413 }, // Payload Too Large
			);
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		if (!allowedTypes.includes(file.type)) {
			console.warn(`[Upload] Invalid file type: ${file.type}`);
			return NextResponse.json(
				{ error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
				{ status: 415 }, // Unsupported Media Type
			);
		}

		try {
			const blob = await put(filename || file.name, file, {
				access: "public",
				addRandomSuffix: true,
				token: token,
			});

			console.log(`[Upload] File uploaded successfully: ${blob.url}`);
			return NextResponse.json({ url: blob.url });
		} catch (uploadError: any) {
			console.error("[Upload] Error uploading to Vercel Blob:", uploadError);

			// Handle specific upload errors
			if (uploadError.message?.includes("401") || uploadError.message?.includes("Unauthorized")) {
				return NextResponse.json({ error: "Authentication failed with Vercel Blob service" }, { status: 401 });
			} else if (uploadError.message?.includes("403") || uploadError.message?.includes("Forbidden")) {
				return NextResponse.json({ error: "Access denied to Vercel Blob service" }, { status: 403 });
			} else if (uploadError.message?.includes("quota") || uploadError.message?.includes("limit")) {
				return NextResponse.json(
					{ error: "Storage quota exceeded. Please try again later." },
					{ status: 507 }, // Insufficient Storage
				);
			}

			return NextResponse.json({ error: "Failed to upload file to storage service" }, { status: 500 });
		}
	} catch (error: any) {
		console.error("[Upload] Unexpected error:", error);
		return NextResponse.json({ error: "An unexpected error occurred during upload" }, { status: 500 });
	}
}
