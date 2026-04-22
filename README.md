<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

# 🗺️ SiMonEv — Sistem Monitoring dan Evaluasi Program Pengentasan Kemiskinan

**SiMonEv** adalah aplikasi web berbasis **Laravel** dan **React.js** yang dirancang untuk mendigitalisasi proses penyaluran, monitoring, dan evaluasi bantuan sosial (bansos) di **Kabupaten Bandung Barat**. Sistem ini membantu pemerintah daerah dalam mengelola program pengentasan kemiskinan secara transparan, terukur, dan berbasis data.

---

## 📋 Deskripsi Aplikasi

### Latar Belakang
Program pengentasan kemiskinan seringkali menghadapi tantangan dalam hal ketepatan sasaran, transparansi distribusi, dan evaluasi efektivitas program. SiMonEv hadir untuk menjawab tantangan tersebut dengan menyediakan platform digital yang mengintegrasikan pendataan penerima, penilaian kebutuhan secara otomatis, dan monitoring penyaluran bantuan secara real-time.

### Tujuan
1. **Digitalisasi** proses pendaftaran dan verifikasi penerima bantuan sosial
2. **Otomatisasi** pencocokan (matchmaking) penerima dengan program bansos berdasarkan indikator kebutuhan
3. **Transparansi** penyaluran bantuan melalui pencatatan distribusi yang terdokumentasi
4. **Evaluasi** efektivitas program melalui dashboard KPI dan peta sebaran

### Cakupan Wilayah
Aplikasi ini difokuskan pada **Kabupaten Bandung Barat (KBB)** yang terdiri dari **16 kecamatan**:

| No | Kecamatan | No | Kecamatan |
|----|-----------|-----|-----------|
| 1 | Batujajar | 9 | Gununghalu |
| 2 | Cihampelas | 10 | Lembang |
| 3 | Cikalong Wetan | 11 | Ngamprah (Pusat Pemerintahan) |
| 4 | Cililin | 12 | Padalarang |
| 5 | Cipatat | 13 | Parongpong |
| 6 | Cipeundeuy | 14 | Rongga |
| 7 | Cipongkor | 15 | Saguling |
| 8 | Cisarua | 16 | Sindangkerta |

---

## ✨ Fitur Utama

### 1. 🔐 Manajemen Pengguna & RBAC
Sistem memiliki 3 level akses pengguna:

| Role | Hak Akses |
|------|-----------|
| **Admin Pusat** | Akses penuh: CRUD semua data, manajemen program, graduasi penerima, laporan, matchmaking batch |
| **Supervisor** | Verifikasi penerima (setuju/tolak), monitoring kinerja petugas, pengelolaan kuota |
| **Petugas Lapangan** | Input data penerima, pencatatan distribusi, kunjungan rumah, data kesehatan |

### 2. 📊 Dashboard KPI
- Statistik total penerima, dana tersalurkan, program aktif, dan tingkat graduasi
- Grafik tren penyaluran bantuan per bulan (Chart.js)
- Peta sebaran kemiskinan per kecamatan (Leaflet.js)
- Ranking kecamatan prioritas berdasarkan tingkat kemiskinan

### 3. 📝 Pendaftaran & Verifikasi Penerima
- Form multi-step (5 langkah): Data Pribadi → Pendidikan → Kesehatan → Ekonomi → Review
- Input indikator kebutuhan terintegrasi
- Preview skor real-time saat pengisian form
- Alur verifikasi: **Diajukan** → **Disetujui/Ditolak** (oleh Supervisor)

### 4. 🧠 Algoritma Matchmaking (Fitur Inti)
Sistem scoring otomatis 3 dimensi yang mencocokkan penerima dengan program bansos:

| Dimensi | Bobot | Indikator |
|---------|-------|-----------|
| Pendidikan | 30% | Anak putus sekolah, tingkat pendidikan kepala keluarga |
| Kesehatan | 30% | Status gizi balita, ibu hamil, penyakit kronis |
| Ekonomi | 40% | Pendapatan, pekerjaan, kepemilikan rumah, kondisi rumah |

**Logika Pencocokan:**
- Skor Pendidikan ≥ 60 → Program **Pendidikan** (PIP)
- Skor Kesehatan ≥ 60 → Program **Kesehatan** & **Pangan**
- Skor Ekonomi ≥ 70 → Program **Bantuan Tunai** (BLT)
- Kondisi rumah tidak layak → Program **Bedah Rumah**

### 5. 📦 Manajemen Program Bansos
CRUD program bantuan dengan 5 kategori: Pangan, Kesehatan, Pendidikan, Bedah Rumah, Bantuan Tunai. Termasuk tracking anggaran dan kuota secara real-time.

