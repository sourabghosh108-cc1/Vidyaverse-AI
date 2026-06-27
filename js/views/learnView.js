/**
 * Learn View Module (Study Portal)
 * Resolves search queries and renders the 10-part study guide interface,
 * including YouTube video recommendations.
 */

import { store } from "../store.js";
import { router } from "../router.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";
import { mockSearch } from "../mockSearch.js";

class LearnView {
  render(params) {
    const container = document.getElementById("view-learn");
    if (!container) return;

    const query = params.query || "";

    if (query) {
      this.renderStudyGuide(container, query);
    } else {
      this.renderPlaceholderState(container);
    }
  }

  renderPlaceholderState(container) {
    container.innerHTML = `
      <div class="learn-placeholder-layout animate-fade-in">
        <header class="learn-view-header card">
          <h2>🔍 Universal Study Search</h2>
          <p>Search any academic topic to generate study sheets, concepts, definitions, and videos instantly.</p>
          <div class="universal-search-wrap">
            <input type="text" id="learn-search-input" placeholder="Enter topic (e.g. Newton's Laws)" />
            <button class="btn btn-primary" id="btn-learn-search">Search Topic</button>
          </div>
        </header>

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
    }

    container.querySelectorAll(".syllabus-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const exam = chip.getAttribute("data-exam");
        // For simplicity, search the exam name directly
        router.navigate(`learn?query=${encodeURIComponent(exam.toUpperCase())}`);
      });
    });
  }

  renderStudyGuide(container, query) {
    const topicData = mockSearch.resolve(query);

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

    container.innerHTML = `
      <div class="study-guide-layout animate-fade-in">
        <!-- Sticky Sub-header search bar -->
        <header class="study-guide-sub-header">
          <button class="btn btn-outline btn-sm" id="btn-back-to-learn-home">← Back</button>
          <div class="guide-search-wrapper">
            <input type="text" id="guide-re-search-input" value="${topicData.topic}" />
            <button class="btn btn-primary btn-sm" id="btn-guide-re-search">Search</button>
          </div>
        </header>

        <!-- Main Guide Card -->
        <div class="card guide-container">
          <div class="guide-title-row">
            <span class="guide-topic-pill">🚀 Study Guide</span>
            <h2>${topicData.topic}</h2>
          </div>

          <!-- 1. Topic Overview -->
          <section class="guide-section">
            <div class="section-badge">1. Topic Overview</div>
            <p class="overview-body">${topicData.overview}</p>
          </section>

          <!-- 2. Key Concepts -->
          <section class="guide-section">
            <div class="section-badge">2. Key Concepts</div>
            <div class="concepts-grid">
              ${topicData.concepts.map(c => `
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
              ${topicData.definitions.map(d => `
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
              ${topicData.formulas.map(f => `
                <div class="formula-card card">
                  <div class="formula-title">${f.name}</div>
                  <code class="formula-equation">${f.eq}</code>
                  <div class="formula-desc">${f.desc}</div>
                </div>
              `).join("")}
            </div>
          </section>

          <!-- 5. Detailed Explanation -->
          <section class="guide-section">
            <div class="section-badge">5. Detailed Explanation</div>
            <div class="explanation-body-text">
              <p>${topicData.explanation}</p>
            </div>
          </section>

          <!-- 6. Exam Notes -->
          <section class="guide-section alert-notes-wrapper">
            <div class="section-badge">6. Exam Notes</div>
            <div class="exam-notes-text-box">
              ${topicData.examNotes.split('\n').map(n => `<p>${n}</p>`).join("")}
            </div>
          </section>

          <!-- 7. Common Mistakes -->
          <section class="guide-section">
            <div class="section-badge">7. Common Mistakes</div>
            <div class="mistakes-grid">
              ${topicData.mistakes.map(m => `
                <div class="mistake-card">
                  <h5>❌ ${m.title}</h5>
                  <p>${m.desc}</p>
                </div>
              `).join("")}
            </div>
          </section>

          <!-- 8. Quick Revision -->
          <section class="guide-section card revision-list-card">
            <div class="section-badge">8. Quick Revision Bullet Points</div>
            <ul class="revision-bullet-list">
              ${topicData.revision.map(r => `<li>🎯 ${r}</li>`).join("")}
            </ul>
          </section>

          <!-- 9. Practice Questions -->
          <section class="guide-section">
            <div class="section-badge">9. Practice Questions</div>
            <div class="practice-questions-wrap">
              ${topicData.questions.map((q, idx) => `
                <div class="practice-q-card">
                  <div class="q-header" id="q-head-${idx}">
                    <strong>Question ${idx + 1}: ${q.q}</strong>
                    <button class="btn btn-outline btn-sm btn-show-ans" data-target="q-ans-${idx}">Reveal Answer</button>
                  </div>
                  <div class="q-answer-body hidden" id="q-ans-${idx}">
                    <p>👉 ${q.a}</p>
                  </div>
                </div>
              `).join("")}
            </div>
          </section>

          <!-- 10. Suggested Videos -->
          <section class="guide-section">
            <div class="section-badge">10. Suggested Video Lectures</div>
            <div class="videos-grid">
              ${topicData.videos.map(v => {
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

    this.bindGuideEvents(container);
  }

  bindGuideEvents(container) {
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
    }

    // Toggle practice questions answers
    container.querySelectorAll(".btn-show-ans").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const ansEl = document.getElementById(targetId);
        if (ansEl) {
          const isHidden = ansEl.classList.contains("hidden");
          if (isHidden) {
            ansEl.classList.remove("hidden");
            btn.textContent = "Hide Answer";
            btn.className = "btn btn-outline btn-sm";
          } else {
            ansEl.classList.add("hidden");
            btn.textContent = "Reveal Answer";
            btn.className = "btn btn-outline btn-sm";
          }
        }
      });
    });
  }
}

export const learnView = new LearnView();
