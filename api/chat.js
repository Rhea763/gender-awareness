const { callDeepSeekChat } = require("../lib/deepseek-chat");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  let payload = req.body;
  if (!payload || typeof payload !== "object") {
    try {
      payload = JSON.parse(req.body || "{}");
    } catch {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  try {
    const reply = await callDeepSeekChat(messages);
    return res.status(200).json({ reply });
  } catch (err) {
    if (err.code === "MISSING_API_KEY") {
      return res.status(500).json({ error: "Server API key not configured." });
    }
    if (err.code === "INVALID_MESSAGES") {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === "UPSTREAM_ERROR") {
      return res.status(err.status || 502).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || "Server error." });
  }
};
