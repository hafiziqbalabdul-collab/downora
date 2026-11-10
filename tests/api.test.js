const test = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const { createApp } = require("../app");
const registry = require("../providers");
const { BaseProvider, ProviderError } = require("../providers/BaseProvider");

const ORIGIN = "http://localhost:5500";
let server, base;

test.before(async () => {
  const app = createApp({ corsOrigins: [ORIGIN], rateLimit: { windowMs: 60000, max: 1000 } });
  server = await new Promise(r => { const s = app.listen(0, () => r(s)); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => new Promise(r => server.close(r)));

const post = (body, headers = {}, url = base) => fetch(url + "/api/analyze", {
  method: "POST", headers: { "Content-Type": "application/json", ...headers },
  body: typeof body === "string" ? body : JSON.stringify(body)
});

test("health check", async () => {
  const r = await fetch(base + "/api/health");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
});

test("URL valid, domain tidak dikenal", async () => {
  const r = await post({ url: "https://example.com/media" });
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.equal(j.status, "platform_unknown");
  assert.equal(j.data.supported, false);
  assert.equal(j.data.platform, null);
});

test("domain platform dikenali tetapi belum ada provider", async () => {
  const r = await post({ url: "https://www.youtube.com/watch?v=abc" });
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.equal(j.status, "provider_not_configured");
  assert.equal(j.data.platform.id, "youtube");
  assert.equal(j.data.supported, false);
});

test("URL kosong atau field tidak ada", async () => {
  for (const body of [{ url: "" }, {}]) {
    const r = await post(body);
    const j = await r.json();
    assert.equal(r.status, 400);
    assert.equal(j.status, "invalid_url");
    assert.equal(j.error.code, "URL_REQUIRED");
  }
});

test("URL tidak valid, host terblokir, dan JSON rusak", async () => {
  let r = await post({ url: "bukan url" });
  assert.equal((await r.json()).error.code, "URL_INVALID");
  r = await post({ url: "http://127.0.0.1/admin" });
  assert.equal((await r.json()).error.code, "URL_HOST_BLOCKED");
  r = await post("{rusak");
  const j = await r.json();
  assert.equal(r.status, 400);
  assert.equal(j.status, "invalid_json");
});

test("kontrak provider: hasil sukses, ProviderError, dan error tak terduga", async () => {
  class Fixture extends BaseProvider {
    constructor() { super({ id: "test-fixture", platforms: ["youtube"] }); this.mode = "ok"; }
    async analyze() {
      if (this.mode === "provider") throw new ProviderError("X", "Konten tidak dapat diakses.");
      if (this.mode === "crash") throw new Error("rahasia internal");
      return { title: "Fixture uji", formats: [] };
    }
  }
  const p = registry.register(new Fixture());
  const originalError = console.error;
  console.error = () => {};
  try {
    let r = await post({ url: "https://youtu.be/abc" });
    let j = await r.json();
    assert.equal(j.status, "analyzed");
    assert.equal(j.data.provider, "test-fixture");

    p.mode = "provider";
    r = await post({ url: "https://youtu.be/abc" }); j = await r.json();
    assert.equal(r.status, 502);
    assert.equal(j.status, "analysis_failed");
    assert.equal(j.error.code, "PROVIDER_FAILED");

    p.mode = "crash";
    r = await post({ url: "https://youtu.be/abc" }); j = await r.json();
    assert.equal(r.status, 500);
    assert.ok(!JSON.stringify(j).includes("rahasia"));
  } finally { console.error = originalError; registry.unregister(p); }
});

test("CORS hanya untuk origin terdaftar", async () => {
  let r = await post({ url: "https://example.com" }, { Origin: ORIGIN });
  assert.equal(r.headers.get("access-control-allow-origin"), ORIGIN);
  r = await post({ url: "https://example.com" }, { Origin: "https://evil.example" });
  assert.equal(r.headers.get("access-control-allow-origin"), null);
});

test("rate limit mengembalikan 429 dengan format konsisten", async () => {
  const s = await new Promise(r => { const x = createApp({ rateLimit: { windowMs: 60000, max: 2 } }).listen(0, () => r(x)); });
  const u = `http://127.0.0.1:${s.address().port}`;
  try {
    await post({ url: "https://example.com" }, {}, u);
    await post({ url: "https://example.com" }, {}, u);
    const r = await post({ url: "https://example.com" }, {}, u);
    assert.equal(r.status, 429);
    assert.equal((await r.json()).status, "rate_limited");
  } finally { await new Promise(r => s.close(r)); }
});

test("frontend disajikan dengan CSP dan origin API eksternal yang dikonfigurasi", async () => {
  const externalApi = "https://api.example.net";
  const s = await new Promise(r => {
    const x = createApp({ cspConnectOrigins: [externalApi] }).listen(0, () => r(x));
  });
  try {
    const response = await fetch(`http://127.0.0.1:${s.address().port}/`);
    const csp = response.headers.get("content-security-policy") || "";
    assert.equal(response.status, 200);
    assert.ok(csp.includes("connect-src 'self'"));
    assert.ok(csp.includes(externalApi));
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  } finally { await new Promise(r => s.close(r)); }
});

test("backend tidak tersedia: fetch ke port tertutup gagal (dasar status 'Server unavailable' di frontend)", async () => {
  const port = await new Promise(r => { const t = net.createServer().listen(0, () => { const p = t.address().port; t.close(() => r(p)); }); });
  await assert.rejects(() => post({ url: "https://example.com" }, {}, `http://127.0.0.1:${port}`));
});
