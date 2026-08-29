/**
 * Vidyaverse AI - Study Agent Module (v4.3)
 * Direct ChatGPT / Claude / Gemini style chatbot.
 * No rigid templates. Clean answers or clean fallback.
 */

import { store } from "../store.js";

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
    // Don't block — if already processing, queue the new message separately
    if (this.isProcessing) {
      // Wait up to 8s for the previous request to finish
      let waited = 0;
      while (this.isProcessing && waited < 8000) {
        await new Promise(r => setTimeout(r, 200));
        waited += 200;
      }
      // If still processing, reset the lock and continue
      if (this.isProcessing) {
        this.isProcessing = false;
      }
    }

    this.isProcessing = true;

    const state = store.getState();
    const profile = state.profile || {};
    const selectedExam = profile.selectedExam || "jee";

    this.conversationHistory.push({ role: "user", content: userPrompt });

    // Keep history to last 12 messages to avoid large payloads
    if (this.conversationHistory.length > 12) {
      this.conversationHistory = this.conversationHistory.slice(-12);
    }

    // Determine API URL
    let apiUrl = "/api/chat";
    if (typeof window !== "undefined" && window?.location?.protocol === "file:") {
      apiUrl = "http://localhost:8000/api/chat";
    }

    try {
      let replyText = "";

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

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
        } else {
          console.warn(`API returned status ${resp.status}`);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.warn("Chat request timed out after 25s");
        } else {
          console.warn("API network error:", err.message);
        }
      }

      // Simple, clean fallback — no rigid templates
      if (!replyText) {
        replyText = getSmartFallback(userPrompt, selectedExam);
      }

      this.conversationHistory.push({ role: "assistant", content: replyText });
      this.isProcessing = false;

      return {
        reply: replyText,
        provider: "openrouter",
        model: "llama-3.3-70b",
      };
    } catch (err) {
      this.isProcessing = false;
      console.error("Chat error:", err);
      return {
        reply: `Sorry, I ran into an issue. Please ask your question again!`,
      };
    }
  }
}

/**
 * Smart fallback: gives a useful, natural, non-template reply when API is down
 */
function getSmartFallback(userPrompt, exam) {
  const q = userPrompt.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|namaste|good morning|good evening)/.test(q)) {
    return `Hello! 👋 I'm **VidyaAI**, your AI study assistant for **${exam.toUpperCase()}**. Ask me any doubt, formula, concept, or request practice questions — I'm here to help!`;
  }

  // Who are you
  if (q.includes("who are you") || q.includes("what are you")) {
    return `I'm **VidyaAI** 🤖 — an AI study assistant built for ${exam.toUpperCase()} preparation. I can solve doubts, explain concepts, derive formulas, and give you practice questions instantly — just like ChatGPT but focused on your exam!`;
  }

  // Thank you
  if (/^(thanks|thank you|thx|ty)/.test(q)) {
    return `You're welcome! 😊 Keep studying hard and feel free to ask any doubt anytime. You've got this! 💪`;
  }

  // Default: acknowledge and suggest re-trying
  return `I'm having a momentary connectivity issue. Please ask your question again and I'll answer right away!\n\nYou can ask me:\n- **Doubts** on any Physics, Chemistry, Biology or Math topic\n- **Formula derivations** step by step\n- **Practice MCQs** with solutions\n- **Concept explanations** in simple language`;
}

export const studyAgent = new StudyAgent();
