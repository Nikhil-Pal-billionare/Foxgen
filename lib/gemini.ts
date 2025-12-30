import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/* =====================================================
   🖼️ IMAGE GENERATION (WORKING – DO NOT TOUCH)
===================================================== */
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

    return imageBytes;
  } catch (err) {
    console.error("🔴 GEMINI IMAGE ERROR:", err);
    throw err;
  }
}

/* =====================================================
   ✨ PROMPT ENHANCEMENT (FIXED)
===================================================== */
export async function enhanceWithGemini(prompt: string) {
  try {
    console.log("🟡 ENHANCING PROMPT:", prompt);

    const systemPrompt = `
You are an expert AI image prompt engineer.

Rewrite the user's prompt with:
- rich visual details
- lighting and atmosphere
- camera angle and realism
- artistic style

Return ONLY the enhanced prompt.
Do NOT add explanations.
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nUser prompt:\n${prompt}`,
            },
          ],
        },
      ],
    });

    const enhancedText =
      response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!enhancedText) {
      throw new Error("Empty response from Gemini");
    }

    console.log("🟢 ENHANCED PROMPT:", enhancedText.trim());

    return enhancedText.trim();
  } catch (err) {
    console.error("🔴 GEMINI PROMPT ENHANCE ERROR:", err);
    throw err;
  }
}
