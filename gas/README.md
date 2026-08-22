# Panduan Backend Google Apps Script & Google Sheets - Sahabat Jariyah

Aplikasi **Sahabat Jariyah** telah dirancang untuk dapat menggunakan Google Spreadsheet sebagai database real-time tanpa biaya hosting server (100% Free & Serverless).

---

## Langkah 1: Buat Google Spreadsheet Baru
1. Kunjungi [https://sheets.new](https://sheets.new) pada peramban web Anda.
2. Beri nama spreadsheet, contoh: `Database Sahabat Jariyah`.

---

## Langkah 2: Pasang Google Apps Script
1. Di Google Spreadsheet, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus seluruh isi default file `Code.gs`.
3. Salin dan tempel (Paste) seluruh isi file `gas/Code.gs` dari proyek ini ke editor Apps Script.
4. Klik ikon **Save (Simpan / Ctrl+S)**.

---

## Langkah 3: Deploy sebagai Web App
1. Klik tombol **Deploy (Terapkan)** di pojok kanan atas > pilih **New Deployment (Penerapan Baru)**.
2. Klik ikon gerigi (Select type) > pilih **Web App**.
3. Isi konfigurasi berikut:
   - **Description**: `Sahabat Jariyah Webhook API v1.0`
   - **Execute as**: `Me (email@gmail.com)`
   - **Who has access**: `Anyone (Siapa saja, bahkan anonim)` *(Wajib agar aplikasi web dapat mengirim donasi tanpa login Google)*
4. Klik **Deploy**.
5. Berikan izin otorisasi akses Google jika diminta (*Review Permissions > Advanced > Go to Untitled project (unsafe) > Allow*).
6. **Salin Web App URL** yang berakhiran `/exec`.

---

## Langkah 4: Hubungkan ke Aplikasi Sahabat Jariyah
1. Buka aplikasi Sahabat Jariyah.
2. Masuk ke menu **Portal Pengelola (Admin)** (PIN default: `123456`).
3. Buka tab **Google Apps Script & DB**.
4. Tempel URL Web App ke kolom **Google Apps Script Webhook URL**, lalu klik **Uji Koneksi & Simpan**.
5. Klik tombol **Sinkronisasi Data ke Google Sheets** untuk membuat seluruh sheet dan tabel otomatis!

---

## Fitur yang Otomatis Tersedia:
- **Sheet `Settings`**: Pengaturan nama, logo, tagline, kontak, dan rekening bank.
- **Sheet `Campaigns`**: Seluruh data program donasi/wakaf, target, dan kabar terbaru.
- **Sheet `Donations`**: Riwayat transaksi, status pembayaran, kode unik, dan doa donatur.
- **Sheet `Disbursements`**: Laporan transparansi penyaluran dana dengan foto bukti & nota kwitansi.
- **Sheet `Prayers`**: Dinding doa donatur.
