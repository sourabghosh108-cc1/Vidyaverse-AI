/**
 * Notes View Module (AI Notes Generator - Upgraded to v2.0)
 * Builds structured study sheets, provides manual editing,
 * and handles downloading files, using the educational database.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";
import { mockSearch } from "../mockSearch.js";

class NotesView {
  constructor() {
    this.currentNoteContent = "";
    this.currentNoteTitle = "";
  }

  render() {
    const container = document.getElementById("view-notes");
    if (!container) return;

    container.innerHTML = `
      <div class="notes-layout-wrapper animate-fade-in">
        <header class="notes-header-card card">
          <h2>📝 AI Notes Generator</h2>
          <p>Instantly synthesize structured, formatted study sheets. Select a mode, enter a topic, and export to text files.</p>
        </header>

        <div class="notes-grid">
          <!-- Left side: generator controls -->
          <div class="notes-controls card">
            <h3>Configure Note Builder</h3>
            
            <div class="form-group">
              <label for="note-topic">Study Topic</label>
              <input type="text" id="note-topic" placeholder="e.g., Electrostatic Potential" />
            </div>

            <div class="form-group">
              <label>Select Note Mode</label>
              <div class="notes-mode-selectors">
                <label class="radio-card">
                  <input type="radio" name="note-mode" value="quick" checked />
                  <div class="radio-label-content">
                    <strong>Quick Notes</strong>
                    <span>Brief core bullet points</span>
                  </div>
                </label>
                <label class="radio-card">
                  <input type="radio" name="note-mode" value="detailed" />
                  <div class="radio-label-content">
                    <strong>Detailed Notes</strong>
                    <span>Deep analysis & context</span>
                  </div>
                </label>
                <label class="radio-card">
                  <input type="radio" name="note-mode" value="revision" />
                  <div class="radio-label-content">
                    <strong>Revision Sheet</strong>
                    <span>Formulas & recall keys</span>
                  </div>
                </label>
                <label class="radio-card">
                  <input type="radio" name="note-mode" value="exam" />
                  <div class="radio-label-content">
                    <strong>Exam Checklist</strong>
                    <span>Mistakes & QA cheat sheet</span>
                  </div>
                </label>
              </div>
            </div>

            <button class="btn btn-primary btn-block" id="btn-generate-notes">
              ✨ Generate AI Notes
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
              <span>Generating Notes with Notes Agent...</span>
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
    const editor = container.querySelector("#note-editor");

    generateBtn.addEventListener("click", async () => {
      const topic = topicInput.value.trim();
      if (!topic) {
        ui.showToast("Please enter a topic name", "warning");
        return;
      }

      // Check radio selection
      const mode = container.querySelector("input[name='note-mode']:checked").value;
      
      // Toggle loading spinner
      loader.classList.remove("hidden");
      generateBtn.disabled = true;

      try {
        const notesData = await this.generateNotes(topic, mode);
        this.currentNoteTitle = `${topic.toLowerCase().replace(/\s+/g, '-')}-${mode}-notes`;
        this.currentNoteContent = notesData;

        editor.value = notesData;
        editor.removeAttribute("disabled");
        downloadBtn.removeAttribute("disabled");
        loader.classList.add("hidden");
        generateBtn.removeAttribute("disabled");

        // Gamification reward
        store.addGeneratedNote(topic, notesData);
        gamification.addXP(50);
        gamification.unlockBadge("note_creator");
        ui.showToast("Notes generated! +50 XP", "success");
      } catch (err) {
        console.error("Failed to generate notes:", err);
        loader.classList.add("hidden");
        generateBtn.removeAttribute("disabled");
        ui.showToast("Unable to generate notes for this topic. Please try again.", "danger");
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

  async generateNotes(topic, mode) {
    const topicData = await mockSearch.resolve(topic);
    const divider = "==================================================";
    let modeLabel = mode.toUpperCase() + " STUDY NOTES";

    let content = `${divider}\n`;
    content += `📖 TOPIC: ${topicData.topic.toUpperCase()}\n`;
    content += `🛠️ MODE: ${modeLabel}\n`;
    content += `🤖 GENERATED BY: Vidyaverse AI Notes Agent\n`;
    content += `${divider}\n\n`;

    if (mode === "quick") {
      content += `1. Core Overview:\n`;
      content += `   ${topicData.overview}\n\n`;
      content += `2. Essential Key Concepts:\n`;
      (topicData.concepts || []).forEach(c => {
        content += `   - ${c.title}: ${c.desc}\n`;
      });
      content += `\n3. Formula Block:\n`;
      (topicData.formulas || []).forEach(f => {
        content += `   [ ${f.name} ]: ${f.eq} (${f.desc})\n`;
      });
      content += `\n4. Quick Takeaway:\n`;
      content += `   ${topicData.examNotes || "Review the principal constants and practice drawing free body diagrams."}`;
    } else if (mode === "detailed") {
      content += `1. Introduction & Theoretical Origin:\n`;
      content += `   ${topicData.overview}\n\n`;
      content += `   ${topicData.explanation || ""}\n\n`;
      content += `2. Exhaustive Concepts Analysis:\n`;
      (topicData.concepts || []).forEach(c => {
        content += `   - ${c.title}: ${c.desc}\n`;
      });
      content += `\n3. Critical Formulas & Equations:\n`;
      (topicData.formulas || []).forEach(f => {
        content += `   - ${f.name}: ${f.eq}\n`;
        content += `     Description: ${f.desc}\n`;
      });
      content += `\n4. Practice Questions & Solutions:\n`;
      (topicData.questions || []).forEach((q, idx) => {
        content += `   Q${idx + 1}: ${q.q}\n`;
        content += `   Answer: ${q.a || q.explanation}\n\n`;
      });
    } else if (mode === "revision") {
      content += `💡 QUICK REVISION SHEET: ${topicData.topic}\n\n`;
      content += `⚡ Key Term Glossary:\n`;
      (topicData.definitions || []).forEach(d => {
        content += `   - ${d.term}: ${d.def}\n`;
      });
      content += `\n🎯 Crucial Formula Chest:\n`;
      (topicData.formulas || []).forEach(f => {
        content += `   - ${f.name}: ${f.eq}\n`;
      });
      content += `\n⚠️ Common Pitfalls to Avoid in Exams:\n`;
      (topicData.mistakes || []).forEach(m => {
        content += `   - ${m.title}: ${m.desc}\n`;
      });
    } else {
      content += `🎓 EXAM CHEATSHEET: ${topicData.topic}\n\n`;
      content += `1. Important Exam Tips:\n`;
      content += `   ${topicData.examNotes || "Study the core formulas and double check all unit conversions."}\n\n`;
      content += `2. Quick Revision Checklist:\n`;
      (topicData.revision || []).forEach(r => {
        content += `   [ ] ${r}\n`;
      });
      content += `\n3. Common Mistakes Alert:\n`;
      (topicData.mistakes || []).forEach(m => {
        content += `   ❌ ${m.title}: ${m.desc}\n`;
      });
    }

    return content;
  }
}

export const notesView = new NotesView();
