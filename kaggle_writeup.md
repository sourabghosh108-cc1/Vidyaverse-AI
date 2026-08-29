# Project Submission Brief: Vidyaverse AI 2.0
> **Track**: Applied AI / Agentic AI Engineering  
> **Event**: Tech Zephyr 4.0 — Agentic AI Hackathon (IIT Bhubaneswar)  
> **Live Application**: [Vidyaverse AI on Vercel](https://vidyaverse-ai.vercel.app) *(Deploy on Vercel)*  
> **Source Code**: [GitHub Repository](https://github.com/your-username/vidyaverse-ai)  

---

## 1. Executive Summary & Problem Formulation

Standard AI education tools are passive—they wait for a prompt, generate an isolated text response, and terminate. When a student preparing for competitive national examinations (JEE, NEET, CUET, Class 10/12) is struggling with a concept, a passive chatbot fails to diagnose gaps, verify retention, search real-time syllabus changes, or structure dynamic practice.

**Vidyaverse AI 2.0** is an **Autonomous Agentic Study Mentor and Gamified Workspace** designed to pursue high-level educational goals through an active **`Observe → Decide → Act → Evaluate → Adapt`** feedback loop.

---

## 2. Agentic Architecture & Workflow

Vidyaverse coordinates specialized tool executors and LLM reasoning engines (Google Gemini 1.5 & Anthropic Claude 3.5) with full fallback autonomy:

```text
       +-------------------------------------------------------------------+
       |                       STUDENT INTERACTION                         |
       |  Goal: "Prepare me for JEE Electrostatics with video & quiz"      |
       +-------------------------------------------------------------------+
                                         |
                                         v
       +-------------------------------------------------------------------+
       |                    1. OBSERVE (Perception)                        |
       |  - Parses target exam syllabus (JEE/NEET/Class 10/12)             |
       |  - Inspects user level, study streaks, and past misconceptions    |
       +-------------------------------------------------------------------+
                                         |
                                         v
       +-------------------------------------------------------------------+
       |                    2. DECIDE (Multi-Step Plan)                    |
       |  - Formulates milestone strategy (Review -> Video -> Diagnostic)  |
       |  - Emits structured Tool Call instructions                        |
       +-------------------------------------------------------------------+
                                         |
                                         v
       +-------------------------------------------------------------------+
       |                    3. ACT (Tool Execution)                        |
       |  [Tool 1: query_curriculum]       -> Local 50-Chapter Database    |
       |  [Tool 2: web_search]             -> Real-time 2026 Trends & PYQs |
       |  [Tool 3: find_youtube_lectures]  -> Curated One-Shot Masterclass |
       |  [Tool 4: generate_quiz]          -> Interactive In-Chat MCQs     |
       |  [Tool 5: start_focus_session]    -> Pomodoro Timer Trigger       |
       +-------------------------------------------------------------------+
                                         |
                                         v
       +-------------------------------------------------------------------+
       |                    4. EVALUATE & ADAPT                            |
       |  - User selects option in interactive quiz card                   |
       |  - Agent evaluates correctness:                                   |
       |      • Correct -> Awards XP & unlocks next advanced module        |
       |      • Incorrect -> Diagnoses misconception, explains derivation, |
       |                     and adapts subsequent practice drills         |
       +-------------------------------------------------------------------+
```

---

## 3. Key Differentiators & Why Agentic AI is Essential

1. **Active Goal Pursuit**: Students declare intent (e.g., *"I have 2 days before my Physics unit test"*), and the agent autonomously structures a multi-day roadmap, fetches video lectures, and initiates timed drills.
2. **Real-Time Tool Grounding**: Avoids hallucinations by querying verified local curriculum JSON structures (`mcp/server.ts` & local datasets) and live web search APIs.
3. **Interactive Human-in-the-Loop Feedback**: Quiz cards and action buttons are rendered natively inside the chat stream, allowing the student to execute drills directly within the conversational flow.
4. **Gamification & Behavioral Reinforcement**: Every agent cycle, quiz answer, and completed focus block dynamically triggers XP rewards, streak protections, and unlocks achievement badges.

---

## 4. Technical Stack & Security Implementation

- **Frontend Core**: Vanilla HTML5, modern CSS3 (Glass-morphism, responsive breakpoints), ES6 JavaScript modules.
- **Serverless API Proxy**: Vercel Serverless Functions (`/api/chat.js`, `/api/search.js`, `/api/youtube.js`).
- **AI Orchestration**: Google Gemini 1.5 Flash (primary tool-caller), Anthropic Claude 3.5 Sonnet, and ReAct Local Fallback Engine.
- **Security & Privacy**: Zero hardcoded secrets in repository; credentials managed strictly via server-side environment variables (`GEMINI_API_KEY`, `YOUTUBE_API_KEY`, etc.). All student logs stay sandboxed in browser `localStorage`.
