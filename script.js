/**
 * Coordinator script.js (Upgraded)
 * Initializes router routes, binds theme click togglers,
 * and synchronizes sidebar stats.
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { ui } from "./js/ui.js";
import { gamification } from "./js/gamification.js";

// Import Upgraded Views
import { homeView } from "./js/views/homeView.js";
import { learnView } from "./js/views/learnView.js";
import { notesView } from "./js/views/notesView.js";
import { pdfView } from "./js/views/pdfView.js";
import { quizView } from "./js/views/quizView.js";
import { dashboardView } from "./js/views/dashboardView.js";
import { settingsView } from "./js/views/settingsView.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize UI core handlers (Toasts, mobile hamburger overlay drawer)
  ui.init();

  // 2. Run consecutive login streak analysis
  gamification.updateStreak();

  // 3. Unlock initial badge reward
  gamification.unlockBadge("welcome");

  // 4. Register routing maps
  router.addRoute("home", () => {
    updateActiveSidebarLink("home");
    homeView.render();
  });

  router.addRoute("learn", (params) => {
    updateActiveSidebarLink("learn");
    learnView.render(params);
  });

  router.addRoute("notes", () => {
    updateActiveSidebarLink("notes");
    notesView.render();
  });

  router.addRoute("pdf", () => {
    updateActiveSidebarLink("pdf");
    pdfView.render();
  });

  router.addRoute("quiz", (params) => {
    updateActiveSidebarLink("quiz");
    quizView.render(params);
  });

  router.addRoute("dashboard", () => {
    updateActiveSidebarLink("dashboard");
    dashboardView.render();
  });

  router.addRoute("settings", () => {
    updateActiveSidebarLink("settings");
    settingsView.render();
  });

  // 5. Initial stats synchronization
  syncSidebarUserStats(store.getState());

  // 6. Listen to state store changes to refresh sidebar panels
  store.subscribe((state) => {
    syncSidebarUserStats(state);
    
    // Refresh currently visible dashboard/settings state if active
    const activeHash = window.location.hash.slice(1) || "home";
    const [path] = activeHash.split("?");
    
    if (path === "dashboard") {
      dashboardView.render();
    } else if (path === "settings") {
      settingsView.render();
    }
  });

  // 7. Initialize router
  router.init();

  // 8. Bind theme switches
  bindThemeToggles();
});

// ----------------------------------------------------
// UI Syncing & Binding Helpers
// ----------------------------------------------------
function syncSidebarUserStats(state) {
  const usernameTag = document.getElementById("sidebar-username");
  const streakTag = document.getElementById("sidebar-streak-val");
  const levelTag = document.getElementById("sidebar-level-val");
  const xpTag = document.getElementById("sidebar-xp-val");

  if (usernameTag) usernameTag.textContent = state.profile.name;
  if (streakTag) streakTag.textContent = state.profile.streak;
  if (levelTag) levelTag.textContent = `Lvl ${state.profile.level}`;
  if (xpTag) xpTag.textContent = `${state.profile.xp.toLocaleString()} XP`;
}

function updateActiveSidebarLink(route) {
  document.querySelectorAll("#sidebar-nav-menu .nav-link").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${route}`) {
      link.classList.add("active");
    }
  });
}

function bindThemeToggles() {
  const sidebarToggle = document.getElementById("btn-sidebar-theme-toggle");
  const mobileToggle = document.getElementById("btn-mobile-theme-toggle");

  const clickHandler = () => {
    ui.toggleTheme();
  };

  if (sidebarToggle) sidebarToggle.addEventListener("click", clickHandler);
  if (mobileToggle) mobileToggle.addEventListener("click", clickHandler);
}
