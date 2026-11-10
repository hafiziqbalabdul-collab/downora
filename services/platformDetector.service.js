/** Daftar domain yang DIKENALI. Dikenali tidak berarti didukung: dukungan ditentukan oleh provider. */
const PLATFORMS = [
  { id: "instagram", name: "Instagram", domains: ["instagram.com"] },
  { id: "tiktok", name: "TikTok", domains: ["tiktok.com"] },
  { id: "youtube", name: "YouTube", domains: ["youtube.com", "youtu.be"] },
  { id: "facebook", name: "Facebook", domains: ["facebook.com", "fb.watch"] },
  { id: "x", name: "X / Twitter", domains: ["x.com", "twitter.com"] },
  { id: "pinterest", name: "Pinterest", domains: ["pinterest.com", "pin.it"] },
  { id: "threads", name: "Threads", domains: ["threads.net", "threads.com"] }
];

/** Cocokkan hostname persis atau subdomain sebenarnya (bukan sekadar substring). */
function detectPlatform(hostname) {
  const h = String(hostname || "").toLowerCase().replace(/\.$/, "");
  for (const p of PLATFORMS)
    for (const d of p.domains)
      if (h === d || h.endsWith("." + d)) return { id: p.id, name: p.name };
  return null;
}

module.exports = { PLATFORMS, detectPlatform };
