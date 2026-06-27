/**
 * Notes View Module (AI Notes Generator)
 * Builds structured study sheets, provides manual editing,
 * and handles downloading files.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

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

    generateBtn.addEventListener("click", () => {
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

      // Mock compilation delay
      setTimeout(() => {
        const notesData = this.generateMockNotes(topic, mode);
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
      }, 1500);
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

  generateMockNotes(topic, mode) {
    const divider = "==================================================";
    let modeLabel = mode.toUpperCase() + " STUDY NOTES";

    let content = `${divider}\n`;
    content += `📖 TOPIC: ${topic.toUpperCase()}\n`;
    content += `🛠️ MODE: ${modeLabel}\n`;
    content += `🤖 GENERATED BY: Vidyaverse AI Notes Agent\n`;
    content += `${divider}\n\n`;

    if (mode === "quick") {
      content += `1. Core Overview:\n`;
      content += `   - ${topic} represents a fundamental component within the exam syllabus.\n`;
      content += `   - Primary parameters include spatial distributions, kinetics, and coefficients.\n\n`;
      content += `2. Essential Bullet Points:\n`;
      content += `   - Key Variable (X): Determines the structural magnitude of the system.\n`;
      content += `   - Boundary Value: All computations are solved assuming standard equilibrium.\n`;
      content += `   - Practical Use: Commonly tested in mechanics, accounting balances, and reactions.\n\n`;
      content += `3. Formula Block:\n`;
      content += `   [ Result = (Input Variable * Coefficient) / (Loss Factor) ]\n\n`;
      content += `4. Quick Takeaway:\n`;
      content += `   - Review the proportionality factors to solve direct MCQ questions easily.`;
    } else if (mode === "detailed") {
      content += `1. Introduction & Theoretical Origin:\n`;
      content += `   The conceptual roots of ${topic} trace back to early structural models. In standard curricula, it forms the basis of complex applications, evaluating how multiple input forces or account sheets reconcile over time.\n\n`;
      content += `2. Exhaustive Analysis:\n`;
      content += `   - Mechanism A (Qualitative): Identifies how variables behave under vacuum or standard pressure.\n`;
      content += `   - Mechanism B (Quantitative): Solved by drawing vector diagrams or ledger balances to find net balances.\n`;
      content += `   - Interconnected Systems: Interlinks directly with advanced syllabus units.\n\n`;
      content += `3. Critical Formulas & Derivations:\n`;
      content += `   - Equation: Force/Value = Constant * (Variable_1 * Variable_2) / Distance^2\n`;
      content += `   - Constant Details: Value equals standard atmospheric constant or basic tax ratios.\n\n`;
      content += `4. Practical Applications & Real-world Scenarios:\n`;
      content += `   - Seen in capacitor design, industrial chemical reactors, or corporate audit filings.\n`;
      content += `   - High-level research papers model these formulas to test tensile strengths and margins.`;
    } else if (mode === "revision") {
      content += `💡 QUICK REVISION SHEET: ${topic}\n\n`;
      content += `⚡ Key Term Glossary:\n`;
      content += `   - Term 1: The standard quantity representing net charge or assets.\n`;
      content += `   - Term 2: The resistance encountered during transfer rates.\n\n`;
      content += `🎯 Crucial Formula Chest:\n`;
      content += `   - Equation A: V = I * R | Assets = Liabilities + Capital\n`;
      content += `   - Equation B: Power = 1 / Focal_Length | Net Income = Revenues - Expenses\n\n`;
      content += `⚠️ Common Pitfalls to Avoid in Exams:\n`;
      content += `   - Forgetting to convert lengths to SI meters (e.g. cm to m).\n`;
      content += `   - Debit-Credit mixups: Assets rise with Debits, Liabilities rise with Credits.\n`;
      content += `   - Confusing electrophiles with nucleophiles.`;
    } else {
      content += `🎓 EXAM CHEATSHEET: ${topic}\n\n`;
      content += `1. High-Probability Exam Questions:\n`;
      content += `   Q: How do you balance variable changes in the system?\n`;
      content += `   A: Resolve forces vertically/horizontally or compile balances in the Trial Balance.\n\n`;
      content += `2. Key Numerical Shortcuts:\n`;
      content += `   - When distance halves, Coulomb force quadruples.\n`;
      content += `   - Profit margin ratios can be quickly verified by dividing Operating Income by Net Sales.\n\n`;
      content += `3. Quick Checklist:\n`;
      content += `   [ ] FBD drawn correctly with all friction vectors\n`;
      content += `   [ ] Accrual adjustments verified for outstanding salaries\n`;
      content += `   [ ] Valence electrons counts check (Tetravalency = 4 bonds)\n`;
      content += `   [ ] Formula constants matched with unit variables`;
    }

    return content;
  }
}

export const notesView = new NotesView();
