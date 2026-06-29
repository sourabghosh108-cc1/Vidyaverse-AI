/**
 * Centralized Store for Vidyaverse AI (Upgraded)
 * Handles client-side state schema, localStorage, and view change events.
 */

const STORAGE_KEY = "vidyaverse_ai_gamestate";

const initialGameState = {
  profile: {
    name: "Aspirant",
    selectedExam: "jee",
    level: 1,
    xp: 0,
    streak: 0,
    lastActiveDate: null, // YYYY-MM-DD
    dailyGoalStatus: {
      completedLessons: 0,
      completedQuizzes: 0,
      lastUpdated: "" // YYYY-MM-DD
    },
    // Upgraded Product Metrics
    topicsStudiedCount: 0,
    notesGeneratedCount: 0,
    pdfsSummarizedCount: 0,
    quizzesCompletedCount: 0
  },
  progress: {
    completedChapters: {},
    completedQuizzes: {},
    generatedNotes: {},  // stores notes title: content
    summarizedPDFs: [],  // list of filenames
    searchedTopics: []   // history of search queries
  },
  unlockedBadges: []
};

class GameStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return JSON.parse(JSON.stringify(initialGameState));
    }
    try {
      const parsed = JSON.parse(raw);
      // Merging properties safely to maintain backwards compatibility
      const profile = { ...initialGameState.profile, ...parsed.profile };
      const progress = { ...initialGameState.progress, ...parsed.progress };
      const unlockedBadges = parsed.unlockedBadges || [];

      return { profile, progress, unlockedBadges };
    } catch (e) {
      console.error("Error reading localStorage, resetting state", e);
      return JSON.parse(JSON.stringify(initialGameState));
    }
  }

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  resetState() {
    this.state = JSON.parse(JSON.stringify(initialGameState));
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
    window.dispatchEvent(new CustomEvent("statechange", { detail: this.state }));
  }

  // Getters
  getState() {
    return this.state;
  }

  getProfile() {
    return this.state.profile;
  }

  getProgress() {
    return this.state.progress;
  }

  getUnlockedBadges() {
    return this.state.unlockedBadges;
  }

  // State Mutators
  setSelectedExam(examId) {
    this.state.profile.selectedExam = examId;
    this.saveState();
  }

  setProfileName(name) {
    this.state.profile.name = name || "Aspirant";
    this.saveState();
  }

  // Upgraded Trackers
  incrementTopicsStudied(topicName) {
    if (!this.state.progress.searchedTopics.includes(topicName)) {
      this.state.progress.searchedTopics.push(topicName);
      this.state.profile.topicsStudiedCount = this.state.progress.searchedTopics.length;
      this.saveState();
    }
  }

  addGeneratedNote(title, content) {
    this.state.progress.generatedNotes[title] = content;
    this.state.profile.notesGeneratedCount = Object.keys(this.state.progress.generatedNotes).length;
    this.saveState();
  }

  addSummarizedPDF(filename) {
    if (!this.state.progress.summarizedPDFs.includes(filename)) {
      this.state.progress.summarizedPDFs.push(filename);
      this.state.profile.pdfsSummarizedCount = this.state.progress.summarizedPDFs.length;
      this.saveState();
    }
  }

  incrementQuizzesCompleted() {
    this.state.profile.quizzesCompletedCount += 1;
    this.saveState();
  }

  getAnthropicApiKey() {
    return localStorage.getItem("vidyaverse_ai_claude_key") || "";
  }

  setAnthropicApiKey(key) {
    if (key) {
      localStorage.setItem("vidyaverse_ai_claude_key", key);
    } else {
      localStorage.removeItem("vidyaverse_ai_claude_key");
    }
    this.notify();
  }

  getYouTubeApiKey() {
    return localStorage.getItem("vidyaverse_yt_key") || "";
  }

  setYouTubeApiKey(key) {
    if (key) {
      localStorage.setItem("vidyaverse_yt_key", key);
    } else {
      localStorage.removeItem("vidyaverse_yt_key");
    }
    this.notify();
  }
}

export const store = new GameStore();
