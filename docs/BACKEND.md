> Catatan: ini README backend asli dari ZIP. Pada proyek terintegrasi, frontend ada di `public/` dan `API_BASE` diatur di `public/config.js`. Panduan utama ada di `README.md` (root).

# DOWNORA Backend Foundation

Backend Node.js/Express untuk menerima URL, memvalidasi input, mendeteksi platform, dan menyiapkan kontrak adapter provider. **Paket ini belum mengunduh media**: registry provider sengaja kosong sampai integrasi yang sah ditambahkan.

## Persyaratan
- Node.js 18 atau lebih baru
- npm

## Menjalankan di Android (Termux)
1. Instal Termux dari F-Droid atau GitHub resmi.
2. Buka Termux dan jalankan:
   ```bash
   pkg update && pkg upgrade -y
   pkg install nodejs git unzip -y
   termux-setup-storage
   ```
3. Simpan `downora-backend.zip` di folder Download Android.
4. Jalankan:
   ```bash
   cd ~/storage/downloads
   unzip downora-backend.zip -d ~
   cd ~/downora-backend
   npm install
   cp .env.example .env
   npm run test:unit
   npm test
   npm start
   ```
5. Buka sesi Termux kedua lalu tes:
   ```bash
   curl http://127.0.0.1:3000/api/health
   ```
   Server lokal hanya bisa diakses di HP itu sendiri kecuali kamu mengatur jaringan/hosting secara khusus.

## Endpoint
- `GET /api/health` — pemeriksaan kesehatan server.
- `POST /api/analyze` — body JSON `{ "url": "https://..." }`.

Contoh:
```bash
curl -X POST http://127.0.0.1:3000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=example"}'
```

Respons `provider_not_configured` berarti domain dikenali, tetapi belum ada integrasi provider. Itu bukan error palsu dan bukan hasil download.

## Konfigurasi frontend
File `frontend/index.html` menggunakan `window.DOWNORA_CONFIG.API_BASE`. Setelah backend di-deploy, isi nilai itu dengan URL HTTPS backend, tanpa slash di akhir. Jangan gunakan `localhost` untuk website publik.

Contoh:
```js
window.DOWNORA_CONFIG = { API_BASE: "https://URL-BACKEND-KAMU" };
```

Atur `CORS_ORIGINS` pada backend ke origin frontend yang tepat, misalnya `https://nama-situs.netlify.app` (tanpa path dan tanpa slash akhir).

## Deploy ke Render
1. Push folder backend ini ke repository GitHub.
2. Buat Web Service baru di Render dan hubungkan repository.
3. Root Directory: kosongkan jika repository berisi isi folder backend di root; jika backend berada di subfolder, isi path subfolder tersebut.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment variables:
   - `NODE_ENV=production`
   - `TRUST_PROXY=1`
   - `CORS_ORIGINS=https://ORIGIN-FRONTEND-KAMU`
   - `RATE_LIMIT_WINDOW_MS=60000`
   - `RATE_LIMIT_MAX=20`
7. Setelah deploy, uji `https://URL-BACKEND/api/health`.
8. Masukkan URL backend HTTPS ke `API_BASE` frontend, lalu deploy ulang frontend.

## Keamanan provider
Saat provider mulai melakukan request jaringan, wajib memanggil `assertPublicHost()` sebelum koneksi keluar, mengikat koneksi ke IP yang sudah divalidasi (DNS pinning), memvalidasi ulang setiap redirect, membatasi ukuran dan waktu request, serta tidak mengakses URL privat/internal. Jangan pernah menganggap validasi URL saja cukup untuk mencegah SSRF.

## Catatan
- CORS bukan autentikasi. Untuk layanan publik, tambahkan abuse monitoring dan batas penggunaan yang sesuai.
- `TRUST_PROXY=1` hanya cocok untuk satu proxy tepercaya di depan aplikasi; sesuaikan dengan infrastruktur hosting.
- Jangan commit file `.env` atau API secret.
- Gunakan provider/API yang memiliki izin dan patuhi hak cipta serta ketentuan platform. Jangan melewati login, konten privat, DRM, atau pembatasan akses.
