# Capstone Project Writeup: Vidyaverse AI

**Category**: Agents for Good Track  
**Submission Portal**: Kaggle Capstone Project Writeups  
**Author**: Capstone Project Group  
**Live Application URL**: [Vercel Deployment Page](https://vidyaverse-ai.vercel.app) *(Update with your specific live Vercel URL)*  
**Code Repository URL**: [GitHub Repository Page](https://github.com/your-username/vidyaverse-ai) *(Update with your specific repository link)*  

---

## 1. Executive Summary & Abstract

**Vidyaverse AI (v1.0)** is an offline-first, client-side gamified study workspace designed for competitive Indian examinations (Class 10, Class 12, JEE, NEET, CUET, and CA Foundation). 

To address the limitations of commercial edtech platforms—such as high subscription walls, data privacy intrusion, and lack of engaging study reinforcement tools—Vidyaverse AI operates entirely inside a browser-based sandboxed environment. Using a client-side **Agentic Development Kit (ADK)** architecture, the platform features a **Universal Study Search** engine, a dedicated **Notes Generator**, a **PDF Summarizer**, a Pomodoro-style **Focus Timer**, and a **Learning Arcade** featuring 13 educational games. 

For interoperability, we supply an active **Model Context Protocol (MCP) Server Blueprint** (`mcp/server.ts`) running on Stdio transport. This allows external LLMs to query our curriculum database directly. All study stats are persisted locally inside the user's browser, creating a secure, offline-first learning sandbox.

---

## 2. Problem Statement

Indian students preparing for national entrance exams face a demanding academic environment.
1. **High Cognitive Load**: Bulk study materials make extracting formula sheets, concise outlines, and quick flashcards exhausting.
2. **Subscription Paywalls**: Premium tutoring services are expensive, widening the educational equity gap for lower-income students.
3. **Data Security Vulnerability**: Most platforms track, log, and monetize student profiles and study logs.
4. **Retention and Burnout**: Reading static notes without gamified milestones fails to maintain long-term engagement.

---

## 3. Technical Architecture & Course Core Concepts

Vidyaverse AI is designed as a Single Page Application (SPA) utilizing vanilla HTML5, CSS3, and ES6 JavaScript. The architecture satisfies three core course concepts:

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
   |      STUDY AGENT CORES       |  |     GAMIFICATION ENGINE      |
   |      (js/views/*.js)         |  |     (js/gamification.js)     |
   | - Learning & Search Agent    |  | - XP Accrual Rates           |
   | - Notes & PDF Agent          |  | - Consecutive Streaks        |
   | - Quiz & Focus Timer Agents  |  | - Achievements Cabinet       |
   | - Learning Arcade Agent      |  |                              |
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

### Concept A: Client-Side Agent Architecture via ADK
Vidyaverse AI distributes study tasks to dedicated client-side views and agents managed by a central ES6 coordinator:
* **Learning Agent** (`learnView.js` & `mockSearch.js`): Maps search queries into a 10-part study template.
* **Notes Agent** (`notesView.js`): Formats summaries in multiple modes (Quick, Detailed, Revision, Exam) and exports notes as `.txt` files.
* **PDF Agent** (`pdfView.js`): Simulates text parsing and builds vocabularies.
* **Quiz Agent** (`quizView.js`): Drives timed MCQs.
* **Arcade Agent** (`arcadeView.js`): Exposes 13 mini-games connected to the gamification store.
* **Focus Agent** (`focusTimerView.js`): Drives Pomodoro deep-work timers.

### Concept B: Model Context Protocol (MCP) Server Blueprint
To facilitate interaction with local LLMs, we provide an active **Model Context Protocol (MCP)** server (`mcp/server.ts`).
* **Stdio Transport**: Enables standard stdin/stdout stream queries, making it compatible with desktop AI clients like Claude Desktop or Cursor.
* **Tool Registration**: Registers `get_exam_curriculum` and `query_chapter_details` schemas.
* **Database Bridging**: The server reads our curriculum JSON database directly, letting LLM agents reference syllabus nodes when tutoring.

### Concept C: Local Storage & API Security Sandbox
To guarantee data privacy, Vidyaverse AI operates inside a client-side sandbox:
* **Zero Backend Calls**: No network databases, cookies, or external trackers.
* **LocalStorage Serialization**: State metrics are saved in the browser cache.
* **Backup Portability**: In the Settings panel, students can click **Export Progress** to download a serialized backup JSON, or upload a file using **Import Progress** to restore progress.

---

## 4. UI/UX Mechanics

### Radial Progress Ring Dashboard
The Student Dashboard (`dashboardView.js`) features a glassmorphic layout:
- **Radial XP Ring**: Renders an SVG circular progress track that calculates and animations the percentage of XP completed toward the next level in real time.
- **Weekly Activity Chart**: An interactive CSS column bar chart displaying daily study XP distributions, with today's activity highlighted.
- **Achievements Cabinet**: Unlocks 10 distinct badges (e.g. *Pioneer*, *First Strike*, *Note Ninja*, *PDF Pro*, *Arcade Star*).

### Pomodoro Focus Room
The Focus Timer view (`focusTimerView.js`) allows students to configure Pomodoro focus intervals, tracking sessions and awarding XP. It supports three presets:
1. *Pomodoro Technique*: 25m study, 5m break (+100 XP)
2. *Deep Work*: 50m study, 10m break (+200 XP)
3. *Power Sprint*: 15m study, 3m break (+50 XP)

### 13-Game Learning Arcade
The Learning Arcade (`arcadeView.js`) offers 13 mini-games linked to the store:
- **10 Offline Games**: *Flashcard Battle*, *Memory Match* (concept-definition matches), *Formula Sprint*, *True/False Rush*, *Concept Bingo*, *Knowledge Tower* (15-floor climb), *Boss Battles* (defeating bosses with subject questions), *Detect the Mistake* (finding errors in AI solutions), *Streak Master*, and *Treasure Hunt*.
- **3 AI-Powered Games**: *AI Debate Arena*, *Professor Challenge*, and *Explain Like I'm 10* (evaluating how simply the user describes a topic).

---

## 5. Development & Verification Workflow

- **Responsive Checks**: Sidebars transition into sliding mobile drawers below `1024px`, with overlay backdrops closing on outside clicks.
- **Mock Search Validations**: Tested input queries to ensure the fallback template engine always returns structured answers.
- **State Save/Restore Tests**: Verified that refreshing the browser, resetting data, or importing JSON backups recovers levels and streak counts.

---

## 6. Future Roadmap

1. **Web-LLM Integration**: Execute open-source models (like Llama 3) inside the browser via WebGPU to run the AI arcade games fully client-side.
2. **OCR Scanner**: Integrate `tesseract.js` in the PDF agent to extract text from images and solve equations.
3. **P2P Study Rooms**: Enable WebRTC signalling to support shared focus timers between students.
