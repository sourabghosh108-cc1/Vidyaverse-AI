# Vidyaverse AI 1.0 🚀
> **Personalized Client‑Side Learning Universe & Gamified Study Companion**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Language](https://img.shields.io/badge/Language-Vanilla%20JS%20%2F%20ES6-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Style](https://img.shields.io/badge/Style-Vanilla%20CSS3-blue?style=flat-square&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Project Category](https://img.shields.io/badge/Kaggle-Intensive%20AI%20Capstone-blueviolet?style=flat-square&logo=kaggle)](https://www.kaggle.com)
[![Offline‑First](https://img.shields.io/badge/Architecture-Offline--First%20%2F%20Private-success?style=flat-square&logo=speedtest)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

Vidyaverse AI 1.0 is a **premium, client‑side, offline‑first gamified study workspace** and structured search engine built for Indian students preparing for competitive entrance exams (Class 10, Class 12, JEE, NEET, CUET, CA Foundation). It runs entirely in the browser, stores all data locally, and is completely free.

---

## 📌 Problem Statement

Students face massive cognitive load, expensive paywalls, and scattered resources. Existing portals are heavy on ads, require log‑ins, depend on servers, and lack gamified mechanics that reinforce daily study habits.

---

## 💡 Solution

Vidyaverse AI provides a **single, distraction‑free, offline‑first environment** with:
- A fuzzy‑search engine that works on a curated JSON curriculum (50 detailed chapters).
- AI‑powered notes generation and PDF summarisation.
- A full gamification layer (XP, levels, streaks, achievements, leaderboards).
- No backend, no telemetry – all data lives in the browser sandbox.

---

## 🎮 Core Features & Gamification

| Feature | What it does | UX Highlights |
|--------|--------------|--------------|
| **XP System** | Every action (study, quiz, notes, PDF) awards XP. | Radial XP ring with smooth animation. |
| **Levels** | 1 000 XP → next level, unlocks new UI perks. | Progress bar showing "to next level". |
| **Achievements** | 10+ badges (e.g., *First Strike*, *On Fire*, *Arcade Star*). | Animated badge grid with hover glow, locked icons show 🔒. |
| **Daily Streaks** | Check‑in each day; missing a day resets streak. | Daily‑missions card with check‑boxes and +250 XP bonus. |
| **Quiz Arena** | Timed MCQs with instant feedback. | Perfect‑score badge *Quiz Ace*. |
| **Notes Generator** | AI‑summarises study topics. | Notes count displayed in dashboard stat cards. |
| **Arcade Hub** | 13 mini‑games (future extensions). | Badge *Arcade Star* on win. |
| **Focus Timer** | Pomodoro‑style work/break cycles. | XP awarded on completion, contributes to streak. |
| **Responsive Design** | Works on desktop & mobile via media queries. | Glass‑morphism hero, touch‑friendly controls. |
| **Quick Actions** | Direct navigation buttons on dashboard. | Six‑button grid with smooth hover effects. |

---

## 📐 Architecture Overview

- **State Management** – `js/store.js` (plain Redux‑style store) holds the user profile (XP, level, badges, streak, etc.).
- **Gamification Logic** – `js/gamification.js` calculates XP, level‑up, streaks, and unlocks achievements.
- **Views** – Each UI screen is a class in `js/views/` with a single `render()` method that injects HTML into a container (`#view‑dashboard`, `#view‑quiz`, …). The `DashboardView` now contains the premium glass‑morphism design.
- **Styling** – `css/style.css` implements glass‑morphism, animated stat cards, bar‑chart fills, and media‑query breakpoints (`<860px`, `<560px`).
- **Agentic Architecture** – A client‑side multi‑agent system coordinated by `js/router.js` (hash router). See the Mermaid diagram in the original README for details.
- **MCP Server** – Optional Node/TS MCP server (`mcp/server.ts`) exposes curriculum and notes to external LLM agents.
- **Security** – All data stays in `localStorage`; API keys (e.g., Anthropic) are kept only in memory and never sent to a backend.

---

## 🚀 Usage Walkthrough

1. **Dashboard** – Hero banner greets you, shows XP, level, streak, and quick‑action buttons (Study, Quiz, Arcade, …). Weekly activity chart visualises XP per day.
2. **Study a Topic** – Search bar (`learnView`) uses fuzzy search to pull a chapter, updates `topicsStudiedCount`, awards XP.
3. **Quiz Arena** – Timed MCQ session; correct answers give XP, perfect score unlocks *Quiz Ace*.
4. **Notes Generator** – Write/paste text → AI generates concise notes, increments `notesGeneratedCount`.
5. **Arcade Hub** – Play mini‑games; winning grants the *Arcade Star* badge.
6. **Focus Timer** – Pomodoro cycles; completing a session adds XP and protects your streak.

All actions automatically persist; reload the page and your progress is retained.

---

## 📁 Project Organization

```text
/
├── index.html                  # SPA entry point
├── README.md                   # (this file)
├── css/
│   └── style.css               # Theme & layout
├── data/                       # Curriculum JSON files
│   ├── educational_database.json
│   ├── class10.json
│   ├── class12.json
│   ├── jee.json
│   ├── neet.json
│   ├── cuet.json
│   ├── cafoundation.json
│   └── career.json
├── js/
│   ├── store.js                # Global state
│   ├── gamification.js         # XP & badge logic
│   ├── router.js               # Hash router / agent dispatcher
│   ├── ui.js                   # Toasts, celebrations
│   ├── mockSearch.js           # Fuzzy search resolver
│   └── views/
│       ├── homeView.js
│       ├── learnView.js
│       ├── notesView.js
│       ├── pdfView.js
│       ├── quizView.js
│       ├── dashboardView.js    # Premium dashboard (glass‑morphism)
│       └── settingsView.js
```

---

## 🛠️ Local Development

```bash
# Clone the repo
git clone https://github.com/sourabghosh108-cc1/Vidyaverse-AI
cd app
# or using Node.js
npx live-server
```
Open **`http://localhost:8000`** in your browser.

---

## ☁️ Vercel Deployment

1. Push the repository to GitHub.
2. In the Vercel dashboard click **Add New Project** and select the repo.
3. Keep the **Framework Preset** as **"Other"**.
4. Click **Deploy** – Vercel will serve the static files and apply cache headers for the JSON curriculum.

---

## 🔐 Security & Privacy

- **Zero backend collection** – All study logs, notes, and progress are stored locally.
- **API key safety** – Anthropic keys (for PDF summarisation) stay in memory; requests go directly from the browser.
- **Timeout protection** – Async operations are wrapped with a 10‑15 s timeout to avoid hanging UI.

---

## 📊 Gamification Formulas

- **Level**: `Level = floor(XP / 1000) + 1`
- **XP rewards**:
  - Search: `+20 XP` (first search of the day `+100 XP`)
  - Generate notes: `+50 XP`
  - Summarise PDF: `+75 XP`
  - Correct MCQ: `+20 XP`
  - Complete Quiz session: `+150 XP`
  - Daily check‑in streak bonus: `+250 XP` when both a study and a quiz are completed in 24 h.

---

## 🤝 Contributing & Future Work

- Add server‑side persistence (Firestore, IndexedDB sync).
- Implement global & weekly leaderboards.
- Expand the Arcade with more educational mini‑games.
- Internationalise the UI with multiplayer (i18n JSON files).

---

*Enjoy learning with Vidyaverse – turn every study session into a game!*
