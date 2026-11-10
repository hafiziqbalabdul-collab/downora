const path = require("path");
const express = require("express");
const baseConfig = require("./config");
const corsMiddleware = require("./middleware/cors");
const rateLimiter = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const analyzeRoutes = require("./routes/analyze.routes");

function createApp(overrides = {}) {
  const cfg = { ...baseConfig, ...overrides, rateLimit: { ...baseConfig.rateLimit, ...(overrides.rateLimit || {}) } };
  const app = express();

  app.disable("x-powered-by");
  if (cfg.trustProxy) app.set("trust proxy", cfg.trustProxy);
  app.use((req, res, next) => {
    res.set({ "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" });
    next();
  });
  app.use(corsMiddleware(cfg.corsOrigins));
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true, status: "ok", message: "DOWNORA backend berjalan." }));
  app.use("/api/analyze", rateLimiter(cfg.rateLimit), analyzeRoutes);

  // Frontend statis (public/). Satu origin dengan API, jadi tidak butuh CORS untuk penggunaan standar.
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api/")) {
      const extraConnectOrigins = (cfg.cspConnectOrigins || []).join(" ");
      res.set("Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; " +
        `connect-src 'self' ${extraConnectOrigins}; frame-ancestors 'none'; base-uri 'none'`);
      res.set("Referrer-Policy", "no-referrer");
    }
    next();
  });
  app.use(express.static(path.join(__dirname, "public"), {
    index: "index.html", dotfiles: "ignore",
    setHeaders: res => res.set("Cache-Control", "no-cache")
  }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
