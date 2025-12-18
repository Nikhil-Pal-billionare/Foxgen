import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateImage(prompt: string) {
  try {
    console.log("🟡 GEMINI IMAGE PROMPT:", prompt);

    const response = await genAI.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
      },
    });

    console.log(
      "🟢 GEMINI RAW RESPONSE:",
      JSON.stringify(response, null, 2)
    );

    const imageBytes =
      response.generatedImages?.[0]?.image?.imageBytes;

    if (!imageBytes) {
      throw new Error("No imageBytes returned from Gemini");
    }

    // ✅ SINGLE, CLEAN RETURN
    return imageBytes;
  } catch (err) {
    console.error("🔴 GEMINI IMAGE ERROR:", err);
    throw err;
  }
}
