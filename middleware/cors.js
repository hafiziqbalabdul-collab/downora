const cors = require("cors");

/** Hanya origin yang terdaftar di CORS_ORIGINS yang diizinkan browser. Request tanpa Origin (curl, server) lolos. */
module.exports = origins => cors({
  origin(origin, cb) { cb(null, !origin || origins.includes(origin)); },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 600
});
