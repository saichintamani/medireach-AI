import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const systemPrompt = `You are the MediReach AI X Symptom Intelligence Agent.
The user is providing a health-related query or symptom: "${prompt}"

Your job is to act as a world-class Explainable AI.
Return ONLY a valid JSON object matching this schema:
{
  "riskLevel": "string (Low, Moderate, High, Critical)",
  "potentialCauses": ["string", "string"],
  "nextActions": ["string", "string"],
  "reasoning": "string (Explain WHY you assigned this risk and causes based on their symptoms)"
}
Do not use markdown blocks, just return raw JSON.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Clean markdown formatting if present
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const config = JSON.parse(cleanJson);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error generating agent response:', error);
    return NextResponse.json({ 
      riskLevel: "Unknown", 
      potentialCauses: ["System unavailable"], 
      nextActions: ["Please try again later"],
      reasoning: "The orchestrator agent failed to connect to the LLM backend."
    }, { status: 500 });
  }
}
