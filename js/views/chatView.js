/**
 * VidyaAI - Conversational AI Chatbot View (v4.0)
 * ChatGPT / Claude / Gemini style clean, direct, intelligent AI chat interface.
 */

import { studyAgent } from "../agent/studyAgent.js";
import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

class ChatView {
  constructor() {
    this.isGenerating = false;
  }

  render() {
    const container = document.getElementById("view-chat");
    if (!container) return;

    const state = store.getState();
    const profile = state.profile || {};
    const selectedExam = (profile.selectedExam || "jee").toUpperCase();

    container.innerHTML = `
      <div class="chat-layout-wrapper animate-fade-in">
        <!-- Chat Header Banner -->
        <header class="chat-header-card card" style="display:flex; justify-content:space-between; align-items:center; padding:16px 22px;">
          <div class="chat-header-left" style="display:flex; align-items:center; gap:14px;">
            <div class="chat-agent-avatar" style="font-size:2rem; background:linear-gradient(135deg,#3B82F6,#10B981); width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center;">🤖</div>
            <div class="chat-agent-info">
              <h2 style="font-size:1.15rem; font-family:var(--font-display); margin:0;">VidyaAI — AI Study Assistant</h2>
              <p style="font-size:0.82rem; color:var(--text-secondary); margin:0;">Target Exam: <strong>${selectedExam}</strong> · Direct Academic AI Solver</p>
            </div>
          </div>
          <div class="chat-header-actions" style="display:flex; align-items:center; gap:10px;">
            <span class="badge" style="background:rgba(59,130,246,0.15); color:#60A5FA; border:1px solid rgba(59,130,246,0.3); padding:4px 12px; border-radius:14px; font-weight:600; font-size:0.8rem;">
              ⚡ OpenRouter GPT-4o Live
            </span>
            <button class="btn btn-sm btn-outline" id="btn-clear-chat" title="Clear conversation history">
              🗑️ Clear Chat
            </button>
          </div>
        </header>

        <!-- Suggested Prompt Chips -->
        <div class="chat-quick-prompts" id="chat-quick-prompts" style="display:flex; gap:8px; overflow-x:auto; padding:10px 0; margin-bottom:12px;">
          <button class="prompt-chip" data-prompt="Give me 3 practice questions for NEET Biology on Genetics with options and solutions">
            🧬 NEET Biology Genetics Q&A
          </button>
          <button class="prompt-chip" data-prompt="Explain the difference between Mitosis and Meiosis step-by-step">
            🔬 Mitosis vs Meiosis
          </button>
          <button class="prompt-chip" data-prompt="Explain Newton's Laws of Motion with formulas and numerical examples">
            ⚡ Newton's Laws Mechanics
          </button>
          <button class="prompt-chip" data-prompt="How do I balance Redox reactions in Chemistry? Give step-by-step rules">
            🧪 Redox Balancing Rules
          </button>
        </div>

        <!-- Chat Conversation Messages Window -->
        <div class="chat-messages-box card" id="chat-messages-box" style="flex:1; min-height:420px; max-height:540px; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md);">
          <div class="chat-empty-state" id="chat-empty-state" style="text-align:center; padding:60px 20px; color:var(--text-secondary);">
            <div style="font-size:3.5rem; margin-bottom:12px;">🤖</div>
            <h3 style="color:var(--text-primary); font-family:var(--font-display); font-size:1.3rem;">Hello ${profile.name || "Aspirant"}, ask me anything!</h3>
            <p style="font-size:0.92rem; max-width:500px; margin:8px auto 0;">I can solve any academic doubt, derive formulas, explain concepts, or generate practice questions for ${selectedExam}.</p>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div class="chat-typing-indicator hidden" id="chat-typing-indicator" style="display:flex; align-items:center; gap:8px; padding:8px 16px; color:var(--text-secondary); font-size:0.88rem;">
          <div class="loader-spinner" style="width:18px; height:18px; border-width:2px;"></div>
          <span>🤖 VidyaAI is typing...</span>
        </div>

        <!-- Bottom Prompt Input Bar -->
        <div class="chat-input-container card" style="margin-top:12px; padding:12px 16px;">
          <form id="chat-input-form" class="chat-input-form" style="display:flex; gap:10px; align-items:center;">
            <textarea
              id="chat-user-input"
              class="chat-textarea"
              placeholder="Ask any doubt or request practice questions (e.g., 'Solve lens formula numerical for JEE')..."
              rows="1"
              style="flex:1; background:var(--bg-color); color:var(--text-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:12px 16px; outline:none; font-family:inherit; font-size:0.95rem; resize:none;"
            ></textarea>
            <button type="submit" class="btn btn-primary btn-chat-send" id="btn-send-message" style="padding:12px 22px; display:flex; align-items:center; gap:6px;">
              <span>Send</span> 🚀
            </button>
          </form>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = document.getElementById("chat-input-form");
    const textarea = document.getElementById("chat-user-input");
    const clearBtn = document.getElementById("btn-clear-chat");
    const promptsContainer = document.getElementById("chat-quick-prompts");

    // Auto-expand textarea on type
    if (textarea) {
      textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
      });

      // Submit on Enter without Shift
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          form.dispatchEvent(new Event("submit"));
        }
      });
    }

    // Submit handler
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = textarea.value.trim();
        if (!text || this.isGenerating) return;
        textarea.value = "";
        textarea.style.height = "auto";
        this.handleUserSubmit(text);
      });
    }

    // Quick prompt chips
    if (promptsContainer) {
      promptsContainer.addEventListener("click", (e) => {
        const chip = e.target.closest(".prompt-chip");
        if (chip && !this.isGenerating) {
          const promptText = chip.getAttribute("data-prompt");
          this.handleUserSubmit(promptText);
        }
      });
    }

    // Clear chat
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        studyAgent.clearHistory();
        const box = document.getElementById("chat-messages-box");
        if (box) {
          box.innerHTML = `
            <div class="chat-empty-state" id="chat-empty-state" style="text-align:center; padding:60px 20px; color:var(--text-secondary);">
              <div style="font-size:3.5rem; margin-bottom:12px;">🧠</div>
              <h3 style="color:var(--text-primary); font-family:var(--font-display); font-size:1.3rem;">Conversation Cleared</h3>
              <p style="font-size:0.92rem;">Ask your next doubt or question whenever you're ready.</p>
            </div>
          `;
        }
        ui.showToast("Conversation history cleared.", "info");
      });
    }
  }

  async handleUserSubmit(promptText) {
    const emptyState = document.getElementById("chat-empty-state");
    if (emptyState) emptyState.remove();

    const typingIndicator = document.getElementById("chat-typing-indicator");

    // 1. Render User Message Bubble
    this.appendMessageBubble("user", promptText);
    this.scrollToBottom();

    // 2. Show Typing Indicator
    this.isGenerating = true;
    if (typingIndicator) typingIndicator.classList.remove("hidden");

    // 3. Trigger AI Chatbot Response
    try {
      const result = await studyAgent.processGoal(promptText);
      const reply = result?.reply || "I am here to help you study! Please ask your question.";
      this.appendMessageBubble("assistant", reply);
    } catch (err) {
      console.error("Failed to process chatbot goal:", err);
      this.appendMessageBubble("assistant", `⚠️ Sorry, I encountered an issue: ${err.message}. Please try again!`);
    } finally {
      if (typingIndicator) typingIndicator.classList.add("hidden");
      this.isGenerating = false;
      try { gamification.addXP(15); } catch(e) {}
      this.scrollToBottom();
    }
  }

  appendMessageBubble(role, content) {
    const messagesBox = document.getElementById("chat-messages-box");
    if (!messagesBox) return;

    const bubbleWrapper = document.createElement("div");
    bubbleWrapper.className = `chat-message-row message-row-${role} animate-fade-in`;
    bubbleWrapper.style.cssText = role === "user" 
      ? "display:flex; flex-direction:row-reverse; align-items:flex-start; gap:12px; margin-bottom:16px;" 
      : "display:flex; flex-direction:row; align-items:flex-start; gap:12px; margin-bottom:16px;";

    const avatar = role === "assistant" ? "🤖" : "👤";
    const authorName = role === "assistant" ? "VidyaAI Assistant" : "You";
    const bubbleBg = role === "user" ? "linear-gradient(135deg,#2563EB,#3B82F6)" : "var(--surface-color)";
    const textColor = role === "user" ? "#FFFFFF" : "var(--text-primary)";
    const borderRadius = role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px";

    const formattedHtml = this.formatMarkdown(content);

    bubbleWrapper.innerHTML = `
      <div class="chat-avatar" style="font-size:1.4rem; background:var(--bg-color); border:1px solid var(--border-color); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${avatar}</div>
      <div class="chat-bubble-content" style="max-width:80%;">
        <div class="chat-bubble-author" style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-bottom:4px; ${role === "user" ? "text-align:right;" : ""}">${authorName}</div>
        <div class="chat-bubble-text" style="background:${bubbleBg}; color:${textColor}; padding:14px 18px; border-radius:${borderRadius}; border:1px solid var(--border-color); line-height:1.6; font-size:0.94rem;">${formattedHtml}</div>
      </div>
    `;

    messagesBox.appendChild(bubbleWrapper);
  }

  formatMarkdown(text) {
    if (!text) return "";
    let html = text
      .replace(/^### (.*$)/gim, '<h4 style="color:var(--color-primary); font-family:var(--font-display); margin-top:14px; margin-bottom:6px;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="color:var(--color-primary); font-family:var(--font-display); margin-top:16px; margin-bottom:8px;">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 style="color:var(--color-primary); font-family:var(--font-display); margin-top:18px; margin-bottom:10px;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(59,130,246,0.15); color:#60A5FA; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.88rem;">$1</code>')
      .replace(/^\- (.*$)/gim, '<li style="margin-left:18px; margin-bottom:4px;">$1</li>')
      .replace(/^\* (.*$)/gim, '<li style="margin-left:18px; margin-bottom:4px;">$1</li>')
      .replace(/\n/g, '<br/>');

    return html;
  }

  scrollToBottom() {
    const messagesBox = document.getElementById("chat-messages-box");
    if (messagesBox) {
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  }
}

export const chatView = new ChatView();
