/**
 * UI Manager for Vidyaverse AI (Upgraded)
 * Controls toast notifications, dark mode, celebration modals, and mobile hamburger navigation.
 */

export const ui = {
  init() {
    this.initTheme();
    this.createToastContainer();
    this.setupGamificationListeners();
    this.setupMobileMenu();
  },

  // ----------------------------------------------------
  // Theme Management (Light/Dark Mode)
  // ----------------------------------------------------
  initTheme() {
    const savedTheme = localStorage.getItem("vidyaverse_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("vidyaverse_theme", next);
    
    // Dispatch event to update theme toggler UI icons if needed
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    return next;
  },

  // ----------------------------------------------------
  // Toast Alerts
  // ----------------------------------------------------
  createToastContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  },

  showToast(message, type = "info") {
    if (!this.toastContainer) this.createToastContainer();

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    
    let icon = "🔔";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "xp") icon = "⚡";

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    this.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 3500);
  },

  // ----------------------------------------------------
  // Confetti overlay modals
  // ----------------------------------------------------
  showCelebrationModal({ title, subtitle, badgeIcon, description, footer }) {
    const overlay = document.createElement("div");
    overlay.className = "celebration-overlay active";
    overlay.innerHTML = `
      <div class="celebration-card">
        <div class="confetti-holder"></div>
        <div class="celebration-icon-wrap animate-bounce-short">
          <span class="celebration-badge-symbol">${badgeIcon || "🎉"}</span>
        </div>
        <h2 class="celebration-title">${title}</h2>
        <p class="celebration-subtitle">${subtitle}</p>
        ${description ? `<p class="celebration-desc">${description}</p>` : ""}
        <div class="celebration-action">
          <button class="btn btn-primary" id="btn-close-celebration" style="width:100%">Continue</button>
        </div>
        ${footer ? `<div class="celebration-footer">${footer}</div>` : ""}
      </div>
    `;

    document.body.appendChild(overlay);
    this.spawnConfettiParticles(overlay.querySelector(".confetti-holder"));

    const closeBtn = overlay.querySelector("#btn-close-celebration");
    closeBtn.focus();
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
      overlay.addEventListener("transitionend", () => overlay.remove());
    });
  },

  spawnConfettiParticles(container) {
    const colors = ["#2563EB", "#60A5FA", "#10b981", "#fbbf24", "#f43f5e", "#a855f7"];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.className = "confetti-particle";
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 15 - 5}%`;
      p.style.setProperty("--dx", `${Math.random() * 160 - 80}px`);
      p.style.setProperty("--dy", `${Math.random() * 260 + 200}px`);
      p.style.setProperty("--rot", `${Math.random() * 360}deg`);
      p.style.animationDelay = `${Math.random() * 0.4}s`;
      p.style.animationDuration = `${Math.random() * 1.2 + 0.8}s`;
      container.appendChild(p);
    }
  },

  // ----------------------------------------------------
  // Mobile Hamburger menu Drawer
  // ----------------------------------------------------
  setupMobileMenu() {
    const burger = document.getElementById("btn-hamburger");
    const sidebar = document.getElementById("app-sidebar");
    
    // Create an overlay element if not exists
    let overlay = document.getElementById("sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "sidebar-overlay";
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    if (burger && sidebar) {
      burger.addEventListener("click", () => {
        sidebar.classList.add("open");
        overlay.classList.add("active");
      });

      const closeMenu = () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
      };

      // Close when clicking overlay backdrop
      overlay.addEventListener("click", closeMenu);

      // Close when clicking nav links
      sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", closeMenu);
      });
    }
  },

  setupGamificationListeners() {
    window.addEventListener("level-up", (e) => {
      const { newLevel } = e.detail;
      this.showToast(`Upgraded to Level ${newLevel}!`, "success");
      this.showCelebrationModal({
        title: "LEVEL UP!",
        subtitle: `You reached Level ${newLevel}!`,
        badgeIcon: "⭐",
        description: `Excellent work! You've crossed the XP threshold and unlocked Level ${newLevel}. Keep exploring topics to claim more rewards!`,
        footer: `+1,000 XP target to next level`
      });
    });

    window.addEventListener("badge-unlocked", (e) => {
      const badge = e.detail;
      this.showToast(`Badge Earned: ${badge.name}!`, "success");
      this.showCelebrationModal({
        title: "ACHIEVEMENT UNLOCKED!",
        subtitle: badge.name,
        badgeIcon: badge.icon,
        description: `You've unlocked the <strong>"${badge.name}"</strong> badge!<br><small>${badge.desc}</small>`,
        footer: `Check your Cabinet on the Settings page`
      });
    });

    window.addEventListener("daily-goal-completed", (e) => {
      const { reward } = e.detail;
      this.showToast(`Daily Goal Met! +${reward} XP`, "xp");
      this.showCelebrationModal({
        title: "DAILY GOAL COMPLETED!",
        subtitle: `⚡ Streak Restored!`,
        badgeIcon: "🔥",
        description: `Awesome job! You studied a topic and completed a quiz today, unlocking a bonus of <strong>${reward} XP</strong>!`,
        footer: `Maintain your streak tomorrow`
      });
    });
  }
};
