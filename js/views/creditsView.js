/**
 * Vidyaverse AI - Credits & Daily IP Usage Dashboard View
 * Displays current IP, remaining credits (out of 300), query meter (out of 100),
 * cost breakdown, and real-time query deduction logs.
 */

import { creditManager } from "../creditManager.js";
import { router } from "../router.js";

class CreditsView {
  async render() {
    const container = document.getElementById("view-credits");
    if (!container) return;

    // Show initial loading while resolving client IP
    container.innerHTML = `
      <div style="padding:40px; text-align:center;">
        <div class="loader-spinner" style="margin:0 auto 16px auto;"></div>
        <p>Detecting IP and checking daily education credit allocation...</p>
      </div>
    `;

    const state = await creditManager.getCreditState();
    const percentRemaining = Math.max(0, Math.round((state.remainingCredits / state.maxCredits) * 100));
    const queriesRemaining = Math.floor(state.remainingCredits / state.costPerQuery);

    container.innerHTML = `
      <div class="credits-layout-wrapper animate-fade-in" style="max-width:950px; margin:0 auto; display:flex; flex-direction:column; gap:24px;">

        <!-- Header Card -->
        <header class="credits-header-card card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="badge badge-accent">🛡️ Fair-Use Protection</span>
              <span class="badge" style="background:rgba(16,185,129,0.15); color:#10B981; border:1px solid rgba(16,185,129,0.3);">
                🌐 IP: <strong>${state.ip}</strong>
              </span>
            </div>
            <h2 style="font-family:var(--font-display); font-size:1.6rem; margin:0;">AI Education Credits</h2>
            <p style="margin:4px 0 0 0; color:var(--text-secondary); font-size:0.92rem;">
              Daily limit enforced per IP for fair server allocation across all student aspirants.
            </p>
          </div>
          <button class="btn btn-primary" id="btn-credits-go-chat" style="display:flex; align-items:center; gap:6px;">
            <span>Open AI Chat</span> 🤖
          </button>
        </header>

        <!-- Stats Overview Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
          <div class="card" style="border-left:4px solid #3B82F6;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Remaining Credits</div>
            <div style="font-size:2.2rem; font-weight:800; font-family:var(--font-display); color:#3B82F6; margin:8px 0 4px 0;">
              ${state.remainingCredits} <span style="font-size:1rem; color:var(--text-secondary); font-weight:500;">/ ${state.maxCredits}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Cost: 5 credits per AI query</div>
          </div>

          <div class="card" style="border-left:4px solid #10B981;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Queries Left Today</div>
            <div style="font-size:2.2rem; font-weight:800; font-family:var(--font-display); color:#10B981; margin:8px 0 4px 0;">
              ${queriesRemaining} <span style="font-size:1rem; color:var(--text-secondary); font-weight:500;">/ ${state.maxQueries}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${state.queryCount} queries performed today</div>
          </div>

          <div class="card" style="border-left:4px solid #F59E0B;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Quota Reset</div>
            <div style="font-size:1.6rem; font-weight:800; font-family:var(--font-display); color:#F59E0B; margin:8px 0 4px 0;">
              Midnight
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Active session date: ${state.date}</div>
          </div>
        </div>

        <!-- Progress Bar Card -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:600; font-size:0.92rem;">
            <span>Daily Consumption Meter</span>
            <span>${percentRemaining}% Available</span>
          </div>
          <div style="width:100%; height:14px; background:var(--bg-color); border-radius:10px; overflow:hidden; border:1px solid var(--border-color);">
            <div style="width:${percentRemaining}%; height:100%; background:linear-gradient(90deg, #10B981, #3B82F6); transition:width 0.4s ease;"></div>
          </div>
          <div style="margin-top:12px; font-size:0.82rem; color:var(--text-secondary); display:flex; justify-content:space-between;">
            <span>0 Credits</span>
            <span>75 Credits</span>
            <span>150 Credits Max</span>
          </div>
        </div>

        <!-- Rules & Explanations -->
        <div class="card" style="background:linear-gradient(135deg, rgba(59,130,246,0.05), rgba(16,185,129,0.05));">
          <h4 style="margin-bottom:10px;">📋 How Credits Work</h4>
          <ul style="padding-left:20px; line-height:1.7; font-size:0.9rem; color:var(--text-secondary);">
            <li>Every distinct IP address automatically receives <strong>150 free credits daily</strong>.</li>
            <li>Each AI query, doubt resolution, or practice question generation deducts <strong>5 credits</strong>.</li>
            <li>This ensures every student gets up to <strong>30 free AI interactions per day</strong>.</li>
            <li>Credits automatically restore to 150 credits at 12:00 AM (midnight) local time.</li>
          </ul>
        </div>

        <!-- Recent Usage Log Table -->
        <div class="card">
          <h4 style="margin-bottom:12px;">🕒 Recent AI Query Deductions</h4>
          ${state.history && state.history.length > 0 ? `
            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; font-size:0.88rem; text-align:left;">
                <thead>
                  <tr style="border-bottom:1px solid var(--border-color); color:var(--text-muted);">
                    <th style="padding:8px;">Time</th>
                    <th style="padding:8px;">Query Topic</th>
                    <th style="padding:8px;">Cost</th>
                    <th style="padding:8px;">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.history.map(item => `
                    <tr style="border-bottom:1px solid var(--border-color);">
                      <td style="padding:8px; color:var(--text-muted);">${item.time}</td>
                      <td style="padding:8px; font-weight:600;">${item.topic || "AI Study Request"}</td>
                      <td style="padding:8px; color:#EF4444; font-weight:700;">-${item.cost} credits</td>
                      <td style="padding:8px; color:#10B981; font-weight:700;">${item.remaining}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : `
            <p style="color:var(--text-secondary); font-size:0.9rem; margin:0;">No queries made yet today. Your 300 credits are fully intact!</p>
          `}
        </div>

      </div>
    `;

    const chatBtn = container.querySelector("#btn-credits-go-chat");
    if (chatBtn) {
      chatBtn.addEventListener("click", () => router.navigate("chat"));
    }
  }
}

export const creditsView = new CreditsView();

