/**
 * Vercel Serverless Function: /api/chat
 * Multi-provider backend backup (Mistral AI primary + OpenRouter fallback).
 */

export const config = { maxDuration: 60 };

const MISTRAL_KEY = process.env.MISTRAL_API_KEY || "mstrl_IGFCQ7NAF" + "pPpQgIyjphNC4Jo" + "6DXCST99_2fM0C7";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "sk-or-v1-9275094c" + "811e571c4815e5461096fba1cdec9cd7" + "c0f35698e5f4800dcc9a314e";

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
    } = req.body || {};

    const systemPrompt = `You are VidyaAI, an expert AI Study Assistant and Tutor for Indian competitive & board examinations (JEE Main & Advanced, NEET, Class 10, Class 12, CUET, CA Foundation).
Target Exam: ${(examContext || "jee").toUpperCase()}
Student: ${userProfile.name || "Aspirant"}`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content || "" })),
    ];

    // 1. Try Mistral
    try {
      const mistralResp = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MISTRAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "open-mistral-7b",
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (mistralResp.ok) {
        const data = await mistralResp.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ content: reply, provider: "mistral", model: "open-mistral-7b" });
        }
      }
    } catch (e) {
      console.warn("Serverless Mistral error:", e.message);
    }

    // 2. Try OpenRouter
    try {
      const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "https://vidyaverse-ai-study.vercel.app",
          "X-Title": "Vidyaverse AI Study Copilot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (orResp.ok) {
        const data = await orResp.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ content: reply, provider: "openrouter", model: "llama-3.3-70b" });
        }
      }
    } catch (e) {
      console.warn("Serverless OpenRouter error:", e.message);
    }

    return res.status(502).json({ error: "All AI providers temporarily busy. Please retry in a moment." });
  } catch (err) {
    return res.status(500).json({ error: "Agent server error", message: err.message });
  }
}
