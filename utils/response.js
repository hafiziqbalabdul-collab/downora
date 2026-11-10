const ok = (status, message, data) => ({ ok: true, status, message, data });
const fail = (status, code, message) => ({ ok: false, status, message, error: { code, message } });
module.exports = { ok, fail };
