# Vidyaverse AI 2.0 🚀
> **Autonomous Agentic Study Mentor & Gamified Learning Workspace**  
> *Built for Tech Zephyr 4.0 — Agentic AI Hackathon (IIT Bhubaneswar) & Evolved from Kaggle Community Project*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vidyaverse-ai.vercel.app)
[![Language](https://img.shields.io/badge/Language-Vanilla%20JS%20%2F%20ES6-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-OpenRouter%20GPT--3.5%20%2F%20Llama%203.3-blueviolet?style=flat-square&logo=meta)](https://openrouter.ai)
[![Architecture](https://img.shields.io/badge/Architecture-Autonomous%20ReAct%20Loop-success?style=flat-square)](#)

Vidyaverse AI 2.0 is an **autonomous agentic study companion** and gamified workspace tailored for Indian competitive exams (JEE Main & Advanced, NEET, CUET, CA Foundation, Class 10 & 12 Boards).

Originally developed and featured in the **Kaggle Community Competition**, this version has been significantly upgraded for **IIT Bhubaneswar's Tech Zephyr 4.0** with full offline fallbacks, responsive dark styling, real-time PDF analysis, and direct conversational integrations.

---

## 📌 Problem Statement

Students preparing for high-stakes entrance exams face:
1. **Cognitive Fragmentation**: Juggling disparate notes, YouTube playlists, mock tests, and syllabus tracking spreadsheets.
2. **Passive AI Tutoring**: Traditional AI tools wait for a prompt, answer statically, and terminate—failing to evaluate retention or adapt to student mistakes.
3. **API Downtime & Expense**: Standard AI tools stop working when credit limits or internet connectivity issues occur.

---

## 💡 The Solution: Autonomous "Observe → Decide → Act → Evaluate → Adapt" Loop

Vidyaverse AI implements a complete closed-loop agentic cycle:

```text
                               +-------------------------------------------+
                               |              STUDENT INTENT               |
                               |  "Prepare me for JEE Electrostatics..."   |
                               +-------------------------------------------+
                                                     |
                                                     v
                               +-------------------------------------------+
                               |             1. OBSERVE (State)            |
                               |    Detect syllabus, goals, and gaps       |
                               +-------------------------------------------+
                                                     |
                                                     v
                               +-------------------------------------------+
                               |             2. DECIDE (Planner)           |
                               |    Decompose goal into action steps       |
                               +-------------------------------------------+
                                                     |
                                                     v
                               +-------------------------------------------+
                               |             3. ACT (Executors)            |
                               | - 📚 query_curriculum (50 chapters)       |
                               | - 🌐 web_search (Live PYQs & updates)     |
                               | - 📺 find_youtube_lectures (Video cards)  |
                               | - 🎯 generate_quiz (Active recall MCQs)   |
                               | - ⏱️ start_focus_session (Pomodoro)       |
                               +-------------------------------------------+
                                                     |
                                                     v
                               +-------------------------------------------+
                               |             4. EVALUATE & ADAPT           |
                               |  Analyze answers, award XP, and adjust    |
                               |  future study roadmaps dynamically        |
                               +-------------------------------------------+
```

---

## 🛠️ Tool Suite & Autonomous Capabilities

| Tool | Capability | Execution Context |
|---|---|---|
| `query_curriculum` | Retrieves structured syllabus, formulas, and study guides. | Local 50-chapter curriculum database & MCP server. |
| `web_search` | Real-time web grounding for latest 2025/2026 exam trends. | Serverless proxy (`/api/search.js`) via Google/Serper. |
| `find_youtube_lectures` | Pulls video lectures with player cards. | YouTube Data API v3 proxy (`/api/youtube.js`). |
| `generate_quiz` | Generates diagnostic MCQs with instant grading and explanations. | Interactive client-side active recall engine. |
| `create_study_roadmap` | Generates multi-day milestones and schedule cards. | Autonomous planner engine. |
| `start_focus_session` | Triggers Pomodoro cycles linked to study tasks. | Focus Timer subsystem. |

---

## 🎮 Gamification & Student Engagement

- **XP & Levels**: Every agentic inquiry, quiz solved, and focus cycle completed awards XP (1,000 XP per level).
- **Streak Tracker**: Tracks daily consecutive study check-ins.
- **Achievements Cabinet**: 10+ unlockable badges (e.g., *Welcome Achiever*, *Diligent Scholar*, *Scribe Elite*, *Quiz Master*).
- **Arcade Hub**: 13 interactive educational mini-games (Debate Arena, Professor Challenge, ELI10) for cognitive breaks.

---

## 📁 Project Structure

```text
app/
├── api/                        # Vercel Serverless API Proxy (Secure environment keys)
│   ├── chat.js                 # OpenRouter LLM proxy (GPT-3.5 Turbo / Llama 3.3)
│   ├── search.js               # Real-time Web Search proxy
│   └── youtube.js              # YouTube Data API lecture search
├── css/
│   └── style.css               # Modern glass-morphism & responsive layout
├── data/                       # Curated Indian Exam JSON Database (50 chapters)
│   ├── educational_database.json
│   ├── class10.json, class12.json, jee.json, neet.json, cuet.json, cafoundation.json
├── js/
│   ├── agent/
│   │   ├── studyAgent.js       # Autonomous ReAct Agent Loop & Fallbacks
│   │   └── tools.js            # Executable Tool Registry & Handlers
│   ├── views/
│   │   ├── chatView.js         # ChatGPT-style Agent Copilot with live widgets
│   │   ├── homeView.js         # Hub Dashboard & Agent Visualizer
│   │   ├── learnView.js        # Universal Study Search & Guides
│   │   ├── notesView.js        # AI Notes & Formula Sheet Generator
│   │   ├── pdfView.js          # PDF Document Scanner & Summarizer
│   │   ├── quizView.js         # Timed MCQ Arena
│   │   ├── focusTimerView.js   # Pomodoro Focus Timer
│   │   └── settingsView.js     # User Profile & API Key Manager
│   ├── store.js                # State store (LocalStorage sandbox)
│   ├── gamification.js         # XP, Streaks & Badge Logic
│   └── router.js               # Hash SPA Router
├── .env.example                # Template for environment variables
├── index.html                  # Main SPA entry point
└── vercel.json                 # Vercel deployment & routing config
```

---

## 🚀 Setup & Local Execution

### 1. Local Run
```bash
# Install dependencies
npm install

# Start local server
node server.js
```
Visit `http://localhost:8000` in your browser.

### 2. Vercel Cloud Deployment
1. Import the repository into [Vercel](https://vercel.com).
2. Under **Project Settings → Environment Variables**, add your keys:
   - `OPENROUTER_API_KEY`: Your OpenRouter API Key
   - `YOUTUBE_API_KEY`: Google Cloud YouTube Data API v3 Key
   - `SEARCH_API_KEY`: Serper Key
3. Click **Deploy**. Vercel will automatically build and host the serverless functions and frontend SPA.

---

## 🔐 Security & Hackathon Compliance

- **No Hardcoded Secrets**: In strict compliance with IIT Bhubaneswar regulations, no private credentials, tokens, or API keys are stored in the repository.
- **Serverless Key Guard**: All cloud LLM and external API requests route through serverless proxies that access server-side environment variables.
- **Offline & Local Sandbox**: When no external keys are present, the system defaults to autonomous local mock engines and client-side database search.
- **Kaggle Roots**: Proudly building upon our verified Kaggle machine learning and conceptual database engines.
