/**
 * Focus Timer View Module
 * A dedicated Pomodoro-style study timer section for Vidyaverse AI.
 * Completely self-contained — does not touch any other view.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

const TIMER_STATE_KEY = "vidyaverse_focus_timer_state";

class FocusTimerView {
  constructor() {
    this.intervalId = null;
    this.secondsLeft = 25 * 60;
    this.totalSeconds = 25 * 60;
    this.isRunning = false;
    this.mode = "focus"; // "focus" | "break"
    this.sessionsCompleted = 0;
    this.soundEnabled = true;
    this.currentPreset = "pomodoro";
    this.currentBreakMin = 5;

    // Load persisted session count
    try {
      const saved = JSON.parse(localStorage.getItem(TIMER_STATE_KEY) || "{}");
      this.sessionsCompleted = saved.sessionsCompleted || 0;
      this.soundEnabled = saved.soundEnabled !== undefined ? saved.soundEnabled : true;
    } catch (_) { /* ignore */ }
  }

  saveState() {
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify({
      sessionsCompleted: this.sessionsCompleted,
      soundEnabled: this.soundEnabled
    }));
  }

  // ── Presets ──────────────────────────────────────────
  get presets() {
    return {
      pomodoro: {
        focus: 25, break: 5,
        name: "🍅 Pomodoro Technique",
        desc: "25 minutes of deep focused work followed by a 5-minute recovery break. Ideal for studying complex topics and maintaining attention without burnout.",
        tags: ["25 min focus", "5 min break", "+100 XP / session"]
      },
      deepwork: {
        focus: 50, break: 10,
        name: "🧠 Deep Work",
        desc: "50 minutes of uninterrupted, high-intensity study followed by a 10-minute recovery. Best for solving difficult problems, writing, or deep revision.",
        tags: ["50 min focus", "10 min break", "+200 XP / session"]
      },
      sprint: {
        focus: 15, break: 3,
        name: "⚡ Power Sprint",
        desc: "15-minute rapid-fire study bursts. Great for quick revision, flashcard practice, or when you only have short windows of time to study.",
        tags: ["15 min focus", "3 min break", "+50 XP / session"]
      }
    };
  }

  render() {
    const container = document.getElementById("view-focus");
    if (!container) return;

    // Stop any running timer from a previous render
    this.stopTimer();
    this.isRunning = false;

    this.ensureStyles();

    container.innerHTML = `
      <div class="focus-layout animate-fade-in">

        <!-- Header -->
        <header class="focus-header-card card">
          <div class="focus-header-inner">
            <div>
              <h2>⏱️ Focus Timer</h2>
              <p>Deep work sessions with structured breaks — stay in the zone and earn XP.</p>
            </div>
            <div class="focus-sessions-pill">
              🏆 <span id="focus-session-count">${this.sessionsCompleted}</span> sessions today
            </div>
          </div>
        </header>

        <!-- Main grid -->
        <div class="focus-main-grid">

          <!-- Timer card (left) -->
          <div class="card focus-timer-card">

            <!-- Mode tabs -->
            <div class="focus-mode-tabs">
              <button class="focus-tab active" data-preset="pomodoro">🍅 Pomodoro</button>
              <button class="focus-tab" data-preset="deepwork">🧠 Deep Work</button>
              <button class="focus-tab" data-preset="sprint">⚡ Power Sprint</button>
            </div>

            <!-- Radial ring -->
            <div class="focus-ring-wrapper">
              <svg class="focus-ring-svg" viewBox="0 0 240 240" width="240" height="240">
                <circle class="focus-ring-track" cx="120" cy="120" r="104" fill="none" stroke-width="12"/>
                <circle
                  class="focus-ring-progress"
                  id="focus-ring-progress"
                  cx="120" cy="120" r="104"
                  fill="none" stroke-width="12"
                  stroke-linecap="round"
                  stroke-dasharray="653.12"
                  stroke-dashoffset="0"
                  transform="rotate(-90 120 120)"
                />
              </svg>
              <div class="focus-ring-inner">
                <div class="focus-mode-label" id="focus-mode-label">FOCUS</div>
                <div class="focus-time-display" id="focus-time-display">25:00</div>
                <div class="focus-status-text" id="focus-status-text">Ready to focus</div>
              </div>
            </div>

            <!-- Controls -->
            <div class="focus-controls">
              <button class="btn btn-outline focus-ctrl-btn" id="btn-focus-reset" title="Reset timer">↺</button>
              <button class="btn btn-primary focus-start-btn" id="btn-focus-start">▶ Start</button>
              <button class="btn btn-outline focus-ctrl-btn" id="btn-focus-sound" title="Toggle sound">
                <span id="focus-sound-icon">${this.soundEnabled ? "🔔" : "🔕"}</span>
              </button>
            </div>

            <!-- Custom duration -->
            <div class="focus-custom-row">
              <div class="focus-custom-field">
                <label for="focus-custom-focus">Focus (min)</label>
                <input type="number" id="focus-custom-focus" min="1" max="120" value="25" />
              </div>
              <div class="focus-custom-field">
                <label for="focus-custom-break">Break (min)</label>
                <input type="number" id="focus-custom-break" min="1" max="60" value="5" />
              </div>
              <button class="btn btn-outline btn-sm" id="btn-focus-custom-apply" style="align-self:flex-end;">Apply</button>
            </div>

          </div>

          <!-- Side panel (right) -->
          <div class="focus-side-panel">

            <div class="card focus-info-card">
              <h4 id="focus-preset-name">🍅 Pomodoro Technique</h4>
              <p id="focus-preset-desc" style="color:var(--text-secondary);font-size:0.88rem;line-height:1.6;margin-top:8px;">
                25 minutes of deep focused work followed by a 5-minute recovery break. Ideal for studying complex topics and maintaining attention without burnout.
              </p>
              <div class="focus-preset-tags" id="focus-preset-tags">
                <span class="badge badge-accent">25 min focus</span>
                <span class="badge badge-accent">5 min break</span>
                <span class="badge">+100 XP / session</span>
              </div>
            </div>

            <div class="card focus-tips-card" style="margin-top:16px;">
              <h4>💡 Focus Tips</h4>
              <ul class="focus-tips-list">
                <li>📵 Put your phone face-down or in another room</li>
                <li>🎧 Use lo-fi or ambient music for background noise</li>
                <li>📋 Write your session goal before starting</li>
                <li>🌊 During breaks, stretch — don't scroll social media</li>
                <li>💧 Keep a water bottle on your desk</li>
              </ul>
            </div>

            <div class="card focus-goal-card" style="margin-top:16px;">
              <h4>🎯 Session Goal</h4>
              <textarea
                id="focus-goal-input"
                placeholder="What will you focus on this session? (e.g. 'Chapter 3 of Mechanics')"
                rows="3"
                class="focus-goal-textarea"
              ></textarea>
            </div>

          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.applyPreset("pomodoro");
  }

  applyPreset(key) {
    this.currentPreset = key;
    const p = this.presets[key];

    this.stopTimer();
    this.isRunning = false;
    this.mode = "focus";
    this.totalSeconds = p.focus * 60;
    this.secondsLeft = this.totalSeconds;
    this.currentBreakMin = p.break;

    const focusInput = document.getElementById("focus-custom-focus");
    const breakInput = document.getElementById("focus-custom-break");
    if (focusInput) focusInput.value = p.focus;
    if (breakInput) breakInput.value = p.break;

    document.getElementById("focus-preset-name").textContent = p.name;
    document.getElementById("focus-preset-desc").textContent = p.desc;
    document.getElementById("focus-preset-tags").innerHTML =
      p.tags.map(t => `<span class="badge badge-accent">${t}</span>`).join("");

    document.querySelectorAll(".focus-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.preset === key);
    });

    this.updateDisplay();
    this.updateRing();
    this.setModeLabel("FOCUS");
    this.setStatusText("Ready to focus");
    this.updateStartBtn(false);
  }

  // ── Timer core ───────────────────────────────────────
  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateStartBtn(true);

    this.intervalId = setInterval(() => {
      this.secondsLeft--;
      this.updateDisplay();
      this.updateRing();
      if (this.secondsLeft <= 0) {
        this.handlePhaseEnd();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.updateStartBtn(false);
    this.setStatusText("Paused — press Start to resume");
  }

  stopTimer() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  handlePhaseEnd() {
    this.stopTimer();
    this.isRunning = false;

    if (this.mode === "focus") {
      this.sessionsCompleted++;
      this.saveState();

      const xpMap = { deepwork: 200, sprint: 50, pomodoro: 100 };
      const xpGain = xpMap[this.currentPreset] || 100;
      gamification.addXP(xpGain);

      const countEl = document.getElementById("focus-session-count");
      if (countEl) countEl.textContent = this.sessionsCompleted;

      ui.showToast(`✅ Session complete! +${xpGain} XP earned`, "success");
      this.playBeep();

      this.mode = "break";
      this.totalSeconds = this.currentBreakMin * 60;
      this.secondsLeft = this.totalSeconds;
      this.setModeLabel("BREAK");
      this.setStatusText("Take a break — you earned it 🎉");
    } else {
      this.mode = "focus";
      const p = this.presets[this.currentPreset];
      this.totalSeconds = p.focus * 60;
      this.secondsLeft = this.totalSeconds;
      this.setModeLabel("FOCUS");
      this.setStatusText("Break done! Ready for next session 💪");
      this.playBeep();
      ui.showToast("☕ Break over — let's go again!", "warning");
    }

    this.updateDisplay();
    this.updateRing();
    this.updateStartBtn(false);
  }

  // ── Display helpers ──────────────────────────────────
  updateDisplay() {
    const m = Math.floor(this.secondsLeft / 60).toString().padStart(2, "0");
    const s = (this.secondsLeft % 60).toString().padStart(2, "0");
    const el = document.getElementById("focus-time-display");
    if (el) el.textContent = `${m}:${s}`;
  }

  updateRing() {
    const ring = document.getElementById("focus-ring-progress");
    if (!ring) return;
    const circumference = 653.12;
    const fraction = this.totalSeconds > 0 ? this.secondsLeft / this.totalSeconds : 1;
    ring.style.strokeDashoffset = circumference * (1 - fraction);

    if (this.mode === "break") {
      ring.style.stroke = "#22c55e";
    } else if (fraction < 0.25) {
      ring.style.stroke = "#f87171";
    } else if (fraction < 0.5) {
      ring.style.stroke = "#fbbf24";
    } else {
      ring.style.stroke = "var(--color-primary, #3b82f6)";
    }
  }

  setModeLabel(text) {
    const el = document.getElementById("focus-mode-label");
    if (!el) return;
    el.textContent = text;
    el.style.color = text === "BREAK" ? "#22c55e" : "var(--color-primary, #3b82f6)";
  }

  setStatusText(text) {
    const el = document.getElementById("focus-status-text");
    if (el) el.textContent = text;
  }

  updateStartBtn(running) {
    const btn = document.getElementById("btn-focus-start");
    if (!btn) return;
    btn.textContent = running ? "⏸ Pause" : "▶ Start";
    btn.className = running
      ? "btn btn-danger focus-start-btn"
      : "btn btn-primary focus-start-btn";
  }

  playBeep() {
    if (!this.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    } catch (_) { /* AudioContext not supported */ }
  }

  // ── Events ───────────────────────────────────────────
  bindEvents(container) {
    container.querySelectorAll(".focus-tab").forEach(tab => {
      tab.addEventListener("click", () => this.applyPreset(tab.dataset.preset));
    });

    container.querySelector("#btn-focus-start").addEventListener("click", () => {
      if (this.isRunning) {
        this.pauseTimer();
      } else {
        this.startTimer();
        this.setStatusText(this.mode === "focus" ? "Stay focused 💪" : "Relax and recharge 🌿");
      }
    });

    container.querySelector("#btn-focus-reset").addEventListener("click", () => {
      this.stopTimer();
      this.isRunning = false;
      this.mode = "focus";
      const p = this.presets[this.currentPreset];
      this.totalSeconds = p.focus * 60;
      this.secondsLeft = this.totalSeconds;
      this.updateDisplay();
      this.updateRing();
      this.setModeLabel("FOCUS");
      this.setStatusText("Reset — ready to start");
      this.updateStartBtn(false);
    });

    container.querySelector("#btn-focus-sound").addEventListener("click", () => {
      this.soundEnabled = !this.soundEnabled;
      this.saveState();
      const icon = container.querySelector("#focus-sound-icon");
      if (icon) icon.textContent = this.soundEnabled ? "🔔" : "🔕";
      ui.showToast(this.soundEnabled ? "Sound on 🔔" : "Sound off 🔕", "success");
    });

    container.querySelector("#btn-focus-custom-apply").addEventListener("click", () => {
      const focusMin = Math.min(120, Math.max(1, parseInt(container.querySelector("#focus-custom-focus").value) || 25));
      const breakMin = Math.min(60, Math.max(1, parseInt(container.querySelector("#focus-custom-break").value) || 5));

      this.stopTimer();
      this.isRunning = false;
      this.mode = "focus";
      this.totalSeconds = focusMin * 60;
      this.secondsLeft = this.totalSeconds;
      this.currentBreakMin = breakMin;
      this.currentPreset = "custom";

      document.querySelectorAll(".focus-tab").forEach(t => t.classList.remove("active"));
      document.getElementById("focus-preset-name").textContent = "⚙️ Custom Timer";
      document.getElementById("focus-preset-desc").textContent =
        `Custom ${focusMin}-minute focus sessions with ${breakMin}-minute breaks. Your rules, your pace.`;
      document.getElementById("focus-preset-tags").innerHTML =
        [`${focusMin} min focus`, `${breakMin} min break`, "+100 XP / session"]
          .map(t => `<span class="badge badge-accent">${t}</span>`).join("");

      this.updateDisplay();
      this.updateRing();
      this.setModeLabel("FOCUS");
      this.setStatusText("Custom timer set — ready!");
      this.updateStartBtn(false);
      ui.showToast(`Custom: ${focusMin}m focus / ${breakMin}m break`, "success");
    });
  }

  // ── Scoped CSS injected once into <head> ─────────────
  ensureStyles() {
    if (document.getElementById("focus-timer-styles")) return;
    const style = document.createElement("style");
    style.id = "focus-timer-styles";
    style.innerHTML = `
      .focus-layout {
        padding: 24px;
        max-width: 1100px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .focus-header-card { padding: 24px 28px; }
      .focus-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .focus-header-inner h2 { font-family: var(--font-display); margin: 0 0 4px 0; }
      .focus-header-inner p  { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }
      .focus-sessions-pill {
        background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15));
        border: 1px solid rgba(139,92,246,0.3);
        border-radius: var(--radius-pill);
        padding: 8px 18px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
      }
      .focus-main-grid {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 24px;
        align-items: start;
      }
      .focus-timer-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 28px;
        gap: 24px;
      }
      .focus-mode-tabs {
        display: flex;
        gap: 6px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-pill);
        padding: 4px;
        width: 100%;
      }
      .focus-tab {
        flex: 1;
        padding: 8px 10px;
        border: none;
        border-radius: var(--radius-pill);
        background: transparent;
        color: var(--text-secondary);
        font-size: 0.83rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-body);
        text-align: center;
      }
      .focus-tab:hover { color: var(--text-primary); background: var(--surface-hover); }
      .focus-tab.active {
        background: var(--color-primary);
        color: #fff;
        font-weight: 600;
        box-shadow: 0 2px 10px rgba(59,130,246,0.35);
      }
      .focus-ring-wrapper {
        position: relative;
        width: 240px;
        height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .focus-ring-svg { position: absolute; top: 0; left: 0; }
      .focus-ring-track { stroke: var(--border-color); }
      .focus-ring-progress {
        stroke: var(--color-primary, #3b82f6);
        transition: stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1), stroke 0.4s ease;
      }
      .focus-ring-inner {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        z-index: 1;
      }
      .focus-mode-label {
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        color: var(--color-primary, #3b82f6);
        text-transform: uppercase;
        transition: color 0.3s ease;
      }
      .focus-time-display {
        font-size: 3.2rem;
        font-weight: 800;
        font-family: var(--font-display);
        color: var(--text-primary);
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .focus-status-text {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-align: center;
        max-width: 130px;
        margin-top: 2px;
      }
      .focus-controls {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .focus-ctrl-btn {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        padding: 0;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .focus-start-btn {
        min-width: 140px;
        height: 52px;
        border-radius: var(--radius-pill);
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        transition: all 0.2s ease;
      }
      .focus-start-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59,130,246,0.4);
      }
      .focus-custom-row {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        width: 100%;
        padding: 14px 16px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
      }
      .focus-custom-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      .focus-custom-field label { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
      .focus-custom-field input {
        padding: 8px 10px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        background: var(--surface-hover);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.95rem;
        width: 100%;
      }
      .focus-info-card, .focus-tips-card, .focus-goal-card { padding: 20px; }
      .focus-info-card h4, .focus-tips-card h4, .focus-goal-card h4 {
        font-family: var(--font-display);
        margin: 0;
      }
      .focus-preset-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
      .focus-tips-list { list-style: none; padding: 0; margin: 10px 0 0 0; display: flex; flex-direction: column; gap: 8px; }
      .focus-tips-list li { font-size: 0.87rem; color: var(--text-secondary); line-height: 1.5; }
      .focus-goal-textarea {
        width: 100%;
        margin-top: 10px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px;
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 0.9rem;
        resize: vertical;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      .focus-goal-textarea:focus { outline: none; border-color: var(--color-primary); }
      @media (max-width: 860px) {
        .focus-main-grid { grid-template-columns: 1fr; }
        .focus-layout { padding: 16px; }
      }
    `;
    document.head.appendChild(style);
  }
}

export const focusTimerView = new FocusTimerView();
