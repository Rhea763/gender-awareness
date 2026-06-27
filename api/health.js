const { hasApiKey } = require("../lib/deepseek-chat");

module.exports = function handler(req, res) {
  const ok = hasApiKey();
  return res.status(200).json({ ok });
};
