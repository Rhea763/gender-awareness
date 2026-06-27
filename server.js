const http = require("http");
const fs = require("fs");
const path = require("path");
const { callDeepSeekChat, hasApiKey } = require("./lib/deepseek-chat");

const PORT = 3789;
const ROOT = __dirname;

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png"
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(body));
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/guide-chat.html";

  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
  if (ext === ".html") headers["Cache-Control"] = "no-store";
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

async function handleChat(req, res) {
  loadEnv();

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body." });
    return;
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  try {
    const reply = await callDeepSeekChat(messages);
    sendJson(res, 200, { reply });
  } catch (err) {
    if (err.code === "MISSING_API_KEY") {
      sendJson(res, 500, { error: "Server API key not configured." });
      return;
    }
    if (err.code === "INVALID_MESSAGES") {
      sendJson(res, 400, { error: err.message });
      return;
    }
    if (err.code === "UPSTREAM_ERROR") {
      sendJson(res, err.status || 502, { error: err.message });
      return;
    }
    sendJson(res, 500, { error: err.message || "Server error." });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/health") {
    loadEnv();
    sendJson(res, 200, { ok: hasApiKey() });
    return;
  }
  if (req.url === "/api/chat") {
    await handleChat(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log("Random Identity local server: http://localhost:" + PORT + "/guide-chat.html");
  if (!hasApiKey()) {
    console.log("Warning: DEEPSEEK_API_KEY not set. Copy .env.example to .env");
  }
});
