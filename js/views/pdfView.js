/**
 * PDF Summarizer View Module
 * Handles mock document uploads, progress scanners,
 * and summaries downloading.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

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
              <input type="file" id="pdf-file-input" accept=".pdf,.txt,.doc,.docx" style="display: none;" />
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

    // Trigger click on file selector
    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });

    // Drag-Drop handlers
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
      activeFile = file;
      fileNameText.textContent = file.name;
      
      // Format file size
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

    summarizeBtn.addEventListener("click", () => {
      if (!activeFile) return;

      loader.classList.remove("hidden");
      summarizeBtn.disabled = true;
      placeholder.style.display = "none";
      resultsContainer.innerHTML = "";

      let progress = 0;
      const steps = [
        "Initializing parser...",
        "Extracting page elements...",
        "Analyzing key text blocks...",
        "Summarizing concepts...",
        "Generating vocabulary sheet..."
      ];

      const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = `${progress}%`;
        percentText.textContent = `${progress}%`;

        // Switch progress messages
        const stepIndex = Math.min(Math.floor(progress / 20), steps.length - 1);
        stepText.textContent = steps[stepIndex];

        if (progress >= 100) {
          clearInterval(interval);
          
          setTimeout(() => {
            loader.classList.add("hidden");
            summarizeBtn.removeAttribute("disabled");
            
            const summaryHTML = this.renderGeneratedSummary(activeFile.name);
            resultsContainer.innerHTML = summaryHTML;
            downloadBtn.removeAttribute("disabled");

            // Gamification reward
            store.addSummarizedPDF(activeFile.name);
            gamification.addXP(75);
            gamification.unlockBadge("pdf_parser");
            ui.showToast("Document summarized! +75 XP", "success");
          }, 400);
        }
      }, 250);
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

  renderGeneratedSummary(filename) {
    const rawName = filename.replace(/\.[^/.]+$/, ""); // Strip extension
    this.currentSummaryTitle = `${rawName}-summary`;

    const summaryText = `==================================================
📄 DOCUMENT SUMMARY: ${filename.toUpperCase()}
🤖 ANALYZED BY: Vidyaverse AI PDF Agent
==================================================

1. DOCUMENT ABSTRACT:
   This file contains structured study materials relating to key chapters of the syllabus. The core focus centers on defining operational parameters, solving variable distributions, and establishing boundary conditions.

2. KEY CONCEPTS DELINEATED:
   - Principle of Relative Magnitudes: The magnitude scale changes exponentially relative to distance or volume.
   - Equilibrium Constraints: Formulates how inputs and output variables remain constant during steady-state analysis.

3. GLOSSARY OF TERMS:
   - Primary Coefficient: The proportionality constant used to align structural equations.
   - Gradient Threshold: The rate of change limit before dielectric breakdown or tax rate scaling is triggered.

4. REVISION SHEET & QUICK TAKEAWAYS:
   - Review primary constants before solving equations.
   - Resolve variables into vectors before adding vectors.
   - Read footnotes to check unit scales.`;

    this.currentSummaryContent = summaryText;

    // Convert txt to HTML structures for screen rendering
    return `
      <div class="summary-results-wrap animate-fade-in">
        <div class="result-card">
          <h4>📁 Summary of: ${filename}</h4>
          <p><strong>Abstract:</strong> This document covers fundamental academic principles. The text maps core variables, mathematical models, and equilibrium states typical of standard board and competitive exam modules.</p>
        </div>

        <div class="result-card">
          <h4>💡 Extracted Key Concepts</h4>
          <div class="concepts-grid">
            <div class="concept-subcard">
              <h5>Relative Magnitudes</h5>
              <p>Values change exponentially relative to distances or base ledger sizes.</p>
            </div>
            <div class="concept-subcard">
              <h5>Equilibrium constraints</h5>
              <p>Formulates how variables reconcile in steady-state models.</p>
            </div>
          </div>
        </div>

        <div class="result-card">
          <h4>📖 Important Terms Glossary</h4>
          <ul class="styled-list">
            <li>🔑 <strong>Primary Coefficient:</strong> Proportionality constant aligning structural equations.</li>
            <li>🔑 <strong>Gradient Threshold:</strong> Rate of change limit before system breakdown or scaling.</li>
          </ul>
        </div>

        <div class="result-card card revision-list-card">
          <h4>⚡ Revision Sheet</h4>
          <ul class="revision-bullet-list">
            <li>🎯 Review standard constants before solving equations.</li>
            <li>🎯 Convert all parameters to standard units (SI/INR).</li>
            <li>🎯 Resolve components into vector matrices when dealing with forces.</li>
          </ul>
        </div>
      </div>
    `;
  }
}

export const pdfView = new PDFView();
