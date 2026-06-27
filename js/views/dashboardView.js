/**
 * Dashboard View Module
 * Displays user profile, daily objectives checklist, gamification levels,
 * and a visual CSS-based weekly study activity graph.
 */

import { store } from "../store.js";
import { gamification } from "../gamification.js";

class DashboardView {
  render() {
    const container = document.getElementById("view-dashboard");
    if (!container) return;

    const state = store.getState();
    const profile = state.profile;

    // Calculate level progression parameters
    const prevLevelXP = (profile.level - 1) * 1000;
    const targetLevelXP = profile.level * 1000;
    const currentLevelProgress = profile.xp - prevLevelXP;
    const progressPercentage = Math.min(Math.max(Math.round((currentLevelProgress / 1000) * 100), 0), 100);

    // Calculate daily objectives completion
    const todayStr = gamification.getTodayDateString();
    const goalStatus = profile.dailyGoalStatus;
    const isNewDay = goalStatus.lastUpdated !== todayStr;
    
    const lessonsCompletedCount = isNewDay ? 0 : goalStatus.completedLessons;
    const quizzesCompletedCount = isNewDay ? 0 : goalStatus.completedQuizzes;

    const isLessonCompleted = lessonsCompletedCount >= 1;
    const isQuizCompleted = quizzesCompletedCount >= 1;

    // Draw the weekly activity bars heights dynamically based on XP and streak
    const baselineXP = [200, 350, 100, 500, 0, 150, 0]; // Mon - Sun default mock distributions
    const daysName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayIndex = (new Date().getDay() + 6) % 7; // Mon is 0, Sun is 6
    
    // Inject current user activity into today's bar
    baselineXP[currentDayIndex] = Math.min(profile.xp % 1000, 800); 

    container.innerHTML = `
      <div class="dashboard-layout animate-fade-in">
        <!-- Greetings header -->
        <header class="dashboard-header-bar">
          <div>
            <h2>📊 Student Progress Dashboard</h2>
            <p>Welcome back, <strong class="text-gradient">${profile.name}</strong>! Review your credentials, streaks, and stats.</p>
          </div>
          <button class="btn btn-primary" onclick="window.location.hash='#learn'">
            Resume Study 🔍
          </button>
        </header>

        <!-- Stats Overview Grid -->
        <div class="dashboard-stats-grid">
          <div class="d-stat-card card">
            <span class="d-stat-icon">⭐</span>
            <span class="d-stat-label">Level</span>
            <span class="d-stat-val">${profile.level}</span>
          </div>
          <div class="d-stat-card card">
            <span class="d-stat-icon">⚡</span>
            <span class="d-stat-label">Total XP</span>
            <span class="d-stat-val">${profile.xp.toLocaleString()} XP</span>
          </div>
          <div class="d-stat-card card font-gold">
            <span class="d-stat-icon">🔥</span>
            <span class="d-stat-label">Daily Streak</span>
            <span class="d-stat-val">${profile.streak} Days</span>
          </div>
          <div class="d-stat-card card">
            <span class="d-stat-icon">📚</span>
            <span class="d-stat-label">Topics Studied</span>
            <span class="d-stat-val">${profile.topicsStudiedCount}</span>
          </div>
          <div class="d-stat-card card">
            <span class="d-stat-icon">📝</span>
            <span class="d-stat-label">Notes Generated</span>
            <span class="d-stat-val">${profile.notesGeneratedCount}</span>
          </div>
          <div class="d-stat-card card">
            <span class="d-stat-icon">📄</span>
            <span class="d-stat-label">PDFs Summarized</span>
            <span class="d-stat-val">${profile.pdfsSummarizedCount}</span>
          </div>
        </div>

        <div class="dashboard-main-row">
          <!-- Left side: XP levels & goals -->
          <div class="dashboard-left-col">
            <!-- Level Progression Bar -->
            <div class="card gamification-panel">
              <h3>XP Level Meter</h3>
              <div class="level-progress-labels">
                <span>Lvl ${profile.level}</span>
                <span>${profile.xp} / ${targetLevelXP} XP</span>
                <span>Lvl ${profile.level + 1}</span>
              </div>
              <div class="level-progress-track">
                <div class="level-progress-fill" style="width: ${progressPercentage}%;"></div>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 10px; text-align: center;">
                Earn ${targetLevelXP - profile.xp} more XP to level up!
              </p>
            </div>

            <!-- Daily Objectives -->
            <div class="card daily-goals-panel">
              <div class="goal-panel-header">
                <h3>🎯 Daily Goal Checklists</h3>
                <span class="bonus-tag">+250 XP bonus</span>
              </div>
              <p class="goal-desc">Complete these micro-tasks today to preserve your check-in streak:</p>
              
              <div class="daily-checklist">
                <div class="checklist-item ${isLessonCompleted ? "completed" : ""}">
                  <div class="checkbox-circle"></div>
                  <div class="checklist-details">
                    <strong>Study a Topic</strong>
                    <span>Use study search or read summaries (${isLessonCompleted ? "1/1" : "0/1"})</span>
                  </div>
                </div>
                
                <div class="checklist-item ${isQuizCompleted ? "completed" : ""}">
                  <div class="checkbox-circle"></div>
                  <div class="checklist-details">
                    <strong>Complete Quiz Session</strong>
                    <span>Challenge timed MCQs in Quiz Arena (${isQuizCompleted ? "1/1" : "0/1"})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side: Weekly visual analytics graph -->
          <div class="dashboard-right-col">
            <div class="card weekly-activity-card">
              <h3>📊 Weekly Study Distribution</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px;">Daily learning activity (in XP points) over the week.</p>
              
              <div class="chart-canvas">
                ${daysName.map((day, idx) => {
                  const xp = baselineXP[idx];
                  const barHeight = Math.max(Math.round((xp / 800) * 150), 10); // Scale to max 150px
                  const isToday = idx === currentDayIndex;
                  return `
                    <div class="chart-bar-wrap">
                      <div class="chart-bar-value">${xp}</div>
                      <div class="chart-bar-col ${isToday ? "active" : ""}" style="height: ${barHeight}px;"></div>
                      <span class="chart-bar-label">${day}</span>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

export const dashboardView = new DashboardView();
