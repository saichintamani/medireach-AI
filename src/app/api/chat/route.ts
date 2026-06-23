import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import firstAidData from '@/data/firstAid.json';
import medicineData from '@/data/medicine.json';
import schemesData from '@/data/schemes.json';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // The Orchestrator Prompt
    const prompt = `You are the MediReach AI Orchestrator. 
The user said: "${message}"

You have access to the following knowledge bases. Based on the user's input, extract the most relevant information and provide a helpful, concise, and structured response suitable for a low-bandwidth mobile app. 

IMPORTANT RULES:
1. DO NOT DIAGNOSE. Always recommend seeing a doctor.
2. If it is an emergency (e.g., snakebite, severe burn, heart attack), start your response with "URGENT EMERGENCY: " and advise them to call local emergency services immediately.
3. If they ask for nearby hospitals, mock a response saying: "Here are 3 nearby medical facilities: [Mock Hospital A - 2km away], [Mock Clinic B - 5km away], [Mock Pharmacy C - 1km away]." (Since we don't have actual GPS coordinates in this hackathon demo).

First-Aid DB: ${JSON.stringify(firstAidData)}
Medicine DB: ${JSON.stringify(medicineData)}
Government Schemes DB: ${JSON.stringify(schemesData)}

Respond directly to the user in a calm, clear manner.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json({ text: "I'm sorry, I encountered an error connecting to the medical database. Please try again or seek professional help immediately if this is an emergency." }, { status: 500 });
  }
}
