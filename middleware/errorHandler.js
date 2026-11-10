const { AppError } = require("../utils/errors");
const { fail } = require("../utils/response");

const notFound = (req, res) => res.status(404).json(fail("not_found", "NOT_FOUND", "Endpoint tidak ditemukan."));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json(fail("invalid_json", "JSON_INVALID", "Body harus berupa JSON yang valid."));
  if (err.type === "entity.too.large") return res.status(413).json(fail("invalid_json", "BODY_TOO_LARGE", "Body terlalu besar."));
  if (err instanceof AppError) return res.status(err.httpStatus).json(fail(err.key, err.code, err.message));
  console.error(err);
  res.status(500).json(fail("analysis_failed", "INTERNAL_ERROR", "Terjadi kesalahan pada server."));
};

module.exports = { notFound, errorHandler };
