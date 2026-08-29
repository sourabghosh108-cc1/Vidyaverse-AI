/**
 * Vidyaverse AI - Local Node.js Development Server
 * Pure Node.js (zero external dependencies required).
 * Serves static frontend assets & routes /api/* endpoints locally.
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8000;

// Load local .env file if present
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [k, ...v] = trimmed.split("=");
      if (k && v.length > 0) {
        process.env[k.trim()] = v.join("=").trim();
      }
    }
  });
}

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

// Import API handlers dynamically
let chatHandler, searchHandler, youtubeHandler;
try {
  const chatMod = await import("./api/chat.js");
  chatHandler = chatMod.default;
} catch (e) {
  console.warn("Could not load ./api/chat.js", e.message);
}

try {
  const searchMod = await import("./api/search.js");
  searchHandler = searchMod.default;
} catch (e) {
  console.warn("Could not load ./api/search.js", e.message);
}

try {
  const ytMod = await import("./api/youtube.js");
  youtubeHandler = ytMod.default;
} catch (e) {
  console.warn("Could not load ./api/youtube.js", e.message);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = parsedUrl.pathname;

  // Helper to parse JSON body
  const parseJsonBody = () =>
    new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });

  // Mock response object compatible with Vercel serverless handlers
  const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(name, val) {
      this.headers[name] = val;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      res.writeHead(this.statusCode, {
        "Content-Type": "application/json",
        ...this.headers,
      });
      res.end(JSON.stringify(data));
    },
    end(data = "") {
      res.writeHead(this.statusCode, this.headers);
      res.end(data);
    },
  };

  // Route API requests
  if (pathname === "/api/chat" && chatHandler) {
    req.body = await parseJsonBody();
    return chatHandler(req, mockRes);
  }

  if (pathname === "/api/search" && searchHandler) {
    req.body = await parseJsonBody();
    req.query = Object.fromEntries(parsedUrl.searchParams);
    return searchHandler(req, mockRes);
  }

  if (pathname === "/api/youtube" && youtubeHandler) {
    req.body = await parseJsonBody();
    req.query = Object.fromEntries(parsedUrl.searchParams);
    return youtubeHandler(req, mockRes);
  }

  // Serve static files
  if (pathname === "/" || pathname === "") {
    pathname = "/index.html";
  }

  const filePath = path.join(__dirname, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Vidyaverse AI 2.0 Local Server running at:`);
  console.log(`👉 http://localhost:${PORT}\n`);
});
