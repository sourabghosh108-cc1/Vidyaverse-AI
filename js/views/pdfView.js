/**
 * PDF Summarizer View Module (Upgraded to v2.0)
 * Handles document uploads, real-time PDF text extraction using PDF.js,
 * automatic matching with the topic database, fallback heuristic summarizing,
 * and summaries downloading.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

// Helper to load PDF.js dynamically from CDN
function loadPDFJS() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => {
      reject(new Error("Unable to load PDF library. Please check your network connection."));
    };
    document.head.appendChild(script);
  });
}

// Helper to extract text page-by-page
async function extractTextFromPDF(file, onProgress) {
  const pdfjs = await loadPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress("Initializing parser...", 10);
  
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = "";
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
    
    // Scale pages extraction progress from 20% to 80%
    const percent = Math.round(20 + (i / numPages) * 60);
    onProgress(`Extracting page ${i} of ${numPages}...`, percent);
  }
  
  return { text: fullText, numPages };
}

// Database topic matcher
async function matchPDFToDatabase(text) {
  try {
    const res = await fetch('./data/educational_database.json');
    if (!res.ok) return null;
    const db = await res.json();
    if (!db || db.length === 0) return null;
    
    let bestMatch = null;
    let highestCount = 0;
    const textLower = text.toLowerCase();
    
    for (const t of db) {
      let count = 0;
      
      // Match topic title (case-insensitive)
      const regexTopic = new RegExp(t.topic.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      const matchesTopic = textLower.match(regexTopic);
      if (matchesTopic) count += matchesTopic.length * 6; // High weight
      
      // Match aliases
      if (t.aliases) {
        t.aliases.forEach(alias => {
          const regexAlias = new RegExp(alias.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
          const matchesAlias = textLower.match(regexAlias);
          if (matchesAlias) count += matchesAlias.length * 4;
        });
      }

      // Match keywords
      if (t.keywords) {
        t.keywords.forEach(kw => {
          const regexKw = new RegExp('\\b' + kw.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'g');
          const matchesKw = textLower.match(regexKw);
          if (matchesKw) count += matchesKw.length;
        });
      }
      
      if (count > highestCount && count > 4) { // Requires a minimum number of matches
        highestCount = count;
        bestMatch = t;
      }
    }
    
    return bestMatch;
  } catch (err) {
    console.error("Error matching PDF to database", err);
    return null;
  }
}

// Fallback heuristic text summarizer
function generateHeuristicSummary(filename, text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const cleanedSentences = sentences.map(s => s.trim()).filter(s => s.length > 8);
  
  // 1. Chapter summary (Abstract)
  const abstract = cleanedSentences.slice(0, 3).join(" ") || "This document contains parsed educational material covering the topics outlined in the file.";
  
  // 2. Key Concepts
  const concepts = [];
  lines.forEach(line => {
    if (line.length > 5 && line.length < 50 && (line.endsWith(":") || /^[A-Z]/.test(line)) && concepts.length < 3) {
      // Find the next line for description
      const descLine = lines[lines.indexOf(line) + 1] || "Core structural framework.";
      if (descLine.length > 10) {
        concepts.push({
          title: line.replace(/:$/, ""),
          desc: descLine
        });
      }
    }
  });
  while (concepts.length < 2) {
    concepts.push({
      title: "Core Concept " + (concepts.length + 1),
      desc: cleanedSentences[Math.min(concepts.length + 2, cleanedSentences.length - 1)] || "Essential structural parameter and system dynamics."
    });
  }
  
  // 3. Definitions
  const definitions = [];
  const defRegex = /\b([a-zA-Z\s]{3,24})\b\s+(?:is defined as|refers to|is the|is a|means)\s+([^.]+)\./i;
  cleanedSentences.forEach(s => {
    const match = s.match(defRegex);
    if (match && definitions.length < 3) {
      definitions.push({
        term: match[1].trim(),
        def: match[2].trim() + "."
      });
    }
  });
  if (definitions.length === 0) {
    definitions.push({ term: "Key Parameter", def: "A variable or property whose value determines the system characteristics." });
    definitions.push({ term: "Equilibrium Boundary", def: "The physical limits or criteria under which the system equations remain valid." });
  }
  
  // 4. Formulas
  const formulas = [];
  lines.forEach(line => {
    if ((line.includes("=") || line.includes("+") || line.includes("-") || line.includes("*")) && /\d|[a-zA-Z]/.test(line) && line.length < 60 && formulas.length < 3) {
      formulas.push({
        name: "Equation " + (formulas.length + 1),
        eq: line,
        desc: "Mathematical relationship extracted directly from the document."
      });
    }
  });
  if (formulas.length === 0) {
    formulas.push({
      name: "Proportionality Model",
      eq: "R = f(x) | constant = k",
      desc: "Standard constant representing the base scaling coefficient."
    });
  }

  // 5. Exam Tips
  const tips = [];
  cleanedSentences.forEach(s => {
    if ((s.toLowerCase().includes("should") || s.toLowerCase().includes("must") || s.toLowerCase().includes("important") || s.toLowerCase().includes("always")) && tips.length < 3) {
      tips.push(s);
    }
  });
  const examTips = tips.join(" ") || "Review standard constants, verify units before calculation, and structure answers in numbered bullet points.";

  // 6. Revision Notes
  const revision = [];
  lines.forEach(line => {
    if ((line.startsWith("-") || line.startsWith("*") || /^\d+\./.test(line)) && revision.length < 5) {
      revision.push(line.replace(/^[-*\d.\s]+/, ""));
    }
  });
  if (revision.length < 3) {
    revision.push("Check all boundary conditions before starting mathematical solutions.");
    revision.push("Convert dimensions to standard SI / Metric parameters (meters, kilograms).");
    revision.push("Practice qualitative diagrams to solidify conceptual understanding.");
  }

  return {
    topic: filename.replace(/\.[^/.]+$/, ""),
    overview: abstract,
    concepts,
    definitions,
    formulas,
    examNotes: examTips,
    revision
  };
}

class PDFView {
  constructor() {
    this.currentSummaryTitle = "";
    this.currentSummaryContent = "";
  }

  render() {
    const container = document.getElementById("view-pdf");
    if (!container) return;

    container.innerHTML = `
      <div class="pdf-layout-wrapper animate-fade-in">
        <header class="pdf-header-card card">
          <h2>📄 PDF Summarizer</h2>
          <p>Analyze any textbook chapter or notes document instantly. Upload a file to extract terms and revision sheets.</p>
        </header>

        <div class="pdf-grid">
          <!-- Dropzone & file selector -->
          <div class="pdf-uploader-section card">
            <h3>Upload Study Document</h3>
            
            <div class="pdf-dropzone" id="pdf-dropzone">
              <span class="dropzone-icon">📥</span>
              <p>Drag and drop your PDF here, or <strong class="text-gradient">browse files</strong></p>
              <input type="file" id="pdf-file-input" accept=".pdf" style="display: none;" />
            </div>

            <!-- Upload state/details -->
            <div class="file-details-box hidden" id="file-details">
              <span class="file-icon">📄</span>
              <div class="file-info-text">
                <strong id="file-name">chemistry-notes-ch3.pdf</strong>
                <span id="file-size">1.2 MB</span>
              </div>
              <button class="close-btn" id="btn-remove-file" title="Remove file">×</button>
            </div>

            <button class="btn btn-primary btn-block" id="btn-summarize-pdf" disabled>
              ⚡ Summarize Document
            </button>
          </div>

          <!-- Summary display workspace -->
          <div class="pdf-summary-workspace card">
            <div class="workspace-header">
              <h3>Summarization Output</h3>
              <button class="btn btn-outline btn-sm" id="btn-download-summary" disabled>
                💾 Download Summary
              </button>
            </div>

            <!-- Loader Progress Bar -->
            <div class="pdf-progress-overlay hidden" id="pdf-loader">
              <div class="progress-info-text">
                <span id="progress-step-text">Reading document...</span>
                <span id="progress-percent-text">0%</span>
              </div>
              <div class="modal-progress-bar">
                <div class="progress-bar-fill" id="pdf-progress-fill" style="width: 0%;"></div>
              </div>
            </div>

            <!-- Results container -->
            <div class="pdf-summary-results-container" id="pdf-results">
              <div class="placeholder-summary-text" id="pdf-results-placeholder">
                <p>Upload a document and click "Summarize" to view structural overviews, glossary terms, and formulas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const dropzone = container.querySelector("#pdf-dropzone");
    const fileInput = container.querySelector("#pdf-file-input");
    const fileDetails = container.querySelector("#file-details");
    const fileNameText = container.querySelector("#file-name");
    const fileSizeText = container.querySelector("#file-size");
    const removeBtn = container.querySelector("#btn-remove-file");
    const summarizeBtn = container.querySelector("#btn-summarize-pdf");
    const downloadBtn = container.querySelector("#btn-download-summary");
    const loader = container.querySelector("#pdf-loader");
    const progressFill = container.querySelector("#pdf-progress-fill");
    const stepText = container.querySelector("#progress-step-text");
    const percentText = container.querySelector("#progress-percent-text");
    const resultsContainer = container.querySelector("#pdf-results");
    const placeholder = container.querySelector("#pdf-results-placeholder");

    let activeFile = null;

    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    const handleFileSelect = (file) => {
      // Check file type
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        ui.showToast("Only PDF files are supported.", "warning");
        return;
      }
      activeFile = file;
      fileNameText.textContent = file.name;
      
      const sizeKB = file.size / 1024;
      const sizeMB = sizeKB / 1024;
      fileSizeText.textContent = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;

      fileDetails.classList.remove("hidden");
      summarizeBtn.removeAttribute("disabled");
      dropzone.classList.add("hidden");
    };

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      activeFile = null;
      fileInput.value = "";
      fileDetails.classList.add("hidden");
      summarizeBtn.setAttribute("disabled", "true");
      dropzone.classList.remove("hidden");
    });

    summarizeBtn.addEventListener("click", async () => {
      if (!activeFile) return;

      loader.classList.remove("hidden");
      summarizeBtn.disabled = true;
      placeholder.style.display = "none";
      resultsContainer.innerHTML = "";
      downloadBtn.setAttribute("disabled", "true");

      const updateProgress = (step, percent) => {
        progressFill.style.width = `${percent}%`;
        percentText.textContent = `${percent}%`;
        stepText.textContent = step;
      };

      try {
        const { text, numPages } = await extractTextFromPDF(activeFile, updateProgress);
        
        if (!text || text.trim().length === 0) {
          throw new Error("Empty text extracted.");
        }
        
        updateProgress("Analyzing and matching content...", 85);
        
        // Run matching or fallback
        const matched = await matchPDFToDatabase(text);
        let summaryData = null;
        
        if (matched) {
          summaryData = matched;
          updateProgress("Matched to topic: " + matched.topic, 95);
        } else {
          summaryData = generateHeuristicSummary(activeFile.name, text);
          updateProgress("Generating heuristic summaries...", 95);
        }
        
        setTimeout(() => {
          loader.classList.add("hidden");
          summarizeBtn.removeAttribute("disabled");
          
          const summaryHTML = this.renderGeneratedSummary(activeFile.name, summaryData);
          resultsContainer.innerHTML = summaryHTML;
          downloadBtn.removeAttribute("disabled");

          // Gamification reward
          store.addSummarizedPDF(activeFile.name);
          gamification.addXP(75);
          gamification.unlockBadge("pdf_parser");
          ui.showToast("Document summarized! +75 XP", "success");
        }, 500);
        
      } catch (err) {
        console.error("PDF summarization failed:", err);
        loader.classList.add("hidden");
        summarizeBtn.removeAttribute("disabled");
        
        resultsContainer.innerHTML = `
          <div class="card error-state animate-fade-in" style="border-color: var(--color-danger); padding:24px; text-align:center;">
            <span style="font-size:2.5rem; display:block; margin-bottom:12px;">⚠️</span>
            <h3 style="color: var(--color-danger); margin-bottom:8px;">Extraction Failed</h3>
            <p>Unable to extract text from this PDF. Please try another file.</p>
          </div>
        `;
        ui.showToast("Unable to extract text from this PDF. Please try another file.", "danger");
      }
    });

    downloadBtn.addEventListener("click", () => {
      if (!this.currentSummaryContent) return;

      const blob = new Blob([this.currentSummaryContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${this.currentSummaryTitle}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      ui.showToast("Summary downloaded successfully!", "success");
    });
  }

  renderGeneratedSummary(filename, data) {
    const rawName = filename.replace(/\.[^/.]+$/, ""); // Strip extension
    this.currentSummaryTitle = `${rawName}-summary`;

    const summaryText = `==================================================
📄 DOCUMENT SUMMARY: ${filename.toUpperCase()}
🤖 ANALYZED BY: Vidyaverse AI PDF Agent
==================================================

1. DOCUMENT ABSTRACT / SUMMARY:
   ${data.overview}

2. KEY CONCEPTS DELINEATED:
   ${(data.concepts || []).map(c => `- ${c.title}: ${c.desc}`).join("\n   ")}

3. GLOSSARY OF TERMS & DEFINITIONS:
   ${(data.definitions || []).map(d => `- ${d.term}: ${d.def}`).join("\n   ")}

4. FORMULA SHEET:
   ${(data.formulas || []).map(f => `- ${f.name}: ${f.eq} (${f.desc})`).join("\n   ")}

5. EXAM TIPS:
   ${data.examNotes}

6. REVISION SHEET & QUICK TAKEAWAYS:
   ${(data.revision || []).map(r => `- ${r}`).join("\n   ")}`;

    this.currentSummaryContent = summaryText;

    return `
      <div class="summary-results-wrap animate-fade-in">
        <div class="result-card">
          <h4>📁 Summary of: ${filename}</h4>
          <p><strong>Abstract:</strong> ${data.overview}</p>
        </div>

        <div class="result-card">
          <h4>💡 Extracted Key Concepts</h4>
          <div class="concepts-grid">
            ${(data.concepts || []).map(c => `
              <div class="concept-subcard">
                <h5>${c.title}</h5>
                <p>${c.desc}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="result-card">
          <h4>📖 Important Terms Glossary</h4>
          <ul class="styled-list">
            ${(data.definitions || []).map(d => `
              <li>🔑 <strong>${d.term}:</strong> ${d.def}</li>
            `).join("")}
          </ul>
        </div>

        <div class="result-card">
          <h4>📐 Formula Sheet</h4>
          <div class="formulas-grid">
            ${(data.formulas || []).map(f => `
              <div class="formula-card card">
                <div class="formula-title">${f.name}</div>
                <code class="formula-equation" style="color:var(--color-primary); font-weight:700;">${f.eq}</code>
                <div class="formula-desc">${f.desc}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="result-card">
          <h4>💡 Exam Tips</h4>
          <div class="exam-notes-text-box">
            <p>${data.examNotes}</p>
          </div>
        </div>

        <div class="result-card card revision-list-card">
          <h4>⚡ Quick Revision Sheet</h4>
          <ul class="revision-bullet-list">
            ${(data.revision || []).map(r => `
              <li>🎯 ${r}</li>
            `).join("")}
          </ul>
        </div>
      </div>
    `;
  }
}

export const pdfView = new PDFView();
