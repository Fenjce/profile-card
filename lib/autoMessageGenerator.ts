import { SeasonalTheme } from "./types";
import { replaceAgeInMessage, calculateAge } from "./seasonalUtils";

// AI API endpoint for generating messages
const AI_API_URL =
  "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

export async function generateAIMessage(
  theme: SeasonalTheme,
  apiKey?: string
): Promise<string> {
  try {
    // Create prompt based on theme
    let prompt = "";
    let age = "";

    if (theme.id === "birthday" && theme.startDate) {
      age = calculateAge(theme.startDate).toString();
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

      const seasonName =
        seasonNames[theme.id as keyof typeof seasonNames] || theme.name;
      prompt = `Tạo một câu chúc ${seasonName} bằng tiếng Việt, ngắn gọn và ý nghĩa. Bao gồm emoji phù hợp.`;
    }

    // Use API key if provided, otherwise use free tier
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(AI_API_URL, {
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

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    let generatedMessage = result[0]?.generated_text || "";

    // Clean up the generated message
    generatedMessage = generatedMessage.replace(prompt, "").trim();

    // If AI generation fails or returns empty, use fallback
    if (!generatedMessage) {
      return getFallbackMessage(theme);
    }

    // Replace {age} for birthday if needed
    if (theme.id === "birthday" && age) {
      generatedMessage = generatedMessage.replace(/{age}/g, age);
    }

    return generatedMessage;
  } catch (error) {
    console.error("AI generation failed:", error);
    // Return fallback message if AI fails
    return getFallbackMessage(theme);
  }
}

function getFallbackMessage(theme: SeasonalTheme): string {
  // Fallback to existing messages if AI fails
  const randomMessage =
    theme.messages[Math.floor(Math.random() * theme.messages.length)];

  // Replace {age} for birthday theme
  if (theme.id === "birthday" && theme.startDate) {
    return replaceAgeInMessage(randomMessage, theme.startDate);
  }

  return randomMessage;
}

// For backward compatibility - try AI first, fallback to existing messages
export async function generateRandomMessage(
  theme: SeasonalTheme,
  apiKey?: string
): Promise<string> {
  // Try AI generation first
  return await generateAIMessage(theme, apiKey);
}