### 6. 🚚 Pencatatan Distribusi
Form bagi Petugas Lapangan untuk mencatat penyerahan bantuan, termasuk jumlah, jenis, bukti foto, dan status penyaluran.

### 7. 🏠 Kunjungan Rumah & Data KIA
Pencatatan kunjungan rumah dengan data Kesehatan Ibu dan Anak (KIA): berat/tinggi badan balita, IMT otomatis, status imunisasi, dan observasi kondisi rumah.

### 8. 🎓 Sistem Graduasi
Admin dapat mengubah status penerima yang sudah mandiri menjadi "Lulus/Graduasi" dengan catatan alasan.

---

## 🛠️ Tech Stack (Framework & Library)

### Backend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **PHP** | ≥ 8.2 | Bahasa pemrograman server |
| **Laravel** | 11.x | Framework backend (REST API) |
| **Laravel Sanctum** | 4.x | Autentikasi API (token-based) |
| **MySQL** | 8.0+ | Database relasional |
| **Composer** | 2.x | Dependency manager PHP |

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **React.js** | 19.x | Library UI (Single Page Application) |
| **Vite** | 8.x | Build tool & dev server |
| **React Router DOM** | 7.x | Client-side routing |
| **Axios** | 1.x | HTTP client untuk konsumsi API |
| **Leaflet.js** | 1.9 | Peta interaktif & geospasial |
| **React-Leaflet** | 5.x | Wrapper React untuk Leaflet |
| **Chart.js** | 4.x | Visualisasi grafik (Line, Doughnut) |
| **React-Chartjs-2** | 5.x | Wrapper React untuk Chart.js |
| **Lucide React** | 0.x | Icon library |
| **Node.js** | ≥ 18 | Runtime JavaScript |
| **npm** | ≥ 9 | Package manager JavaScript |

---

## 🚀 Panduan Instalasi & Menjalankan Pertama Kali

### Prasyarat (Prerequisites)

Pastikan perangkat lunak berikut sudah terinstall di komputer Anda:

| Software | Versi Minimum | Cek Versi |
|----------|---------------|-----------|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| MySQL | 8.0+ | `mysql --version` |

