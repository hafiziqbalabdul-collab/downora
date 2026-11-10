const net = require("net");
const { AppError } = require("../utils/errors");

const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".lan", ".home", ".corp", ".intranet"];
const bad = (code, msg) => new AppError(400, code, msg, "invalid_url");

/**
 * Validasi dan normalisasi URL dari pengguna.
 * Hanya http/https, tanpa kredensial, tanpa IP literal, tanpa host internal, hanya port 80/443.
 */
function validateUrl(input, { maxLength = 2048 } = {}) {
  if (typeof input !== "string" || input.trim() === "") throw bad("URL_REQUIRED", "URL wajib diisi.");
  const raw = input.trim();
  if (raw.length > maxLength) throw bad("URL_INVALID", "URL terlalu panjang.");

  let u;
  try { u = new URL(raw); } catch { throw bad("URL_INVALID", "Format URL tidak valid."); }

  if (u.protocol !== "http:" && u.protocol !== "https:")
    throw bad("URL_PROTOCOL_UNSUPPORTED", "Hanya URL http:// atau https:// yang diterima.");
  if (u.username || u.password) throw bad("URL_INVALID", "URL tidak boleh berisi username atau password.");

  const hostname = u.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (!hostname) throw bad("URL_INVALID", "Hostname tidak ditemukan.");

  if (net.isIP(hostname)) throw bad("URL_HOST_BLOCKED", "Alamat IP langsung tidak diterima.");
  if (hostname === "localhost" || !hostname.includes(".") || BLOCKED_SUFFIXES.some(s => hostname.endsWith(s)))
    throw bad("URL_HOST_BLOCKED", "Hostname ini tidak diizinkan.");
  if (u.port && u.port !== "80" && u.port !== "443") throw bad("URL_HOST_BLOCKED", "Port ini tidak diizinkan.");

  return { url: u.href, hostname, protocol: u.protocol };
}

module.exports = { validateUrl };
