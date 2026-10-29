/**
 * Vidyaverse AI - Study Agent Module
 * ChatGPT-style AI study assistant with IP-based Credit Limiter.
 * Dual-layer execution:
 *   1. Direct client-side engine with cushioning (Mistral primary + OpenRouter)
 *   2. Serverless /api/chat fallback
 *   3. Intelligent offline synthesizer
 */

import { store } from "../store.js";
import { requestAIWithCushion } from "./aiConfig.js";
import { creditManager } from "../creditManager.js";

export class StudyAgent {
  constructor() {
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  clearHistory() {
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  async processGoal(userPrompt) {
    // 0. Verify IP Daily Credit Limit (150 credits / 30 queries limit)
    const canQuery = await creditManager.canMakeQuery();
    if (!canQuery) {
      const state = await creditManager.getCreditState();
      return {
        reply: `⚠️ **Daily Educational AI Limit Reached**\n\nYour IP address (\`${state.ip}\`) has reached its daily quota of **${state.maxQueries} AI study queries** (${state.maxCredits} credits, 5 credits/query).\n\n⏰ **Quota resets every 24 hours at midnight.**\nYou can view your live credit usage on the **[AI Credits Page](#credits)**.`,
        provider: "rate-limit",
        model: "limit-enforcer",
      };
    }

    if (this.isProcessing) {
      let waited = 0;
      while (this.isProcessing && waited < 8000) {
        await new Promise((r) => setTimeout(r, 200));
        waited += 200;
      }
      if (this.isProcessing) {
        this.isProcessing = false;
      }
    }

    this.isProcessing = true;

    const state = store.getState();
    const profile = state.profile || {};
    const selectedExam = profile.selectedExam || "jee";

    this.conversationHistory.push({ role: "user", content: userPrompt });

    if (this.conversationHistory.length > 12) {
      this.conversationHistory = this.conversationHistory.slice(-12);
    }

    const systemPrompt = `You are VidyaAI, an expert AI Study Assistant and Tutor for Indian competitive & board examinations (JEE Main & Advanced, NEET, Class 10, Class 12, CUET, CA Foundation).
Current Student Context:
- Target Exam: ${(selectedExam || "jee").toUpperCase()}
- Student Name: ${profile.name || "Aspirant"}

Behavior Instructions:
- Answer direct, conversational, and technical study questions naturally like ChatGPT and Claude.
- If asked for doubts, derivations, or problem solutions, solve them step-by-step with clear formulas and final answers.
- If asked for practice questions or PYQs (e.g. NEET Biology, Physics, Chemistry), generate 3-4 high-yield questions with options, correct answer keys, and clear explanations.
- Use clean Markdown formatting (bold, headings, bullet points, code blocks).`;

    try {
      let replyText = "";
      let usedProvider = "mistral";
      let usedModel = "open-mistral-7b";

      // 1. Primary: Direct Client-Side Engine with Model Cushioning (Mistral Primary)
      try {
        const clientRes = await requestAIWithCushion(this.conversationHistory, systemPrompt);
        if (clientRes && clientRes.content) {
          replyText = clientRes.content;
          usedModel = clientRes.model;
          usedProvider = clientRes.provider;
        }
      } catch (err) {
        console.warn("Client AI cushion fallback:", err.message);
      }

      // 2. Secondary: Backend Serverless API route fallback (/api/chat)
      if (!replyText) {
        try {
          let apiUrl = "/api/chat";
          if (typeof window !== "undefined" && window?.location?.protocol === "file:") {
            apiUrl = "http://localhost:8000/api/chat";
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);

          const resp = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              messages: this.conversationHistory,
              examContext: selectedExam,
              userProfile: {
                name: profile.name,
                level: state.level,
                xp: state.xp,
              },
            }),
          });

          clearTimeout(timeout);

          if (resp.ok) {
            const data = await resp.json();
            replyText = (data.content || "").trim();
            if (data.model) usedModel = data.model;
            if (data.provider) usedProvider = data.provider;
          }
        } catch (err) {
          console.warn("Backend API fallback error:", err.message);
        }
      }

      // 3. Smart offline fallback synthesis
      if (!replyText) {
        replyText = getSmartFallback(userPrompt, selectedExam);
      }

      // Deduct 5 credits upon successful AI answer
      try {
        await creditManager.deductQueryCredits(userPrompt);
      } catch (e) {
        console.warn("Credit deduction notice:", e.message);
      }

      this.conversationHistory.push({ role: "assistant", content: replyText });
      this.isProcessing = false;

      return {
        reply: replyText,
        provider: usedProvider,
        model: usedModel,
      };
    } catch (err) {
      this.isProcessing = false;
      console.error("Chat error:", err);
      return {
        reply: "Sorry, I ran into an issue. Please ask your question again!",
      };
    }
  }
}

/**
 * Smart fallback: gives a useful reply when networks are completely offline
 */
function getSmartFallback(userPrompt, exam) {
  const q = userPrompt.toLowerCase().trim();

  if (/^(hi|hello|hey|namaste|good morning|good evening)/.test(q)) {
    return `Hello! 👋 I'm **VidyaAI**, your AI study assistant for **${exam.toUpperCase()}**. Ask me any doubt, formula, concept, or request practice questions — I'm here to help!`;
  }

  if (q.includes("who are you") || q.includes("what are you")) {
    return `I'm **VidyaAI** 🤖 — an AI study assistant built for ${exam.toUpperCase()} preparation. I can solve doubts, explain concepts, derive formulas, and give you practice questions instantly!`;
  }

  if (/^(thanks|thank you|thx|ty)/.test(q)) {
    return `You're welcome! 😊 Keep studying hard and feel free to ask any doubt anytime. You've got this! 💪`;
  }

  return `I'm your AI study assistant for **${exam.toUpperCase()}**.\n\nYou can ask me:\n- **Doubts** on Physics, Chemistry, Biology, or Math\n- **Formula derivations** step by step\n- **Practice MCQs** with solutions\n- **Concept explanations** in simple language`;
}

export const studyAgent = new StudyAgent();
