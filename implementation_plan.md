# Vidyaverse AI — Implementation Plan

---

## 1. Problem Statement

Indian students preparing for JEE, NEET, CUET, and Board exams face:
- 📚 Massive cognitive load from unstructured textbook content
- 💸 Expensive edtech subscription paywalls
- 🕵️ Privacy violations from data-harvesting platforms
- 😴 Burnout from passive reading without gamified reinforcement loops

**Vidyaverse AI** solves all four problems with a free, offline-first, browser-based study workspace powered by client-side AI agents.

---

## 2. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Browser["🌐 Browser — Client-Side SPA"]
        direction TB
        User(["👤 Student User"]) --> Shell

        subgraph Shell["App Shell — index.html + script.js"]
            Sidebar["📌 Left Sidebar Nav\n260px Fixed Desktop\nSlide-out Drawer Mobile"]
            Router["🔀 Hash Router\njs/router.js"]
            Toast["🔔 Toast Alerts\njs/ui.js"]
        end

        Sidebar -->|Hash change| Router

        subgraph Agents["🤖 Client-Side Agent Layer  — js/views/"]
            direction LR
            A1["🔍 Learning Agent\nlearnView.js"]
            A2["📝 Notes Agent\nnotesView.js"]
            A3["📄 PDF Agent\npdfView.js"]
            A4["🎯 Quiz Agent\nquizView.js"]
            A5["⏱ Focus Agent\nfocusTimerView.js"]
            A6["🕹️ Arcade Agent\narcadeView.js"]
            A7["📊 Dashboard Agent\ndashboardView.js"]
            A8["⚙️ Settings Agent\nsettingsView.js"]
        end

        Router --> Agents

        subgraph Store["💾 State Store — js/store.js"]
            XP["XP & Level"]
            Streak["Daily Streak"]
            Badges["Achievements"]
            Metrics["Study Metrics"]
        end

        Agents -->|Write XP / update state| Store
        Store <-->|Persist & restore| LocalStorage[("🗄️ localStorage\nSecurity Sandbox")]
        Store -->|Trigger re-renders| Toast
    end

    subgraph MCP["🔌 MCP Server — mcp/server.ts"]
        Tools["Tool Registry\nget_exam_curriculum\nquery_chapter_details"]
        Stdio["Stdio Transport\nstdin / stdout"]
        DB[("📂 data/*.json\nCurriculum Database")]
    end

    DB -->|Read syllabus| Tools
    Stdio <-->|JSON-RPC| Tools

    subgraph External["🤖 External LLM Agents"]
        LLM["Claude Desktop\nCursor AI\nLocal Ollama"]
    end

    LLM <-->|Stdio queries| Stdio
```

---

## 3. Module Architecture — File-Level Flowchart

```mermaid
flowchart LR
    subgraph Entry["Entry Point"]
        HTML["index.html\nSPA Shell"] --> Script["script.js\nApp Coordinator"]
    end

    subgraph Core["Core Engine"]
        Script --> Router["router.js\nHash Routing"]
        Script --> UIManager["ui.js\nTheme · Toasts · Drawer"]
        Script --> GameEngine["gamification.js\nXP · Levels · Streaks"]
        Script --> StateStore["store.js\nState + localStorage"]
    end

    subgraph ViewLayer["Agent View Layer"]
        Router -->|#home| HomeV["homeView.js"]
        Router -->|#learn| LearnV["learnView.js"]
        Router -->|#notes| NotesV["notesView.js"]
        Router -->|#pdf| PDFV["pdfView.js"]
        Router -->|#quiz| QuizV["quizView.js"]
        Router -->|#focus| FocusV["focusTimerView.js"]
        Router -->|#arcade| ArcadeV["arcadeView.js"]
        Router -->|#dashboard| DashV["dashboardView.js"]
        Router -->|#settings| SettingsV["settingsView.js"]
    end

    subgraph DataLayer["Data Layer"]
        StateStore <-->|Read/Write| LS[("localStorage")]
        LearnV --> MockDB["mockSearch.js\nStudy Dictionary"]
        ArcadeV --> GameData["In-memory\nGame Datasets"]
        MockDB & GameData --> CurrDB[("data/*.json\nCurriculum JSONs")]
    end

    subgraph MCPLayer["MCP Gateway"]
        CurrDB --> MCPSrv["mcp/server.ts\nMCP Server"]
        MCPSrv <-->|Stdio| ExtLLM["External LLMs"]
    end
```

---

## 4. User Interaction Flow

```mermaid
flowchart TD
    Start(["Student opens app"]) --> Home["Home Page\nHero Search Bar"]
    Home -->|Types topic| Search["mockSearch.js resolves query"]
    Search --> Guide["10-Part Study Guide renders:\n1 Overview · 2 Concepts · 3 Definitions\n4 Formulas · 5 Explanation · 6 Exam Tips\n7 Mistakes · 8 Revision · 9 Q&A · 10 Videos"]
    Guide -->|+20 XP| Store1[("store.js")]

    Home -->|Click Notes| Notes["Notes Generator\nQuick · Detailed · Revision · Exam"]
    Notes -->|Download .txt| File["Exported Notes File"]
    Notes -->|+50 XP| Store1

    Home -->|Click PDF| PDF["PDF Drag & Drop\nSimulated scanner loader"]
    PDF -->|Extracts summary + glossary| PDFOut["Abstract Cards + Key Terms"]
    PDFOut -->|+75 XP| Store1

    Home -->|Click Quiz| Quiz["Timed MCQ Arena\n30s countdown per question"]
    Quiz -->|Correct answer| Explain["Detailed Explanation Panel"]
    Explain -->|+20 XP per correct| Store1
    Quiz -->|Session complete| QuizEnd["Score + Leaderboard"]
    QuizEnd -->|+150 XP| Store1

    Home -->|Click Focus| Focus["Pomodoro Timer\n25m · 50m · 15m presets"]
    Focus -->|Timer ends| FocusEnd["Session Complete"]
    FocusEnd -->|+50-200 XP| Store1

    Home -->|Click Arcade| Arcade["13-Game Hub\n10 Offline + 3 AI Games"]
    Arcade -->|Win game| ArcadeWin["XP per game win"]
    ArcadeWin -->|Store win| Store1

    Store1 -->|Level threshold crossed| LevelUp["🎉 Level Up! Confetti Modal"]
    Store1 -->|Badge condition met| Badge["🏅 Achievement Unlocked Toast"]
    Store1 -->|Streak updated| Streak["🔥 Streak Counter in Sidebar"]
