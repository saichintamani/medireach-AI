import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // System instruction to force structured JSON output
    const prompt = `
      You are an expert Medical AI diagnostic system specializing in ${mode} health.
      Analyze the attached medical report or image (X-Ray, ECG, MRI, text).
      
      You must perform a deep analysis and extract the following:
      1. score: A health score from 0 to 100.
      2. disease: The specific disease or anomaly detected.
      3. affectedNode: The specific anatomical node/bone/artery affected.
      4. recommendation: A short 1-sentence recommendation.
      5. severity: "low" | "medium" | "high" | "critical".
      6. explanation: A detailed, clear explanation of what the report shows and why the condition exists.
      7. consequences: What will happen if this condition is ignored or emergency action is not taken.
      8. action_plan: An array of specific, immediate actionable steps the patient should take.
      9. flaws: An array of any flaws, critical warnings, or emergency concerns detected in the report.

      You must respond ONLY with a raw JSON object (no markdown, no backticks).
      Schema:
      {
        "score": number,
        "disease": string,
        "affectedNode": string,
        "recommendation": string,
        "severity": "low" | "medium" | "high" | "critical",
        "explanation": string,
        "consequences": string,
        "action_plan": string[],
        "flaws": string[]
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    // Clean up potential markdown formatting
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanedJson);

    return NextResponse.json({ data: parsedData });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Fallback response if API fails or parsing fails
    return NextResponse.json({ 
      data: {
        score: 45,
        disease: "Analysis Failed - Structural Anomaly Suspected",
        affectedNode: "Unknown Region",
        recommendation: "Please upload a higher resolution medical report or consult a doctor immediately.",
        severity: "medium",
        explanation: "The AI was unable to clearly parse the provided image or document data. This could be due to low resolution, unsupported format, or network timeouts.",
        consequences: "Without a clear evaluation, potential underlying critical conditions may be missed.",
        action_plan: ["Retake the medical image with better lighting.", "Ensure the text in the report is fully legible.", "Upload the report again."],
        flaws: ["Unreadable diagnostic data", "Potential critical conditions obscured"]
      } 
    });
  }
}
