# Catatan audit DOWNORA

## Perubahan pada paket ini
- Menghapus peringatan server yang keliru menyatakan CORS wajib untuk semua deployment. Frontend dan API satu origin tidak memerlukan CORS.
- Menambahkan `CSP_CONNECT_ORIGINS` untuk mengizinkan origin API eksternal pada Content-Security-Policy ketika `API_BASE` tidak kosong.
- Menambahkan tes API untuk header CSP, Referrer-Policy, dan penyajian frontend.
- Memperjelas status SSRF: helper DNS tersedia, tetapi provider masa depan tetap harus melakukan DNS pinning dan memvalidasi redirect.

## Batas verifikasi
- Tes unit dapat dijalankan tanpa dependency eksternal.
- Tes API memerlukan `npm install` karena Express, cors, dotenv, dan express-rate-limit belum termasuk dalam ZIP.
- Integrasi end-to-end belum dinyatakan lulus sampai `npm install`, `npm test`, server lokal, dan uji browser benar-benar dijalankan.
- Belum ada provider downloader. `provider_not_configured` adalah hasil yang diharapkan untuk platform yang belum diintegrasikan.

## Pengaturan API eksternal
Jika halaman frontend yang disajikan backend memakai `API_BASE` ke origin lain, tambahkan origin API yang sama ke `CSP_CONNECT_ORIGINS` pada backend. Jika frontend di-host terpisah, kebijakan CSP harus dikonfigurasi pada hosting frontend, bukan hanya backend.
