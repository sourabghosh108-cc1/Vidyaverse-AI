# Vidyaverse AI 2.0 🚀

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Language](https://img.shields.io/badge/Language-Vanilla%20JS%20%2F%20ES6-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Style](https://img.shields.io/badge/Style-Vanilla%20CSS3-blue?style=flat-square&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Project Category](https://img.shields.io/badge/Kaggle-Intensive%20AI%20Capstone-blueviolet?style=flat-square&logo=kaggle)](https://www.kaggle.com)
[![Offline-First](https://img.shields.io/badge/Architecture-Offline--First%20%2F%20Private-success?style=flat-square&logo=speedtest)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

> **Kaggle Intensive AI Capstone Project** — A premium, client-side, offline-first gamified study workspace and structured search engine designed for Indian students preparing for competitive exams (Class 10, Class 12, JEE, NEET, CUET, and CA Foundation).

---

## 📌 Problem Statement

Students preparing for high-stakes Indian entrance exams face immense academic pressure, heavy cognitive load, and scattered study resources. Existing edtech platforms are often expensive, bloated with ads, require complex cloud setups, and lack engaging loops that reinforce daily study habits. 

## 💡 The Solution: Vidyaverse AI 2.0

Vidyaverse AI 2.0 is a **completely free, client-side, offline-first study companion**. It operates entirely in the browser using `localStorage` and client-side processing, requiring no backend servers or database signups.

### Key Upgraded Capabilities in v2.0:
- **Comprehensive Knowledge Database**: Replaced placeholder generators with a structured JSON database populated with **50 genuine, highly detailed chapters** across Physics, Chemistry, Mathematics, Biology, CA Foundation Accounting, and CUET Aptitude.
- **Smart Fuzzy Search**: Implemented a hybrid search engine combining exact, substring, keyword-overlap, and **Levenshtein character-distance matching** to resolve typos and aliases (e.g. `"Coulomb Law"`, `"Coulomb's Law"`, and `"Electrostatic Force"` all map to the same page).
- **Study-First Experience (10-Part Interactive Guide)**:
  - **Topic Overview & Detailed Explanation**
  - **Key Concepts** (Interactive Grid)
  - **Glossary & Definitions**
  - **Formula Chest** (Equations and descriptions)
  - **Interactive Flashcards** (Flippable Q&A widget with card navigation)
  - **Concept Assessment Quiz** (Interactive MCQ with immediate green/red feedback, scoring, and explanations)
  - **Syllabus Learning Path** (Visual progress timeline)
  - **Knowledge Graph** (Related chapters navigation)
  - **Common Mistakes & Exam Tips**
  - **Quick Revision Bullet Points**
  - **Suggested Video Lectures** (Curated educational video cards with durations, channels, and correct thumbnails)
- **E2E PDF Summarizer**: Fixed the stuck upload system. Dynamically loads the `PDF.js` library in-browser, extracts text page-by-page, shows real progress, matches text to database topics, and falls back to a smart heuristic summarizer (extracting summaries, terms, formulas, and tips from raw text).
- **Bulletproof Safety & Loading Audit**: All asynchronous operations (Notes & PDF generation) run within a **10-second timeout protection** and are wrapped in robust `try/catch/finally` blocks, guaranteeing that loading overlays always close and buttons are re-enabled.

---

## 🛠️ Technology Stack

- **Frontend Core**: Semantic HTML5, Vanilla ES6 JavaScript (Native modular imports)
- **Styling**: Vanilla CSS3 (Custom Dark Mode default, light mode toggler, glassmorphism, responsive flex/grid layouts)
- **Parsing Engines**: Client-side `PDF.js` (for local document text extraction)
- **State Store**: Browser `localStorage` (for streaks, badges, notes, and activity scores)
- **Deployment**: Vercel-ready static configuration (`vercel.json`)

---

## 📂 Project Organization

```text
/
├── index.html                  # Master dashboard shell
├── vercel.json                 # Vercel static routing & cache headers
├── README.md                   # Capstone project documentation
├── css/
│   └── style.css               # Design tokens, SaaS colors, visual layouts
├── data/                       # Curriculum databases
│   ├── educational_database.json # [NEW] 50-topic comprehensive curriculum database
│   ├── class10.json            # Chapter MCQ maps (Class 10 Science)
│   ├── class12.json            # Chapter MCQ maps (Class 12 Physics/Chemistry)
│   ├── jee.json                # Chapter MCQ maps (JEE Physics/Math)
│   ├── neet.json               # Chapter MCQ maps (NEET Biology)
│   ├── cuet.json               # Chapter MCQ maps (CUET Quantitative)
│   ├── cafoundation.json       # Chapter MCQ maps (CA Accounting)
│   └── career.json             # Career roadmap timelines
└── js/                         # JavaScript source modules
    ├── store.js                # Game state management & backup logic
    ├── gamification.js         # XP points, levels, streaks, and badges checklist
    ├── router.js               # Client-side hash router
    ├── ui.js                   # Themes, toasts, mobile menus, and confetti overlays
    ├── mockSearch.js           # Search resolver (fuzzy matches, suggestions)
    └── views/                  # View renderers
        ├── homeView.js         # Home search with autocomplete suggestions
        ├── learnView.js        # Upgraded study workspace (flashcards, assessments)
        ├── notesView.js        # Upgraded notes generator builder
        ├── pdfView.js          # Upgraded PDF summarizer with progress & matching
        ├── quizView.js         # Timed MCQ player & rankings board
        ├── dashboardView.js    # Habit dashboard with CSS weekly bar charts
        └── settingsView.js     # User renames, badges cabinet, data backup
```

---

## 🕹️ Gamification Rules

- **Leveling Formula**: $\text{Level} = \lfloor \frac{\text{XP}}{1000} \rfloor + 1$
- **XP Accrual Rates**:
  - Perform a Universal Study Search: $+20$ XP (first search: $+100$ XP)
  - Generate custom notes: $+50$ XP
  - Upload & Summarize a PDF: $+75$ XP
  - Answer an MCQ question correctly: $+20$ XP
  - Complete a Quiz Arena session: $+150$ XP
  - Meet the Daily Goal (1 search + 1 quiz): $+250$ XP bonus
  - Complete a Pomodoro focus timer block: $+50$ XP

---

## 🚀 Local Development

Since the app uses ES Modules, run a local web server to avoid CORS blocks:

1. Clone or download the files.
2. Open terminal in the directory and launch a server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node
   npx live-server
   ```
3. Open **`http://localhost:8000`** (or `http://127.0.0.1:8080` for live-server) in your web browser.

---

## ☁️ Vercel Deployment

Deploy your static workspace instantly:
1. Push the project to GitHub.
2. Log into the [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Select your repository. Vercel will automatically set the **Framework Preset** to **"Other"**.
4. Click **Deploy**. Vercel will build the workspace and optimize cache control headers for JSON resources based on the local `vercel.json` configurations.
