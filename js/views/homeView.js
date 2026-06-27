/**
 * Home View Module (Upgraded Landing Dashboard)
 * Renders hero search, quick actions, popular topic links, and the AI Agent Visualizer.
 */

import { store } from "../store.js";
import { router } from "../router.js";
import { ui } from "../ui.js";

class HomeView {
  render() {
    const container = document.getElementById("view-home");
    if (!container) return;

    const profile = store.getProfile();

    container.innerHTML = `
      <div class="home-layout animate-fade-in">
        <!-- Hero Section -->
        <section class="home-hero-card card">
          <div class="hero-text-content">
            <span class="hero-pill">⚡ Welcome to Vidyaverse AI</span>
            <h1>Your Personalized Learning Universe</h1>
            <p>Learn topics instantly, generate notes, summarize documents, practice timed quizzes, and build study streaks.</p>
            
            <!-- Universal Study Search Bar -->
            <div class="universal-search-wrap">
              <input type="text" id="universal-search-input" placeholder="What would you like to learn today? (e.g., Electrostatics)" />
              <button class="btn btn-primary" id="btn-universal-search">
                <span>🔍 Search Topic</span>
              </button>
            </div>
            
            <!-- Popular topics shortcuts -->
            <div class="popular-topics-row">
              <span class="popular-label">Try searching:</span>
              <button class="topic-chip" data-topic="electrostatics">⚡ Electrostatics</button>
              <button class="topic-chip" data-topic="newton's laws">📐 Newton's Laws</button>
              <button class="topic-chip" data-topic="organic chemistry">🧪 Organic Chemistry</button>
              <button class="topic-chip" data-topic="accounting">📊 Introduction to Accounting</button>
            </div>
          </div>
        </section>

        <!-- Quick Actions Grid -->
        <section class="quick-actions-grid-section">
          <h3>⚡ Quick Hub Utilities</h3>
          <div class="quick-actions-grid">
            <div class="action-card card" data-target="learn">
              <span class="action-icon">🔍</span>
              <h4>Study Search</h4>
              <p>Explore instant guides and video curators.</p>
            </div>
            <div class="action-card card" data-target="notes">
              <span class="action-icon">📝</span>
              <h4>Notes Generator</h4>
              <p>Build formatted study sheets and text files.</p>
            </div>
            <div class="action-card card" data-target="pdf">
              <span class="action-icon">📄</span>
              <h4>PDF Summarizer</h4>
              <p>Scan documents and extract terms.</p>
            </div>
            <div class="action-card card" data-target="quiz">
              <span class="action-icon">🎯</span>
              <h4>Quiz Arena</h4>
              <p>Test knowledge with Duolingo-style MCQs.</p>
            </div>
            <div class="action-card card" data-target="dashboard">
              <span class="action-icon">📊</span>
              <h4>Habit Dashboard</h4>
              <p>Review streaks, levels, and activity scores.</p>
            </div>
          </div>
        </section>

        <!-- AI Agentic Brain Visualization Section (Hackathon Pitch) -->
        <section class="agent-visualization-section card">
          <div class="viz-header">
            <h3>🤖 Future AI Agentic Brain Architecture</h3>
            <span class="badge badge-accent">Hackathon Blueprint</span>
          </div>
          <p class="viz-desc">How Vidyaverse AI plans to orchestrate specialized client-side agents for autonomous learning generation.</p>
          
          <div class="agent-workflow-canvas">
            <!-- User Prompt Input Node -->
            <div class="workflow-endpoint user-input-node">
              <div class="node-icon">👤</div>
              <div class="node-details">
                <strong>Student Query / File</strong>
                <span>"Summarize Newton's Laws"</span>
              </div>
            </div>

            <div class="workflow-direction-arrow">⬇️</div>

            <!-- Agentic Core Dispatcher -->
            <div class="agent-coordinator-card">
              <div class="coord-header">🧠 Central Agentic Router</div>
              <small>Parses intent & distributes tasks to sub-agents</small>
            </div>

            <div class="workflow-direction-arrow">⬇️</div>

            <!-- Modular Subagents Grid -->
            <div class="subagents-viz-grid">
              <div class="agent-viz-card">
                <span class="agent-viz-icon">🔍</span>
                <h5>Learning Agent</h5>
                <p>Generates detailed topic overviews, formulas, and key concepts.</p>
                <span class="agent-io">OUT: Topic Sheets</span>
              </div>
              <div class="agent-viz-card">
                <span class="agent-viz-icon">📝</span>
                <h5>Notes Agent</h5>
                <p>Generates formatted revision sheets (Quick, Detailed, Exam notes).</p>
                <span class="agent-io">OUT: .txt / Markdown</span>
              </div>
              <div class="agent-viz-card">
                <span class="agent-viz-icon">🎯</span>
                <h5>Quiz Agent</h5>
                <p>Builds timed MCQ sets, evaluates responses, and provides explanations.</p>
                <span class="agent-io">OUT: Gamified score</span>
              </div>
              <div class="agent-viz-card">
                <span class="agent-viz-icon">📄</span>
                <h5>PDF Agent</h5>
                <p>Extracts texts from uploaded documents and builds study summaries.</p>
                <span class="agent-io">OUT: Term Glossary</span>
              </div>
              <div class="agent-viz-card">
                <span class="agent-viz-icon">🎥</span>
                <h5>Recommendation Agent</h5>
                <p>Curates YouTube tutorials and study websites based on topic analysis.</p>
                <span class="agent-io">OUT: YouTube feed</span>
              </div>
              <div class="agent-viz-card">
                <span class="agent-viz-icon">📊</span>
                <h5>Progress Agent</h5>
                <p>Tracks active study patterns, streaks, and updates gamification badges.</p>
                <span class="agent-io">OUT: localStorage Metrics</span>
              </div>
            </div>

            <div class="workflow-direction-arrow">⬇️</div>

            <!-- Unified UI Output Node -->
            <div class="workflow-endpoint user-output-node">
              <div class="node-icon">✨</div>
              <div class="node-details">
                <strong>Personalized Study Space</strong>
                <span>Formatted text, interactive cards & PDF sheets</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const searchInput = container.querySelector("#universal-search-input");
    const searchBtn = container.querySelector("#btn-universal-search");

    const executeSearch = () => {
      const q = searchInput.value.trim();
      if (q) {
        // Route to learn page with query parameter
        router.navigate(`learn?query=${encodeURIComponent(q)}`);
      } else {
        ui.showToast("Please enter a study topic", "warning");
      }
    };

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", executeSearch);
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          executeSearch();
        }
      });
    }

    // Popular topic chips clicks
    container.querySelectorAll(".topic-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const topic = chip.getAttribute("data-topic");
        router.navigate(`learn?query=${encodeURIComponent(topic)}`);
      });
    });

    // Quick action cards clicks
    container.querySelectorAll(".action-card").forEach(card => {
      card.addEventListener("click", () => {
        const target = card.getAttribute("data-target");
        router.navigate(target);
      });
    });
  }
}

export const homeView = new HomeView();
