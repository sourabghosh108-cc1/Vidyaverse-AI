# 3–5 Minute Demo Video Script
> **Hackathon**: Tech Zephyr 4.0 — Agentic AI Hackathon (IIT Bhubaneswar)  
> **Project**: Vidyaverse AI 2.0 (Autonomous Agentic Study Copilot)  
> **Target Video Duration**: 3:30 – 4:30 Minutes  

---

## 🎬 Video Overview & Timestamp Breakdown

| Timestamp | Section | Visual Focus on Screen | Voiceover Narrative |
|---|---|---|---|
| **0:00 – 0:45** | **The Problem & Pitch** | Home Page / Dashboard overview | *"Most AI education tools are passive chatbots that just dump text. Vidyaverse AI 2.0 introduces an Autonomous Agentic Study Mentor that observes goals, calls live tools, tests comprehension, and adapts to student mistakes."* |
| **0:45 – 1:45** | **Live Agentic ReAct Demo** | Click **"AI Agent Copilot"** tab | *Enter prompt: "I am preparing for JEE Electrostatics. Build a 3-day plan, find a top video lecture, search for 2026 PYQ weightage, and test me."* Highlight the **Reasoning Trace step badges** appearing live: `🧠 Thinking...`, `🛠️ Tool: query_curriculum`, `🌐 Tool: web_search`, `📺 Tool: find_youtube_lectures`, `🎯 Tool: generate_quiz`. |
| **1:45 – 2:30** | **Tool Execution & Active Widgets** | Chat output displaying YouTube card & Quiz | *"Notice the rich widgets returned by the agent. We have an embedded YouTube video masterclass, live web search results, and an interactive diagnostic quiz directly in the chat stream."* |
| **2:30 – 3:15** | **Human-in-the-Loop & Adaptive Feedback** | Click on Quiz Option A/B/C inside chat | *Click the correct/incorrect option.* Show instant grading, XP toast (+50 XP), level progression, and how the agent provides instant feedback and error remediation. |
| **3:15 – 3:45** | **Gamification & Multi-View Ecosystem** | Navigate to Quiz Arena, Focus Timer, Habit Dashboard | *"All agent activities flow into our gamified student hub—updating streaks, XP levels, and unlocking achievements."* |
| **3:45 – 4:00** | **Architecture & Conclusion** | Show Architecture Diagram / GitHub Repo | *"Built with clean ES6 architecture, Model Context Protocol (MCP) server integration, and secure serverless key guards. Thank you!"* |

---

## 🎙️ Step-by-Step Recording Instructions

1. **Before Recording**:
   - Open the web app locally or on Vercel at `http://localhost:8000`.
   - Ensure audio is clear with minimal background noise.
2. **Key Moments to Emphasize**:
   - Explicitly highlight the **ReAct Agent Loop**: *Observe $\rightarrow$ Decide $\rightarrow$ Act $\rightarrow$ Evaluate $\rightarrow$ Adapt*.
   - Point out that **API keys are protected server-side** in Vercel environment variables, keeping credentials 100% safe.
3. **Closing**:
   - Conclude with a strong call to action about democratizing personalized, active AI mentorship for every student in India.
