const test = require("node:test");
const assert = require("node:assert/strict");
const { validateUrl } = require("../services/urlValidator.service");
const { detectPlatform } = require("../services/platformDetector.service");
const { isBlockedIp } = require("../services/ssrfGuard.service");

test("URL valid dinormalisasi", () => {
  const r = validateUrl("  https://www.youtube.com/watch?v=abc  ");
  assert.equal(r.hostname, "www.youtube.com");
});

test("URL kosong atau bukan string ditolak", () => {
  for (const v of ["", "   ", undefined, null, 123])
    assert.throws(() => validateUrl(v), { code: "URL_REQUIRED" });
});

test("URL tidak valid ditolak", () => {
  for (const v of ["bukan url", "example.com/path", "http://"])
    assert.throws(() => validateUrl(v), { code: "URL_INVALID" });
});

test("protokol selain http/https ditolak", () => {
  for (const v of ["ftp://example.com/a", "javascript:alert(1)", "file:///etc/passwd"])
    assert.throws(() => validateUrl(v), { code: "URL_PROTOCOL_UNSUPPORTED" });
});

test("host internal, IP literal, dan port aneh ditolak", () => {
  for (const v of ["http://localhost/", "http://127.0.0.1/", "http://[::1]/", "http://2130706433/",
    "http://192.168.1.1/", "http://intranet.local/", "http://server/", "http://youtube.com:8080/"])
    assert.throws(() => validateUrl(v), { code: "URL_HOST_BLOCKED" }, v);
  assert.throws(() => validateUrl("http://user:pass@youtube.com/"), { code: "URL_INVALID" });
});

test("deteksi platform memakai hostname, bukan substring", () => {
  assert.equal(detectPlatform("m.youtube.com").id, "youtube");
  assert.equal(detectPlatform("youtu.be").id, "youtube");
  assert.equal(detectPlatform("TWITTER.com").id, "x");
  assert.equal(detectPlatform("youtube.com.").id, "youtube");
  assert.equal(detectPlatform("notyoutube.com"), null);
  assert.equal(detectPlatform("youtube.com.evil.com"), null);
  assert.equal(detectPlatform("example.com"), null);
});

test("SSRF guard memblokir IP privat, reserved, dan dokumentasi", () => {
  for (const ip of ["0.1.2.3", "10.0.0.1", "100.64.0.1", "172.16.0.1", "192.168.0.5",
    "127.0.0.1", "169.254.169.254", "192.0.2.1", "198.51.100.1", "203.0.113.1",
    "224.0.0.1", "::", "::1", "fe80::1", "fd00::1", "::ffff:127.0.0.1", "2001:db8::1"])
    assert.equal(isBlockedIp(ip), true, ip);
  for (const ip of ["8.8.8.8", "172.32.0.1", "2606:4700::1111"])
    assert.equal(isBlockedIp(ip), false, ip);
});
