/**
 * Learn View Module (Study Portal - Upgraded to v2.0)
 * Resolves search queries and renders the upgraded interactive study workspace,
 * including flashcards, assessments, learning paths, and video recommendations.
 */

import { store } from "../store.js";
import { router } from "../router.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";
import { mockSearch } from "../mockSearch.js";

class LearnView {
  constructor() {
    this.activeFlashcardIndex = 0;
    this.isFlashcardFlipped = false;

    this.activeQuizIndex = 0;
    this.quizSelectedOption = null;
    this.quizAnswered = false;
    this.quizScore = 0;
    this.isQuizComplete = false;
  }

  async render(params) {
    const container = document.getElementById("view-learn");
    if (!container) return;

    this.ensureStyles();

    const query = params.query || "";

    if (query) {
      await this.renderStudyGuide(container, query);
    } else {
      this.renderPlaceholderState(container);
    }
  }

  ensureStyles() {
    if (document.getElementById("learn-upgraded-styles")) return;

    const style = document.createElement("style");
    style.id = "learn-upgraded-styles";
    style.innerHTML = `
      .search-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }
      .search-info-card h4 {
        margin-bottom: 12px;
        color: var(--text-primary);
        font-family: var(--font-display);
      }
      .recent-searches-list, .trending-topics-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .topic-pill-btn {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        padding: 6px 12px;
        border-radius: var(--radius-pill);
        font-size: 0.85rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
        text-align: left;
      }
      .topic-pill-btn:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
        border-color: var(--border-color-hover);
      }
      .recent-search-item {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        padding: 6px 12px;
        border-radius: var(--radius-pill);
        font-size: 0.85rem;
        color: var(--color-primary);
        cursor: pointer;
        transition: all var(--transition-fast);
        text-align: left;
      }
      .recent-search-item:hover {
        background: rgba(59, 130, 246, 0.2);
      }
      .no-recent-searches {
        color: var(--text-muted);
        font-size: 0.85rem;
        font-style: italic;
      }
      
      /* Flashcard styling */
      .flashcard-section-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin: 20px 0;
        perspective: 1000px;
        width: 100%;
      }
      .flashcard-wrapper {
        width: 100%;
        max-width: 480px;
        height: 240px;
        cursor: pointer;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }
      .flashcard-wrapper.flipped {
        transform: rotateY(180deg);
      }
      .flashcard-face {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 24px;
        text-align: center;
        box-shadow: var(--card-shadow);
      }
      .flashcard-front {
        background-color: var(--surface-color);
        color: var(--text-primary);
      }
      .flashcard-back {
        background-color: rgba(59, 130, 246, 0.08);
        border-color: rgba(59, 130, 246, 0.25);
        color: var(--text-primary);
        transform: rotateY(180deg);
      }
      .flashcard-controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .flashcard-btn {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        padding: 8px 16px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .flashcard-btn:hover:not(:disabled) {
        background: var(--surface-hover);
      }
      .flashcard-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .flashcard-indicator {
        font-size: 0.9rem;
        color: var(--text-muted);
      }

      /* Mini Quiz styling */
      .mini-quiz-wrapper {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 24px;
        margin: 20px 0;
      }
      .mini-quiz-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 8px;
      }
      .mini-quiz-question {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      .mini-quiz-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
      }
      .mini-quiz-option-btn {
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        padding: 12px 16px;
        border-radius: var(--radius-sm);
        text-align: left;
        cursor: pointer;
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      .mini-quiz-option-btn:hover:not(:disabled) {
        background: var(--surface-hover);
        border-color: var(--border-color-hover);
      }
      .mini-quiz-option-btn.selected {
        background: var(--surface-hover);
        border-color: var(--color-primary);
      }
      .mini-quiz-option-btn.correct {
        background-color: rgba(16, 185, 129, 0.15) !important;
        border-color: var(--color-success) !important;
        color: var(--color-success) !important;
        font-weight: 600;
      }
      .mini-quiz-option-btn.incorrect {
        background-color: rgba(239, 68, 68, 0.15) !important;
        border-color: var(--color-danger) !important;
        color: var(--color-danger) !important;
      }
      .mini-quiz-explanation {
        background: rgba(59, 130, 246, 0.05);
        border-left: 4px solid var(--color-primary);
        padding: 12px 16px;
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        margin-bottom: 16px;
      }
      .mini-quiz-explanation h5 {
        margin-bottom: 4px;
        color: var(--color-primary);
      }
      .mini-quiz-footer {
        display: flex;
        justify-content: flex-end;
      }

      /* Learning Path styling */
      .learning-path-timeline {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        overflow-x: auto;
        padding: 20px 10px;
        gap: 10px;
        margin: 16px 0;
        scroll-behavior: smooth;
      }
      .learning-path-step {
        flex: 0 0 160px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        padding: 12px;
        border-radius: var(--radius-md);
        text-align: center;
        position: relative;
        transition: all var(--transition-fast);
      }
      .learning-path-step.active {
        background: rgba(37, 99, 235, 0.08);
        border-color: var(--color-primary);
        font-weight: 600;
        box-shadow: 0 0 12px rgba(37, 99, 235, 0.15);
      }
      .learning-path-step.active .step-num {
        background-color: var(--color-primary);
        color: #fff;
      }
      .step-num {
        width: 24px;
        height: 24px;
        background-color: var(--surface-hover);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 8px auto;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      .step-name {
        font-size: 0.85rem;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .learning-path-arrow {
        color: var(--text-muted);
        font-weight: bold;
        flex: 0 0 20px;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  renderPlaceholderState(container) {
    const searchedTopics = store.getProgress().searchedTopics || [];
    const recentUnique = [...new Set(searchedTopics)].reverse().slice(0, 5);

    container.innerHTML = `
      <div class="learn-placeholder-layout animate-fade-in">
        <header class="learn-view-header card">
          <h2>🔍 Universal Study Search</h2>
          <p>Search any academic topic to generate study sheets, concepts, definitions, and videos instantly.</p>
          <div class="universal-search-wrap" style="position: relative;">
            <input type="text" id="learn-search-input" placeholder="Enter topic (e.g. Coulomb's Law)" autocomplete="off" />
            <button class="btn btn-primary" id="btn-learn-search">Search Topic</button>
          </div>
        </header>

        <div class="search-info-grid">
          <!-- Recent Searches -->
          <div class="card search-info-card">
            <h4>🕒 Recent Searches</h4>
            <div class="recent-searches-list" id="recent-searches-list">
              ${recentUnique.length > 0
        ? recentUnique.map(t => `<button class="recent-search-item" data-topic="${t}">${t}</button>`).join("")
        : `<span class="no-recent-searches">No recent searches yet.</span>`
      }
            </div>
          </div>
          
          <!-- Trending Topics -->
          <div class="card search-info-card">
            <h4>🔥 Trending Topics</h4>
            <div class="trending-topics-list" id="trending-topics-list">
              <button class="topic-pill-btn" data-topic="Coulomb's Law">⚡ Coulomb's Law</button>
              <button class="topic-pill-btn" data-topic="Photosynthesis">🌱 Photosynthesis</button>
              <button class="topic-pill-btn" data-topic="Quadratic Equations">📐 Quadratic Equations</button>
              <button class="topic-pill-btn" data-topic="Journal Entries">📊 Journal Entries</button>
              <button class="topic-pill-btn" data-topic="Simple and Compound Interest">💰 Simple Interest & CI</button>
            </div>
          </div>

          <!-- Students Also Studied -->
          <div class="card search-info-card">
            <h4>📚 Students Also Studied</h4>
            <div class="trending-topics-list" id="studied-topics-list">
              <button class="topic-pill-btn" data-topic="Newton's Laws of Motion">🏃 Newton's Laws</button>
              <button class="topic-pill-btn" data-topic="Chemical Bonding">🧪 Chemical Bonding</button>
              <button class="topic-pill-btn" data-topic="DNA Replication">🧬 DNA Replication</button>
              <button class="topic-pill-btn" data-topic="Ohm's Law">⚡ Ohm's Law</button>
              <button class="topic-pill-btn" data-topic="Logical Venn Diagrams">📊 Venn Diagrams</button>
            </div>
          </div>
        </div>

        <section class="syllabus-browser-card card">
          <h3>📂 Browse Syllabus Databases</h3>
          <p>Prefer structured curriculum chapters? Click a category to open the subject guides:</p>
          <div class="syllabus-grid">
            <button class="syllabus-chip" data-exam="jee">📐 JEE Preparation</button>
            <button class="syllabus-chip" data-exam="neet">🧬 NEET Preparation</button>
            <button class="syllabus-chip" data-exam="class12">🧪 Class 12 Boards</button>
            <button class="syllabus-chip" data-exam="class10">📖 Class 10 Boards</button>
            <button class="syllabus-chip" data-exam="cuet">🏛️ CUET Entrance</button>
            <button class="syllabus-chip" data-exam="cafoundation">📊 CA Foundation</button>
          </div>
        </section>
      </div>
    `;

    this.bindPlaceholderEvents(container);
  }

  bindPlaceholderEvents(container) {
    const searchInput = container.querySelector("#learn-search-input");
    const searchBtn = container.querySelector("#btn-learn-search");

    const executeSearch = () => {
      const q = searchInput.value.trim();
      if (q) {
        router.navigate(`learn?query=${encodeURIComponent(q)}`);
      } else {
        ui.showToast("Please enter a topic", "warning");
      }
    };

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", executeSearch);
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") executeSearch();
      });

      // Suggestions binding
      let suggestionsBox = container.querySelector("#learn-search-suggestions");
      if (!suggestionsBox) {
        suggestionsBox = document.createElement("div");
        suggestionsBox.id = "learn-search-suggestions";
        suggestionsBox.className = "search-suggestions-dropdown hidden";
        searchInput.parentNode.appendChild(suggestionsBox);
      }

      searchInput.addEventListener("input", async () => {
        const q = searchInput.value.trim();
        if (q.length < 2) {
          suggestionsBox.innerHTML = "";
          suggestionsBox.classList.add("hidden");
          return;
        }

        const suggestions = await mockSearch.getSuggestions(q);
        if (suggestions.length > 0) {
          suggestionsBox.innerHTML = suggestions.map(s => `
            <div class="suggestion-item" data-val="${s}">
              <span class="suggestion-icon">🔍</span>
              <span class="suggestion-text">${s}</span>
            </div>
          `).join("");
          suggestionsBox.classList.remove("hidden");

          suggestionsBox.querySelectorAll(".suggestion-item").forEach(item => {
            item.addEventListener("click", () => {
              const val = item.getAttribute("data-val");
              searchInput.value = val;
              suggestionsBox.classList.add("hidden");
              router.navigate(`learn?query=${encodeURIComponent(val)}`);
            });
          });
        } else {
          suggestionsBox.innerHTML = "";
          suggestionsBox.classList.add("hidden");
        }
      });

      // Close suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (e.target !== searchInput && e.target !== suggestionsBox && !suggestionsBox.contains(e.target)) {
          suggestionsBox.classList.add("hidden");
        }
      });
    }

    // Popular clicks
    container.querySelectorAll(".recent-search-item, .topic-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const topic = btn.getAttribute("data-topic");
        router.navigate(`learn?query=${encodeURIComponent(topic)}`);
      });
    });

    container.querySelectorAll(".syllabus-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const exam = chip.getAttribute("data-exam");
        router.navigate(`learn?query=${encodeURIComponent(exam.toUpperCase())}`);
      });
    });
  }

  async renderStudyGuide(container, query) {
    const topicData = await mockSearch.resolve(query);

    // Track study event in store
    store.incrementTopicsStudied(topicData.topic);

    // Gamification reward (+100 XP for study search)
    const wasUnlocked = gamification.unlockBadge("search_first");
    gamification.incrementDailyGoalProgress("lesson");
    if (wasUnlocked) {
      gamification.addXP(100);
    } else {
      gamification.addXP(20); // Small standard revision reward
    }

    // Reset components state variables for this new topic
    this.resetTopicStates();

    container.innerHTML = `
      <div class="study-guide-layout animate-fade-in">
        <!-- Sticky Sub-header search bar -->
        <header class="study-guide-sub-header">
          <button class="btn btn-outline btn-sm" id="btn-back-to-learn-home">← Back</button>
          <div class="guide-search-wrapper" style="position: relative; flex: 1; max-width: 480px;">
            <input type="text" id="guide-re-search-input" value="${topicData.topic}" autocomplete="off" />
            <button class="btn btn-primary btn-sm" id="btn-guide-re-search">Search</button>
          </div>
        </header>

        <!-- Main Guide Card -->
        <div class="card guide-container">
          <div class="guide-title-row">
            <span class="guide-topic-pill">🚀 Study Guide [${topicData.difficulty || 'Medium'}]</span>
            <h2>${topicData.topic}</h2>
            <div class="topic-tags-row" style="margin-top: 6px;">
              ${(topicData.tags || []).map(t => `<span class="badge badge-accent" style="margin-right: 6px;">${t}</span>`).join("")}
            </div>
          </div>

          <!-- 1. Topic Overview & Detailed Explanation -->
          <section class="guide-section">
            <div class="section-badge">1. Topic Overview</div>
            <p class="overview-body">${topicData.overview}</p>
            <div class="explanation-body-text" style="margin-top: 16px;">
              <p>${topicData.explanation}</p>
            </div>
          </section>

          <!-- 2. Key Concepts -->
          <section class="guide-section">
            <div class="section-badge">2. Key Concepts</div>
            <div class="concepts-grid">
              ${(topicData.concepts || []).map(c => `
                <div class="concept-subcard">
                  <h5>💡 ${c.title}</h5>
                  <p>${c.desc}</p>
                </div>
              `).join("")}
            </div>
          </section>

          <!-- 3. Important Definitions -->
          <section class="guide-section">
            <div class="section-badge">3. Important Definitions</div>
            <div class="definitions-list">
              ${(topicData.definitions || []).map(d => `
                <div class="definition-row">
                  <strong class="def-term">${d.term}</strong>
                  <span class="def-desc">${d.def}</span>
                </div>
              `).join("")}
            </div>
          </section>

          <!-- 4. Formula Section -->
          <section class="guide-section">
            <div class="section-badge">4. Formula Section</div>
            <div class="formulas-grid">
              ${(topicData.formulas || []).map(f => `
                <div class="formula-card card">
                  <div class="formula-title">${f.name}</div>
                  <code class="formula-equation" style="color:var(--color-primary); font-size:1.1rem; font-weight:700;">${f.eq}</code>
                  <div class="formula-desc" style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">${f.desc}</div>
                </div>
              `).join("")}
            </div>
          </section>

          <!-- 5. Flashcards -->
          <section class="guide-section">
            <div class="section-badge">5. Interactive Flashcards</div>
            <div id="flashcards-widget-container">
              ${this.renderFlashcardWidget(topicData)}
            </div>
          </section>

          <!-- 6. Mini-Assessment Quiz -->
          <section class="guide-section">
            <div class="section-badge">6. Concept Assessment Quiz</div>
            <div id="quiz-widget-container">
              ${this.renderQuizWidget(topicData)}
            </div>
          </section>

          <!-- 7. Learning Path -->
          <section class="guide-section">
            <div class="section-badge">7. Syllabus Learning Path</div>
            ${this.renderLearningPathWidget(topicData)}
          </section>

          <!-- 8. Knowledge Graph (Related Topics) -->
          <section class="guide-section">
            <div class="section-badge">8. Related Chapters</div>
            ${this.renderRelatedTopicsWidget(topicData)}
          </section>

          <!-- 9. Common Mistakes & Exam Tips -->
          <section class="guide-section">
            <div class="section-badge">9. Common Mistakes & Exam Tips</div>
            <div class="mistakes-grid">
              ${(topicData.mistakes || []).map(m => `
                <div class="mistake-card">
                  <h5>❌ ${m.title}</h5>
                  <p>${m.desc}</p>
                </div>
              `).join("")}
            </div>
            
            <div class="exam-notes-text-box" style="margin-top: 16px;">
              <h5 style="color: var(--color-warning); font-weight: 600; margin-bottom: 6px;">💡 Important Exam Tips</h5>
              <p>${topicData.examNotes || 'Be neat, state units clearly, and draw diagrams wherever possible.'}</p>
            </div>
          </section>

          <!-- 10. Quick Revision Bullet Points -->
          <section class="guide-section card revision-list-card">
            <div class="section-badge">10. Quick Revision Notes</div>
            <ul class="revision-bullet-list">
              ${(topicData.revision || []).map(r => `<li>🎯 ${r}</li>`).join("")}
            </ul>
          </section>

          <!-- 11. Suggested Videos -->
          <section class="guide-section">
            <div class="section-badge">11. Suggested Video Lectures</div>
            <div class="videos-grid">
              ${(topicData.videos || []).map(v => {
      const ytThumb = `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`;
      return `
                  <div class="card video-card">
                    <div class="video-thumbnail-wrapper">
                      <img class="video-thumb" src="${ytThumb}" alt="${v.title}" />
                      <span class="video-duration-tag">${v.duration}</span>
                    </div>
                    <div class="video-info">
                      <div class="video-channel-tag">${v.channel}</div>
                      <h4 class="video-title">${v.title}</h4>
                      <a class="btn btn-primary btn-sm btn-block" href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" rel="noopener noreferrer">
                        Watch on YouTube ↗
                      </a>
                    </div>
                  </div>
                `;
    }).join("")}
            </div>
          </section>
        </div>
      </div>
    `;

    this.bindGuideEvents(container, topicData);
  }

  resetTopicStates() {
    this.activeFlashcardIndex = 0;
    this.isFlashcardFlipped = false;

    this.activeQuizIndex = 0;
    this.quizSelectedOption = null;
    this.quizAnswered = false;
    this.quizScore = 0;
    this.isQuizComplete = false;
  }

  renderFlashcardWidget(topicData) {
    const flashcards = topicData.flashcards || [];
    if (flashcards.length === 0) return `<p class="no-recent-searches">No flashcards available for this topic.</p>`;

    const card = flashcards[this.activeFlashcardIndex];
    return `
      <div class="flashcard-section-container">
        <div class="flashcard-wrapper ${this.isFlashcardFlipped ? "flipped" : ""}" id="flashcard-card">
          <div class="flashcard-face flashcard-front">
            <span style="font-size: 2rem; margin-bottom: 12px;">❓</span>
            <h5>Question</h5>
            <p style="font-size: 1.1rem; font-weight: 500; margin-top: 8px;">${card.front}</p>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: auto;">Click to Flip</span>
          </div>
          <div class="flashcard-face flashcard-back">
            <span style="font-size: 2rem; margin-bottom: 12px;">✨</span>
            <h5>Answer</h5>
            <p style="font-size: 1.1rem; font-weight: 500; margin-top: 8px;">${card.back}</p>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: auto;">Click to Flip</span>
          </div>
        </div>
        <div class="flashcard-controls">
          <button class="flashcard-btn" id="btn-flashcard-prev" ${this.activeFlashcardIndex === 0 ? "disabled" : ""}>⬅️ Previous</button>
          <span class="flashcard-indicator">Card ${this.activeFlashcardIndex + 1} of ${flashcards.length}</span>
          <button class="flashcard-btn" id="btn-flashcard-next" ${this.activeFlashcardIndex === flashcards.length - 1 ? "disabled" : ""}>Next ➡️</button>
        </div>
      </div>
    `;
  }

  bindFlashcardEvents(container, topicData) {
    const cardEl = container.querySelector("#flashcard-card");
    const prevBtn = container.querySelector("#btn-flashcard-prev");
    const nextBtn = container.querySelector("#btn-flashcard-next");
    const flashcards = topicData.flashcards || [];

    if (cardEl) {
      cardEl.addEventListener("click", () => {
        this.isFlashcardFlipped = !this.isFlashcardFlipped;
        cardEl.classList.toggle("flipped", this.isFlashcardFlipped);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.activeFlashcardIndex > 0) {
          this.activeFlashcardIndex--;
          this.isFlashcardFlipped = false;
          this.refreshFlashcards(container, topicData);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.activeFlashcardIndex < flashcards.length - 1) {
          this.activeFlashcardIndex++;
          this.isFlashcardFlipped = false;
          this.refreshFlashcards(container, topicData);
        }
      });
    }
  }

  refreshFlashcards(container, topicData) {
    const section = container.querySelector(".flashcard-section-container");
    if (section) {
      const parent = section.parentNode;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = this.renderFlashcardWidget(topicData);
      parent.replaceChild(tempDiv.firstElementChild, section);
      this.bindFlashcardEvents(container, topicData);
    }
  }

  renderQuizWidget(topicData) {
    const questions = topicData.questions || [];
    if (questions.length === 0) return `<p class="no-recent-searches">No quiz questions available for this topic.</p>`;

    if (this.isQuizComplete) {
      return `
        <div class="mini-quiz-wrapper animate-fade-in" style="text-align: center;">
          <h3>🎉 Assessment Completed!</h3>
          <p style="margin: 12px 0; font-size: 1.1rem;">You scored <strong style="color: var(--color-success);">${this.quizScore} / ${questions.length}</strong> correct responses.</p>
          <div class="result-stat" style="display:inline-block; margin-top:8px;">
            <span class="stat-num" style="font-size:1.5rem; color:var(--color-primary)">+50 XP</span>
            <span class="stat-lbl" style="font-size:0.8rem; color:var(--text-muted)">Practice Bonus Applied</span>
          </div>
          <button class="btn btn-outline btn-block" id="btn-quiz-reset" style="margin-top: 16px;">Retake Assessment</button>
        </div>
      `;
    }

    const q = questions[this.activeQuizIndex];
    return `
      <div class="mini-quiz-wrapper animate-fade-in">
        <div class="mini-quiz-header">
          <strong style="color: var(--color-primary)">🎯 Topic Quiz</strong>
          <span style="font-size: 0.85rem; color: var(--text-muted)">Question ${this.activeQuizIndex + 1} of ${questions.length} (Score: ${this.quizScore})</span>
        </div>
        <div class="mini-quiz-question">
          <strong>Q:</strong> ${q.q}
        </div>
        <div class="mini-quiz-options">
          ${q.options.map((opt, idx) => {
      let cls = "";
      if (this.quizAnswered) {
        if (idx === q.correctAnswerIndex) {
          cls = "correct";
        } else if (idx === this.quizSelectedOption) {
          cls = "incorrect";
        }
      } else if (this.quizSelectedOption === idx) {
        cls = "selected";
      }
      return `
              <button class="mini-quiz-option-btn ${cls}" data-idx="${idx}" ${this.quizAnswered ? "disabled" : ""}>
                <strong style="color: var(--text-muted)">${String.fromCharCode(65 + idx)}</strong>
                <span>${opt}</span>
              </button>
            `;
    }).join("")}
        </div>

        ${this.quizAnswered ? `
          <div class="mini-quiz-explanation animate-fade-in">
            <h5>💡 Explanation</h5>
            <p>${q.explanation || "No additional explanation available."}</p>
          </div>
        ` : ""}

        <div class="mini-quiz-footer">
          <button class="btn btn-primary" id="btn-quiz-submit" ${this.quizSelectedOption === null ? "disabled" : ""}>
            ${this.quizAnswered ? (this.activeQuizIndex === questions.length - 1 ? "Finish Assessment" : "Next Question") : "Lock Answer"}
          </button>
        </div>
      </div>
    `;
  }

  bindQuizEvents(container, topicData) {
    const options = container.querySelectorAll(".mini-quiz-option-btn");
    const submitBtn = container.querySelector("#btn-quiz-submit");
    const resetBtn = container.querySelector("#btn-quiz-reset");
    const questions = topicData.questions || [];

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.activeQuizIndex = 0;
        this.quizSelectedOption = null;
        this.quizAnswered = false;
        this.quizScore = 0;
        this.isQuizComplete = false;
        this.refreshQuiz(container, topicData);
      });
      return;
    }

    options.forEach(btn => {
      btn.addEventListener("click", () => {
        if (this.quizAnswered) return;
        options.forEach(o => o.classList.remove("selected"));
        btn.classList.add("selected");
        this.quizSelectedOption = parseInt(btn.getAttribute("data-idx"));
        if (submitBtn) submitBtn.removeAttribute("disabled");
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (!this.quizAnswered) {
          this.quizAnswered = true;
          const q = questions[this.activeQuizIndex];
          if (this.quizSelectedOption === q.correctAnswerIndex) {
            this.quizScore++;
            gamification.addXP(20);
            ui.showToast("Correct! +20 XP", "success");
          } else {
            ui.showToast("Incorrect answer", "warning");
          }
          this.refreshQuiz(container, topicData);
        } else {
          if (this.activeQuizIndex < questions.length - 1) {
            this.activeQuizIndex++;
            this.quizSelectedOption = null;
            this.quizAnswered = false;
            this.refreshQuiz(container, topicData);
          } else {
            this.isQuizComplete = true;
            gamification.addXP(50); // Completion bonus
            ui.showToast("Assessment complete! +50 XP", "success");
            this.refreshQuiz(container, topicData);
          }
        }
      });
    }
  }

  refreshQuiz(container, topicData) {
    const quizWrapper = container.querySelector(".mini-quiz-wrapper");
    if (quizWrapper) {
      const parent = quizWrapper.parentNode;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = this.renderQuizWidget(topicData);
      parent.replaceChild(tempDiv.firstElementChild, quizWrapper);
      this.bindQuizEvents(container, topicData);
    }
  }

  renderLearningPathWidget(topicData) {
    const path = topicData.learningPath || [];
    if (path.length === 0) return "";

    return `
      <div class="card" style="margin: 20px 0;">
        <h4>🗺️ Learning Path</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Follow this recommended syllabus order to master this unit.</p>
        <div class="learning-path-timeline">
          ${path.map((step, idx) => {
      const isActive = step.toLowerCase() === topicData.topic.toLowerCase() ? "active" : "";
      const elements = [];
      elements.push(`
              <div class="learning-path-step ${isActive}" title="${step}">
                <div class="step-num">${idx + 1}</div>
                <div class="step-name">${step}</div>
              </div>
            `);
      if (idx < path.length - 1) {
        elements.push(`<div class="learning-path-arrow">➔</div>`);
      }
      return elements.join("");
    }).join("")}
        </div>
      </div>
    `;
  }

  renderRelatedTopicsWidget(topicData) {
    const related = topicData.related || [];
    if (related.length === 0) return "";

    return `
      <div class="card" style="margin: 20px 0;">
        <h4>🕸️ Knowledge Graph: Related Chapters</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Students who studied ${topicData.topic} also studied these related chapters:</p>
        <div class="recent-searches-list" id="related-topics-list">
          ${related.map(r => {
      const label = r.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `
              <button class="recent-search-item" data-related-id="${r}">
                🔗 ${label}
              </button>
            `;
    }).join("")}
        </div>
      </div>
    `;
  }

  bindGuideEvents(container, topicData) {
    container.querySelector("#btn-back-to-learn-home").addEventListener("click", () => {
      router.navigate("learn");
    });

    const searchInput = container.querySelector("#guide-re-search-input");
    const searchBtn = container.querySelector("#btn-guide-re-search");

    const executeReSearch = () => {
      const q = searchInput.value.trim();
      if (q) {
        router.navigate(`learn?query=${encodeURIComponent(q)}`);
      }
    };

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", executeReSearch);
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") executeReSearch();
      });

      // Suggestions binding
      let suggestionsBox = container.querySelector("#guide-re-search-suggestions");
      if (!suggestionsBox) {
        suggestionsBox = document.createElement("div");
        suggestionsBox.id = "guide-re-search-suggestions";
        suggestionsBox.className = "search-suggestions-dropdown hidden";
        searchInput.parentNode.appendChild(suggestionsBox);
      }

      searchInput.addEventListener("input", async () => {
        const q = searchInput.value.trim();
        if (q.length < 2) {
          suggestionsBox.innerHTML = "";
          suggestionsBox.classList.add("hidden");
          return;
        }

        const suggestions = await mockSearch.getSuggestions(q);
        if (suggestions.length > 0) {
          suggestionsBox.innerHTML = suggestions.map(s => `
            <div class="suggestion-item" data-val="${s}">
              <span class="suggestion-icon">🔍</span>
              <span class="suggestion-text">${s}</span>
            </div>
          `).join("");
          suggestionsBox.classList.remove("hidden");

          suggestionsBox.querySelectorAll(".suggestion-item").forEach(item => {
            item.addEventListener("click", () => {
              const val = item.getAttribute("data-val");
              searchInput.value = val;
              suggestionsBox.classList.add("hidden");
              router.navigate(`learn?query=${encodeURIComponent(val)}`);
            });
          });
        } else {
          suggestionsBox.innerHTML = "";
          suggestionsBox.classList.add("hidden");
        }
      });

      // Close suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (e.target !== searchInput && e.target !== suggestionsBox && !suggestionsBox.contains(e.target)) {
          suggestionsBox.classList.add("hidden");
        }
      });
    }

    // Related clicks
    container.querySelectorAll("#related-topics-list button").forEach(btn => {
      btn.addEventListener("click", () => {
        const relatedQuery = btn.getAttribute("data-related-id");
        router.navigate(`learn?query=${encodeURIComponent(relatedQuery)}`);
      });
    });

    // Bind flashcard events
    this.bindFlashcardEvents(container, topicData);

    // Bind mini-quiz events
    this.bindQuizEvents(container, topicData);
  }
}

export const learnView = new LearnView();
