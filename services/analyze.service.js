const config = require("../config");
const { AppError } = require("../utils/errors");
const { validateUrl } = require("./urlValidator.service");
const { detectPlatform } = require("./platformDetector.service");
const { findProvider } = require("../providers");
const { ProviderError } = require("../providers/BaseProvider");

async function analyze(rawUrl) {
  const v = validateUrl(rawUrl, { maxLength: config.maxUrlLength });
  const platform = detectPlatform(v.hostname);
  const base = { url: v.url, hostname: v.hostname, platform, supported: false };

  if (!platform)
    return { status: "platform_unknown", message: "Domain tidak dikenali sebagai platform yang diketahui.", data: base };

  const provider = findProvider(platform.id);
  if (!provider)
    return {
      status: "provider_not_configured",
      message: `${platform.name} terdeteksi, tetapi provider untuk platform ini belum dikonfigurasi.`,
      data: base
    };

  try {
    const media = await provider.analyze(v.url, { platform });
    return { status: "analyzed", message: "Analisis selesai.", data: { ...base, supported: true, provider: provider.id, media } };
  } catch (err) {
    if (err instanceof ProviderError) throw new AppError(502, "PROVIDER_FAILED", err.message, "analysis_failed");
    throw err;
  }
}

module.exports = { analyze };
