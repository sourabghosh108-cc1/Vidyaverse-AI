/**
 * Notes View Module (AI Notes Generator - Upgraded to v3.0)
 * Builds structured study sheets with three generation modes.
 * Supports Claude AI (via Anthropic API key from Settings) with automatic
 * fallback to the local educational database generator.
 * Includes timeout protection, mode persistence, and E2E error handling.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";
import { mockSearch } from "../mockSearch.js";

const NOTES_MODE_KEY = "vidyaverse_notes_mode";

// Helper to run promises with a timeout
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
  }

  render() {
    const container = document.getElementById("view-notes");
    if (!container) return;

    // Restore last selected mode from localStorage
    const savedMode = localStorage.getItem(NOTES_MODE_KEY) || "quick";
    const hasApiKey = !!store.getAnthropicApiKey();

    container.innerHTML = `
      <div class="notes-layout-wrapper animate-fade-in">
        <header class="notes-header-card card">
          <h2>📝 AI Notes Generator</h2>
          <p>Synthesize structured, formatted study sheets in three formats. Powered by Claude AI when your API key is configured in Settings, or the local knowledge engine as a fallback.</p>
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
              <span class="ai-mode-badge ${hasApiKey ? "ai-mode-claude" : "ai-mode-local"}" id="notes-ai-badge">
                <span class="ai-badge-dot"></span>
                ${hasApiKey ? "Claude AI Mode" : "Local AI Mode"}
              </span>
            </div>

            <button class="btn btn-primary btn-block" id="btn-generate-notes" style="margin-top: 8px;">
              ✨ Generate Notes
            </button>
          </div>

          <!-- Right side: output workspace -->
          <div class="notes-workspace card">
            <div class="workspace-header">
              <h3>Notes Editor Workspace</h3>
              <button class="btn btn-outline btn-sm" id="btn-download-note" disabled>
                💾 Download Notes
              </button>
            </div>

            <!-- Loader -->
            <div class="note-loader-overlay hidden" id="note-loader">
              <div class="loader-spinner"></div>
              <span id="note-loader-text">Generating Notes...</span>
            </div>

            <div class="note-editor-container" id="editor-container">
              <textarea id="note-editor" placeholder="Your generated notes will appear here. You can manually edit or append content before exporting..." disabled></textarea>
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
    const loader = container.querySelector("#note-loader");
    const loaderText = container.querySelector("#note-loader-text");
    const editor = container.querySelector("#note-editor");
    const badge = container.querySelector("#notes-ai-badge");
    const modeRadios = container.querySelectorAll("input[name='note-mode']");

    // Persist mode selection
    modeRadios.forEach(radio => {
      radio.addEventListener("change", () => {
        localStorage.setItem(NOTES_MODE_KEY, radio.value);
      });
    });

    // Update badge live whenever API key changes (e.g. user opens settings in same session)
    const refreshBadge = () => {
      const hasKey = !!store.getAnthropicApiKey();
      badge.className = `ai-mode-badge ${hasKey ? "ai-mode-claude" : "ai-mode-local"}`;
      badge.innerHTML = `<span class="ai-badge-dot"></span>${hasKey ? "Claude AI Mode" : "Local AI Mode"}`;
    };

    // Re-check badge whenever this view is in focus
    document.addEventListener("visibilitychange", refreshBadge);

    generateBtn.addEventListener("click", async () => {
      const topic = topicInput.value.trim();
      if (!topic) {
        ui.showToast("Please enter a topic name", "warning");
        return;
      }

      const mode = container.querySelector("input[name='note-mode']:checked").value;
      const apiKey = store.getAnthropicApiKey();

      // Show loader
      loader.classList.remove("hidden");
      generateBtn.disabled = true;

      console.log(`Notes generation started — topic: "${topic}", mode: "${mode}", engine: ${apiKey ? "Claude" : "Local"}`);

      try {
        let notesData;

        if (apiKey) {
          // --- Claude AI Path ---
          loaderText.textContent = "Generating with Claude AI...";
          const claudePromise = (async () => {
            await new Promise(resolve => setTimeout(resolve, 800)); // brief UX pause
            return await this.generateWithClaude(topic, mode, apiKey);
          })();

          try {
            notesData = await withTimeout(claudePromise, 30000, "Claude generation timed out. Falling back to local generator.");
          } catch (claudeErr) {
            console.warn("Claude generation failed, falling back to local:", claudeErr.message);
            const isKeyErr = claudeErr.message.toLowerCase().includes("api") ||
                             claudeErr.message.toLowerCase().includes("auth") ||
                             claudeErr.message.toLowerCase().includes("invalid");
            ui.showToast(
              isKeyErr ? "Invalid API key — falling back to Local AI Mode" : claudeErr.message + " Using local generator.",
              "warning"
            );
            // Update badge to show local fallback
            badge.className = "ai-mode-badge ai-mode-local";
            badge.innerHTML = `<span class="ai-badge-dot"></span>Local AI Mode`;
            loaderText.textContent = "Generating with Local AI...";
            await new Promise(resolve => setTimeout(resolve, 700));
            notesData = await withTimeout(this.generateNotes(topic, mode), 10000, "Generation timed out. Please try again.");
          }
        } else {
          // --- Local Generator Path ---
          loaderText.textContent = "Generating with Local AI...";
          const localPromise = (async () => {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return await this.generateNotes(topic, mode);
          })();
          notesData = await withTimeout(localPromise, 10000, "Generation timed out. Please try again.");
        }

        this.currentNoteTitle = `${topic.toLowerCase().replace(/\s+/g, '-')}-${mode}-notes`;
        this.currentNoteContent = notesData;

        editor.value = notesData;
        editor.removeAttribute("disabled");
        downloadBtn.removeAttribute("disabled");

        console.log(`Notes generation completed — topic: "${topic}"`);
        ui.showToast("Notes generated! +50 XP", "success");

        store.addGeneratedNote(topic, notesData);
        gamification.addXP(50);
        gamification.unlockBadge("note_creator");

      } catch (err) {
        console.error("Notes generation failed:", err);

        const isTimeout = err.message.includes("timed out");
        const displayErr = isTimeout
          ? "Generation timed out. Please try again."
          : "Unable to generate notes for this topic. Please try again.";

        editor.value = `⚠️ ERROR: ${displayErr}\n\nDetails: ${err.message}`;
        editor.removeAttribute("disabled");
        ui.showToast(displayErr, "danger");
      } finally {
        loader.classList.add("hidden");
        generateBtn.removeAttribute("disabled");
      }
    });

    downloadBtn.addEventListener("click", () => {
      if (!this.currentNoteContent) return;

      const blob = new Blob([this.currentNoteContent], { type: "text/plain;charset=utf-8" });
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

  // ─── Claude AI Generation ────────────────────────────────────────────────

  async generateWithClaude(topic, mode, apiKey) {
    const prompts = {
      quick: `You are an expert academic tutor. Generate concise **Quick Revision Notes** for the topic: "${topic}".

Structure your response as a clean plain-text document with these sections:
==================================================
📖 TOPIC: ${topic.toUpperCase()}
⚡ MODE: QUICK REVISION NOTES
🤖 GENERATED BY: Claude AI (Anthropic)
==================================================

1. CORE OVERVIEW (2–3 sentences)

2. KEY CONCEPTS & DEFINITIONS
   - [Term]: [Definition]
   (list all critical terms with brief definitions)

3. IMPORTANT FORMULAS & EQUATIONS
   [ Formula Name ]: [Formula] — [what it represents]
   (include all key formulas)

4. EXAM-FOCUSED SUMMARY
   (bullet points of the most important exam-relevant facts)

5. QUICK TAKEAWAY
   (one powerful sentence summarizing the entire topic)

Use clear, concise language suitable for competitive exam preparation (JEE/NEET/Board exams).`,

      detailed: `You are an expert academic professor. Generate comprehensive **Detailed Study Notes** for the topic: "${topic}".

Structure your response as a clean plain-text document with these sections:
==================================================
📖 TOPIC: ${topic.toUpperCase()}
📚 MODE: DETAILED STUDY NOTES
🤖 GENERATED BY: Claude AI (Anthropic)
==================================================

1. INTRODUCTION & THEORETICAL BACKGROUND
   (thorough explanation of the concept and its origin)

2. CORE CONCEPTS — DEEP ANALYSIS
   (explain each major concept with full detail and context)

3. CRITICAL FORMULAS & DERIVATIONS
   - [Formula Name]: [Formula]
     Derivation hint: [brief derivation or physical reasoning]
     Units: [SI units]
     When to use: [condition/scenario]

4. WORKED EXAMPLES
   (2–3 solved examples showing step-by-step problem solving)

5. COMMON MISTAKES & MISCONCEPTIONS
   ❌ Mistake: [what students get wrong]
   ✅ Correct approach: [how to do it right]

6. KEY TAKEAWAYS
   (bulleted list of the most important points to remember)

7. CONNECTIONS TO OTHER TOPICS
   (briefly link this topic to related concepts)

Use academic but accessible language for undergraduate and competitive exam students.`,

      lecture: `You are an expert academic lecturer. Generate professional **Lecture Notes** for the topic: "${topic}".

Structure your response as a clean plain-text document:
==================================================
📖 TOPIC: ${topic.toUpperCase()}
🎓 MODE: LECTURE NOTES FORMAT
🤖 GENERATED BY: Claude AI (Anthropic)
==================================================

# ${topic.toUpperCase()}

## 1. Introduction
   [Brief introduction to the topic and its importance]

## 2. Theoretical Framework
   [Core theory, laws, or principles]

   ### 2.1 [Sub-concept 1]
   [Detailed explanation]

   ### 2.2 [Sub-concept 2]
   [Detailed explanation]

   ### 2.3 [Sub-concept 3 if applicable]
   [Detailed explanation]

## 3. Mathematical Formulation
   [All relevant equations with descriptions]

## 4. Applications & Examples
   [Real-world applications and worked examples]

## 5. Summary Table
   | Concept | Definition | Formula/Key Fact |
   |---------|-----------|-----------------|
   | [concept] | [definition] | [formula or key fact] |
   (fill with 4–6 rows)

## 6. Exam Preparation
   Important Questions:
   - [Q1]
   - [Q2]
   - [Q3]
   
   Must-Remember Points:
   • [Point 1]
   • [Point 2]
   • [Point 3]

## 7. References & Further Study
   [Suggest standard textbooks or chapters relevant to this topic]

Use precise academic language with clear heading hierarchy.`
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: prompts[mode] || prompts.quick
          }
        ]
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // ─── Local Generator ─────────────────────────────────────────────────────

  async generateNotes(topic, mode) {
    const topicData = await mockSearch.resolve(topic);
    const divider = "==================================================";

    let content = `${divider}\n`;
    content += `📖 TOPIC: ${topicData.topic.toUpperCase()}\n`;

    if (mode === "quick") {
      content += `⚡ MODE: QUICK REVISION NOTES\n`;
      content += `🤖 GENERATED BY: Vidyaverse Local AI Agent\n`;
      content += `${divider}\n\n`;

      content += `1. CORE OVERVIEW:\n`;
      content += `   ${topicData.overview}\n\n`;

      content += `2. KEY CONCEPTS & DEFINITIONS:\n`;
      (topicData.concepts || []).forEach(c => {
        content += `   - ${c.title}: ${c.desc}\n`;
      });
      (topicData.definitions || []).forEach(d => {
        content += `   - ${d.term}: ${d.def}\n`;
      });

      content += `\n3. IMPORTANT FORMULAS:\n`;
      (topicData.formulas || []).forEach(f => {
        content += `   [ ${f.name} ]: ${f.eq} — ${f.desc}\n`;
      });

      content += `\n4. EXAM-FOCUSED SUMMARY:\n`;
      (topicData.revision || []).forEach(r => {
        content += `   • ${r}\n`;
      });
      if (!(topicData.revision || []).length) {
        content += `   • ${topicData.examNotes || "Review the principal constants and practice drawing free body diagrams."}\n`;
      }

      content += `\n5. QUICK TAKEAWAY:\n`;
      content += `   ${topicData.examNotes || "Master the core formulas and their conditions of applicability."}`;

    } else if (mode === "detailed") {
      content += `📚 MODE: DETAILED STUDY NOTES\n`;
      content += `🤖 GENERATED BY: Vidyaverse Local AI Agent\n`;
      content += `${divider}\n\n`;

      content += `1. INTRODUCTION & THEORETICAL BACKGROUND:\n`;
      content += `   ${topicData.overview}\n`;
      if (topicData.explanation) content += `   ${topicData.explanation}\n`;
      content += `\n`;

      content += `2. CORE CONCEPTS — DEEP ANALYSIS:\n`;
      (topicData.concepts || []).forEach(c => {
        content += `   ▸ ${c.title}:\n`;
        content += `     ${c.desc}\n\n`;
      });

      content += `3. CRITICAL FORMULAS & EQUATIONS:\n`;
      (topicData.formulas || []).forEach(f => {
        content += `   - ${f.name}: ${f.eq}\n`;
        content += `     Description: ${f.desc}\n\n`;
      });

      content += `4. PRACTICE QUESTIONS & SOLUTIONS:\n`;
      (topicData.questions || []).forEach((q, idx) => {
        content += `   Q${idx + 1}: ${q.q}\n`;
        content += `   Answer: ${q.a || q.explanation}\n\n`;
      });

      content += `5. COMMON MISTAKES & MISCONCEPTIONS:\n`;
      (topicData.mistakes || []).forEach(m => {
        content += `   ❌ ${m.title}: ${m.desc}\n`;
      });
      if (!(topicData.mistakes || []).length) {
        content += `   ❌ Always double-check unit conversions and sign conventions.\n`;
      }

      content += `\n6. KEY TAKEAWAYS:\n`;
      (topicData.revision || []).forEach(r => {
        content += `   • ${r}\n`;
      });
      if (!(topicData.revision || []).length) {
        content += `   • ${topicData.examNotes || "Review the principal concepts and their interconnections."}\n`;
      }

    } else {
      // lecture mode — structured hierarchical format
      content += `🎓 MODE: LECTURE NOTES FORMAT\n`;
      content += `🤖 GENERATED BY: Vidyaverse Local AI Agent\n`;
      content += `${divider}\n\n`;

      content += `# ${topicData.topic.toUpperCase()}\n\n`;

      content += `## 1. Introduction\n`;
      content += `   ${topicData.overview}\n\n`;

      content += `## 2. Theoretical Framework\n`;
      (topicData.concepts || []).forEach((c, i) => {
        content += `\n   ### 2.${i + 1} ${c.title}\n`;
        content += `   ${c.desc}\n`;
      });
      content += `\n`;

      content += `## 3. Mathematical Formulation\n`;
      (topicData.formulas || []).forEach(f => {
        content += `   - ${f.name}: ${f.eq}\n`;
        content += `     ${f.desc}\n`;
      });
      content += `\n`;

      content += `## 4. Applications & Examples\n`;
      (topicData.questions || []).forEach((q, idx) => {
        content += `   Example ${idx + 1}: ${q.q}\n`;
        content += `   Solution: ${q.a || q.explanation}\n\n`;
      });
      if (!(topicData.questions || []).length) {
        content += `   Refer to standard textbook problems for worked examples on this topic.\n\n`;
      }

      content += `## 5. Summary Table\n`;
      content += `   ${"─".repeat(60)}\n`;
      content += `   Concept                 | Key Fact / Formula\n`;
      content += `   ${"─".repeat(60)}\n`;
      (topicData.concepts || []).forEach(c => {
        const col1 = c.title.padEnd(24).slice(0, 24);
        content += `   ${col1}| ${c.desc.slice(0, 40)}\n`;
      });
      (topicData.formulas || []).forEach(f => {
        const col1 = f.name.padEnd(24).slice(0, 24);
        content += `   ${col1}| ${f.eq}\n`;
      });
      content += `   ${"─".repeat(60)}\n\n`;

      content += `## 6. Exam Preparation\n`;
      content += `   Must-Remember Points:\n`;
      (topicData.revision || []).forEach(r => {
        content += `   • ${r}\n`;
      });
      if (!(topicData.revision || []).length) {
        content += `   • ${topicData.examNotes || "Focus on formula derivations and applied problem solving."}\n`;
      }

      content += `\n   Common Mistakes to Avoid:\n`;
      (topicData.mistakes || []).forEach(m => {
        content += `   ❌ ${m.title}: ${m.desc}\n`;
      });

      content += `\n## 7. References & Further Study\n`;
      content += `   • NCERT Textbook — relevant chapter\n`;
      content += `   • H.C. Verma — Concepts of Physics\n`;
      content += `   • Previous year JEE/NEET questions on ${topicData.topic}\n`;
    }

    return content;
  }
}

export const notesView = new NotesView();
