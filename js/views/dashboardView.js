/**
 * Dashboard View — Premium Edition
 * Glassmorphism hero · animated stat cards · radial XP ring
 * Achievements cabinet · animated bar chart · daily missions
 */

import { store } from "../store.js";
import { gamification } from "../gamification.js";

// ─── badge definitions ────────────────────────────────────────────────────────
const ALL_BADGES = [
  { id:"welcome",      icon:"👋", name:"Pioneer",         desc:"Joined Vidyaverse"          },
  { id:"first_quiz",   icon:"🎯", name:"First Strike",    desc:"Completed your first quiz"  },
  { id:"streak_3",     icon:"🔥", name:"On Fire",         desc:"3-day study streak"         },
  { id:"streak_7",     icon:"⚡", name:"Week Warrior",    desc:"7-day study streak"         },
  { id:"notes_master", icon:"📝", name:"Note Ninja",      desc:"Generated 5+ notes"         },
  { id:"pdf_reader",   icon:"📄", name:"PDF Pro",         desc:"Summarized 3+ PDFs"         },
  { id:"level_5",      icon:"🏆", name:"Level 5 Scholar", desc:"Reached Level 5"            },
  { id:"quiz_ace",     icon:"🧠", name:"Quiz Ace",        desc:"Scored 100% on a quiz"      },
  { id:"explorer",     icon:"🗺️", name:"Explorer",        desc:"Studied 10+ topics"         },
  { id:"arcade_star",  icon:"🕹️", name:"Arcade Star",     desc:"Won an Arcade game"         },
];

