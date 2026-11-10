const rateLimit = require("express-rate-limit");
const { fail } = require("../utils/response");

module.exports = ({ windowMs, max }) => rateLimit({
  windowMs,
  limit: max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json(fail("rate_limited", "RATE_LIMITED", "Terlalu banyak permintaan. Coba lagi sebentar."))
});
