/**
 * Gamification Engine for Vidyaverse AI (Upgraded)
 * Awards XP for study guides, quizzes, notes generation, and document uploads.
 */

import { store } from "./store.js";

// Badge specifications
export const BADGES = [
  { id: "welcome", name: "Welcome Achiever", desc: "Started your prep journey on Vidyaverse AI!", icon: "🚀" },
  { id: "scholar", name: "Diligent Scholar", desc: "Read your first chapter summary.", icon: "📚" },
  { id: "search_first", name: "Universe Explorer", desc: "Performed your first universal study search.", icon: "🔍" },
  { id: "note_creator", name: "Scribe Elite", desc: "Generated custom notes with AI Agents.", icon: "📝" },
  { id: "pdf_parser", name: "Doc Analyst", desc: "Summarized a PDF document.", icon: "📄" },
  { id: "quiz_master", name: "Quiz Master", desc: "Completed a full chapter quiz.", icon: "🏆" },
  { id: "streak_3", name: "Consistent 3", desc: "Maintained a 3-day study streak.", icon: "⚡" },
  { id: "focus_rookie", name: "Focus Rookie", desc: "Completed your first Pomodoro session.", icon: "⏱️" }
];

export const gamification = {
  /**
   * Adds XP to user profile, checks for level up
   * @param {number} amount 
   */
  addXP(amount) {
    const state = store.getState();
    const oldLevel = state.profile.level;
    
    state.profile.xp += amount;
    
    // Formula: Level = Math.floor(XP / 1000) + 1
    const newLevel = Math.floor(state.profile.xp / 1000) + 1;
    let leveledUp = false;
    
    if (newLevel > oldLevel) {
      state.profile.level = newLevel;
      leveledUp = true;
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("level-up", { 
          detail: { oldLevel, newLevel } 
        }));
      }, 300);
    }
    
    store.saveState();
    return { leveledUp, oldLevel, newLevel };
  },

  /**
   * Updates streak calendar days
   */
  updateStreak() {
    const state = store.getState();
    const todayStr = this.getTodayDateString();
    const lastActive = state.profile.lastActiveDate;

    if (!lastActive) {
      state.profile.streak = 1;
    } else {
      const diffDays = this.getDateDifferenceInDays(lastActive, todayStr);
      if (diffDays === 1) {
        state.profile.streak += 1;
      } else if (diffDays > 1) {
        state.profile.streak = 1;
      }
    }

    state.profile.lastActiveDate = todayStr;
    store.saveState();

    if (state.profile.streak >= 3) this.unlockBadge("streak_3");
  },

  incrementDailyGoalProgress(type) {
    const state = store.getState();
    const todayStr = this.getTodayDateString();
    const goalStatus = state.profile.dailyGoalStatus;

    if (goalStatus.lastUpdated !== todayStr) {
      goalStatus.completedLessons = 0;
      goalStatus.completedQuizzes = 0;
      goalStatus.lastUpdated = todayStr;
    }

    const alreadyMet = goalStatus.completedLessons >= 1 && goalStatus.completedQuizzes >= 1;

    if (type === "lesson") {
      goalStatus.completedLessons += 1;
    } else if (type === "quiz") {
      goalStatus.completedQuizzes += 1;
    }

    store.saveState();

    const metNow = goalStatus.completedLessons >= 1 && goalStatus.completedQuizzes >= 1;

    if (!alreadyMet && metNow) {
      this.addXP(250);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("daily-goal-completed", {
          detail: { reward: 250 }
        }));
      }, 500);
    }
  },

  /**
   * Unlocks a specific badge if not already unlocked
   * @param {string} badgeId 
   */
  unlockBadge(badgeId) {
    const state = store.getState();
    const badges = state.unlockedBadges;

    if (badges.includes(badgeId)) {
      return false;
    }

    const badgeInfo = BADGES.find(b => b.id === badgeId);
    if (!badgeInfo) return false;

    state.unlockedBadges.push(badgeId);
    store.saveState();

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("badge-unlocked", { 
        detail: badgeInfo 
      }));
    }, 400);

    return true;
  },

  getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  getDateDifferenceInDays(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }
};
