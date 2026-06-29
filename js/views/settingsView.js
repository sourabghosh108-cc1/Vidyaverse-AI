/**
 * Settings & Profile View Module
 * Manages username saving, badges cabinet, data exports/imports,
 * and system reset actions.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { BADGES } from "../gamification.js";

class SettingsView {
  render() {
    const container = document.getElementById("view-settings");
    if (!container) return;

    const state = store.getState();
    const profile = state.profile;
    const unlocked = state.unlockedBadges;

    container.innerHTML = `
      <div class="settings-layout-wrapper animate-fade-in">
        <header class="settings-header-card card">
          <h2>⚙️ System Settings & Profile</h2>
          <p>Customize your credentials, review achievement badges, backup your study progress, or clear statistics.</p>
        </header>

        <div class="settings-grid">
          <!-- Left side: forms & utilities -->
          <div class="settings-left-col">
            <!-- Edit Profile Card -->
            <div class="card settings-profile-card">
              <h3>👤 Edit Student Profile</h3>
              
              <div class="form-group" style="margin-top:16px;">
                <label for="settings-name-input">Aspirant Name</label>
                <div class="input-inline-wrap">
                  <input type="text" id="settings-name-input" value="${profile.name}" />
                  <button class="btn btn-primary" id="btn-settings-save-name">Save Name</button>
                </div>
              </div>

              <div class="form-group">
                <label for="settings-exam-select">Default Exam syllabus</label>
                <select id="settings-exam-select" class="exam-selector-select">
                  <option value="class10" ${profile.selectedExam === "class10" ? "selected" : ""}>Class 10 Board Prep</option>
                  <option value="class12" ${profile.selectedExam === "class12" ? "selected" : ""}>Class 12 Board Prep</option>
                  <option value="jee" ${profile.selectedExam === "jee" ? "selected" : ""}>JEE Main & Advanced</option>
                  <option value="neet" ${profile.selectedExam === "neet" ? "selected" : ""}>NEET Preparation</option>
                  <option value="cuet" ${profile.selectedExam === "cuet" ? "selected" : ""}>CUET Entrance</option>
                  <option value="cafoundation" ${profile.selectedExam === "cafoundation" ? "selected" : ""}>CA Foundation</option>
                </select>
              </div>
            </div>

            <!-- AI API Key Settings -->
            <div class="card settings-api-card" style="margin-top: 24px;">
              <h3>🤖 AI API Key (Optional)</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 12px;">
                Enter your Anthropic API Key to enable Claude-powered PDF summaries and AI-generated study notes.
              </p>
              <div class="form-group">
                <label for="settings-api-key-input">Anthropic API Key</label>
                <div class="input-inline-wrap">
                  <input type="password" id="settings-api-key-input" value="${store.getAnthropicApiKey()}" placeholder="sk-ant-..." />
                  <button class="btn btn-primary" id="btn-settings-save-key">Save Key</button>
                </div>
              </div>
            </div>

            <!-- YouTube API Key Settings -->
            <div class="card settings-api-card" style="margin-top: 16px;">
              <h3>📺 YouTube API Key (Optional)</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 12px;">
                Enter your YouTube Data API v3 key to load real, topic-matched video lectures on every study guide page.
                Get a free key from <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary);">Google Cloud Console</a>.
              </p>
              <div class="form-group">
                <label for="settings-yt-key-input">YouTube Data API v3 Key</label>
                <div class="input-inline-wrap">
                  <input type="password" id="settings-yt-key-input" value="${store.getYouTubeApiKey()}" placeholder="AIza..." />
                  <button class="btn btn-primary" id="btn-settings-save-yt-key">Save Key</button>
                </div>
              </div>
            </div>

            <!-- Backup & Restore -->
            <div class="card settings-backup-card" style="margin-top: 24px;">
              <h3>📂 Study Data Backup</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">
                Save your progress (XP, streaks, unlocked badges) as a JSON file to transfer between browsers or backups.
              </p>
              
              <div class="backup-actions">
                <button class="btn btn-outline" id="btn-export-progress">
                  📤 Export Progress JSON
                </button>
                
                <button class="btn btn-outline" id="btn-trigger-import">
                  📥 Import Progress JSON
                </button>
                <input type="file" id="import-progress-file" accept=".json" style="display: none;" />
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="card settings-reset-card">
              <h3>⚠️ Danger Zone</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">
                Permanently delete all study statistics, XP, streaks, levels, and notes stored in this browser.
              </p>
              <button class="btn btn-danger btn-block" id="btn-wipe-data">
                Reset Progress Data
              </button>
            </div>
          </div>

          <!-- Right side: Badges Cabinet -->
          <div class="settings-right-col">
            <div class="card badges-cabinet-card">
              <h3>🏆 Achievements Cabinet</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                Unlocked badges will display in full color. Locked achievements remain in grayscale.
              </p>
              
              <div class="badges-cabinet-grid" id="settings-badges-grid">
                ${BADGES.map(badge => {
                  const isUnlocked = unlocked.includes(badge.id);
                  return `
                    <div class="badge-cabinet-item ${isUnlocked ? "" : "locked"}" title="${isUnlocked ? badge.desc : "Locked Achievement"}">
                      <div class="badge-cabinet-icon">${badge.icon}</div>
                      <div class="badge-cabinet-name">${badge.name}</div>
                      <div class="badge-cabinet-desc">${isUnlocked ? badge.desc : "Locked"}</div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>

            <!-- About Vidyaverse AI -->
            <div class="card about-box-card" style="margin-top: 32px;">
              <h3>🚀 About Vidyaverse AI</h3>
              <p style="font-size: 0.9rem; margin-bottom: 12px;"><strong>Version:</strong> 1.0.0 </p>
              <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
                Vidyaverse AI is a client-side gamified study workspace designed for competitive Indian exams. We respect user privacy by saving all logs locally on your machine without server-side databases or third-party cookies.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const saveNameBtn = container.querySelector("#btn-settings-save-name");
    const nameInput = container.querySelector("#settings-name-input");
    const examSelect = container.querySelector("#settings-exam-select");
    const exportBtn = container.querySelector("#btn-export-progress");
    const triggerImportBtn = container.querySelector("#btn-trigger-import");
    const importFileInput = container.querySelector("#import-progress-file");
    const wipeBtn = container.querySelector("#btn-wipe-data");

    // Save Name
    saveNameBtn.addEventListener("click", () => {
      const newName = nameInput.value.trim();
      if (newName) {
        store.setProfileName(newName);
        ui.showToast("Username updated successfully!", "success");
      }
    });

    // Save API Key (Anthropic)
    const saveKeyBtn = container.querySelector("#btn-settings-save-key");
    const keyInput = container.querySelector("#settings-api-key-input");
    if (saveKeyBtn && keyInput) {
      saveKeyBtn.addEventListener("click", () => {
        const newKey = keyInput.value.trim();
        store.setAnthropicApiKey(newKey);
        if (newKey) {
          ui.showToast("Anthropic API Key saved!", "success");
        } else {
          ui.showToast("Anthropic API Key cleared.", "warning");
        }
      });
    }

    // Save YouTube API Key
    const saveYtKeyBtn = container.querySelector("#btn-settings-save-yt-key");
    const ytKeyInput = container.querySelector("#settings-yt-key-input");
    if (saveYtKeyBtn && ytKeyInput) {
      saveYtKeyBtn.addEventListener("click", () => {
        const newKey = ytKeyInput.value.trim();
        store.setYouTubeApiKey(newKey);
        if (newKey) {
          ui.showToast("YouTube API Key saved! Videos will load on study pages.", "success");
        } else {
          ui.showToast("YouTube API Key cleared.", "warning");
        }
      });
    }


    // Save Exam
    examSelect.addEventListener("change", (e) => {
      const examId = e.target.value;
      store.setSelectedExam(examId);
      ui.showToast(`Switched default syllabus to ${examId.toUpperCase()}`, "success");
    });

    // Export progress JSON
    exportBtn.addEventListener("click", () => {
      const stateData = JSON.stringify(store.getState(), null, 2);
      const blob = new Blob([stateData], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vidyaverse-progress-backup.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      ui.showToast("Backup exported successfully!", "success");
    });

    // Import progress JSON
    triggerImportBtn.addEventListener("click", () => {
      importFileInput.click();
    });

    importFileInput.addEventListener("change", (e) => {
      if (e.target.files.length === 0) return;
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const importedState = JSON.parse(event.target.result);
          if (importedState.profile && importedState.progress) {
            localStorage.setItem("vidyaverse_ai_gamestate", JSON.stringify(importedState));
            ui.showToast("Progress imported successfully!", "success");
            setTimeout(() => window.location.reload(), 1000);
          } else {
            throw new Error("Invalid structure");
          }
        } catch (err) {
          ui.showToast("Failed to parse progress backup file.", "warning");
        }
      };

      reader.readAsText(file);
    });

    // Wipe progress data
    wipeBtn.addEventListener("click", () => {
      if (confirm("🚨 WARNING: Are you sure you want to delete all study data? This resets streaks, XP, level, and completed lessons. This cannot be undone.")) {
        store.resetState();
        ui.showToast("Progress wiped successfully", "warning");
        setTimeout(() => window.location.reload(), 500);
      }
    });
  }
}

export const settingsView = new SettingsView();
