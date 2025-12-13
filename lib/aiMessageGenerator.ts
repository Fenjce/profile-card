const API_URL =
  "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

const FALLBACKS = {
  spring: [
    "🌸 Mùa xuân tươi mới! Hạnh phúc nở rộ như hoa",
    "🌺 Xuân về mang theo niềm vui và hy vọng",
  ],
  summer: [
    "☀️ Mùa hè rực rỡ! Năng lượng tích cực tràn đầy",
    "🏖️ Hè vui vẻ! Những kỷ niệm đẹp đang chờ đón",
  ],
  autumn: [
    "🍂 Thu về lãng mạn! Sắc màu đẹp của cuộc sống",
    "🍁 Mùa thu yên bình! Thời gian để suy ngẫm",
  ],
  winter: [
    "❄️ Đông ấm áp! Tình người gần gũi hơn",
    "⛄ Mùa đông yên bình! Bình an trong từng khoảnh khắc",
  ],
  "lunar-new-year": [
    "🧧 Tết an khang! Phúc lộc đầy nhà",
    "🎊 Xuân mới tốt lành! Vạn sự như ý",
  ],
  christmas: [
    "🎄 Noel an lành! Yêu thương tràn ngập",
    "🎅 Giáng sinh vui vẻ! Niềm tin và hy vọng",
  ],
  birthday: [
    "🎂 Nay là sinh nhật tôi! Chúc bản thân luôn vui vẻ",
    "🎈 Sinh nhật của tôi đây! Mong có tất cả điều tốt đẹp",
  ],
};

const getRandomMessage = (seasonId: string) => {
  const messages =
    FALLBACKS[seasonId as keyof typeof FALLBACKS] || FALLBACKS.spring;
  return messages[Math.floor(Math.random() * messages.length)];
};

export async function generateSeasonalMessage(
  seasonId: string,
  seasonName: string,
  apiKey?: string
) {
  if (!apiKey) return getRandomMessage(seasonId);

  try {
    const prompts =
      seasonId === "birthday"
        ? [
            `Tạo lời chúc sinh nhật cá nhân bằng tiếng Việt, bắt đầu bằng "Nay là sinh nhật tôi", khoảng 10-15 từ:`,
          ]
        : [
            `Tạo lời chúc ${seasonName} ấm áp bằng tiếng Việt, khoảng 10-15 từ:`,
          ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompts[0],
        parameters: {
          max_length: 50,
          temperature: 0.8,
          do_sample: true,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    if (data?.[0]?.generated_text) {
      let text = data[0].generated_text
        .replace(prompts[0], "")
        .trim()
        .replace(/^\W+/, "")
        .replace(/\s+/g, " ");

      const emojis = {
        spring: "🌸",
        summer: "☀️",
        autumn: "🍂",
        winter: "❄️",
        "lunar-new-year": "🧧",
        christmas: "🎄",
        birthday: "🎂",
      };
      const emoji = emojis[seasonId as keyof typeof emojis] || "✨";

      if (!/^[\uD83C-\uDBFF][\uDC00-\uDFFF]/.test(text))
        text = `${emoji} ${text}`;
      return text;
    }
    throw new Error("No generated text");
  } catch (error) {
    console.error("AI Generation failed:", error);
    return getRandomMessage(seasonId);
  }
}

export async function generateMultipleMessages(
  seasonId: string,
  seasonName: string,
  count = 3,
  apiKey?: string
) {
  const messages = [];
  for (let i = 0; i < count; i++) {
    const message = await generateSeasonalMessage(seasonId, seasonName, apiKey);
    messages.push(message);
    if (i < count - 1) await new Promise((r) => setTimeout(r, 1000));
  }
  return messages;
}