class DashboardView {
  render() {
    const container = document.getElementById("view-dashboard");
    if (!container) return;
    this._injectStyles();

    const state   = store.getState();
    const profile = state.profile;

    // XP ring maths
    const prevXP    = (profile.level - 1) * 1000;
    const nextXP    = profile.level * 1000;
    const pct       = Math.min(Math.max(((profile.xp - prevXP) / 1000) * 100, 0), 100);
    const toNext    = nextXP - profile.xp;
    const circumf   = 2 * Math.PI * 54;          // r=54
    const dash      = (pct / 100) * circumf;

    // Daily goals
    const todayStr  = gamification.getTodayDateString();
    const gStatus   = profile.dailyGoalStatus;
    const newDay    = gStatus.lastUpdated !== todayStr;
    const lessonOk  = !newDay && gStatus.completedLessons  >= 1;
    const quizOk    = !newDay && gStatus.completedQuizzes  >= 1;
    const allDone   = lessonOk && quizOk;

    // Weekly bars
    const days      = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const todayIdx  = (new Date().getDay() + 6) % 7;
    const baseXP    = [310, 520, 180, 640, 90, 270, 0];
    baseXP[todayIdx] = Math.min(profile.xp % 1000, 800);
    const maxBar    = Math.max(...baseXP, 1);

    // Unlocked badge check
    const unlocked  = new Set(profile.badges || ["welcome"]);

    // Greeting
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    container.innerHTML = `
      <div class="db-root animate-fade-in">

        <!-- ── HERO BANNER ─────────────────────────────────────── -->
        <div class="db-hero">
          <div class="db-hero-bg"></div>
          <div class="db-hero-orb db-orb1"></div>
          <div class="db-hero-orb db-orb2"></div>
          <div class="db-hero-content">
            <div class="db-hero-left">
              <p class="db-greet-sub">${greet} 👋</p>
              <h1 class="db-greet-name">${profile.name}</h1>
              <p class="db-greet-line">Level ${profile.level} Scholar · ${profile.streak} Day Streak 🔥</p>
              <div class="db-hero-btns">
                <a href="#learn"  class="db-hbtn db-hbtn-primary">🔍 Resume Study</a>
                <a href="#quiz"   class="db-hbtn db-hbtn-outline">🎯 Quiz Arena</a>
                <a href="#arcade" class="db-hbtn db-hbtn-outline">🕹️ Arcade</a>
              </div>
            </div>
            <!-- Radial XP Ring -->
            <div class="db-xp-ring-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/>
                <circle cx="70" cy="70" r="54" fill="none"
                  stroke="url(#xpGrad)" stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="${dash} ${circumf}"
                  stroke-dashoffset="${circumf / 4}"
                  class="db-ring-arc"/>
                <defs>
                  <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stop-color="#818cf8"/>
                    <stop offset="100%" stop-color="#34d399"/>
                  </linearGradient>
                </defs>
                <text x="70" y="62" text-anchor="middle" fill="white" font-size="18" font-weight="800" font-family="Outfit,sans-serif">Lvl ${profile.level}</text>
                <text x="70" y="82" text-anchor="middle" fill="rgba(255,255,255,.6)" font-size="9" font-family="Inter,sans-serif">${pct.toFixed(0)}% to next</text>
              </svg>
              <p class="db-ring-caption">${toNext.toLocaleString()} XP to go</p>
            </div>
          </div>
        </div>

        <!-- ── STAT CARDS ──────────────────────────────────────── -->
        <div class="db-stats-grid">
          ${[
            { icon:"⚡", label:"Total XP",          val: profile.xp.toLocaleString(),           accent:"#818cf8" },
            { icon:"🔥", label:"Day Streak",         val: profile.streak + " days",               accent:"#fb923c" },
            { icon:"📚", label:"Topics Studied",     val: profile.topicsStudiedCount,             accent:"#34d399" },
            { icon:"📝", label:"Notes Generated",    val: profile.notesGeneratedCount,            accent:"#fbbf24" },
            { icon:"📄", label:"PDFs Summarised",    val: profile.pdfsSummarizedCount,            accent:"#22d3ee" },
            { icon:"🏅", label:"Badges Earned",      val: unlocked.size + "/" + ALL_BADGES.length,accent:"#a78bfa" },
          ].map(s => `
            <div class="db-scard" style="--sa:${s.accent}">
              <div class="db-scard-icon">${s.icon}</div>
              <div class="db-scard-body">
                <span class="db-scard-val">${s.val}</span>
                <span class="db-scard-lbl">${s.label}</span>
              </div>
              <div class="db-scard-glow"></div>
            </div>`).join("")}
        </div>

        <!-- ── MAIN GRID ───────────────────────────────────────── -->
        <div class="db-main-grid">

          <!-- Weekly Activity Chart -->
          <div class="db-card db-chart-card">
            <div class="db-card-header">
              <h3>📊 Weekly Activity</h3>
              <span class="db-badge-chip">XP This Week</span>
            </div>
            <div class="db-chart-area">
              ${days.map((day,i) => {
                const xp  = baseXP[i];
                const hpct = Math.round((xp / maxBar) * 100);
                const isT  = i === todayIdx;
                return `<div class="db-bar-col">
                  <span class="db-bar-val">${xp > 0 ? xp : ""}</span>
                  <div class="db-bar-track">
                    <div class="db-bar-fill ${isT ? "db-bar-today" : ""}"
                         style="height:${hpct}%;--delay:${i * 80}ms"></div>
                  </div>
                  <span class="db-bar-day ${isT ? "db-bar-today-lbl" : ""}">${day}</span>
                </div>`;
              }).join("")}
            </div>
          </div>

          <!-- Daily Missions -->
          <div class="db-card db-missions-card">
            <div class="db-card-header">
              <h3>🎯 Daily Missions</h3>
              <span class="db-badge-chip" style="background:${allDone ? "rgba(52,211,153,.15)" : "rgba(251,191,36,.1)"};color:${allDone ? "#34d399" : "#fbbf24"};border-color:${allDone ? "rgba(52,211,153,.3)" : "rgba(251,191,36,.3)"}">${allDone ? "✅ Complete!" : "In Progress"}</span>
            </div>
            <p class="db-card-sub">Finish both to protect your streak</p>
            ${[
              { ok: lessonOk, icon:"🔍", title:"Study a Topic",        sub:"Search or read a lesson",         xp:"+125 XP" },
              { ok: quizOk,   icon:"🎯", title:"Complete a Quiz",      sub:"Attempt Quiz Arena session",       xp:"+125 XP" },
            ].map(m => `
              <div class="db-mission-row ${m.ok ? "db-mission-done" : ""}">
                <div class="db-mission-chk ${m.ok ? "db-chk-done" : ""}">
                  ${m.ok ? "✓" : ""}
                </div>
                <div class="db-mission-info">
                  <strong>${m.icon} ${m.title}</strong>
                  <span>${m.sub}</span>
                </div>
                <span class="db-mission-xp">${m.ok ? "Done!" : m.xp}</span>
              </div>`).join("")}
            ${allDone ? `<div class="db-mission-bonus">🎉 Bonus claimed! +250 XP</div>` : `<p class="db-mission-hint">💡 Complete both for a +250 XP bonus!</p>`}
          </div>

          <!-- XP Level Progress -->
          <div class="db-card db-level-card">
            <div class="db-card-header">
              <h3>🚀 Level Progress</h3>
              <span class="db-badge-chip">Level ${profile.level}</span>
            </div>
            <div class="db-level-row">
              <span class="db-level-badge">${profile.level}</span>
              <div class="db-lp-wrap">
                <div class="db-lp-labels">
                  <span>${profile.xp.toLocaleString()} XP</span>
                  <span>${nextXP.toLocaleString()} XP</span>
                </div>
                <div class="db-lp-track">
                  <div class="db-lp-fill" style="width:${pct}%"></div>
                </div>
                <p class="db-lp-sub">${toNext.toLocaleString()} XP to reach Level ${profile.level + 1}</p>
              </div>
              <span class="db-level-badge db-level-next">${profile.level + 1}</span>
            </div>
            <!-- Mini ranks -->
            <div class="db-ranks-row">
              ${[
                { min:1,  max:4,  label:"Novice",    icon:"🌱" },
                { min:5,  max:9,  label:"Scholar",   icon:"📖" },
                { min:10, max:19, label:"Expert",    icon:"🏆" },
                { min:20, max:99, label:"Master",    icon:"👑" },
              ].map(r => {
                const active = profile.level >= r.min && profile.level <= r.max;
                return `<div class="db-rank ${active ? "db-rank-active" : ""}">
                  <span>${r.icon}</span><span>${r.label}</span>
                </div>`;
              }).join("")}
            </div>
          </div>

          <!-- Achievements Cabinet -->
          <div class="db-card db-badges-card">
            <div class="db-card-header">
              <h3>🏅 Achievements</h3>
              <span class="db-badge-chip">${unlocked.size}/${ALL_BADGES.length} Earned</span>
            </div>
            <div class="db-badges-grid">
              ${ALL_BADGES.map(b => {
                const earned = unlocked.has(b.id);
                return `<div class="db-badge-item ${earned ? "db-badge-earned" : "db-badge-locked"}" title="${b.desc}">
                  <div class="db-badge-icon">${earned ? b.icon : "🔒"}</div>
                  <span class="db-badge-name">${b.name}</span>
                </div>`;
              }).join("")}
            </div>
          </div>

        </div>

        <!-- ── QUICK ACTIONS ───────────────────────────────────── -->
        <div class="db-quick-grid">
          ${[
            { href:"#learn",   icon:"🔍", title:"Study Now",      sub:"Search any topic"         },
            { href:"#notes",   icon:"📝", title:"Make Notes",     sub:"AI-powered notes"         },
            { href:"#quiz",    icon:"🎯", title:"Quiz Arena",     sub:"Test your knowledge"      },
            { href:"#arcade",  icon:"🕹️", title:"Arcade",         sub:"13 learning games"        },
            { href:"#focus",   icon:"⏱️", title:"Focus Timer",    sub:"Deep work sessions"       },
            { href:"#pdf",     icon:"📄", title:"PDF Summariser", sub:"Upload & summarise"       },
          ].map(q => `
            <a href="${q.href}" class="db-qaction">
              <span class="db-qa-icon">${q.icon}</span>
              <div>
                <strong>${q.title}</strong>
                <span>${q.sub}</span>
              </div>
              <span class="db-qa-arrow">→</span>
            </a>`).join("")}
        </div>

      </div>`;

    // Animate bars on load
    requestAnimationFrame(() => {
      container.querySelectorAll(".db-bar-fill").forEach(el => {
        const delay = el.style.getPropertyValue("--delay") || "0ms";
        el.style.transitionDelay = delay;
        el.classList.add("db-bar-animated");
      });
    });
  }

