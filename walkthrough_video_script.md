# Vidyaverse AI - Walkthrough Video Script (v1.0 Submission)

This script is structured for a screen-share walkthrough of **Vidyaverse AI v1.0** live on Vercel and in VS Code.

- **Target Duration**: 4 Minutes 50 Seconds
- **Tone**: Professional, enthusiastic, startup-pitch style.

---

### 🎬 Scene 1: Introduction (0:00 - 0:45)
- **Visual Cue**: 
  Open browser showing the live Vercel deployment of **Vidyaverse AI** on the Home page (`#home`). Hover your cursor over the Notion-style left sidebar, showing smooth transition highlights. Click the **Theme Toggle (🌓)** button in the sidebar footer to switch between Light and Dark modes.
- **Narration**:
  > *"Hello judges and Capstone team! Welcome to Vidyaverse AI, your personalized learning universe. Vidyaverse is a serverless, offline-first study workspace designed to help competitive Indian students prepare for Class 10, 12, JEE, NEET, CUET, and CA Foundation exams without cost, advertisements, or data trackers."*
  >
  > *"As you can see, we’ve built a premium Notion-style dashboard featuring a fixed left sidebar for easy navigation. All progress metrics, streaks, and levels are persisted locally in the browser's storage sandbox, giving students total data privacy."*

---

### 🎬 Scene 2: Universal Study Search (0:45 - 1:30)
- **Visual Cue**: 
  Click the search bar in the hero card. Type *"Electrostatics"* and click **Search Topic** (or click the *⚡ Electrostatics* popular chip). Scroll down the generated study guide smoothly, pointing out the numbered sections: Overview, Concepts, Definitions, Formulas, Explanation, and Suggested Videos. Click **Reveal Answer** on a practice question.
- **Narration**:
  > *"Let's test our core feature: the Universal Study Search. If I search for 'Electrostatics' or click a popular chip, our client-side Learning Agent instantly resolves the query and renders a structured 10-part study guide."*
  >
  > *"Rather than a wall of text, the student gets a structured layout: an overview, a grid of key concepts, definitions, formula code blocks, common exam mistakes, and expandable practice questions. At the bottom, our Recommendation Agent curates relevant YouTube video lectures and practice worksheets directly from our curriculum database, bypassing any external API key limits."*

---

### 🎬 Scene 3: Notes & PDF Summarizer (1:30 - 2:15)
- **Visual Cue**: 
  Click **Notes** in the sidebar. Type *"Kinematics"* in the topic input, select **Revision Sheet**, and click **Generate AI Notes**. Watch the loader spin for 1.5 seconds, then show the structured text. Click **Download Notes**. 
  Next, click **PDF Summarizer** in the sidebar. Click the dropzone, upload a sample text file, and click **Summarize Document**. Let the progress bar climb to 100% showing the steps, and show the results cards.
- **Narration**:
  > *"Next is the Notes Generator. Students can choose from Quick, Detailed, Revision, or Exam templates, type their topic, and generate formatted notes with our Notes Agent. The generated sheet can be edited directly on the screen and downloaded as a text file."*
  >
  > *"Similarly, our PDF Summarizer allows students to drag and drop textbook PDFs or notes. Our PDF Agent runs a progressive text scanner to extract abstract summaries, key concept cards, and glossary glossaries that can be exported in one click."*

---

### 🎬 Scene 4: Focus Timer & Student Dashboard (2:15 - 3:00)
- **Visual Cue**: 
  Click **Focus Timer** in the sidebar. Hover over the presets tabs: Pomodoro, Deep Work, Power Sprint. Point out the study tags and session counter.
  Next, click **Dashboard** in the sidebar. Highlight the **Radial XP Ring** showing percentage progress. Hover over the weekly activity bar chart columns. Point out the daily mission checkboxes and the unlocked badges in the cabinet.
- **Narration**:
  > *"We've introduced a dedicated Focus Timer View in this version. This section features customizable Pomodoro-style timers with three presets: the classic 25-minute Pomodoro, 50-minute Deep Work blocks, and 15-minute Power Sprints, rewarding students with XP and session milestones."*
  >
  > *"On the Student Dashboard, we find our profile analytics: a premium glassmorphic hero banner, an SVG-based Radial XP Ring calculating level progression, a weekly learning distribution chart showing daily XP gained, and an achievements cabinet highlighting unlocked badges like Note Ninja or PDF Pro."*

---

### 🎬 Scene 5: Quiz Arena & Learning Arcade (3:00 - 4:00)
- **Visual Cue**: 
  Click **Quiz Arena** in the sidebar, show the category selectors.
  Next, click **Arcade** in the sidebar. Highlight the grid of 13 games, focusing on the game cards: Flashcard Battle, Memory Match, Knowledge Tower, and the Claude-powered AI Debate Arena, Professor Challenge, and Explain Like I'm 10. Click on **Knowledge Tower** or **True/False Rush** to show the game UI.
- **Narration**:
  > *"For timed assessments, the Quiz Arena offers categories for Board and Entrance exams with Duolingo-style MCQs, countdown timers, and immediate feedback."*
  >
  > *"But the highlight of our gamification is the new Learning Arcade. Here, we've implemented 13 educational mini-games. This includes 10 fully offline retro games—like Memory Match, Formula Sprint, and a 15-floor Knowledge Tower—plus 3 Claude API-powered games, including the AI Debate Arena and Explain Like I'm 10, designed to make revision active and competitive."*

---

### 🎬 Scene 6: MCP Server TypeScript Code (4:00 - 4:40)
- **Visual Cue**: 
  Switch your screen-share to VS Code showing the file [mcp/server.ts](file:///c:/Users/ACER/Desktop/app/mcp/server.ts). Highlight the imports at the top, the tool definitions (`get_exam_curriculum`, `query_chapter_details`), and the Stdio transport configuration at the bottom.
- **Narration**:
  > *"To ensure Vidyaverse AI is future-proof, we developed a Model Context Protocol (MCP) server under `mcp/server.ts`. This server runs on a Node.js Stdio transport. It registers specific tools that expose our offline JSON curriculum databases directly to external LLM agents like Cursor or Claude Desktop."*
  >
  > *"This enables external AI assistants to read, query, and reference our local syllabus files and student progress metrics safely, bridging the gap between local database context and generative LLM reasoning."*

---

### 🎬 Scene 7: Outro (4:40 - 4:50)
- **Visual Cue**: 
  Switch back to the browser showing the dashboard page (`#dashboard`). Point to the weekly study activity bar chart and the daily checkboxes.
- **Narration**:
  > *"In conclusion, Vidyaverse AI satisfies the Kaggle Capstone guidelines by delivering a clean, functional study portal with client-side agents, local sandboxed memory, and an MCP server framework. Thank you for your time, and happy learning!"*
