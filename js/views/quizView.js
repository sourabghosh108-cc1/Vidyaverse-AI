/**
 * Quiz Arena View - v3.0 (Premium)
 * 15 questions · Combo multiplier · 50/50 + Hint lifelines
 * Speed bonus · Floating XP · S-F grade results · Leaderboard
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

const EXAM_META = {
  jee:          { icon: "📐", label: "JEE Main / Advanced",  color: "#3b82f6", subjects: "Physics · Chemistry · Maths"         },
  neet:         { icon: "🧬", label: "NEET Entrance",         color: "#22c55e", subjects: "Biology · Chemistry · Physics"        },
  class12:      { icon: "🧪", label: "Class 12 Boards",       color: "#a855f7", subjects: "Physics · Chemistry · Maths"         },
  class10:      { icon: "📖", label: "Class 10 Boards",       color: "#f59e0b", subjects: "Science · Mathematics"               },
  cuet:         { icon: "🏛️", label: "CUET Entrance",        color: "#ef4444", subjects: "Quant · Reasoning · English"         },
  cafoundation: { icon: "📊", label: "CA Foundation",         color: "#06b6d4", subjects: "Accounts · Law · Economics · Maths"  }
};

const DIFF_COLOR = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };

const GRADES = [
  { min: 93, grade: "S", label: "Legendary",   color: "#fbbf24", emoji: "👑" },
  { min: 80, grade: "A", label: "Excellent",   color: "#22c55e", emoji: "🏆" },
  { min: 65, grade: "B", label: "Good Work",   color: "#3b82f6", emoji: "🎯" },
  { min: 50, grade: "C", label: "Average",     color: "#a855f7", emoji: "📚" },
  { min: 33, grade: "D", label: "Keep Trying", color: "#f59e0b", emoji: "💪" },
  { min:  0, grade: "F", label: "Revise More", color: "#ef4444", emoji: "📖" }
];

class QuizView {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timerInterval = null;
    this.timeLeft = 30;
    this.selectedOption = null;
    this.locked = false;
    this.lifelines = { fifty: true, hint: true };
    this.timePerQ = [];
    this.examMeta = null;
    this.bankCache = null;
    this._qStartTime = 0;
  }

  async loadBank() {
    if (this.bankCache) return this.bankCache;
    const r = await fetch("./data/quiz_bank.json");
    if (!r.ok) throw new Error("Quiz bank not found");
    this.bankCache = await r.json();
    return this.bankCache;
  }

  render(params) {
    const container = document.getElementById("view-quiz");
    if (!container) return;
    this.ensureStyles();
    const examId = params.exam || "";
    if (examId) { this.startExam(container, examId); }
    else { this.renderSelector(container); }
  }

  // ── SELECTOR ────────────────────────────────────────────────
  renderSelector(container) {
    const p = store.getProfile();
    container.innerHTML = `
      <div class="qa-layout animate-fade-in">
        <header class="card qa-header">
          <div class="qa-header-row">
            <div><h2>🎯 Quiz Arena</h2><p>Timed MCQs · Combo multipliers · Lifelines · Graded results</p></div>
            <div class="qa-xp-pill">⚡ ${p.xp.toLocaleString()} XP · Lv ${p.level}</div>
          </div>
        </header>
        <div class="qa-cats-grid">
          ${Object.entries(EXAM_META).map(([id, m]) => `
            <button class="qa-cat-card" data-exam="${id}" style="--cc:${m.color}">
              <span class="qa-cat-icon">${m.icon}</span>
              <div class="qa-cat-body">
                <h4>${m.label}</h4>
                <small>${m.subjects}</small>
              </div>
              <span class="qa-cat-arr">→</span>
            </button>`).join("")}
        </div>
        <div class="card qa-howto">
          <h4>⚡ Arena Rules</h4>
          <div class="qa-how-grid">
            <span>🕐 30s per question</span><span>🔥 Up to 3× combo bonus</span>
            <span>⚡ Speed bonus &lt;10s</span><span>🆘 50/50 lifeline</span>
            <span>💡 Hint lifeline</span><span>🏅 S / A / B / C / D / F grade</span>
          </div>
        </div>
      </div>`;
    container.querySelectorAll(".qa-cat-card").forEach(c =>
      c.addEventListener("click", () => { window.location.hash = `#quiz?exam=${c.dataset.exam}`; })
    );
  }

  // ── LOAD ────────────────────────────────────────────────────
  async startExam(container, examId) {
    this.examMeta = EXAM_META[examId] || EXAM_META.jee;
    container.innerHTML = `<div class="qa-loading card"><span style="animation:spin 1s linear infinite;display:inline-block">⏳</span> Loading…</div>`;
    try {
      const bank = await this.loadBank();
      this.questions = (bank[examId] || []).slice(0, 15);
      for (let i = this.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
      }
      if (!this.questions.length) throw new Error("No questions available");
      this.renderSetup(container, examId);
    } catch (e) {
      container.innerHTML = `<div class="card qa-err"><h3>⚠️ ${e.message}</h3><button class="btn btn-primary" onclick="window.location.hash='#quiz'">← Back</button></div>`;
    }
  }

  renderSetup(container, examId) {
    const m = this.examMeta;
    container.innerHTML = `
      <div class="qa-setup-wrap animate-fade-in">
        <div class="card qa-setup-card" style="--cc:${m.color}">
          <div class="qa-setup-top">
            <span style="font-size:2.5rem">${m.icon}</span>
            <div><h2>${m.label}</h2><p style="color:var(--text-secondary);font-size:.9rem">${m.subjects}</p></div>
          </div>
          <div class="qa-setup-stats">
            <div class="qa-sstat"><span class="qa-sstat-v">${this.questions.length}</span><span>Questions</span></div>
            <div class="qa-sstat"><span class="qa-sstat-v">30s</span><span>Per Q</span></div>
            <div class="qa-sstat"><span class="qa-sstat-v">3×</span><span>Max Combo</span></div>
            <div class="qa-sstat"><span class="qa-sstat-v">+20</span><span>Base XP</span></div>
          </div>
          <div class="qa-ll-preview">
            <span class="qa-ll-chip">🆘 50/50</span>
            <span class="qa-ll-chip">💡 Hint</span>
            <span style="color:var(--text-muted);font-size:.82rem">2 lifelines per session</span>
          </div>
          ${this.renderLeaderboard(4)}
          <button class="btn qa-start-btn" id="btn-qa-start">🚀 Start Arena Session</button>
          <button class="btn btn-outline" style="width:100%" onclick="window.location.hash='#quiz'">← Choose Exam</button>
        </div>
      </div>`;
    container.querySelector("#btn-qa-start").addEventListener("click", () => {
      this.currentIndex = 0; this.score = 0; this.combo = 0; this.maxCombo = 0;
      this.lifelines = { fifty: true, hint: true }; this.timePerQ = [];
      this.showQuestion(container);
    });
  }

  // ── QUESTION ────────────────────────────────────────────────
  showQuestion(container) {
    const q = this.questions[this.currentIndex];
    this.selectedOption = null; this.locked = false; this.timeLeft = 30;
    const pct = (this.currentIndex / this.questions.length) * 100;
    const comboText = this.combo >= 3 ? "🔥 3× COMBO!" : this.combo === 2 ? "⚡ 2× Combo" : "";
    const dc = DIFF_COLOR[q.difficulty] || "#888";

    container.innerHTML = `
      <div class="qa-play-wrap animate-fade-in">
        <div class="card qa-hud">
          <div class="qa-hud-l">
            <span class="qa-qnum">Q${this.currentIndex + 1}/${this.questions.length}</span>
            <span class="qa-diff" style="background:${dc}22;color:${dc}">${(q.difficulty||"med").toUpperCase()}</span>
            <span class="qa-subj">${q.subject || ""}</span>
          </div>
          <div class="qa-hud-c">${comboText ? `<div class="qa-combo-pill">${comboText}</div>` : ""}</div>
          <div class="qa-hud-r">
            <span class="qa-score-pill">✅ ${this.score}</span>
            <div class="qa-timer-wrap">
              <svg viewBox="0 0 44 44" width="44" height="44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-color)" stroke-width="4"/>
                <circle cx="22" cy="22" r="18" fill="none" stroke="#3b82f6" stroke-width="4"
                  stroke-dasharray="113.1" stroke-dashoffset="0" id="qa-tring"
                  stroke-linecap="round" transform="rotate(-90 22 22)"/>
              </svg>
              <span id="qa-tnum">30</span>
            </div>
          </div>
        </div>

        <div class="qa-prog-track"><div class="qa-prog-fill" style="width:${pct}%"></div></div>

        <div class="card qa-qcard">
          <p class="qa-qtext">${q.question}</p>
          <div class="qa-opts-grid" id="qa-opts">
            ${q.options.map((opt, i) => `
              <button class="qa-opt" data-idx="${i}" id="qa-o${i}">
                <span class="qa-opt-lt">${String.fromCharCode(65+i)}</span>
                <span class="qa-opt-tx">${opt}</span>
              </button>`).join("")}
          </div>
          <div class="qa-exp hidden" id="qa-exp">
            <span id="qa-exp-ic">💡</span>
            <p>${q.explanation}</p>
          </div>
        </div>

        <div class="qa-abar">
          <div class="qa-lls">
            <button class="qa-llbtn ${!this.lifelines.fifty?"used":""}" id="ll-fifty" ${!this.lifelines.fifty?"disabled":""}>🆘 50/50</button>
            <button class="qa-llbtn ${!this.lifelines.hint?"used":""}" id="ll-hint"  ${!this.lifelines.hint?"disabled":""}>💡 Hint</button>
          </div>
          <div class="qa-abr">
            <button class="btn btn-outline btn-sm" id="qa-quit">Quit</button>
            <button class="btn btn-primary qa-lockbtn" id="qa-lock" disabled>Lock Answer</button>
          </div>
        </div>
      </div>`;

    this.bindQEvents(container, q);
    this.startTimer(container, q);
  }

  bindQEvents(container, q) {
    const opts = container.querySelectorAll(".qa-opt");
    const lockBtn = container.querySelector("#qa-lock");

    opts.forEach(btn => btn.addEventListener("click", () => {
      if (this.locked) return;
      opts.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      this.selectedOption = parseInt(btn.dataset.idx);
      lockBtn.removeAttribute("disabled");
    }));

    lockBtn.addEventListener("click", () => {
      if (this.locked) { this.nextQ(container); }
      else { this.lockAnswer(container, q); }
    });

    container.querySelector("#qa-quit").addEventListener("click", () => {
      if (confirm("Quit session?")) { clearInterval(this.timerInterval); window.location.hash = "#quiz"; }
    });

    // 50/50
    const fiftyBtn = container.querySelector("#ll-fifty");
    if (fiftyBtn) fiftyBtn.addEventListener("click", () => {
      if (!this.lifelines.fifty || this.locked) return;
      this.lifelines.fifty = false; fiftyBtn.classList.add("used"); fiftyBtn.disabled = true;
      const wrong = q.options.map((_, i) => i).filter(i => i !== q.correct);
      wrong.sort(() => Math.random() - 0.5).slice(0, 2).forEach(i => {
        const el = container.querySelector(`#qa-o${i}`);
        if (el) { el.disabled = true; el.style.opacity = "0.2"; el.style.pointerEvents = "none"; }
      });
      ui.showToast("50/50 used — 2 wrong options hidden", "success");
    });

    // Hint
    const hintBtn = container.querySelector("#ll-hint");
    if (hintBtn) hintBtn.addEventListener("click", () => {
      if (!this.lifelines.hint || this.locked) return;
      this.lifelines.hint = false; hintBtn.classList.add("used"); hintBtn.disabled = true;
      const el = container.querySelector(`#qa-o${q.correct}`);
      if (el) { el.classList.add("hint-pulse"); setTimeout(() => el.classList.remove("hint-pulse"), 1600); }
      ui.showToast("💡 Correct option highlighted briefly!", "success");
    });
  }

  startTimer(container, q) {
    clearInterval(this.timerInterval);
    this._qStartTime = Date.now();
    const ring = container.querySelector("#qa-tring");
    const num  = container.querySelector("#qa-tnum");
    const C = 113.1;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      const frac = this.timeLeft / 30;
      if (ring) { ring.style.strokeDashoffset = C * (1 - frac); ring.style.stroke = frac < .33 ? "#ef4444" : frac < .6 ? "#f59e0b" : "#3b82f6"; }
      if (num) num.textContent = this.timeLeft;
      if (this.timeLeft <= 0) { clearInterval(this.timerInterval); this.timePerQ.push(30); this.lockAnswer(container, q); }
    }, 1000);
  }

  lockAnswer(container, q) {
    clearInterval(this.timerInterval);
    this.locked = true;
    const elapsed = Math.round((Date.now() - this._qStartTime) / 1000);
    this.timePerQ.push(elapsed);

    container.querySelectorAll(".qa-opt").forEach(btn => {
      const i = parseInt(btn.dataset.idx);
      btn.disabled = true;
      if (i === q.correct) btn.classList.add("correct");
      else if (i === this.selectedOption) btn.classList.add("incorrect");
    });

    const correct = this.selectedOption === q.correct;
    const expBox = container.querySelector("#qa-exp");
    const expIc  = container.querySelector("#qa-exp-ic");
    if (expBox) { expBox.classList.remove("hidden"); expBox.style.borderLeftColor = correct ? "#22c55e" : "#ef4444"; }
    if (expIc) expIc.textContent = correct ? "✅" : "❌";

    if (correct) {
      this.combo++; if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      const mult = Math.min(this.combo, 3);
      const speed = elapsed <= 10 ? 10 : 0;
      const xp = 20 * mult + speed;
      this.score++; gamification.addXP(xp);
      this.spawnXP(container, `+${xp} XP${mult > 1 ? ` (${mult}×)` : ""}${speed ? " ⚡" : ""}`);
    } else { this.combo = 0; }

    const lockBtn = container.querySelector("#qa-lock");
    if (lockBtn) {
      lockBtn.textContent = this.currentIndex === this.questions.length - 1 ? "See Results" : "Next →";
      lockBtn.removeAttribute("disabled");
    }
  }

  spawnXP(container, txt) {
    const el = document.createElement("div");
    el.className = "qa-xp-float"; el.textContent = txt;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  nextQ(container) {
    if (this.currentIndex < this.questions.length - 1) { this.currentIndex++; this.showQuestion(container); }
    else { this.finishQuiz(container); }
  }

  // ── RESULTS ─────────────────────────────────────────────────
  finishQuiz(container) {
    clearInterval(this.timerInterval);
    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);
    const bonusXP = 150;
    const totalXP = this.score * 20 + bonusXP;
    gamification.addXP(bonusXP);
    gamification.incrementDailyGoalProgress("quiz");
    gamification.unlockBadge("quiz_master");
    store.incrementQuizzesCompleted();

    const g = GRADES.find(g => pct >= g.min);
    const avgTime = this.timePerQ.length ? Math.round(this.timePerQ.reduce((a, b) => a + b, 0) / this.timePerQ.length) : 0;

    container.innerHTML = `
      <div class="qa-results-wrap animate-fade-in">
        <div class="card qa-res-card" style="--gc:${g.color}">
          <div class="qa-grade-hero">
            <div class="qa-grade-ring">
              <span style="font-size:1.4rem">${g.emoji}</span>
              <span class="qa-grade-ltr" style="color:${g.color}">${g.grade}</span>
            </div>
            <div>
              <h2 style="margin:0 0 4px 0;font-family:var(--font-display)">${g.label}!</h2>
              <p style="color:var(--text-secondary);margin:0">${this.examMeta.icon} ${this.examMeta.label} · ${total} Qs</p>
            </div>
          </div>

          <div class="qa-res-stats">
            <div class="qa-rs"><span class="qa-rv">${this.score}/${total}</span><span>Correct</span></div>
            <div class="qa-rs"><span class="qa-rv" style="color:${g.color}">${pct}%</span><span>Accuracy</span></div>
            <div class="qa-rs"><span class="qa-rv">🔥 ${this.maxCombo}×</span><span>Best Combo</span></div>
            <div class="qa-rs"><span class="qa-rv">${avgTime}s</span><span>Avg Time</span></div>
            <div class="qa-rs"><span class="qa-rv" style="color:#fbbf24">+${totalXP}</span><span>XP Earned</span></div>
          </div>

          ${this.maxCombo >= 3 ? `<div class="qa-combo-medal">🔥 Hot Streak — ${this.maxCombo} correct in a row!</div>` : ""}

          <div style="width:100%">
            <h4 style="margin-bottom:10px">📈 Leaderboard</h4>
            ${this.renderLeaderboard(6)}
          </div>

          <div class="qa-res-btns">
            <button class="btn btn-primary" id="qa-retry">🔄 Try Again</button>
            <button class="btn btn-outline" onclick="window.location.hash='#quiz'">← Exams</button>
            <button class="btn btn-outline" onclick="window.location.hash='#dashboard'">📊 Dashboard</button>
          </div>
        </div>
      </div>`;

    container.querySelector("#qa-retry").addEventListener("click", () => {
      this.currentIndex = 0; this.score = 0; this.combo = 0; this.maxCombo = 0;
      this.lifelines = { fifty: true, hint: true }; this.timePerQ = [];
      for (let i = this.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
      }
      this.showQuestion(container);
    });
  }

  renderLeaderboard(n) {
    const p = store.getProfile();
    const peers = [
      { name: "Ananya S.", xp: 8200 }, { name: "Rohan V.", xp: 6400 },
      { name: "Priya P.", xp: 5900 }, { name: "Aarav G.", xp: 4100 },
      { name: "Ishaan S.", xp: 2700 }, { name: "Deepika R.", xp: 1500 }
    ];
    const list = [...peers, { name: `${p.name} (You)`, xp: p.xp, me: true }];
    list.sort((a, b) => b.xp - a.xp);
    const medal = ["👑", "🥈", "🥉"];
    return `<div class="qa-lb">
      ${list.slice(0, n).map((r, i) => `
        <div class="qa-lb-row ${r.me ? "qa-lb-me" : ""}">
          <span class="qa-lb-rk">${medal[i] || "#" + (i+1)}</span>
          <span class="qa-lb-nm">${r.name}</span>
          <span class="qa-lb-xp">${r.xp.toLocaleString()} XP</span>
        </div>`).join("")}
    </div>`;
  }

  // ── STYLES ──────────────────────────────────────────────────
  ensureStyles() {
    if (document.getElementById("qa-styles")) return;
    const s = document.createElement("style");
    s.id = "qa-styles";
    s.innerHTML = `
      .qa-layout,.qa-play-wrap,.qa-setup-wrap,.qa-results-wrap{padding:24px;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
      .qa-header.card{padding:24px 28px}
      .qa-header-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
      .qa-header-row h2{font-family:var(--font-display);margin:0 0 4px 0}
      .qa-header-row p{color:var(--text-secondary);font-size:.9rem;margin:0}
      .qa-xp-pill{background:linear-gradient(135deg,rgba(59,130,246,.15),rgba(139,92,246,.15));border:1px solid rgba(139,92,246,.3);border-radius:var(--radius-pill);padding:8px 16px;font-size:.88rem;font-weight:600;white-space:nowrap}
      .qa-cats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
      .qa-cat-card{display:flex;align-items:center;gap:14px;padding:18px 20px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:var(--radius-lg);cursor:pointer;text-align:left;transition:all .2s;font-family:var(--font-body);position:relative;overflow:hidden}
      .qa-cat-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--cc);border-radius:2px 0 0 2px}
      .qa-cat-card:hover{border-color:var(--cc);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.2)}
      .qa-cat-icon{font-size:2rem;flex-shrink:0}
      .qa-cat-body h4{margin:0 0 3px 0;font-size:.95rem;color:var(--text-primary)}
      .qa-cat-body small{color:var(--text-muted);font-size:.78rem}
      .qa-cat-arr{margin-left:auto;color:var(--text-muted);font-size:1.1rem;transition:transform .2s}
      .qa-cat-card:hover .qa-cat-arr{transform:translateX(4px);color:var(--cc)}
      .qa-howto{padding:20px}.qa-howto h4{font-family:var(--font-display);margin:0 0 12px 0}
      .qa-how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .qa-how-grid span{font-size:.85rem;color:var(--text-secondary);background:var(--surface-color);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:8px 10px}
      .qa-loading{text-align:center;padding:48px;font-size:1.1rem;color:var(--text-muted)}
      .qa-err{max-width:480px;margin:60px auto;text-align:center;padding:32px}
      .qa-setup-wrap{align-items:center}
      .qa-setup-card{max-width:560px;width:100%;padding:32px;display:flex;flex-direction:column;gap:20px;align-items:center;border-top:3px solid var(--cc)}
      .qa-setup-top{display:flex;align-items:center;gap:16px;align-self:flex-start}
      .qa-setup-top h2{margin:0 0 4px 0;font-family:var(--font-display)}
      .qa-setup-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%}
      .qa-sstat{background:var(--surface-color);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px;text-align:center;display:flex;flex-direction:column;gap:3px}
      .qa-sstat-v{font-size:1.3rem;font-weight:700;color:var(--cc);font-family:var(--font-display)}
      .qa-sstat span:last-child{font-size:.75rem;color:var(--text-muted)}
      .qa-ll-preview{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .qa-ll-chip{background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);border-radius:var(--radius-pill);padding:5px 12px;font-size:.82rem;font-weight:600}
      .qa-start-btn{width:100%;padding:14px;font-size:1.05rem;font-weight:700;border-radius:var(--radius-pill);background:linear-gradient(135deg,var(--cc),color-mix(in srgb,var(--cc) 70%,#fff));border:none;color:#fff;cursor:pointer;transition:transform .2s,box-shadow .2s}
      .qa-start-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.25)}
      .qa-lb{display:flex;flex-direction:column;gap:6px;width:100%}
      .qa-lb-row{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface-color);border:1px solid var(--border-color);border-radius:var(--radius-md)}
      .qa-lb-me{border-color:#3b82f655;background:rgba(59,130,246,.06)}
      .qa-lb-rk{font-size:1rem;width:28px;text-align:center}
      .qa-lb-nm{flex:1;font-size:.88rem;font-weight:500}
      .qa-lb-xp{font-size:.82rem;color:#fbbf24;font-weight:700}
      .qa-hud.card{display:flex;align-items:center;justify-content:space-between;padding:12px 18px}
      .qa-hud-l,.qa-hud-r{display:flex;align-items:center;gap:8px}
      .qa-hud-c{flex:1;display:flex;justify-content:center}
      .qa-qnum{font-weight:700;font-size:.9rem}
      .qa-diff{padding:2px 8px;border-radius:var(--radius-pill);font-size:.72rem;font-weight:700;letter-spacing:.05em}
      .qa-subj{font-size:.78rem;color:var(--text-muted)}
      .qa-combo-pill{background:linear-gradient(135deg,#f59e0b22,#ef444422);border:1px solid #f59e0b55;border-radius:var(--radius-pill);padding:4px 12px;font-size:.82rem;font-weight:700;color:#f59e0b;animation:pulseDot 1s ease-in-out infinite alternate}
      .qa-score-pill{background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);border-radius:var(--radius-pill);padding:4px 10px;font-size:.85rem;font-weight:700;color:#22c55e}
      .qa-timer-wrap{position:relative;display:flex;align-items:center;justify-content:center}
      .qa-timer-wrap svg{position:absolute}
      #qa-tnum{font-size:.85rem;font-weight:700;position:relative;z-index:1}
      .qa-prog-track{height:4px;background:var(--border-color);border-radius:2px;overflow:hidden}
      .qa-prog-fill{height:100%;background:linear-gradient(90deg,#3b82f6,#a855f7);border-radius:2px;transition:width .4s ease}
      .qa-qcard{padding:28px}
      .qa-qtext{font-size:1.1rem;font-weight:600;line-height:1.6;margin:0 0 20px 0;color:var(--text-primary)}
      .qa-opts-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .qa-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--surface-color);border:1.5px solid var(--border-color);border-radius:var(--radius-lg);cursor:pointer;text-align:left;transition:all .18s;font-family:var(--font-body)}
      .qa-opt:hover:not(:disabled){border-color:#3b82f6;background:rgba(59,130,246,.06);transform:translateY(-1px)}
      .qa-opt.selected{border-color:#3b82f6;background:rgba(59,130,246,.1)}
      .qa-opt.correct{border-color:#22c55e!important;background:rgba(34,197,94,.12)!important}
      .qa-opt.incorrect{border-color:#ef4444!important;background:rgba(239,68,68,.1)!important}
      .qa-opt.hint-pulse{animation:hPulse .4s ease 3;border-color:#fbbf24!important}
      @keyframes hPulse{0%,100%{box-shadow:none}50%{box-shadow:0 0 16px #fbbf2488}}
      .qa-opt-lt{width:28px;height:28px;border-radius:50%;background:var(--border-color);display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;flex-shrink:0;color:var(--text-secondary)}
      .qa-opt.selected .qa-opt-lt{background:#3b82f6;color:#fff}
      .qa-opt.correct .qa-opt-lt{background:#22c55e;color:#fff}
      .qa-opt.incorrect .qa-opt-lt{background:#ef4444;color:#fff}
      .qa-opt-tx{font-size:.9rem;color:var(--text-primary)}
      .qa-exp{display:flex;align-items:flex-start;gap:10px;margin-top:16px;padding:14px 16px;background:rgba(255,255,255,.03);border-left:3px solid #22c55e;border-radius:0 var(--radius-md) var(--radius-md) 0;transition:border-color .2s}
      .qa-exp.hidden{display:none}
      #qa-exp-ic{font-size:1.2rem;flex-shrink:0}
      .qa-exp p{font-size:.88rem;color:var(--text-secondary);line-height:1.6;margin:0}
      .qa-abar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:4px 0}
      .qa-lls{display:flex;gap:8px}
      .qa-llbtn{padding:8px 14px;border-radius:var(--radius-pill);background:rgba(59,130,246,.1);border:1.5px solid rgba(59,130,246,.3);color:var(--text-primary);font-size:.82rem;font-weight:600;cursor:pointer;font-family:var(--font-body);transition:all .2s}
      .qa-llbtn:hover:not(:disabled){background:rgba(59,130,246,.2)}
      .qa-llbtn.used{opacity:.3;cursor:not-allowed}
      .qa-abr{display:flex;gap:8px;align-items:center}
      .qa-lockbtn{min-width:130px;border-radius:var(--radius-pill);font-weight:700}
      .qa-xp-float{position:fixed;top:40%;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;font-weight:800;font-size:1.1rem;padding:8px 20px;border-radius:var(--radius-pill);pointer-events:none;z-index:9999;animation:floatUp 1.4s ease forwards}
      @keyframes floatUp{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-60px)}}
      .qa-results-wrap{align-items:center}
      .qa-res-card{max-width:620px;width:100%;padding:32px;display:flex;flex-direction:column;gap:24px;align-items:center;border-top:3px solid var(--gc)}
      .qa-grade-hero{display:flex;align-items:center;gap:20px;align-self:flex-start}
      .qa-grade-ring{width:80px;height:80px;border-radius:50%;border:3px solid var(--gc);display:flex;flex-direction:column;align-items:center;justify-content:center;background:color-mix(in srgb,var(--gc) 8%,transparent)}
      .qa-grade-ltr{font-size:1.6rem;font-weight:900;font-family:var(--font-display);line-height:1}
      .qa-res-stats{display:flex;gap:10px;flex-wrap:wrap;width:100%;justify-content:center}
      .qa-rs{flex:1;min-width:80px;text-align:center;padding:14px 10px;background:var(--surface-color);border:1px solid var(--border-color);border-radius:var(--radius-md);display:flex;flex-direction:column;gap:4px}
      .qa-rv{font-size:1.3rem;font-weight:800;font-family:var(--font-display);color:var(--text-primary)}
      .qa-rs span:last-child{font-size:.75rem;color:var(--text-muted)}
      .qa-combo-medal{background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(239,68,68,.08));border:1px solid rgba(251,191,36,.3);border-radius:var(--radius-pill);padding:8px 18px;font-size:.88rem;font-weight:700;color:#fbbf24}
      .qa-res-btns{display:flex;gap:10px;flex-wrap:wrap;width:100%;justify-content:center}
      .qa-res-btns .btn{flex:1;min-width:120px;border-radius:var(--radius-pill)}
      @media(max-width:640px){
        .qa-opts-grid{grid-template-columns:1fr}
        .qa-setup-stats{grid-template-columns:repeat(2,1fr)}
        .qa-how-grid{grid-template-columns:repeat(2,1fr)}
        .qa-layout,.qa-play-wrap,.qa-setup-wrap,.qa-results-wrap{padding:14px}
      }
    `;
    document.head.appendChild(s);
  }
}

export const quizView = new QuizView();