> **💡 Tip:** Untuk pengguna macOS, Anda bisa menggunakan [Homebrew](https://brew.sh/) untuk menginstall semua dependencies:
> ```bash
> brew install php composer node mysql
> brew services start mysql
> ```

> **💡 Tip:** Untuk pengguna Windows, gunakan [XAMPP](https://www.apachefriends.org/) atau [Laragon](https://laragon.org/) yang sudah menyertakan PHP, MySQL, dan Composer.

---

### Langkah 1: Clone Repository

```bash
git clone <URL_REPOSITORY> SiMonevMainFramework
cd SiMonevMainFramework
```

---

### Langkah 2: Setup Backend (Laravel)

```bash
# Masuk ke folder backend
cd backend

# Install dependencies PHP
composer install

# Salin file konfigurasi environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### Konfigurasi Database

Buka file `backend/.env` dan sesuaikan konfigurasi database MySQL Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=simonev
DB_USERNAME=root
DB_PASSWORD=
```

> ⚠️ Sesuaikan `DB_USERNAME` dan `DB_PASSWORD` dengan kredensial MySQL di komputer Anda.

#### Buat Database

Buat database MySQL bernama `simonev`:

```bash
# Via MySQL CLI
mysql -u root -p -e "CREATE DATABASE simonev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Atau via PHP (jika MySQL CLI tidak tersedia)
php -r "\$pdo = new PDO('mysql:host=127.0.0.1', 'root', ''); \$pdo->exec('CREATE DATABASE IF NOT EXISTS simonev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'); echo 'OK';"
```

#### Jalankan Migrasi & Seeder

```bash
# Jalankan semua migrasi database + data awal
php artisan migrate --seed

# Jika error, coba untuk melakukan migrate fresh
php artisan migrate:fresh
```

Ini akan membuat semua tabel dan mengisi data sample:
- 3 akun pengguna (Admin, Supervisor, Petugas)
- 16 kecamatan Kabupaten Bandung Barat
- 5 program bansos contoh
- 5 penerima contoh dengan indikator & skor

#### Jalankan Backend Server

```bash
php artisan serve
# Server berjalan di http://localhost:8000
```

---

### Langkah 3: Setup Frontend (React)

Buka **terminal baru** (jangan tutup terminal backend):

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies JavaScript
npm install

# Jalankan development server
npm run dev
# Server berjalan di http://localhost:5173
```

---

### Langkah 4: Buka Aplikasi

Buka browser dan akses: **http://localhost:5173**

#### Akun Demo untuk Login

| Role | Email | Password |
|------|-------|----------|
| Admin Pusat | `admin@simonev.com` | `password123` |
| Supervisor | `supervisor@simonev.com` | `password123` |
| Petugas Lapangan | `petugas@simonev.com` | `password123` |

> 💡 Coba login dengan masing-masing role untuk melihat perbedaan akses menu dan fitur.

---

## 📁 Struktur Folder Proyek

```
SiMonevMainFramework/
│
├── backend/                        # ⚙️ Laravel 11 (REST API)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # 7 Controller API
│   │   │   └── Middleware/         # RoleMiddleware (RBAC)
│   │   ├── Models/                 # 7 Eloquent Model
│   │   └── Services/              # MatchmakingService
│   ├── database/
│   │   ├── migrations/             # 12 Migration files
│   │   └── seeders/                # Data awal KBB
│   ├── routes/
│   │   └── api.php                 # Definisi endpoint API
│   └── .env                        # Konfigurasi environment
│
├── frontend/                       # ⚛️ React 19 + Vite
│   ├── src/
│   │   ├── components/             # Sidebar, Layout, MapKBB
│   │   ├── contexts/               # AuthContext (state management)
│   │   ├── lib/                    # Axios API client
│   │   ├── pages/                  # 7 Halaman utama
│   │   ├── App.jsx                 # Routing utama
│   │   ├── index.css               # Design system (dark mode)
│   │   └── main.jsx                # Entry point
│   ├── index.html
│   └── package.json
│
└── README.md                       # 📖 Dokumentasi ini
```

---

## 🔌 API Endpoints

Semua endpoint menggunakan prefix `/api` dan memerlukan token Sanctum (kecuali login).

### Autentikasi
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/login` | Login, mendapatkan token |
| `POST` | `/api/logout` | Logout, revoke token |
| `GET` | `/api/me` | Profil user saat ini |

### Dashboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/dashboard/stats` | Statistik KPI |
| `GET` | `/api/dashboard/map-data` | Data peta per kecamatan |
| `GET` | `/api/dashboard/trends` | Tren penyaluran bulanan |

### Penerima Bansos
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET` | `/api/beneficiaries` | Semua | Daftar penerima (filter, search, pagination) |
| `GET` | `/api/beneficiaries/{id}` | Semua | Detail penerima |
| `POST` | `/api/beneficiaries` | Petugas, Admin | Daftarkan penerima baru |
| `PUT` | `/api/beneficiaries/{id}` | Petugas, Admin | Update data penerima |
| `PATCH` | `/api/beneficiaries/{id}/verify` | Supervisor, Admin | Verifikasi (setujui/tolak) |
| `PATCH` | `/api/beneficiaries/{id}/graduate` | Admin | Graduasi penerima |
| `DELETE` | `/api/beneficiaries/{id}` | Admin | Hapus penerima |

### Program Bansos
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET` | `/api/programs` | Semua | Daftar program |
| `POST` | `/api/programs` | Admin | Buat program baru |
| `PUT` | `/api/programs/{id}` | Admin | Update program |
| `DELETE` | `/api/programs/{id}` | Admin | Hapus program |
| `POST` | `/api/programs/{id}/matchmaking` | Admin | Jalankan matchmaking batch |

### Distribusi & Kunjungan
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET` | `/api/distributions` | Semua | Daftar distribusi |
| `POST` | `/api/distributions` | Petugas, Admin | Catat distribusi |
| `GET` | `/api/home-visits` | Semua | Daftar kunjungan rumah |
| `POST` | `/api/home-visits` | Petugas, Admin | Catat kunjungan rumah |

### Wilayah
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/regions` | Daftar wilayah (kabupaten/kecamatan/desa) |
| `GET` | `/api/regions/{id}` | Detail wilayah |

---

## 🔧 Perintah-Perintah Berguna

```bash
# === BACKEND ===
cd backend

php artisan serve                    # Jalankan server backend
php artisan migrate                  # Jalankan migrasi baru
php artisan migrate:fresh --seed     # Reset database + seed ulang
php artisan route:list               # Lihat semua route API
php artisan tinker                   # Laravel REPL (untuk debugging)

# === FRONTEND ===
cd frontend

npm run dev                          # Jalankan development server
npm run build                        # Build untuk production
npm run preview                      # Preview hasil build
```

---

## 🤝 Tim Pengembang

Proyek ini dikembangkan sebagai bagian dari mata kuliah **Proyek Perangkat Lunak** Semester 6.

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademis.
