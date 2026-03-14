"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabase/server";

interface SOAPNote {
  assessment: string;
  objective: string;
  plan: string;
  subjective: string;
}

interface AIActionResult {
  data?: SOAPNote;
  error?: string;
  success: boolean;
}

export async function generateSOAPNote(
  appointmentType: string,
  visitSummary: string
): Promise<AIActionResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "AI service not configured" };
  }

  const typeLabel =
    appointmentType === "initial"
      ? "initial evaluation"
      : appointmentType === "follow_up"
        ? "follow-up"
        : "consultation";

  const prompt = `You are a clinical documentation assistant for a telehealth platform.
Generate a professional SOAP note for a ${typeLabel} appointment.

Visit summary from the provider: "${visitSummary.trim() || "General virtual care visit."}"

Return ONLY valid JSON with these four keys (no markdown, no code fences):
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "..."
}

Guidelines:
- Subjective: Patient's reported symptoms, history, and chief complaint based on the visit summary.
- Objective: Telehealth-appropriate observations (appearance, speech, visible signs). Do NOT fabricate vital signs or physical exam findings that cannot be assessed remotely.
- Assessment: Clinical impression and differential considerations.
- Plan: Numbered action items including follow-up, medications, patient education, and referrals as appropriate.
- Use professional medical language. Be concise but thorough.
- Each section should be 2-4 sentences.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as SOAPNote;

    if (!parsed.subjective || !parsed.objective || !parsed.assessment || !parsed.plan) {
      return { success: false, error: "AI returned incomplete note" };
    }

    return { success: true, data: parsed };
  } catch {
    return { success: false, error: "AI generation failed" };
  }
}
