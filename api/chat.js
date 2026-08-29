/**
 * Vercel Serverless Function: /api/chat
 * Routes AI chat calls to OpenRouter (Llama 3.3 70B Instruct / GPT-3.5 Turbo).
 * 100% reliable, fast, intelligent AI study assistant.
 */

export const config = { maxDuration: 60 };

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const DEFAULT_MODEL = "openai/gpt-3.5-turbo";
const FALLBACK_MODEL = "meta-llama/llama-3.3-70b-instruct";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const {
      messages = [],
      examContext = "jee",
      userProfile = {},
      modelName,
    } = req.body || {};

    let model = modelName || DEFAULT_MODEL;
    const systemPrompt = buildSystemPrompt(examContext, userProfile);

    const orMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content || "" })),
    ];

    let response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://vidyaverse-ai.vercel.app",
        "X-Title": "Vidyaverse AI - Agentic Study Copilot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: orMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    // Fallback to GPT-3.5 Turbo if target model has any issue
    if (!response.ok && model !== FALLBACK_MODEL) {
      console.warn(`Primary model ${model} failed (${response.status}), retrying with ${FALLBACK_MODEL}`);
      model = FALLBACK_MODEL;
      response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://vidyaverse-ai.vercel.app",
          "X-Title": "Vidyaverse AI - Agentic Study Copilot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: orMessages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
    }

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      return res.status(response.status).json({ error: "OpenRouter API error", details: err });
    }

    const result = await response.json();
    const replyText = result?.choices?.[0]?.message?.content || "No response generated.";

    return res.status(200).json({
      content: replyText,
      provider: "openrouter",
      model,
    });
  } catch (err) {
    return res.status(500).json({ error: "Agent server error", message: err.message });
  }
}

function buildSystemPrompt(examContext, userProfile) {
  return `You are VidyaAI, an expert AI Study Assistant and Tutor for Indian competitive & board examinations (JEE Main & Advanced, NEET, Class 10, Class 12, CUET, CA Foundation).

Current Student Context:
- Target Exam: ${(examContext || "jee").toUpperCase()}
- Student Name: ${userProfile.name || "Aspirant"}

Behavior Instructions:
- Answer direct, conversational, and technical study questions naturally like ChatGPT and Claude.
- If asked for doubts, derivations, or problem solutions, solve them step-by-step with clear formulas and final answers.
- If asked for practice questions or PYQs (e.g. NEET Biology, Physics, Chemistry), generate 3-4 high-yield questions with options, correct answer keys, and clear explanations.
- Use clean Markdown formatting (bold, headings, bullet points, code blocks).`;
}
