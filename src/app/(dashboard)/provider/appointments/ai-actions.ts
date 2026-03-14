"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
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

function buildPrompt(appointmentType: string, visitSummary: string): string {
  const typeLabel =
    appointmentType === "initial"
      ? "initial evaluation"
      : appointmentType === "follow_up"
        ? "follow-up"
        : "consultation";

  return `You are a clinical documentation assistant for a telehealth platform.
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
}

function parseSOAPNote(text: string): SOAPNote | null {
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as SOAPNote;
    if (!parsed.subjective || !parsed.objective || !parsed.assessment || !parsed.plan) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function generateWithGemini(prompt: string): Promise<SOAPNote | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return parseSOAPNote(result.response.text());
}

async function generateWithGroq(prompt: string): Promise<SOAPNote | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) return null;
  return parseSOAPNote(text);
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

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { success: false, error: "AI service not configured" };
  }

  const prompt = buildPrompt(appointmentType, visitSummary);

  // Try Gemini first, fall back to Groq
  try {
    const note = await generateWithGemini(prompt);
    if (note) return { success: true, data: note };
  } catch {
    // Gemini failed — fall through to Groq
  }

  try {
    const note = await generateWithGroq(prompt);
    if (note) return { success: true, data: note };
  } catch {
    // Groq also failed
  }

  return { success: false, error: "AI generation failed" };
}
