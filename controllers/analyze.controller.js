const analyzeService = require("../services/analyze.service");
const { ok } = require("../utils/response");

async function analyze(req, res, next) {
  try {
    const result = await analyzeService.analyze(req.body && req.body.url);
    res.json(ok(result.status, result.message, result.data));
  } catch (err) { next(err); }
}

module.exports = { analyze };
