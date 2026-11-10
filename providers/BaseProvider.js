/** Error yang aman ditampilkan ke pengguna dari sebuah provider. */
class ProviderError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

/**
 * Antarmuka adapter platform. Satu provider bisa melayani satu atau beberapa platform.
 *
 * analyze(url, { platform }) harus mengembalikan:
 * {
 *   title, author, thumbnail, durationSeconds,
 *   formats: [{ id, label, type: "video"|"audio"|"image", quality, container, sizeBytes }]
 * }
 * Aturan: hanya konten yang boleh diakses secara sah. Jangan melewati login, akun privat, DRM, atau
 * pembatasan akses. Panggil assertPublicHost() sebelum request keluar. Lempar ProviderError jika gagal.
 */
class BaseProvider {
  constructor({ id, platforms }) { this.id = id; this.platforms = platforms; }
  supports(platformId) { return this.platforms.includes(platformId); }
  async analyze(/* url, context */) { throw new Error(`${this.id}: analyze() belum diimplementasikan`); }
}

module.exports = { BaseProvider, ProviderError };
