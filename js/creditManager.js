/**
 * Credit & IP Rate Limit Service for VidyaAI
 * - 150 credits per IP per day
 * - 1 AI query = 5 credits (Exact 30 queries / day per IP)
 * - Tracks usage and resets every 24 hours (midnight)
 */

const STORAGE_KEY_PREFIX = "vidya_credit_state_";
const DAILY_MAX_CREDITS = 150;
const COST_PER_QUERY = 5;

class CreditManager {
  constructor() {
    this.cachedIp = null;
    this.state = null;
  }

  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  async fetchClientIp() {
    if (this.cachedIp) return this.cachedIp;

    try {
      const resp = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const data = await resp.json();
        this.cachedIp = data.ip || "127.0.0.1";
        return this.cachedIp;
      }
    } catch (e) {
      // Fallback service
      try {
        const resp2 = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (resp2.ok) {
          const data2 = await resp2.json();
          this.cachedIp = data2.ip || "127.0.0.1";
          return this.cachedIp;
        }
      } catch (err) {
        this.cachedIp = "127.0.0.1";
      }
    }
    return this.cachedIp || "127.0.0.1";
  }

  async getCreditState() {
    const ip = await this.fetchClientIp();
    const today = this.getTodayDateString();
    const storageKey = STORAGE_KEY_PREFIX + ip.replace(/[^a-zA-Z0-9]/g, "_");

    let record = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) record = JSON.parse(raw);
    } catch (e) {
      record = null;
    }

    // Reset if it's a new day or config updated or not present
    if (!record || record.date !== today || record.maxCredits !== DAILY_MAX_CREDITS || record.costPerQuery !== COST_PER_QUERY) {
      record = {
        ip,
        date: today,
        maxCredits: DAILY_MAX_CREDITS,
        remainingCredits: DAILY_MAX_CREDITS,
        usedCredits: 0,
        queryCount: 0,
        maxQueries: Math.floor(DAILY_MAX_CREDITS / COST_PER_QUERY), // 30
        costPerQuery: COST_PER_QUERY,
        history: []
      };
      localStorage.setItem(storageKey, JSON.stringify(record));
    }

    this.state = record;
    return record;
  }

  async canMakeQuery() {
    const state = await this.getCreditState();
    return state.remainingCredits >= COST_PER_QUERY;
  }

  async deductQueryCredits(topic = "Study Query") {
    const state = await this.getCreditState();
    if (state.remainingCredits < COST_PER_QUERY) {
      throw new Error("Credit limit reached for today (30 queries / 150 credits used). Quota resets at midnight.");
    }

    state.remainingCredits -= COST_PER_QUERY;
    state.usedCredits += COST_PER_QUERY;
    state.queryCount += 1;
    state.history.unshift({
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      topic: topic.slice(0, 40),
      cost: COST_PER_QUERY,
      remaining: state.remainingCredits
    });

    if (state.history.length > 20) {
      state.history = state.history.slice(0, 20);
    }

    const storageKey = STORAGE_KEY_PREFIX + state.ip.replace(/[^a-zA-Z0-9]/g, "_");
    localStorage.setItem(storageKey, JSON.stringify(state));
    this.state = state;

    window.dispatchEvent(new CustomEvent("credits_updated", { detail: state }));
    return state;
  }
}

export const creditManager = new CreditManager();

