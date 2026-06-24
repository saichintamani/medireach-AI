import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const { patientContext } = await req.json();

    const prompt = `
      You are the core medical intelligence engine of MediReach AI.
      Generate a realistic, simulated medical timeline for a patient based on this context:
      ${patientContext || "A 45-year-old patient with a recent history of mild cardiac anomalies."}

      Respond strictly with a JSON array of 4 to 6 timeline events. Do NOT output markdown, code blocks, or any introductory text. Only raw JSON.
      Each object must match this interface:
      {
        "id": number, // unique
        "title": string, // short medical event title (e.g. "ECG Scan", "Cardiology Consult")
        "date": string, // Month YYYY (e.g. "Jan 2024")
        "content": string, // brief description of what happened
        "category": string, // "Diagnosis", "Procedure", "Consultation", "Emergency"
        "iconName": string, // strictly one of: "Calendar", "FileText", "Code", "User", "Clock", "HeartPulse", "AlertTriangle", "Activity"
        "relatedIds": number[], // array of related event IDs
        "status": string, // "completed", "in-progress", or "pending"
        "energy": number // 0 to 100 representing intensity/importance
      }

      Ensure the dates go in chronological order from past to future (future events should be "pending").
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    let reply = chatCompletion.choices[0].message.content || "[]";
    
    // Remove any markdown formatting if the LLM hallucinated it
    reply = reply.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

    const timelineData = JSON.parse(reply);

    return NextResponse.json({ success: true, data: timelineData });

  } catch (error) {
    console.error("Timeline API Error:", error);
    // Fallback data in case of failure or quota issue
    const fallbackData = [
      {
        id: 1, title: "Initial Screening", date: "Jan 2024", content: "Routine checkup and bloodwork.",
        category: "Consultation", iconName: "Calendar", relatedIds: [2], status: "completed", energy: 20
      },
      {
        id: 2, title: "ECG Scan", date: "Feb 2024", content: "Slight arrhythmia detected.",
        category: "Diagnosis", iconName: "Activity", relatedIds: [1, 3], status: "completed", energy: 70
      },
      {
        id: 3, title: "Cardiology Consult", date: "Mar 2024", content: "Prescribed beta blockers.",
        category: "Consultation", iconName: "User", relatedIds: [2], status: "in-progress", energy: 50
      },
      {
        id: 4, title: "Follow-up Scan", date: "May 2024", content: "Scheduled echo-cardiogram.",
        category: "Procedure", iconName: "HeartPulse", relatedIds: [3], status: "pending", energy: 80
      }
    ];
    return NextResponse.json({ success: true, data: fallbackData });
  }
}
