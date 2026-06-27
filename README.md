# Vidyaverse AI 🚀

> Your Personalized Learning Universe — A Gamified study workspace for competitive Indian exams.

Vidyaverse AI is an interactive, client-side single page application (SPA) prototype built for students preparing for Class 10, Class 12, JEE, NEET, CUET, and CA Foundation. It combines structured revision sheets, custom note builders, document summarization, timed MCQ tests, and study habit trackers in a Notion/SaaS-inspired layout.

---

## 📌 Problem Statement

Students preparing for high-stakes Indian exams (JEE, NEET, Boards) face immense academic pressure and struggle with cognitive load. Commercial edtech platforms are often expensive, cluttered with advertisements, require complex signups, and lack interactive loops that reinforce daily study habits.

## 💡 The Solution

Vidyaverse AI provides a **completely free, private, and offline-first study suite**:
- **Privacy First**: No server databases, no signups, and no trackers. All data is saved inside the user's browser via `localStorage` and can be backed up as a JSON file.
- **Unified Hub Dashboard**: Employs a left-sidebar layout (Notion style) with sliding drawers on mobile to maximize workspace focus.
- **Universal Study Search**: Resolves any academic search query into a structured 10-part educational guide (Overview, Concepts, Vocabulary, Formulas, Notes, Q&As, Videos).
- **Gamified Habit Loops**: Promotes daily check-ins using XP thresholds, levels upgrades, login streaks, and achievement badges cabinets.

---

## 🛠️ Technology Stack

- **Frontend**: Semantic HTML5 & Vanilla ES6 JavaScript (Native modular imports)
- **Styling**: Vanilla CSS3 (Custom Dark Mode default, light mode toggler, glassmorphism, responsive flex/grid layouts)
- **State Store**: `localStorage` backup manager
- **Deployment**: Vercel-ready static configuration (`vercel.json`)

---

## 📂 Project Organization

```text
/
├── index.html                  # Master dashboard shell
├── vercel.json                 # CDN caching parameters
├── README.md                   # Product documentation
├── css/
│   └── style.css               # Design tokens, SaaS colors, visual timelines & charts
├── data/                       # Curriculum databases
│   ├── class10.json            # Class 10 Board Science
│   ├── class12.json            # Class 12 Boards Physics/Chemistry
│   ├── jee.json                # JEE Prep Physics/Mathematics
│   ├── neet.json               # NEET Biology chapter MCQs
│   ├── cuet.json               # CUET General Test Quant Ratios
│   ├── cafoundation.json       # CA Foundation double-entry accounting
│   └── career.json             # Career timeline roadmaps & cutoffs
└── js/                         # JavaScript source modules
    ├── store.js                # Game state management & backup logic
    ├── gamification.js         # XP points, levels, streaks, and badges checklist
    ├── router.js               # Client-side hash router
    ├── ui.js                   # Themes, toasts, mobile menus, and confetti overlays
    ├── mockSearch.js           # Universal Search mock parser and dynamic engine
    └── views/                  # View renderers
        ├── homeView.js         # Hero search, quick actions, and AI Agents visualizer
        ├── learnView.js        # Study guide renderer and YouTube-style video cards
        ├── notesView.js        # Notes generator builder with TXT exports
        ├── pdfView.js          # PDF drag-drop uploader & extraction loader
        ├── quizView.js         # Duolingo style timed MCQ player & rankings board
        ├── dashboardView.js    # Habit dashboard with CSS weekly bar charts
        └── settingsView.js     # User renames, badges cabinet, data backup
```

---

## 🤖 Future AI Agentic Brain Architecture

Vidyaverse AI structures its data generation using specialized sub-agents working together in a client-side environment:

```text
                  +----------------------------------+
                  |    Student Input Query / File    |
                  +----------------------------------+
                                   |
                                   v
                  +----------------------------------+
                  |     Central Agentic Router       |
                  +----------------------------------+
                                   |
        +------------------+-------+-------+------------------+
        |                  |               |                  |
        v                  v               v                  v
 [ Learning Agent ]  [ Notes Agent ]  [ PDF Agent ]     [ Quiz Agent ]
 - Topic Outlines    - Quick Notes    - Page OCR        - MCQs Generator
 - Formula Sheets    - Exam Cheats    - Term Glossary   - Explanations
        |                  |               |                  |
        +------------------+-------+-------+------------------+
                                   |
                                   v
                  +----------------------------------+
                  |  Progress & Recommendation Agent |
                  +----------------------------------+
                                   |
                                   v
                  +----------------------------------+
                  |      Personalized Workspace      |
                  +----------------------------------+
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

## 🚀 Installation & Local Development

No compilers or complex node modules installation needed.

1. Clone or download the files:
   ```bash
   git clone https://github.com/your-username/vidyaverse-ai.git
   cd vidyaverse-ai
   ```

2. Run a local static server. For example:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node
   npx live-server
   ```

3. Open `http://localhost:8000` in your web browser.

---

## ☁️ Vercel Deployment

Deploy your static workspace instantly:
1. Connect your repository to GitHub.
2. Log into the [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Select your repository and click **Deploy**. Vercel will optimize cache control headers for JSON resources based on the local `vercel.json` configurations.
