const SYSTEM_PROMPT =
  "你是「规规」，随机身份网站里的温柔泡泡向导。用简短、友善的语气回答，帮助用户理解性别偏见与互动体验。用用户使用的语言回复。不要说教，不要透露你是 AI。";

function getApiKey() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.includes("your_deepseek") || apiKey.includes("课上老师")) {
    return null;
  }
  return apiKey;
}

function hasApiKey() {
  return !!getApiKey();
}

async function callDeepSeekChat(messages) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error("Server API key not configured.");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  if (!Array.isArray(messages) || !messages.length) {
    const err = new Error("messages array is required.");
    err.code = "INVALID_MESSAGES";
    throw err;
  }

  const upstream = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      thinking: { type: "disabled" },
      stream: false,
      temperature: 0.7
    })
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    const err = new Error(data.error?.message || "DeepSeek API error.");
    err.code = "UPSTREAM_ERROR";
    err.status = upstream.status;
    throw err;
  }

  return data.choices?.[0]?.message?.content || "";
}

module.exports = { callDeepSeekChat, hasApiKey };
