/**
 * Quiz View Module (Gamified Quiz Arena)
 * Renders category select boards, countdown timers,
 * answer feedback, explanations, and rankings.
 */

import { store } from "../store.js";
import { ui } from "../ui.js";
import { gamification } from "../gamification.js";

class QuizView {
  constructor() {
    this.currentData = null;
    this.quizzesList = [];
    
    this.currentIndex = 0;
    this.score = 0;
    this.timerInterval = null;
    this.timeLeft = 30;
    this.selectedOptionIndex = null;
    this.answerLocked = false;
  }

  render(params) {
    const container = document.getElementById("view-quiz");
    if (!container) return;

    const examId = params.exam || "";

    if (examId) {
      this.loadQuizChapter(container, examId);
    } else {
      this.renderCategorySelector(container);
    }
  }

  renderCategorySelector(container) {
    container.innerHTML = `
      <div class="quiz-selector-layout animate-fade-in">
        <header class="quiz-view-header card">
          <h2>🎯 Quiz Arena</h2>
          <p>Challenge yourself with timed multiple choice questions, score XP multipliers, and maintain check-in streaks.</p>
        </header>

        <section class="categories-selection-section">
          <h3>Choose Exam Arena</h3>
          <div class="categories-grid">
            <div class="card category-card" data-exam="jee">
              <span class="cat-icon">📐</span>
              <h4>JEE Main / Advanced</h4>
              <small>Physics & Calculus MCQs</small>
            </div>
            <div class="card category-card" data-exam="neet">
              <span class="cat-icon">🧬</span>
              <h4>NEET Entrance</h4>
              <small>NCERT Biology & Cytology MCQs</small>
            </div>
            <div class="card category-card" data-exam="class12">
              <span class="cat-icon">🧪</span>
              <h4>Class 12 Boards</h4>
              <small>Physics Potential & kinetics MCQs</small>
            </div>
            <div class="card category-card" data-exam="class10">
              <span class="cat-icon">📖</span>
              <h4>Class 10 Boards</h4>
              <small>Science chemical & optics MCQs</small>
            </div>
            <div class="card category-card" data-exam="cuet">
              <span class="cat-icon">🏛️</span>
              <h4>CUET Entrance</h4>
              <small>Quantitative Ratios MCQs</small>
            </div>
            <div class="card category-card" data-exam="cafoundation">
              <span class="cat-icon">📊</span>
              <h4>CA Foundation</h4>
              <small>Double-Entry accounting MCQs</small>
            </div>
          </div>
        </section>
      </div>
    `;

    this.bindCategoryEvents(container);
  }

  bindCategoryEvents(container) {
    container.querySelectorAll(".category-card").forEach(card => {
      card.addEventListener("click", () => {
        const exam = card.getAttribute("data-exam");
        window.location.hash = `#quiz?exam=${exam}`;
      });
    });
  }

