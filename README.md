<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg">
    <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Dompetulun">
  </picture>
</p>

<h1 align="center">Dompetulun</h1>

<p align="center">
  Aplikasi pencatatan keuangan pribadi — catat pemasukan & pengeluaran, pantau anggaran, lacak tagihan, dan raih tujuan finansial.
  <br>
  Dibangun dengan <strong>Laravel 12</strong>, <strong>Inertia.js</strong>, dan <strong>React</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-red?logo=laravel" alt="Laravel 12">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Inertia.js-2.0-purple" alt="Inertia.js 2.0">
  <img src="https://img.shields.io/badge/SQLite-003B57?logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

---

## ✨ Fitur

| Fitur | Deskripsi |
|---|---|
| **Dashboard** | Ringkasan cepat: saldo, pemasukan, pengeluaran, rasio tabungan, tagihan jatuh tempo, anggaran mendekati batas |
| **Transaksi** | Catat pemasukan & pengeluaran dengan kategori, dompet, label, dan upload struk |
| **Dompet** | Kelola multiple dompet (tunai, bank, e-wallet) dengan saldo otomatis |
| **Kategori & Label** | Atur transaksi dengan kategori bawaan dan label kustom |
| **Anggaran (Budget)** | Buat anggaran per kategori, pantau budget vs realisasi, multi-month report |
| **Tagihan Berulang** | Catat tagihan bulanan, tandai sudah dibayar, riwayat pembayaran |
| **Aset & Kekayaan Bersih** | Catat aset (tanah, kendaraan, investasi, dll) dan pantau net worth |
| **Hutang** | Catat hutang & piutang dengan进度 pembayaran |
| **Tujuan (Goals)** | Tetapkan target finansial, atur aturan funding otomatis (persentase, roundup, fixed) |
| **Wawasan Finansial** | Skor kesehatan keuangan, tips cerdas, tren 6 bulan, perbandingan MoM |
| **Kalender** | Lihat transaksi harian dalam tampilan kalender |
| **Galeri Struk** | Upload & lihat struk belanja dari setiap transaksi |
| **Laporan (Reports)** | Laporan pemasukan/pengeluaran per periode, filter kategori & dompet |
| **Ekspor** | Export data ke CSV & PDF |
| **Multi-perangkat** | Akses dari mana saja via browser (Inertia SPA) |

## 🧰 Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend** | Laravel 12, PHP 8.4 |
| **Frontend** | React 19, Inertia.js 2, Tailwind CSS |
| **Database** | SQLite |
| **Charts** | Recharts |
| **Animasi** | Framer Motion |
| **Notifikasi** | react-hot-toast |
| **Ikon** | Lucide React |
| **CSS Framework** | Sneat Bootstrap Template |

## 📸 Screenshots

> *(tangkapan layar akan ditambahkan)*

| Dashboard | Transaksi |
|---|---|
| ![Dashboard](https://via.placeholder.com/400x250?text=Dashboard) | ![Transaksi](https://via.placeholder.com/400x250?text=Transaksi) |

| Wawasan Finansial | Anggaran |
|---|---|
| ![Wawasan](https://via.placeholder.com/400x250?text=Insights) | ![Anggaran](https://via.placeholder.com/400x250?text=Budget) |

## ⚙️ Instalasi

```bash
# Clone repositori
git clone https://github.com/username/dompetulun.git
cd dompetulun

# Install dependensi PHP
composer install

# Install dependensi frontend
npm install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Buat database SQLite
touch database/database.sqlite

# Jalankan migrasi + seeder
php artisan migrate --seed

# Build aset frontend
npm run build

# Jalankan development server
php artisan serve
```

## 🚀 Pengembangan

```bash
# Jalankan Vite dev server (hot reload)
npm run dev

# Jalankan app di terminal lain
php artisan serve
```

## 🧪 Testing

```bash
# Jalankan semua test
php artisan test

# Test spesifik
php artisan test --filter=NewFeaturesTest
```

```bash
# Coverage (Xdebug required)
php artisan test --coverage
```

## 📁 Struktur Direktori

```
app/
├── Http/
│   ├── Controllers/     # Controller untuk setiap fitur
│   ├── Middleware/       # SecurityHeaders, throttle
│   └── Requests/        # Form request validation
├── Models/               # Eloquent models
├── Services/
│   └── FundingProcessor.php  # Auto-funding engine
└── ...
database/
├── factories/            # Model factories (9 factory)
├── migrations/           # Schema database
└── seeders/              # Data awal
resources/js/
├── Components/           # Shared React components
├── Layouts/              # App layout, sidebar
└── Pages/                # Halaman (Inertia)
routes/
└── web.php               # Semua route aplikasi
tests/
└── Feature/              # Feature tests (30+ tests)
```

## 🛡️ Keamanan

- **Autorisasi** — Setiap operasi update/delete memverifikasi kepemilikan data (owner check)
- **Rate Limiting** — 120 request/menit untuk semua route auth
- **Security Headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Input Sanitasi** — strip_tags() + validasi diperkuat di semua form request

## 📜 License

MIT — silakan gunakan, modifikasi, dan sebarkan.

---

<p align="center">
  Dibuat dengan ❤️ untuk mengelola keuangan pribadi lebih baik.
</p>
