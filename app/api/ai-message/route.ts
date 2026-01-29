import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai-message
 * Generates AI messages for themes using Hugging Face API
 *
 * Error Handling:
 * - Validates request body structure
 * - Handles API failures with proper status codes
 * - Logs errors for debugging
 * - Returns user-friendly error messages
 */
export async function POST(request: NextRequest) {
	try {
		// Validate request body
		let requestBody: any;
		try {
			requestBody = await request.json();
		} catch (error) {
			console.error("[AI Message] Invalid JSON in request body:", error);
			return NextResponse.json({ error: "Invalid request body. Expected valid JSON." }, { status: 400 });
		}

		const { theme, apiKey } = requestBody;

		// Validate required fields
		if (!theme || !theme.id) {
			console.error("[AI Message] Missing required field: theme.id");
			return NextResponse.json({ error: "Missing required field: theme.id" }, { status: 400 });
		}

		// Create prompt based on theme
		let prompt = "";

		try {
			if (theme.id === "birthday" && theme.startDate) {
				const birthYear = theme.startDate.split("-")[2];
				const currentYear = new Date().getFullYear();
				const age = currentYear - parseInt(birthYear);
				prompt = `Tạo một câu chúc sinh nhật ${age} tuổi bằng tiếng Việt, ngắn gọn và ý nghĩa. Bao gồm emoji phù hợp.`;
			} else {
				const seasonNames = {
					spring: "mùa xuân",
					summer: "mùa hè",
					autumn: "mùa thu",
					winter: "mùa đông",
					"lunar-new-year": "Tết Nguyên Đán",
					christmas: "Giáng Sinh",
				};

				const seasonName = seasonNames[theme.id as keyof typeof seasonNames] || theme.name;
				prompt = `Tạo một câu chúc ${seasonName} bằy tiếng Việt, ngắn gọn và ý nghĩa. Bao gồm emoji phù hợp.`;
			}
		} catch (error) {
			console.error("[AI Message] Error creating prompt:", error);
			return NextResponse.json({ error: "Failed to create prompt from theme data" }, { status: 400 });
		}

		// Call Hugging Face API from server
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (apiKey) {
			headers["Authorization"] = `Bearer ${apiKey}`;
		}

		let response: Response;
		try {
			response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
				method: "POST",
				headers,
				body: JSON.stringify({
					inputs: prompt,
					parameters: {
						max_length: 100,
						temperature: 0.8,
						do_sample: true,
					},
				}),
			});
		} catch (error) {
			console.error("[AI Message] Network error calling Hugging Face API:", error);
			return NextResponse.json({ error: "Failed to connect to AI service. Please try again later." }, { status: 503 });
		}

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error");
			console.error(`[AI Message] Hugging Face API error: ${response.status}`, errorText);

			if (response.status === 401) {
				return NextResponse.json({ error: "Invalid API key provided" }, { status: 401 });
			} else if (response.status === 429) {
				return NextResponse.json({ error: "AI service rate limit exceeded. Please try again later." }, { status: 429 });
			} else if (response.status >= 500) {
				return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again later." }, { status: 503 });
			}

			return NextResponse.json({ error: "Failed to generate message from AI service" }, { status: 500 });
		}

		let result: any;
		try {
			result = await response.json();
		} catch (error) {
			console.error("[AI Message] Failed to parse Hugging Face response:", error);
			return NextResponse.json({ error: "Invalid response from AI service" }, { status: 502 });
		}

		let generatedMessage = result[0]?.generated_text || "";

		// Clean up the generated message
		generatedMessage = generatedMessage.replace(prompt, "").trim();

		if (!generatedMessage) {
			console.warn("[AI Message] Empty response from AI service");
			return NextResponse.json({ error: "AI service returned empty message" }, { status: 502 });
		}

		return NextResponse.json({ message: generatedMessage });
	} catch (error) {
		console.error("[AI Message] Unexpected error:", error);
		return NextResponse.json({ error: "An unexpected error occurred while generating the message" }, { status: 500 });
	}
}