  _injectStyles() {
    if (document.getElementById("db-premium-sty")) return;
    const s = document.createElement("style");
    s.id = "db-premium-sty";
    s.innerHTML = `
/* ── ROOT ── */
.db-root{padding:0 0 40px;max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:22px;font-family:var(--font-body)}

/* ── HERO ── */
.db-hero{position:relative;border-radius:var(--radius-lg,18px);overflow:hidden;padding:36px 38px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 45%,#1e3a5f 100%);min-height:180px}
.db-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(99,102,241,.25) 0%,transparent 70%)}
.db-hero-orb{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none}
.db-orb1{width:260px;height:260px;background:rgba(129,140,248,.18);top:-80px;right:80px}
.db-orb2{width:180px;height:180px;background:rgba(52,211,153,.12);bottom:-60px;right:280px}
.db-hero-content{position:relative;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.db-hero-left{flex:1;min-width:200px}
.db-greet-sub{color:rgba(255,255,255,.6);font-size:.85rem;margin:0 0 4px;letter-spacing:.04em}
.db-greet-name{color:#fff;font-family:var(--font-display,Outfit,sans-serif);font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;margin:0 0 6px}
.db-greet-line{color:rgba(255,255,255,.7);font-size:.88rem;margin:0 0 18px}
.db-hero-btns{display:flex;gap:10px;flex-wrap:wrap}
.db-hbtn{display:inline-flex;align-items:center;gap:5px;padding:9px 18px;border-radius:var(--radius-pill,9999px);font-size:.82rem;font-weight:600;text-decoration:none;transition:all .18s;white-space:nowrap}
.db-hbtn-primary{background:rgba(255,255,255,.95);color:#312e81}
.db-hbtn-primary:hover{background:#fff;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.2)}
.db-hbtn-outline{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25);backdrop-filter:blur(4px)}
.db-hbtn-outline:hover{background:rgba(255,255,255,.18);transform:translateY(-1px)}
/* XP Ring */
.db-xp-ring-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0}
.db-ring-arc{transition:stroke-dasharray 1s cubic-bezier(.4,0,.2,1)}
.db-ring-caption{color:rgba(255,255,255,.6);font-size:.75rem;text-align:center}

/* ── STAT CARDS ── */
.db-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:12px}
.db-scard{position:relative;display:flex;align-items:center;gap:12px;padding:16px 18px;background:var(--card-bg);border:1.5px solid var(--border-color);border-radius:var(--radius-lg,18px);overflow:hidden;transition:all .2s;cursor:default}
.db-scard::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--sa);opacity:.9}
.db-scard:hover{transform:translateY(-3px);border-color:var(--sa);box-shadow:0 8px 28px rgba(0,0,0,.18)}
.db-scard:hover .db-scard-glow{opacity:1}
.db-scard-glow{position:absolute;inset:0;background:radial-gradient(circle at 20% 50%,var(--sa),transparent 70%);opacity:0;transition:opacity .3s;pointer-events:none;mix-blend-mode:screen}
.db-scard-icon{font-size:1.5rem;flex-shrink:0}
.db-scard-body{display:flex;flex-direction:column}
.db-scard-val{font-size:1.15rem;font-weight:800;font-family:var(--font-display,Outfit,sans-serif);color:var(--text-primary);line-height:1.1}
.db-scard-lbl{font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}

/* ── MAIN GRID ── */
.db-main-grid{display:grid;grid-template-columns:1.4fr 1fr;grid-template-rows:auto auto;gap:16px}
.db-card{background:var(--card-bg);border:1.5px solid var(--border-color);border-radius:var(--radius-lg,18px);padding:22px 24px}
.db-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.db-card-header h3{font-family:var(--font-display,Outfit,sans-serif);font-size:.98rem;margin:0;color:var(--text-primary)}
.db-badge-chip{padding:3px 10px;border-radius:var(--radius-pill,9999px);font-size:.72rem;font-weight:700;background:rgba(129,140,248,.12);color:#818cf8;border:1px solid rgba(129,140,248,.25)}
.db-card-sub{color:var(--text-muted);font-size:.8rem;margin:-6px 0 12px}

/* Chart */
.db-chart-card{grid-column:1;grid-row:1}
.db-chart-area{display:flex;align-items:flex-end;gap:8px;height:160px;padding:0 4px}
.db-bar-col{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;height:100%}
.db-bar-val{font-size:.65rem;color:var(--text-muted);min-height:14px}
.db-bar-track{flex:1;width:100%;background:rgba(255,255,255,.05);border-radius:6px 6px 2px 2px;overflow:hidden;position:relative}
.db-bar-fill{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(129,140,248,.5),rgba(129,140,248,.15));border-radius:6px 6px 0 0;height:0;transition:height .7s cubic-bezier(.4,0,.2,1)}
.db-bar-fill.db-bar-animated{height:var(--bh,0)}
.db-bar-fill.db-bar-today{background:linear-gradient(to top,#818cf8,rgba(129,140,248,.25))}
.db-bar-day{font-size:.68rem;color:var(--text-muted);font-weight:500}
.db-bar-today-lbl{color:#818cf8;font-weight:700}

/* Missions */
.db-missions-card{grid-column:2;grid-row:1}
.db-mission-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color)}
.db-mission-row:last-of-type{border-bottom:none}
.db-mission-done .db-mission-info strong,.db-mission-done .db-mission-info span{opacity:.55}
.db-mission-chk{width:24px;height:24px;border-radius:50%;border:2px solid var(--border-color);display:flex;align-items:center;justify-content:center;font-size:.75rem;flex-shrink:0;transition:all .2s}
.db-chk-done{background:#34d399;border-color:#34d399;color:#fff}
.db-mission-info{flex:1}
.db-mission-info strong{display:block;font-size:.85rem;color:var(--text-primary);margin-bottom:2px}
.db-mission-info span{font-size:.73rem;color:var(--text-muted)}
.db-mission-xp{font-size:.75rem;font-weight:700;color:#fbbf24;white-space:nowrap}
.db-mission-bonus{margin-top:12px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.25);border-radius:var(--radius-md,12px);padding:8px 12px;font-size:.82rem;font-weight:600;color:#34d399;text-align:center}
.db-mission-hint{margin-top:10px;font-size:.75rem;color:var(--text-muted);text-align:center}

/* Level */
.db-level-card{grid-column:1;grid-row:2}
.db-level-row{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.db-level-badge{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#818cf8,#6366f1);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.95rem;color:#fff;flex-shrink:0;font-family:var(--font-display,Outfit,sans-serif)}
.db-level-next{background:linear-gradient(135deg,rgba(129,140,248,.15),rgba(99,102,241,.08));border:1.5px dashed rgba(129,140,248,.4);color:rgba(129,140,248,.7)}
.db-lp-wrap{flex:1}
.db-lp-labels{display:flex;justify-content:space-between;font-size:.73rem;color:var(--text-muted);margin-bottom:5px}
.db-lp-track{height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden}
.db-lp-fill{height:100%;background:linear-gradient(90deg,#818cf8,#34d399);border-radius:4px;transition:width 1s cubic-bezier(.4,0,.2,1)}
.db-lp-sub{font-size:.73rem;color:var(--text-muted);margin:5px 0 0;text-align:center}
.db-ranks-row{display:flex;gap:8px;flex-wrap:wrap}
.db-rank{flex:1;min-width:70px;text-align:center;padding:8px 6px;border-radius:var(--radius-md,12px);background:var(--surface-color,rgba(255,255,255,.03));border:1.5px solid var(--border-color);display:flex;flex-direction:column;align-items:center;gap:3px;font-size:.72rem;color:var(--text-muted);transition:all .2s}
.db-rank span:first-child{font-size:1.1rem}
.db-rank-active{background:rgba(129,140,248,.12);border-color:#818cf8;color:#818cf8;font-weight:700}

/* Badges */
.db-badges-card{grid-column:2;grid-row:2}
.db-badges-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.db-badge-item{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:var(--radius-md,12px);background:var(--surface-color,rgba(255,255,255,.03));border:1.5px solid var(--border-color);transition:all .2s;cursor:default;text-align:center}
.db-badge-earned{border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.05)}
.db-badge-earned:hover{transform:translateY(-2px);border-color:#fbbf24;box-shadow:0 6px 18px rgba(251,191,36,.15)}
.db-badge-locked{opacity:.35}
.db-badge-icon{font-size:1.4rem}
.db-badge-name{font-size:.6rem;color:var(--text-muted);line-height:1.2;font-weight:600}
.db-badge-earned .db-badge-name{color:var(--text-secondary)}

/* Quick Actions */
.db-quick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}
.db-qaction{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--card-bg);border:1.5px solid var(--border-color);border-radius:var(--radius-lg,18px);text-decoration:none;color:var(--text-primary);transition:all .18s;position:relative;overflow:hidden}
.db-qaction::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(129,140,248,.06),transparent);opacity:0;transition:opacity .2s}
.db-qaction:hover{border-color:rgba(129,140,248,.5);transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.14)}
.db-qaction:hover::before{opacity:1}
.db-qa-icon{font-size:1.4rem;flex-shrink:0}
.db-qaction div{flex:1}
.db-qaction div strong{display:block;font-size:.85rem;font-weight:700;margin-bottom:1px}
.db-qaction div span{font-size:.72rem;color:var(--text-muted)}
.db-qa-arrow{color:rgba(129,140,248,.5);font-size:1rem;transition:transform .2s}
.db-qaction:hover .db-qa-arrow{transform:translateX(3px);color:#818cf8}

@media(max-width:860px){
  .db-main-grid{grid-template-columns:1fr}
  .db-chart-card,.db-missions-card,.db-level-card,.db-badges-card{grid-column:1;grid-row:auto}
  .db-badges-grid{grid-template-columns:repeat(5,1fr)}
  .db-hero{padding:24px 20px}
}
@media(max-width:560px){
  .db-root{padding:0 0 30px}
  .db-stats-grid{grid-template-columns:repeat(2,1fr)}
  .db-hero-content{flex-direction:column}
  .db-xp-ring-wrap{order:-1}
  .db-badges-grid{grid-template-columns:repeat(4,1fr)}
  .db-quick-grid{grid-template-columns:1fr 1fr}
}`;
    document.head.appendChild(s);
  }
}
export const dashboardView = new DashboardView();
