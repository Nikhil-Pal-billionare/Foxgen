import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";


const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    console.log("▶️ Video-plan API called");

    const body = await req.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // Use 2.0 to avoid the 404 version mismatch
      contents: [{
        role: "user",
        parts: [{
          text: `You are an AI video planner. 
          From the user input: "${input}", generate a final script and logical scenes.
          Return ONLY valid JSON.`
        }]
      }],
      config: {
        // This forces the model to return a JSON object without markdown backticks
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            finalScript: { type: "string" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sceneText: { type: "string" },
                  footageType: { type: "string" }
                },
                required: ["sceneText", "footageType"]
              }
            }
          },
          required: ["finalScript", "scenes"]
        }
      }
    });

  
    const result = typeof response.text === 'string' ? JSON.parse(response.text) : response.text;

    console.log("✅ Video plan generated successfully");
    return NextResponse.json(result);

  } catch (err: any) {
    console.error("🔥 Video-plan error:", err);
    return NextResponse.json(
      { error: "Video planning failed", details: err.message },
      { status: 500 }
    );
  }
}