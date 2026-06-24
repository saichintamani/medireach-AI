import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message, diagnosis, history, locationCoordinates } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are the MediReach AI Hospital Assistant.
      The patient has just been diagnosed with: ${JSON.stringify(diagnosis)}.
      
      User's exact geolocation coordinates: ${locationCoordinates ? JSON.stringify(locationCoordinates) : "Not provided"}.
      
      If the user's location coordinates are provided, you MUST automatically analyze those coordinates (Latitude and Longitude) to determine their real-world city/region, and instantly recommend 2-3 top-tier specialized hospitals for their specific condition in that exact area. (You can use realistic mock hospitals if needed, but they must sound extremely professional and geographically accurate to the coordinates if possible).
      
      If the user has NOT provided coordinates, ask them for their city or zip code.
      
      Previous conversation history:
      ${JSON.stringify(history)}
      
      User's latest message: ${message}
      
      Respond directly to the user as the AI assistant:
    `;

    const result = await model.generateContent(prompt);
    
    return NextResponse.json({ reply: result.response.text() });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "I am experiencing network difficulties reaching the medical database. Please try again." });
  }
}