```

---

## 5. Gamification State Machine

```mermaid
stateDiagram-v2
    [*] --> NewUser : First visit

    NewUser --> ActiveLearner : Welcome Badge Unlocked\n+0 XP · Level 1

    ActiveLearner --> SearchedTopic : Searches a topic\n+20 XP
    ActiveLearner --> GeneratedNotes : Generates notes\n+50 XP
    ActiveLearner --> SummarisedPDF : Uploads PDF\n+75 XP
    ActiveLearner --> CompletedQuiz : Finishes Quiz\n+150 XP
    ActiveLearner --> CompletedFocus : Finished Pomodoro\n+50-200 XP
    ActiveLearner --> WonArcadeGame : Won Arcade game\n+30-150 XP

    SearchedTopic --> CheckLevel : Accumulates XP
    GeneratedNotes --> CheckLevel
    SummarisedPDF --> CheckLevel
    CompletedQuiz --> CheckLevel
    CompletedFocus --> CheckLevel
    WonArcadeGame --> CheckLevel

    CheckLevel --> LevelUp : XP ÷ 1000 > current Level
    CheckLevel --> ActiveLearner : Below threshold

    LevelUp --> ShowCelebration : Confetti + Modal
    ShowCelebration --> ActiveLearner : Continue learning

    ActiveLearner --> DailyGoalMet : 1 search + 1 quiz done\n+250 XP bonus
    DailyGoalMet --> StreakIncrease : Streak +1
    StreakIncrease --> ActiveLearner
```

---

## 6. MCP Server Architecture

```mermaid
flowchart LR
    subgraph Server["mcp/server.ts"]
        Init["Server.init()\nvidyaverse-ai-curriculum-server"]
        Tools["Tool Registry"]
        T1["get_exam_curriculum\nParams: examId"]
        T2["query_chapter_details\nParams: examId · subjectId · chapterId"]
        Transport["StdioServerTransport\nstdin ↔ stdout"]
        DB[("data/\njee.json · neet.json\nclass10.json · class12.json\ncuet.json · cafoundation.json")]
    end

    Init --> Tools
    Tools --> T1
    Tools --> T2
    T1 & T2 -->|fs.readFileSync| DB
    Server <-->|JSON-RPC over Stdio| Transport

    subgraph Clients["Supported LLM Clients"]
        C1["Claude Desktop"]
        C2["Cursor AI"]
        C3["Local Ollama"]
        C4["VS Code Copilot"]
    end

    Transport <--> Clients
```

---

## 7. Kaggle Evaluation Criteria Mapping

| Criterion | Where Implemented | Score Weight |
|---|---|---|
| **Agent / Multi-agent System (ADK)** | `js/views/*.js` — 9 independent client-side agents coordinated by `script.js` | Code |
| **MCP Server** | `mcp/server.ts` with Stdio transport, `get_exam_curriculum` & `query_chapter_details` tools | Code |
| **Security Features** | `js/store.js` — zero external calls, localStorage sandbox, export/import JSON backup | Code + Video |
| **Deployability** | `vercel.json` — deployed as static SPA on Vercel, zero build steps needed | Video |
| **Antigravity** | Built with Antigravity AI tool (this session) | Video |
| **Agent Skills** | `js/gamification.js` — XP accrual, streak, badges as persistent agent memory | Code + Video |

---

## 8. File Structure Summary

```
vidyaverse-ai/
├── index.html              ← SPA Shell (sidebar + view panels)
├── script.js               ← App coordinator (routing + sidebar sync)
├── vercel.json             ← Vercel static deployment config
├── README.md               ← Full product documentation
│
├── css/
│   └── style.css           ← Design tokens, dark/light mode, charts
│
├── data/                   ← Curated curriculum JSON databases
│   ├── class10.json
│   ├── class12.json
│   ├── jee.json
│   ├── neet.json
│   ├── cuet.json
│   └── cafoundation.json
│
├── mcp/
│   └── server.ts           ← MCP server (Stdio transport + tool registry)
│
└── js/
    ├── store.js            ← State + localStorage sandbox
    ├── gamification.js     ← XP, levels, streaks, badges
    ├── router.js           ← Hash-based SPA router
    ├── ui.js               ← Theme, toasts, confetti, mobile drawer
    ├── mockSearch.js       ← Study search dictionary + 10-part resolver
    └── views/
        ├── homeView.js         ← Search console + AI agent visualizer
        ├── learnView.js        ← 10-part study guide renderer
        ├── notesView.js        ← Notes builder + .txt exporter
        ├── pdfView.js          ← PDF scanner + summary output
        ├── quizView.js         ← Timed MCQ arena + leaderboard
        ├── focusTimerView.js   ← Pomodoro / Deep Work / Sprint timer
        ├── arcadeView.js       ← 13-game educational hub
        ├── dashboardView.js    ← Radial XP ring + weekly chart
        └── settingsView.js     ← Profile + export/import + badges
```
