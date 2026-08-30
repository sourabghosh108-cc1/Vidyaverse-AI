# Vidyaverse AI 2.0 🚀
> **Autonomous Agentic Study Mentor & Gamified Learning Workspace**  
> **Events & Awards**:  
> 🏅 **Tech Zephyr 4.0 — Agentic AI Hackathon** *(Indian Institute of Technology Bhubaneswar)*  
> 🏆 **AI Agents: Intensive Vibe Coding Capstone** *(Kaggle & Google DeepMind)* — *Agents for Good Track* (DOI: [`10.34740/kaggle/w/94423`](https://doi.org/10.34740/kaggle/w/94423))

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Application-black?style=flat-square&logo=vercel)](https://vidyaverse-ai-study.vercel.app)
[![Kaggle DOI](https://img.shields.io/badge/Kaggle%20DOI-10.34740%2Fkaggle%2Fw%2F94423-blue?style=flat-square&logo=kaggle)](https://doi.org/10.34740/kaggle/w/94423)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/sourabghosh108-cc1/Vidyaverse-AI)
[![Architecture](https://img.shields.io/badge/Architecture-Observe--Decide--Act--Evaluate--Adapt-success?style=flat-square)](#)

---

## 📌 Project Overview & Evolution

**Vidyaverse AI** is an intelligent, offline-first, client-side gamified study workspace designed for competitive Indian examinations (Class 10, Class 12, JEE Main & Advanced, NEET, CUET, and CA Foundation).

Originally created during **Kaggle's 5-Day AI Agents: Intensive Vibe Coding Course with Google** (*Agents for Good Track*), the application has been evolved into **Vidyaverse AI 2.0** for **IIT Bhubaneswar's Tech Zephyr 4.0 Agentic AI Hackathon**. It transitions standard passive AI text generation into an active **`Observe → Decide → Act → Evaluate → Adapt`** autonomous feedback loop.

### 🎥 Project Videos & Links
- 🌐 **Live Web Application**: [vidyaverse-ai-study.vercel.app](https://vidyaverse-ai-study.vercel.app)
- 💻 **GitHub Repository**: [github.com/sourabghosh108-cc1/Vidyaverse-AI](https://github.com/sourabghosh108-cc1/Vidyaverse-AI)
- 🎬 **YouTube Demo Video 1 (Full Overview)**: [youtu.be/GkMr3lLC4hw](https://youtu.be/GkMr3lLC4hw?si=gi8-qyRV0IZgKON7)
- 🎬 **YouTube Demo Video 2 (Features & ReAct Deep Dive)**: [youtu.be/Op7VxjoOx6k](https://youtu.be/Op7VxjoOx6k?si=uVONdnP6OY_882H6)
- 📄 **Kaggle DOI Citation**: `https://doi.org/10.34740/kaggle/w/94423`

---

## 💡 Problem Statement

Indian students preparing for national competitive exams face steep academic obstacles:
1. **High Cognitive Load**: Bulk study materials make extracting formula sheets, concise outlines, and quick flashcards exhausting.
2. **Subscription Paywalls & Commercial Lock-in**: Premium edtech platforms place basic tutoring tools behind expensive recurring paywalls.
3. **Passive AI Tutoring**: Standard LLM chat prompts stop as soon as text is generated—failing to test retention, search real-time syllabus changes, or structure dynamic practice.
4. **Data Security & Privacy Vulnerabilities**: Commercial platforms track and monetize student study logs.

---

## 🛠️ System Architecture & Course Concepts

Vidyaverse AI 2.0 is designed as a Single Page Application (SPA) utilizing vanilla HTML5, modern CSS3 (Glass-morphism layout), and modular ES6 JavaScript.

```text
                  +------------------------------------------------------+
                  |              STUDENT WEB APP SHELL                   |
                  |     (index.html, css/style.css, script.js)           |
                  +------------------------------------------------------+
                                   |
                                   v
                  +------------------------------------------------------+
                  |            CLIENT-SIDE STATE STORE                   |
                  |      (js/store.js <---> LocalStorage Sandbox)        |
                  +------------------------------------------------------+
                                   |
                  +----------------+----------------+
                  |                                 |
                  v                                 v
   +------------------------------+  +------------------------------+
   |     AGENTIC REACT LOOPS      |  |     GAMIFICATION ENGINE      |
   |      (js/views/*.js)         |  |     (js/gamification.js)     |
   | - Observe: Exam Context      |  | - XP Accrual & Levels        |
   | - Decide: Tool Orchestrator  |  | - Consecutive Streaks        |
   | - Act: Tool Executors        |  | - Achievements Cabinet       |
   | - Evaluate: Quiz & Feedback  |  |                              |
   | - Adapt: Profile Refinement  |  |                              |
   +------------------------------+  +------------------------------+
                  |
                  +---------------------------------+
                                                    | (Interoperability)
                                                    v
                                     +------------------------------+
                                     |   MODEL CONTEXT PROTOCOL     |
                                     |  (mcp/server.ts via Stdio)   |
                                     +------------------------------+
```

### 1. The Autonomous Agentic Loop (`Observe → Decide → Act → Evaluate → Adapt`)
- **Observe**: Agent reads student exam goals, XP levels, past quiz performance, and active target syllabus (`JEE`, `NEET`, `Class 10/12`).
- **Decide**: Agent chooses appropriate tools from its registry rather than giving static text output.
- **Act**: Executes tool calls (`query_curriculum`, `web_search`, `find_youtube_lectures`, `generate_quiz`, `start_focus_session`).
- **Evaluate**: Automatically grades active recall quizzes, awards XP, tracks streaks, and diagnoses misconceptions.
- **Adapt**: Adjusts future quiz difficulties, roadmap milestones, and study recommendations.

### 2. Model Context Protocol (MCP) Server Blueprint (`mcp/server.ts`)
- **Stdio Transport**: Provides standard stdin/stdout stream queries compatible with AI desktop environments like Claude Desktop and Cursor.
- **Schema Registration**: Exposes `get_exam_curriculum` and `query_chapter_details`.
- **Database Bridging**: Connects external LLM agents directly to the 50-chapter curriculum dataset.

---

## 🧰 Agent Tool Registry

| Tool Name | Action / Function | Execution Context |
|---|---|---|
| `query_curriculum` | Fetches structured syllabus, formulas, derivations, and exam tips. | Local 50-chapter curriculum database & MCP server. |
| `web_search` | Real-time web search for 2025/2026 exam trends & PYQs. | Serverless proxy (`/api/search.js`) via Google/Serper. |
| `find_youtube_lectures` | Pulls topic-matched one-shot video masterclasses with direct player cards. | YouTube Data API v3 proxy (`/api/youtube.js`). |
| `generate_quiz` | Generates diagnostic MCQs with instant grading, explanations, and XP rewards. | Interactive client-side active recall engine. |
| `create_study_roadmap` | Generates adaptive multi-day milestones and schedule cards. | Autonomous planner engine. |
| `start_focus_session` | Automatically triggers Pomodoro cycles linked to study tasks. | Focus Timer subsystem. |

---

## 💼 Business Model & Social Impact (Tech Zephyr 4.0 B-Plan)

Vidyaverse AI is built on the philosophy that **high-quality education must be ultra-affordable and accessible to every student**, eliminating heavy edtech paywalls.

### 🪙 Democratic Pricing Architecture
- **Free Tier (₹0)**: Lifetime 100% free access to core offline app, gamified study arcade, syllabus database, focus timers, local notes & PDF reader.
- **Ultra-Low Micro-Tier (₹9 to ₹11 / month)**: Pocket-friendly micro-subscription for daily diagnostic quiz generation and active recall practice.
- **AI Agent Study Pro (₹499 to ₹501 / month)**: Advanced power-user tier for deep multi-step ReAct agent reasoning, continuous mock test generation, and personalized mentor personas.
- **B2B School & Coaching Center SaaS (₹201 / month median)**: Median pricing for local coaching centers, tier-2/3/4 schools, and independent tutors to track batch student performance and leaderboards.

### 🎓 The "Next 50 Scholarship" Initiative (Super 30 Concept)
Inspired by Anand Kumar's world-renowned **Super 30** program, the **Next 50 Scholarship** identifies 50 deserving, economically underprivileged students per cohort and provides **100% fully funded access** to complete study passes, AI agent mentorship, and exam preparation resources.

### 🔮 Future Vision: The ₹1 / $1 Accredited Global Virtual University
As the **Next 50 Scholarship** expands over the coming years, Vidyaverse AI plans to evolve into an accredited, ultra-low-cost **Global Virtual University**:
- 🌐 **₹1 / $1 University Degree**: Evolving higher education degree access to an unprecedented cost of **₹1,000 – ₹2,000 total (or 1 Rupee / $1 entry model)** by partnering with US and international accreditation bodies.
- 📜 **Industry Micro-Certifications**: Providing affordable, verified skill certifications in AI Engineering, Machine Learning, Web Technologies, and Data Science.

---

## 🎮 Gamification & Engagement Mechanics

- **Radial XP Ring Dashboard**: Real-time SVG circular track rendering progress toward the next level (1,000 XP per level).
- **Streak Tracker Engine**: Monitors consecutive daily study check-ins.
- **Achievements Cabinet**: 10+ unlockable badges (*Welcome Achiever*, *Diligent Scholar*, *Scribe Elite*, *Quiz Master*, *Arcade Star*).
- **13-Game Learning Arcade**:
  - **10 Offline Games**: Flashcard Battle, Memory Match, Formula Sprint, True/False Rush, Concept Bingo, Knowledge Tower (15-floor climb), Boss Battles, Detect the Mistake, Streak Master, Treasure Hunt.
  - **3 AI-Powered Games**: AI Debate Arena, Professor Challenge, and Explain Like I'm 10 (ELI10).

---

## 📁 Project Directory Map

```text
Vidyaverse-AI/
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
│   │   ├── studyAgent.js       # Autonomous ReAct Agent Loop & Fail-Safe Fallbacks
│   │   └── tools.js            # Executable Tool Registry & Handlers
│   ├── views/
│   │   ├── chatView.js         # ChatGPT-style Agent Copilot interface
│   │   ├── homeView.js         # Hub Dashboard & Visualizer
│   │   ├── learnView.js        # Universal Study Search & Guides
│   │   ├── notesView.js        # AI Notes & Formula Sheet Generator
│   │   ├── pdfView.js          # PDF Document Scanner & Summarizer
│   │   ├── quizView.js         # Timed MCQ Arena
│   │   ├── focusTimerView.js   # Pomodoro Focus Timer
│   │   ├── arcadeView.js       # 13 AI & Offline Study Mini-Games
│   │   ├── dashboardView.js    # Radial XP & Analytics Dashboard
│   │   └── settingsView.js     # Profile & Sandbox Backup Manager
│   ├── store.js                # State store (LocalStorage sandbox)
│   ├── gamification.js         # XP, Streaks & Badge Logic
│   └── router.js               # SPA Hash Router
├── mcp/
│   └── server.ts               # Model Context Protocol (MCP) Server Blueprint
├── .env.example                # Template for environment variables (Zero secrets)
├── .gitignore                  # Git privacy guard
├── index.html                  # Main SPA entry point
├── package.json                # Project metadata
├── server.js                   # Local Node.js development server
└── vercel.json                 # Vercel cloud deployment config
```

---

## 🚀 Setup & Execution Guide

### 1. Local Execution
```bash
# Clone the repository
git clone https://github.com/sourabghosh108-cc1/Vidyaverse-AI.git
cd Vidyaverse-AI

# Install dependencies (Optional)
npm install

# Start local server
node server.js
```
Open `http://localhost:8000` in your browser.

### 2. Vercel Cloud Deployment
1. Import repository into [Vercel](https://vercel.com).
2. Set Environment Variables under **Project Settings → Environment Variables**:
   - `OPENROUTER_API_KEY`: Your OpenRouter API Key
   - `YOUTUBE_API_KEY`: Google YouTube Data API v3 Key (Optional)
   - `SEARCH_API_KEY`: Serper Key (Optional)
3. Click **Deploy**.

---

## 🔐 Security & Hackathon Regulations Compliance

- **Zero Hardcoded Secrets**: Strictly compliant with competition security regulations—no private credentials, tokens, or API keys are stored in the repository.
- **Serverless Key Guard**: Cloud LLM and API requests route through serverless endpoints consuming server-side environment variables.
- **Local Fallback Engine**: If external APIs are unavailable, the system seamlessly defaults to client-side database synthesis so learning never stops.

---
**Author**: Sourab Ghosh (`sourabghosh108@gmail.com`)  
**Kaggle DOI**: `10.34740/kaggle/w/94423` | **License**: CC BY 4.0 / MIT
