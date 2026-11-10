require("dotenv").config();

const int = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const list = v => (v || "").split(",").map(s => s.trim().replace(/\/+$/, "")).filter(Boolean);
const originList = v => list(v).flatMap(value => {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol) || u.origin !== value ||
        u.username || u.password || u.pathname !== "/" || u.search || u.hash) return [];
    return [u.origin];
  } catch { return []; }
});

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: int(process.env.PORT, 3000),
  corsOrigins: list(process.env.CORS_ORIGINS),
  cspConnectOrigins: originList(process.env.CSP_CONNECT_ORIGINS),
  trustProxy: int(process.env.TRUST_PROXY, 0),
  rateLimit: {
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 60000),
    max: int(process.env.RATE_LIMIT_MAX, 20)
  },
  maxUrlLength: 2048
};
