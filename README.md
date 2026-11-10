# DOWNORA (frontend + backend terintegrasi)

Satu proyek Node.js: backend Express menyajikan API **dan** frontend Blue Glass Studio dari satu origin.

## Struktur
```
package.json  server.js  app.js     titik masuk dan rakitan Express
config/ routes/ controllers/ services/ providers/ middleware/ utils/   backend
public/index.html                   frontend (desain, navigasi, tema: tidak diubah)
public/config.js                    konfigurasi API_BASE frontend
tests/                              unit.test.js (tanpa dependency), api.test.js
docs/BACKEND.md                     dokumentasi backend asli (Termux, Render, keamanan provider)
.env.example                        contoh environment variables
```

## Status jujur
- Diimplementasikan tetapi perlu diuji lokal: validasi URL, deteksi platform, `POST /api/analyze`, rate limit, CORS, dan penyajian frontend.
- Validasi URL menolak IP literal dan hostname internal yang umum. SSRF guard DNS tersedia sebagai helper, tetapi provider wajib memanggilnya sebelum request keluar, melakukan DNS pinning, dan memvalidasi redirect. Karena belum ada provider aktif, perlindungan request outbound belum dapat dianggap teruji.
- **Belum ada downloader.** Registry provider kosong, jadi platform yang dikenali (mis. YouTube) menghasilkan `provider_not_configured`. Tidak ada hasil media atau unduhan palsu.
- Belum diuji end-to-end: tes API (`npm test`) butuh `npm install` yang belum bisa dijalankan di lingkungan pembuatan proyek ini. Jalankan sendiri langkah di bawah.

## Jalankan di Android (Termux)
```bash
pkg update && pkg upgrade -y
pkg install nodejs unzip -y
termux-setup-storage
cd ~/storage/downloads && unzip DOWNORA-integrated.zip -d ~ && cd ~/downora
npm install
cp .env.example .env
npm run test:unit && npm test
npm start
```
Lalu buka `http://127.0.0.1:3000` di browser HP. Frontend dan API berjalan dari alamat yang sama, jadi tidak perlu mengatur `API_BASE` atau CORS.
Cek API: `curl http://127.0.0.1:3000/api/health`

## Deploy (Render, satu layanan untuk frontend + API)
1. Push folder ini ke GitHub (jangan commit `.env`).
2. Render: New Web Service. Build `npm install`, Start `npm start`.
3. Environment: `NODE_ENV=production`, `TRUST_PROXY=1`, `RATE_LIMIT_WINDOW_MS=60000`, `RATE_LIMIT_MAX=20`. `CORS_ORIGINS` dikosongkan.
4. Setelah deploy, buka `https://URL-RENDER/api/health`, lalu buka `https://URL-RENDER/` dan coba Analyze Link.

Jika frontend ingin di-host terpisah: isi `API_BASE` di `public/config.js` dengan URL backend HTTPS. Pada backend, isi `CORS_ORIGINS` dengan origin frontend. Jika halaman frontend ini tetap disajikan oleh backend tetapi memanggil API eksternal, isi `CSP_CONNECT_ORIGINS` dengan origin API eksternal. Jika frontend benar-benar di-host pada domain lain, kebijakan CSP juga harus mengizinkan API backend pada hosting frontend tersebut.

## Menambah provider
Lihat `providers/BaseProvider.js` dan bagian "Keamanan provider" di `docs/BACKEND.md`. Sebelum request jaringan, provider wajib memanggil `assertPublicHost()`; mengikat koneksi ke IP yang telah diverifikasi (DNS pinning); memvalidasi setiap redirect; serta membatasi waktu dan ukuran respons. Helper DNS saja tidak mencegah DNS rebinding jika koneksi kemudian melakukan resolusi ulang.
