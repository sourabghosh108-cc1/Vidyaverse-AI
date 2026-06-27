/**
 * Hash-based Router for Vidyaverse AI (Upgraded)
 * Connects hash endpoints to active CSS layouts and view managers.
 */

class Router {
  constructor() {
    this.routes = {};
    window.addEventListener("hashchange", () => this.handleHashChange());
  }

  /**
   * Registers a route mapping
   * @param {string} hash 
   * @param {function} renderCallback 
   */
  addRoute(hash, renderCallback) {
    this.routes[hash] = renderCallback;
  }

  navigate(routeString) {
    window.location.hash = routeString;
  }

  handleHashChange() {
    let hash = window.location.hash.slice(1) || "home";
    
    // Redirect old routes to their upgraded equivalents
    if (hash === "landing" || hash === "") {
      hash = "home";
    }

    // Parse params (e.g. learn?query=electrostatics)
    const [path, queryString] = hash.split("?");
    const params = {};
    
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }

    // Hide all view panels
    document.querySelectorAll(".view-panel").forEach(panel => {
      panel.classList.remove("active");
    });

    if (this.routes[path]) {
      const targetPanel = document.getElementById(`view-${path}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
      
      this.routes[path](params);
      window.scrollTo(0, 0);
    } else {
      this.navigate("home");
    }
  }

  init() {
    this.handleHashChange();
  }
}

export const router = new Router();
