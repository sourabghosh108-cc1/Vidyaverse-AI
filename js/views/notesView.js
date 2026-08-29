/**
 * Notes View Module (AI Notes Generator - Upgraded to v3.2)
 * Builds structured study sheets with three generation modes.
 * Features Formatted Visual Preview + Raw Editor toggle, 100% hidden loader fix,
 * OpenRouter AI generation with intelligent local fallback.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";
import { mockSearch } from "../mockSearch.js";

const NOTES_MODE_KEY = "vidyaverse_notes_mode";

// Helper to run promises with a timeout (45s default)
const withTimeout = (promise, ms, errorMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });
  return Promise.race([
    promise.then(val => {
      clearTimeout(timeoutId);
      return val;
    }),
    timeoutPromise
  ]);
};

class NotesView {
  constructor() {
    this.currentNoteContent = "";
    this.currentNoteTitle = "";
    this.viewMode = "preview"; // "preview" | "editor"
  }

  render() {
    const container = document.getElementById("view-notes");
    if (!container) return;

    const savedMode = localStorage.getItem(NOTES_MODE_KEY) || "quick";

    container.innerHTML = `
      <div class="notes-layout-wrapper animate-fade-in">
        <header class="notes-header-card card">
          <h2>📝 AI Notes Generator</h2>
          <p>Synthesize structured, formatted study sheets in three formats. Powered by OpenRouter GPT-4o AI with intelligent fallbacks.</p>
        </header>

        <div class="notes-grid">
          <!-- Left side: generator controls -->
          <div class="notes-controls card">
            <h3>Configure Note Builder</h3>

            <div class="form-group" style="margin-top: 16px;">
              <label for="note-topic">Study Topic</label>
              <input type="text" id="note-topic" placeholder="e.g., Electrostatic Potential, Photosynthesis, Newton's Laws" />
            </div>

            <div class="form-group">
              <label>Generation Mode</label>
              <div class="notes-mode-selectors">

                <label class="radio-card">
                  <input type="radio" name="note-mode" value="quick" ${savedMode === "quick" ? "checked" : ""} />
                  <div class="radio-label-content">
                    <strong>⚡ Quick Revision Notes</strong>
                    <span>Concise bullets · Definitions · Formulas · Exam-focused summaries</span>
                  </div>
                </label>

                <label class="radio-card">
                  <input type="radio" name="note-mode" value="detailed" ${savedMode === "detailed" ? "checked" : ""} />
                  <div class="radio-label-content">
                    <strong>📚 Detailed Study Notes</strong>
                    <span>Full explanations · Examples · Common mistakes · Key takeaways</span>
                  </div>
                </label>

                <label class="radio-card">
                  <input type="radio" name="note-mode" value="lecture" ${savedMode === "lecture" ? "checked" : ""} />
                  <div class="radio-label-content">
                    <strong>🎓 Lecture Notes Format</strong>
                    <span>H1/H2/H3 hierarchy · Summary table · Exam prep section</span>
                  </div>
                </label>

              </div>
            </div>

            <!-- AI Mode Badge -->
            <div class="notes-mode-badge-wrap">
              <span class="ai-mode-badge ai-mode-claude" id="notes-ai-badge">
                <span class="ai-badge-dot"></span>
                OpenRouter AI Mode
              </span>
            </div>

            <button class="btn btn-primary btn-block" id="btn-generate-notes" style="margin-top: 8px;">
              ✨ Generate Notes
            </button>
          </div>

          <!-- Right side: output workspace -->
          <div class="notes-workspace card">
            <div class="workspace-header" style="display:flex; justify-content:space-between; align-items:center;">
              <h3>Notes Workspace</h3>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-outline btn-sm" id="btn-toggle-view" disabled>
                  ✏️ Edit Raw Text
                </button>
                <button class="btn btn-outline btn-sm" id="btn-download-note" disabled>
                  💾 Download Notes
                </button>
              </div>
            </div>

            <!-- Loader Overlay -->
            <div class="note-loader-overlay hidden" id="note-loader">
              <div class="loader-spinner"></div>
              <span id="note-loader-text" style="font-weight: 600; color: #60A5FA;">Generating Notes...</span>
            </div>

            <!-- Output Views -->
            <div class="note-editor-container" id="editor-container" style="display:flex; flex-direction:column; flex:1;">
              <!-- Formatted Preview -->
              <div id="note-preview-view" style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 22px; line-height: 1.7; font-size: 0.95rem; min-height: 380px; max-height: 520px; overflow-y: auto;">
                <p style="color: var(--text-secondary); text-align: center; margin-top: 140px;">
                  👈 Configure a topic on the left and click <strong>"✨ Generate Notes"</strong> to build formatted study sheets.
                </p>
              </div>

              <!-- Raw Textarea Editor -->
              <textarea id="note-editor" class="hidden" placeholder="Your generated notes will appear here. You can manually edit or append content before exporting..."></textarea>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const topicInput = container.querySelector("#note-topic");
    const generateBtn = container.querySelector("#btn-generate-notes");
    const downloadBtn = container.querySelector("#btn-download-note");
    const toggleViewBtn = container.querySelector("#btn-toggle-view");
    const loader = container.querySelector("#note-loader");
    const loaderText = container.querySelector("#note-loader-text");
    const editor = container.querySelector("#note-editor");
    const previewView = container.querySelector("#note-preview-view");
    const modeRadios = container.querySelectorAll("input[name='note-mode']");

    // Persist mode selection
    modeRadios.forEach(radio => {
      radio.addEventListener("change", () => {
        localStorage.setItem(NOTES_MODE_KEY, radio.value);
      });
    });

    // Toggle Preview / Raw Editor
    toggleViewBtn.addEventListener("click", () => {
      if (this.viewMode === "preview") {
        this.viewMode = "editor";
        previewView.classList.add("hidden");
        editor.classList.remove("hidden");
        toggleViewBtn.textContent = "👁️ Formatted View";
      } else {
        this.viewMode = "preview";
        editor.classList.add("hidden");
        previewView.classList.remove("hidden");
        // Re-render formatted preview from current textarea content
        previewView.innerHTML = formatMarkdownToRichNotes(editor.value);
        toggleViewBtn.textContent = "✏️ Edit Raw Text";
      }
    });

    // Update editor value on user input
    editor.addEventListener("input", () => {
      this.currentNoteContent = editor.value;
    });

    generateBtn.addEventListener("click", async () => {
      const topic = topicInput.value.trim();
      if (!topic) {
        ui.showToast("Please enter a topic name", "warning");
        return;
      }

      const mode = container.querySelector("input[name='note-mode']:checked").value;

      // Show loader
      loader.classList.remove("hidden");
      generateBtn.disabled = true;

      console.log(`Notes generation started — topic: "${topic}", mode: "${mode}"`);

      try {
        let notesData;

        loaderText.textContent = "Generating with OpenRouter AI...";
        try {
          const aiPromise = this.generateWithOpenRouter(topic, mode);
          notesData = await withTimeout(aiPromise, 45000, "AI timeout");
        } catch (aiErr) {
          console.warn("OpenRouter AI notes error, using local fallback generator:", aiErr.message);
          loaderText.textContent = "Synthesizing study notes...";
          notesData = await this.generateNotes(topic, mode);
        }

        this.currentNoteTitle = `${topic.toLowerCase().replace(/\s+/g, '-')}-${mode}-notes`;
        this.currentNoteContent = notesData;

        editor.value = notesData;
        previewView.innerHTML = formatMarkdownToRichNotes(notesData);

        // Reset to preview mode
        this.viewMode = "preview";
        editor.classList.add("hidden");
        previewView.classList.remove("hidden");
        toggleViewBtn.textContent = "✏️ Edit Raw Text";

        toggleViewBtn.removeAttribute("disabled");
        downloadBtn.removeAttribute("disabled");

        console.log(`Notes generation completed — topic: "${topic}"`);
        ui.showToast("Notes generated! +50 XP", "success");

        store.addGeneratedNote(topic, notesData);
        gamification.addXP(50);
        gamification.unlockBadge("note_creator");

      } catch (err) {
        console.error("Notes generation failed:", err);
        previewView.innerHTML = `<div style="color:var(--color-danger); text-align:center; padding:20px;">⚠️ ERROR: Unable to generate notes.<br/><br/>${err.message}</div>`;
        ui.showToast("Failed to generate notes. Please try again.", "danger");
      } finally {
        loader.classList.add("hidden");
        generateBtn.removeAttribute("disabled");
      }
    });

    downloadBtn.addEventListener("click", () => {
      const content = editor.value || this.currentNoteContent;
      if (!content) return;

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${this.currentNoteTitle}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      ui.showToast("Notes downloaded successfully!", "success");
    });
  }

  // ─── OpenRouter AI Generation ──────────────────────────────────────────────

  async generateWithOpenRouter(topic, mode) {
    const modeLabel = { quick: "Quick Revision Notes", detailed: "Detailed Study Notes", lecture: "Lecture Notes" }[mode] || "Study Notes";
    const prompt = `You are an expert academic tutor for Indian competitive examinations (JEE, NEET, CUET, Class 10/12, CA Foundation).
Generate comprehensive ${modeLabel} for the topic: "${topic}".

Structure cleanly with markdown headings and sections:
# 📖 ${topic.toUpperCase()} — ${modeLabel.toUpperCase()}

### ⚡ 1. Core Overview
(Concise summary of the topic)

### 💡 2. Key Concepts & Definitions
- **Term**: Definition

### 📐 3. Important Formulas & Equations
- **Formula Name**: Equation (units & physical meaning)

### 🎯 4. Exam-Focused Tips & Takeaways
- Key tips for solving exam questions

### ❌ 5. Common Mistakes to Avoid
- Common misconceptions and how to correct them

Use clear, exam-ready language for Indian competitive exam students.`;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        examContext: store.getState()?.profile?.selectedExam || "jee",
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.content || "Failed to generate notes.";
  }

  // ─── Local Knowledge Engine Fallback ──────────────────────────────────────────

  async generateNotes(topic, mode) {
    const topicData = await mockSearch.resolve(topic);
    const divider = "==================================================";

    let content = `${divider}\n`;
    content += `📖 TOPIC: ${topicData.topic.toUpperCase()}\n`;

    if (mode === "quick") {
      content += `⚡ MODE: QUICK REVISION NOTES\n`;
      content += `🤖 GENERATED BY: Vidyaverse AI Knowledge Engine\n`;
      content += `${divider}\n\n`;

      content += `### 1. CORE OVERVIEW:\n${topicData.overview}\n\n`;

      content += `### 2. KEY CONCEPTS & DEFINITIONS:\n`;
      (topicData.concepts || []).forEach(c => {
        content += `- **${c.title}**: ${c.desc}\n`;
      });
      (topicData.definitions || []).forEach(d => {
        content += `- **${d.term}**: ${d.def}\n`;
      });

      content += `\n### 3. IMPORTANT FORMULAS:\n`;
      (topicData.formulas || []).forEach(f => {
        content += `- **${f.name}**: \`${f.eq}\` — ${f.desc}\n`;
      });

      content += `\n### 4. EXAM-FOCUSED SUMMARY:\n`;
      (topicData.revision || []).forEach(r => {
        content += `- ${r}\n`;
      });

    } else if (mode === "detailed") {
      content += `📚 MODE: DETAILED STUDY NOTES\n`;
      content += `🤖 GENERATED BY: Vidyaverse AI Knowledge Engine\n`;
      content += `${divider}\n\n`;

      content += `### 1. INTRODUCTION & BACKGROUND:\n${topicData.overview}\n\n`;

      content += `### 2. DEEP CONCEPTUAL ANALYSIS:\n`;
      (topicData.concepts || []).forEach(c => {
        content += `#### ${c.title}\n${c.desc}\n\n`;
      });

      content += `### 3. CRITICAL FORMULAS:\n`;
      (topicData.formulas || []).forEach(f => {
        content += `- **${f.name}**: \`${f.eq}\` (${f.desc})\n`;
      });

      content += `\n### 4. EXAM TIPS:\n${topicData.examNotes}\n`;

    } else if (mode === "lecture") {
      content += `🎓 MODE: LECTURE NOTES FORMAT\n`;
      content += `🤖 GENERATED BY: Vidyaverse AI Knowledge Engine\n`;
      content += `${divider}\n\n`;

      content += `# ${topicData.topic.toUpperCase()}\n\n`;
      content += `## 1. Executive Summary\n${topicData.overview}\n\n`;
      content += `## 2. Core Concepts\n`;
      (topicData.concepts || []).forEach((c, idx) => {
        content += `### 2.${idx + 1} ${c.title}\n${c.desc}\n\n`;
      });

      content += `## 3. Formulas & Equations\n`;
      (topicData.formulas || []).forEach(f => {
        content += `- **${f.name}**: \`${f.eq}\` — ${f.desc}\n`;
      });
    }

    return content;
  }
}

/**
 * Format markdown text into styled HTML elements for the Notes preview
 */
function formatMarkdownToRichNotes(text) {
  if (!text) return "";
  let html = text
    .replace(/^# (.*$)/gim, '<h1 style="color:var(--color-primary); font-family:var(--font-display); font-size:1.4rem; margin-bottom:12px; border-bottom:2px solid var(--border-color); padding-bottom:8px;">$1</h1>')
    .replace(/^### (.*$)/gim, '<h3 style="color:var(--color-primary); font-family:var(--font-display); font-size:1.1rem; margin-top:16px; margin-bottom:8px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:var(--text-primary); font-family:var(--font-display); font-size:1.25rem; margin-top:18px; margin-bottom:10px;">$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color:var(--text-primary); font-weight:600;">$1</strong>')
    .replace(/`([^`]+)`/gim, '<code style="background:rgba(59,130,246,0.15); color:#60A5FA; padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.88rem;">$1</code>')
    .replace(/^\- (.*$)/gim, '<li style="margin-left:20px; margin-bottom:6px;">$1</li>')
    .replace(/\n\n/gim, '<br/><br/>');

  return html;
}

export const notesView = new NotesView();
