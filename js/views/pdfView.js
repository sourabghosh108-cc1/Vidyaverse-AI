/**
 * PDF Summarizer View Module (Upgraded to v2.0 with Claude API Integration)
 * Handles document uploads, real-time PDF text extraction using PDF.js,
 * automatic matching with the topic database, fallback heuristic summarizing,
 * Claude API summaries, and summaries downloading/copying.
 * Includes timeout protection and E2E error handling.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

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
      
      const regexTopic = new RegExp(t.topic.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      const matchesTopic = textLower.match(regexTopic);
      if (matchesTopic) count += matchesTopic.length * 6;
      
      if (t.aliases) {
        t.aliases.forEach(alias => {
          const regexAlias = new RegExp(alias.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
          const matchesAlias = textLower.match(regexAlias);
          if (matchesAlias) count += matchesAlias.length * 4;
        });
      }

      if (t.keywords) {
        t.keywords.forEach(kw => {
          const regexKw = new RegExp('\\b' + kw.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'g');
          const matchesKw = textLower.match(regexKw);
          if (matchesKw) count += matchesKw.length;
        });
      }
      
      if (count > highestCount && count > 4) {
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
  
  const abstract = cleanedSentences.slice(0, 3).join(" ") || "This document contains parsed educational material covering the topics outlined in the file.";
  
  const concepts = [];
  lines.forEach(line => {
    if (line.length > 5 && line.length < 50 && (line.endsWith(":") || /^[A-Z]/.test(line)) && concepts.length < 3) {
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

  const tips = [];
  cleanedSentences.forEach(s => {
    if ((s.toLowerCase().includes("should") || s.toLowerCase().includes("must") || s.toLowerCase().includes("important") || s.toLowerCase().includes("always")) && tips.length < 3) {
      tips.push(s);
    }
  });
  const examTips = tips.join(" ") || "Review standard constants, verify units before calculation, and structure answers in numbered bullet points.";

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
    this.summaryLength = "medium"; // Defaults to medium
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

            <!-- Summary Length Selector -->
            <div class="summary-length-selector-container" style="margin-top:20px; margin-bottom: 20px;">
              <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--text-secondary);">Summary Length</label>
              <div class="length-buttons-group" style="display:flex; gap:8px;">
                <button class="btn btn-outline btn-sm" data-length="short" style="flex:1;">Short</button>
                <button class="btn btn-primary btn-sm" data-length="medium" style="flex:1;">Medium</button>
                <button class="btn btn-outline btn-sm" data-length="long" style="flex:1;">Long</button>
              </div>
            </div>

            <button class="btn btn-primary btn-block" id="btn-summarize-pdf" disabled>
              ⚡ Summarize Document
            </button>
          </div>

          <!-- Summary display workspace -->
          <div class="pdf-summary-workspace card">
            <div class="workspace-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <h3>Summarization Output</h3>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-outline btn-sm" id="btn-copy-summary" disabled>
                  📋 Copy
                </button>
                <button class="btn btn-outline btn-sm" id="btn-download-summary" disabled>
                  💾 Download
                </button>
              </div>
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
    const copyBtn = container.querySelector("#btn-copy-summary");
    const loader = container.querySelector("#pdf-loader");
    const progressFill = container.querySelector("#pdf-progress-fill");
    const stepText = container.querySelector("#progress-step-text");
    const percentText = container.querySelector("#progress-percent-text");
    const resultsContainer = container.querySelector("#pdf-results");
    const placeholder = container.querySelector("#pdf-results-placeholder");

    // Length selection buttons
    const lengthButtons = container.querySelectorAll(".length-buttons-group button");
    
    lengthButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        lengthButtons.forEach(b => {
          b.classList.remove("btn-primary");
          b.classList.add("btn-outline");
        });
        btn.classList.remove("btn-outline");
        btn.classList.add("btn-primary");
        this.summaryLength = btn.getAttribute("data-length");
      });
    });

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
      copyBtn.setAttribute("disabled", "true");

      const updateProgress = (step, percent) => {
        progressFill.style.width = `${percent}%`;
        percentText.textContent = `${percent}%`;
        stepText.textContent = step;
      };

      console.log("PDF generation started for file:", activeFile.name);

      try {
        const parsingPromise = (async () => {
          const apiKey = store.getAnthropicApiKey();
          
          if (apiKey) {
            // Real Claude API summarized path
            updateProgress("Converting file to base64 buffer...", 30);
            
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                const base64String = result.split(',')[1];
                resolve(base64String);
              };
              reader.onerror = reject;
              reader.readAsDataURL(activeFile);
            });

            updateProgress("Sending request to Claude AI (Sonnet)...", 60);

            const lengthGuide = {
              short: '2-3 sentences',
              medium: '4-6 sentences',
              long: '2-3 paragraphs'
            };

            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
              },
              body: JSON.stringify({
                model: 'claude-3-5-sonnet-latest',
                max_tokens: 2000,
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'document',
                        source: {
                          type: 'base64',
                          media_type: 'application/pdf',
                          data: base64
                        }
                      },
                      {
                        type: 'text',
                        text: `Summarize this PDF document in approximately ${lengthGuide[this.summaryLength]}. Focus on the main points and key information.`
                      }
                    ]
                  }
                ]
              })
            });

            if (!response.ok) {
              const data = await response.json().catch(() => ({}));
              throw new Error(data.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            const summaryText = data.content[0].text;
            
            updateProgress("Finalizing summaries...", 95);
            return {
              isClaude: true,
              overview: summaryText,
              concepts: [],
              definitions: [],
              formulas: [],
              examNotes: "",
              revision: []
            };
          }

          // Local offline parser fallback path
          const { text, numPages } = await extractTextFromPDF(activeFile, updateProgress);
          
          if (!text || text.trim().length === 0) {
            throw new Error("Unable to extract text from this PDF. Please try another file.");
          }
          
          updateProgress("Analyzing and matching content...", 80);
          
          const matched = await matchPDFToDatabase(text);
          let summaryData = null;
          
          if (matched) {
            summaryData = matched;
          } else {
            summaryData = generateHeuristicSummary(activeFile.name, text);
          }

          // Trim/expand local summaries based on chosen length
          if (this.summaryLength === "short") {
            summaryData.overview = summaryData.overview.split(".").slice(0, 2).join(".") + ".";
            summaryData.concepts = summaryData.concepts.slice(0, 1);
            summaryData.definitions = summaryData.definitions.slice(0, 1);
            summaryData.formulas = [];
          } else if (this.summaryLength === "medium") {
            summaryData.overview = summaryData.overview.split(".").slice(0, 4).join(".") + ".";
            summaryData.concepts = summaryData.concepts.slice(0, 2);
            summaryData.definitions = summaryData.definitions.slice(0, 2);
          }

          updateProgress("Finalizing summaries...", 95);
          await new Promise(resolve => setTimeout(resolve, 500));
          return summaryData;
        })();

        // Wrap parsing/summarizing in a 15s timeout
        const summaryData = await withTimeout(parsingPromise, 15000, "Generation timed out. Please try again.");
        
        const summaryHTML = this.renderGeneratedSummary(activeFile.name, summaryData);
        resultsContainer.innerHTML = summaryHTML;
        downloadBtn.removeAttribute("disabled");
        copyBtn.removeAttribute("disabled");

        console.log("PDF generation completed successfully for file:", activeFile.name);
        ui.showToast("Document summarized! +75 XP", "success");

        store.addSummarizedPDF(activeFile.name);
        gamification.addXP(75);
        gamification.unlockBadge("pdf_parser");
        
      } catch (err) {
        console.error("PDF generation failed:", err);
        console.log("PDF generation failed:", err.message);

        const isTimeout = err.message.includes("timed out");
        const displayErr = isTimeout ? "Generation timed out. Please try again." : err.message;

        resultsContainer.innerHTML = `
          <div class="card error-state animate-fade-in" style="border-color: var(--color-danger); padding:24px; text-align:center;">
            <span style="font-size:2.5rem; display:block; margin-bottom:12px;">⚠️</span>
            <h3 style="color: var(--color-danger); margin-bottom:8px;">Extraction Failed</h3>
            <p>${displayErr}</p>
          </div>
        `;
        ui.showToast(displayErr, "danger");
      } finally {
        loader.classList.add("hidden");
        summarizeBtn.removeAttribute("disabled");
      }
    });

    copyBtn.addEventListener("click", () => {
      if (!this.currentSummaryContent) return;

      navigator.clipboard.writeText(this.currentSummaryContent).then(() => {
        copyBtn.textContent = "✅ Copied!";
        ui.showToast("Summary copied to clipboard!", "success");
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy";
        }, 2000);
      }).catch(err => {
        console.error("Clipboard copy failed:", err);
        ui.showToast("Failed to copy summary.", "danger");
      });
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

    if (data.isClaude) {
      this.currentSummaryContent = `==================================================
📄 CLAUDE AI SUMMARY: ${filename.toUpperCase()}
🤖 ANALYZED BY: Anthropic Claude Sonnet 3.5
==================================================

${data.overview}`;

      return `
        <div class="summary-results-wrap animate-fade-in">
          <div class="result-card">
            <h4>📁 Claude AI Summary of: ${filename}</h4>
            <div style="background: var(--bg-color); padding:20px; border-radius:var(--radius-sm); border:1px solid var(--border-color); color:var(--text-primary); white-space:pre-wrap; line-height:1.6; max-height:400px; overflow-y:auto; margin-top:12px; font-size: 0.95rem;">
              ${data.overview}
            </div>
          </div>
        </div>
      `;
    }

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