  async loadQuizChapter(container, examId) {
    container.innerHTML = `<div class="loading-state">🤖 Fetching MCQ questions database...</div>`;
    
    try {
      const response = await fetch(`./data/${examId}.json`);
      if (!response.ok) throw new Error("Database load failure");
      this.currentData = await response.json();

      // Gather all quizzes across subjects
      this.quizzesList = [];
      this.currentData.subjects.forEach(sub => {
        sub.chapters.forEach(chap => {
          if (chap.quizzes && chap.quizzes.length > 0) {
            this.quizzesList.push(...chap.quizzes);
          }
        });
      });

      if (this.quizzesList.length > 0) {
        this.renderSetupScreen(container);
      } else {
        container.innerHTML = `
          <div class="card error-state">
            <h3>No quizzes available</h3>
            <p>We are currently uploading test questions for this category.</p>
            <button class="btn btn-primary" onclick="window.location.hash='#quiz'">Back to Arena</button>
          </div>
        `;
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div class="card error-state">
          <h3>Failed to connect to Quiz Database</h3>
          <p>${err.message}</p>
          <button class="btn btn-primary" onclick="window.location.hash='#quiz'">Back to Arena</button>
        </div>
      `;
    }
  }

  renderSetupScreen(container) {
    container.innerHTML = `
      <div class="card quiz-setup-card animate-fade-in">
        <span class="setup-badge">🎯 Challenging Mode</span>
        <h2>${this.currentData.examName} Practice</h2>
        <p>Test your speed and precision under countdown conditions. Earn +20 XP per correct response.</p>
        
        <div class="quiz-info-grid">
          <div class="info-item">
            <span class="info-val">${this.quizzesList.length}</span>
            <span class="info-lbl">Questions</span>
          </div>
          <div class="info-item">
            <span class="info-val">30s</span>
            <span class="info-lbl">Per Question</span>
          </div>
          <div class="info-item">
            <span class="info-val">+20 XP</span>
            <span class="info-lbl">Per Correct</span>
          </div>
        </div>

        <div class="leaderboard-preview" style="width: 100%; text-align:left;">
          <h4 style="font-size:0.9rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">🔥 Mock Top Scorers</h4>
          ${this.renderLeaderboardHTML(3)}
        </div>

        <button class="btn btn-primary btn-block" id="btn-start-quiz-arena" style="margin-top:16px;">
          Start Arena Session
        </button>
      </div>
    `;

    container.querySelector("#btn-start-quiz-arena").addEventListener("click", () => {
      this.startQuizArena(container);
    });
  }

  startQuizArena(container) {
    this.currentIndex = 0;
    this.score = 0;
    this.selectedOptionIndex = null;
    this.answerLocked = false;
    
    this.showQuestion(container);
  }

  showQuestion(container) {
    const q = this.quizzesList[this.currentIndex];
    this.selectedOptionIndex = null;
    this.answerLocked = false;
    this.timeLeft = 30;

    container.innerHTML = `
      <div class="quiz-play-layout animate-fade-in">
        <!-- Top bar details -->
        <div class="quiz-progress-section">
          <div class="progress-details">
            <span>Arena Question ${this.currentIndex + 1} of ${this.quizzesList.length}</span>
            <span id="quiz-timer-text">⏳ 30s</span>
          </div>
          <div class="modal-progress-bar">
            <div class="progress-bar-fill" id="quiz-timer-bar" style="width: 100%"></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="card question-card">
          <h3 class="quiz-question-text">${q.question}</h3>
          
          <div class="quiz-options-list" id="options-container">
            ${q.options.map((opt, idx) => `
              <button class="quiz-option-btn" data-idx="${idx}">
                <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
                <span class="opt-text">${opt}</span>
              </button>
            `).join("")}
          </div>

          <!-- Explanation Panel -->
          <div class="quiz-explanation-box hidden" id="explanation-box">
            <h5>💡 Explanation Details</h5>
            <p>${q.explanation}</p>
          </div>
        </div>

        <!-- Action bar -->
        <div class="quiz-footer-actions">
          <button class="btn btn-outline" id="btn-quit-quiz">Quit Session</button>
          <button class="btn btn-primary" id="btn-submit-answer" disabled>Lock Answer</button>
        </div>
      </div>
    `;

    this.bindQuestionEvents(container, q);
    this.startTimer(container);
  }

  bindQuestionEvents(container, q) {
    const optionsContainer = container.querySelector("#options-container");
    const submitBtn = container.querySelector("#btn-submit-answer");
    const quitBtn = container.querySelector("#btn-quit-quiz");

    optionsContainer.querySelectorAll(".quiz-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (this.answerLocked) return;

        optionsContainer.querySelectorAll(".quiz-option-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");

        this.selectedOptionIndex = parseInt(btn.getAttribute("data-idx"));
        submitBtn.removeAttribute("disabled");
      });
    });

    submitBtn.addEventListener("click", () => {
      if (this.answerLocked) {
        this.nextQuestion(container);
      } else {
        this.lockAnswer(q, submitBtn, optionsContainer);
      }
    });

    quitBtn.addEventListener("click", () => {
      if (confirm("Quit quiz session? Progress will be discarded.")) {
        clearInterval(this.timerInterval);
        this.renderSelector(container);
      }
    });
  }

  startTimer(container) {
    clearInterval(this.timerInterval);
    const timerText = container.querySelector("#quiz-timer-text");
    const timerBar = container.querySelector("#quiz-timer-bar");

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (timerText) timerText.textContent = `⏳ ${this.timeLeft}s`;
      if (timerBar) timerBar.style.width = `${(this.timeLeft / 30) * 100}%`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        const q = this.quizzesList[this.currentIndex];
        const submitBtn = container.querySelector("#btn-submit-answer");
        const optionsContainer = container.querySelector("#options-container");
        this.lockAnswer(q, submitBtn, optionsContainer);
      }
    }, 1000);
  }

  lockAnswer(q, submitBtn, optionsContainer) {
    clearInterval(this.timerInterval);
    this.answerLocked = true;

    optionsContainer.querySelectorAll(".quiz-option-btn").forEach(btn => {
      const idx = parseInt(btn.getAttribute("data-idx"));
      if (idx === q.correctAnswerIndex) {
        btn.classList.add("correct");
      } else if (idx === this.selectedOptionIndex) {
        btn.classList.add("incorrect");
      }
    });

    const isCorrect = this.selectedOptionIndex === q.correctAnswerIndex;
    if (isCorrect) {
      this.score++;
      gamification.addXP(20);
      ui.showToast("Correct! +20 XP", "success");
    } else {
      ui.showToast("Incorrect answer", "warning");
    }

    const expBox = document.getElementById("explanation-box");
    if (expBox) expBox.classList.remove("hidden");

    submitBtn.textContent = this.currentIndex === this.quizzesList.length - 1 ? "Check Results" : "Next Question";
    submitBtn.removeAttribute("disabled");
  }

  nextQuestion(container) {
    if (this.currentIndex < this.quizzesList.length - 1) {
      this.currentIndex++;
      this.showQuestion(container);
    } else {
      this.finishQuiz(container);
    }
  }

  finishQuiz(container) {
    clearInterval(this.timerInterval);

    // Completion XP
    const finalXP = (this.score * 20) + 150;
    gamification.addXP(150); // Add completion bonus
    gamification.incrementDailyGoalProgress("quiz");
    gamification.unlockBadge("quiz_master");

    // Track metrics
    store.incrementQuizzesCompleted();

    const percentage = Math.round((this.score / this.quizzesList.length) * 100);

    container.innerHTML = `
      <div class="card quiz-results-card animate-fade-in">
        <h2>🎉 Quiz Complete!</h2>
        <p class="results-subtitle">Excellent attempt on ${this.currentData.examName}!</p>
        
        <div class="results-stats-row">
          <div class="result-stat">
            <span class="stat-num">${this.score}/${this.quizzesList.length}</span>
            <span class="stat-lbl">Correct Answers</span>
          </div>
          <div class="result-stat">
            <span class="stat-num">${percentage}%</span>
            <span class="stat-lbl">Accuracy</span>
          </div>
          <div class="result-stat">
            <span class="stat-num">+${finalXP} XP</span>
            <span class="stat-lbl">Total Earned</span>
          </div>
        </div>

        <div class="quiz-leaderboard-section" style="width:100%;">
          <h4>📈 Live Rankings Board</h4>
          ${this.renderLeaderboardHTML(6)}
        </div>

        <div class="results-buttons">
          <button class="btn btn-primary" onclick="window.location.hash='#dashboard'">View Progress</button>
          <button class="btn btn-outline" id="btn-restart-arena">Try Again</button>
        </div>
      </div>
    `;

    container.querySelector("#btn-restart-arena").addEventListener("click", () => {
      this.startQuizArena(container);
    });
  }

  renderSelector(container) {
    window.location.hash = "#quiz";
  }

  renderLeaderboardHTML(size) {
    const profile = store.getProfile();
    const userXP = profile.xp;

    const mockAspirants = [
      { name: "Ananya Sharma", xp: 5800, badge: "👑" },
      { name: "Rohan Verma", xp: 4200, badge: "🔥" },
      { name: "Priya Patel", xp: 3950, badge: "🎯" },
      { name: "Aarav Gupta", xp: 2900, badge: "📚" },
      { name: "Ishaan Sen", xp: 1800, badge: "⚡" },
      { name: "Deepika R.", xp: 950, badge: "🚀" }
    ];

    const fullList = [...mockAspirants, { name: `${profile.name} (You)`, xp: userXP, badge: "👤", isUser: true }];
    fullList.sort((a, b) => b.xp - a.xp);

    const activeList = fullList.slice(0, size);

    return `
      <div class="mock-leaderboard">
        ${activeList.map((item, idx) => `
          <div class="leaderboard-row ${item.isUser ? "user-row" : ""}">
            <span class="row-rank">#${idx + 1}</span>
            <span class="row-badge">${item.badge}</span>
            <span class="row-name">${item.name}</span>
            <span class="row-xp">${item.xp} XP</span>
          </div>
        `).join("")}
      </div>
    `;
  }
}

export const quizView = new QuizView();
