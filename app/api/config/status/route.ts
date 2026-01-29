import { NextResponse } from "next/server";

/**
 * GET /api/config/status
 * Returns whether Vercel KV is configured
 * Used by client-side code to determine if it should call the API or use localStorage
 */
export async function GET() {
	const isConfigured = !!(
		(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
		(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
	);

	const response = NextResponse.json({
		isConfigured,
	});

	// Cache for 1 minute
	response.headers.set("Cache-Control", "public, max-age=60");

	return response;
}
