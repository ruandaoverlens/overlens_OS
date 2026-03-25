const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const MODEL = "doubao-seedream-4-0-250828";

export async function generateCoverImage(title: string): Promise<string | null> {
  if (!ARK_API_KEY) {
    console.error("[seedream] ARK_API_KEY not set");
    return null;
  }

  const prompt = buildPrompt(title);

  try {
    const res = await fetch(ARK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        size: "2K",
        sequential_image_generation: "disabled",
        stream: false,
        response_format: "url",
        watermark: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[seedream] API error:", res.status, text);
      return null;
    }

    const data = await res.json();
    const url = data?.data?.[0]?.url;

    if (!url) {
      console.error("[seedream] No image URL in response");
      return null;
    }

    return url;
  } catch (err) {
    console.error("[seedream] Request failed:", err);
    return null;
  }
}

function buildPrompt(title: string): string {
  return [
    "Abstract editorial cover image for a market research report titled:",
    `"${title}".`,
    "Dark moody atmosphere, deep black background,",
    "subtle geometric shapes, flowing light trails,",
    "data visualization aesthetic, minimal and elegant,",
    "cool blue and amber accent tones, cinematic lighting,",
    "no text, no letters, no words, no watermark.",
  ].join(" ");
}
