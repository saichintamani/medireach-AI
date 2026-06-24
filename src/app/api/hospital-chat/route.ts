import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const { message, diagnosis, history, locationCoordinates } = await req.json();

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

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const reply = chatCompletion.choices[0].message.content || "I am currently unable to process your request.";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "I am experiencing network difficulties reaching the medical database. Please ensure your Groq API key is valid." });
  }
}
