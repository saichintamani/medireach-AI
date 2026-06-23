import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    const systemPrompt = `You are the ultimate Medical Vision System Agent.
You will be provided with an image of a medical document (e.g. X-Ray, Lab Report, or Prescription).

Your job is to act as a Doctor-Level vision model.
Return ONLY a valid JSON object matching this schema:
{
  "documentType": "string (e.g. Chest X-Ray)",
  "primaryDiagnosis": "string (e.g. Possible Pneumonia)",
  "confidenceScore": "string (e.g. 91%)",
  "detectedAnomalies": ["string", "string"],
  "suggestedActions": ["string", "string"]
}
Do not use markdown blocks, just return raw JSON.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: "image/jpeg"
        }
      }
    ]);
    
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error scanning report:', error);
    return NextResponse.json({ 
      documentType: "Unknown", 
      primaryDiagnosis: "Error connecting to Vision OS.",
      confidenceScore: "0%",
      detectedAnomalies: [],
      suggestedActions: ["Please try uploading the report again."]
    }, { status: 500 });
  }
}
