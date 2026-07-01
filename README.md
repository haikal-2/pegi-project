# Pegi - Team Workflow & Architecture Guide

Selamat datang di repositori TravelGo Kelompok 1! Proyek ini menggunakan arsitektur **Monorepo**, di mana kode Frontend dan Backend disimpan dalam satu repositori yang sama tetapi dipisah ke dalam dua direktori utama: `/frontend` dan `/backend`.

## Struktur Folder Utama

```text
Project-Website-Pegi/
│
├── frontend/                     <-- Folder kerja Tim Frontend (React, TypeScript)
│   ├── public/
│   ├── src/
│   │   ├── assets/               <-- File statis (Gambar, CSS global)
│   │   ├── components/           <-- Komponen reusable (Navbar, Footer, Card)
│   │   ├── context/              <-- State global (Data User Login, dll)
│   │   ├── pages/                <-- Halaman UI utama
│   │   ├── services/             <-- Konfigurasi Axios & Endpoint API
│   │   ├── types/                <-- Definisi tipe data TypeScript (Interfaces)
│   │   └── utils/                <-- Fungsi bantuan (Format Rupiah, Tanggal)
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      <-- Folder kerja Tim Backend (Spring Boot, Java)
│   ├── src/main/java/com/pegi/backend/
│   │   ├── config/               <-- Pengaturan global (CORS, Security)
│   │   ├── controller/           <-- Menerima request API dari Frontend
│   │   ├── dto/                  <-- Format balasan API (ApiResponse, Request Body)
│   │   ├── entity/               <-- Model tabel database
│   │   │   └── enums/            <-- Kumpulan tipe data konstan (Status, Role)
│   │   ├── repository/           <-- Query ke database MySQL
│   │   └── service/              <-- Logika bisnis aplikasi
│   ├── src/main/resources/
│   │   └── application.properties<-- Tetapan database (pegi_db) & server
│   └── pom.xml
│
└── README.md

```

---

## Repository Branching Rules

Setiap anggota tim **wajib** bekerja di *branch* (jalur) masing-masing untuk mencegah bentrok kode saat mengedit proyek di dalam folder yang sama.

* `main` → Final / Production (Hanya untuk rilis resmi)
* `dev` → Development (Ruang tengah / Pusat integrasi kode Frontend & Backend)
* `frontend-faishal` → Branch kerja Faishal
* `frontend-hamzah` → Branch kerja Hamzah
* `backend-haikal` → Branch kerja Haikal
* `backend-haris` → Branch kerja Haris

---

## Setup Pertama Kali (Clone & Install)

Jalankan deretan perintah ini **sekali saja** saat pertama kali mengunduh proyek ke laptop:

```bash
# 1. Clone repositori ke laptop
git clone https://github.com/Harisnoresst/Project-Website-Pegi.git
cd Project-Website-Pegi

# 2. Masuk ke branch utama dan tarik data terbaru
git checkout dev
git pull origin dev

# 3A. Setup KHUSUS Tim Frontend (Faishal & Hamzah)
cd frontend
npm install    # Menginstal semua library React, Bootstrap, Axios
cd ..

# 3B. Setup KHUSUS Tim Backend (Haikal & Haris)
# (Pastikan XAMPP/MySQL menyala dan database pegi_db sudah dibuat)
cd backend
mvn clean install -DskipTests    # Menginstal semua library Spring Boot
cd ..

# 4. Buat dan pindah ke branch pribadi masing-masing (Contoh: Faishal)
git checkout -b frontend-faishal

```

*(Catatan: Langkah ke-4 dilakukan agar kamu membawa "fotokopian" pondasi proyek dari `dev` ke kamar/branch pribadimu).*

---

## Pembagian Tugas, Lokasi File, dan API (Kontrak Kerja)

### TIM FRONTEND (Bekerja di dalam folder `/frontend`)

**1. Faishal (User Experience & Social Features)**
Fokus pada antarmuka pengguna umum dan interaksi sosial.

* **Pages (`/frontend/src/pages/`):**
* `HomePage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`
* `HotelSearchPage.tsx`, `HotelDetailPage.tsx`
* `DestinationSearchPage.tsx`, `DestinationDetailPage.tsx`
* `TransportSearchPage.tsx` (Pencarian transportasi darat)
* `TravelPartnerPage.tsx` (Matching User), `GroupListPage.tsx`, `GroupDetailPage.tsx`
* `ChatPage.tsx`, `SplitBillPage.tsx`


* **Services (`/frontend/src/services/`):**
* `authService.ts`, `hotelService.ts`, `destinationService.ts`, `transportService.ts`
* `matchingService.ts`, `groupService.ts`, `chatService.ts`, `splitBillService.ts`


* **API yang Dikonsumsi:**
* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/hotels`, `GET /api/hotels/{id}`
* `GET /api/destinations`, `GET /api/destinations/{id}` (Termasuk data Crowd Level)
* `GET /api/transports`, `GET /api/transports/{id}`
* `GET /api/matching/partners`
* `POST /api/groups`, `GET /api/groups`
* `POST /api/groups/{id}/invite`, `POST /api/groups/{id}/join`
* `GET /api/groups/{id}/chats`, `POST /api/groups/{id}/chats`
* `GET /api/groups/{id}/split-bill`, `POST /api/groups/{id}/split-bill`
* `PUT /api/groups/{id}/split-bill/{billId}/pay`



**2. Hamzah (Dashboard & Admin Monitoring)**
Fokus pada halaman profil, riwayat, dan panel kontrol administrator.

* **Pages (`/frontend/src/pages/`):**
* `ProfilePage.tsx` (Termasuk tampilan Gamification/Badge)
* `WishlistPage.tsx`, `BookingHistoryPage.tsx`
* `AdminDashboard.tsx`, `AdminUserPage.tsx`, `AdminHotelPage.tsx`
* `AdminDestinationPage.tsx`, `AdminPromoPage.tsx`
* `AdminTransportPage.tsx` (CRUD data transportasi darat)
* `AdminGroupPage.tsx` (Monitoring aktivitas grup)
* `AdminMonitoringPage.tsx` (Statistik dan destinasi populer)


* **Services (`/frontend/src/services/`):**
* `userService.ts`, `wishlistService.ts`, `bookingService.ts`
* `adminService.ts`, `promoService.ts`, `adminTransportService.ts`, `monitoringService.ts`


* **API yang Dikonsumsi:**
* `GET /api/profile`, `PUT /api/profile`
* `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/{id}`
* `GET /api/bookings`, `POST /api/bookings`
* `GET /api/admin/dashboard`
* `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/{id}`, `DELETE /api/admin/users/{id}`
* `GET /api/admin/hotels`, `POST /api/admin/hotels`, `PUT /api/admin/hotels/{id}`, `DELETE /api/admin/hotels/{id}`
* `GET /api/admin/destinations`, `POST /api/admin/destinations`, `PUT /api/admin/destinations/{id}`, `DELETE /api/admin/destinations/{id}`
* `GET /api/admin/promos`, `POST /api/admin/promos`, `PUT /api/admin/promos/{id}`, `DELETE /api/admin/promos/{id}`
* `GET /api/admin/transports`, `POST /api/admin/transports`, `PUT /api/admin/transports/{id}`, `DELETE /api/admin/transports/{id}`
* `GET /api/admin/groups`
* `GET /api/admin/monitoring/stats`



---

### TIM BACKEND (Bekerja di dalam folder `/backend`)

*(Path Base: `/backend/src/main/java/com/pegi/backend/`)*

**3. Haikal (Auth, User & Social Module)**
Fokus pada otentikasi, manajemen pengguna, dan fitur sosial.

* **Controllers (`.../controller/`):** `AuthController.java`, `UserController.java`, `WishlistController.java`, `ReviewController.java`, `MatchingController.java`, `GroupController.java`, `ChatController.java`
* **Services (`.../service/`):** `AuthService.java`, `UserService.java`, `WishlistService.java`, `ReviewService.java`, `MatchingService.java`, `GroupService.java`, `ChatService.java`, `BadgeService.java` (Logika gamifikasi otomatis)
* **Repositories (`.../repository/`):** `UserRepository.java`, `RoleRepository.java`, `WishlistRepository.java`, `ReviewRepository.java`, `GroupRepository.java`, `ChatMessageRepository.java`
* **Entities (`.../entity/`):** `User.java`, `Role.java`, `Wishlist.java`, `Review.java`, `Group.java`, `GroupMember.java`, `ChatMessage.java`, `Badge.java`
* **Enums (`.../entity/enums/`):** `RoleType.java` (ADMIN, USER), `GroupType.java` (PRIVATE, PUBLIC)
* **Penyedia API:**
* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/profile` (Termasuk data Badge), `PUT /api/profile`
* `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/{id}`
* `POST /api/reviews`, `GET /api/reviews/{hotelId}`



**4. Haris (Booking, Transaction & Analytics Module)**
Fokus pada inventaris, transaksi pemesanan, dan sistem *split bill*.

* **Controllers (`.../controller/`):** `HotelController.java`, `DestinationController.java`, `TransportController.java`, `BookingController.java`, `PaymentController.java`, `PromoController.java`, `InvoiceController.java`, `SplitBillController.java`
* **Services (`.../service/`):** `HotelService.java`, `DestinationService.java`, `TransportService.java`, `BookingService.java`, `PaymentService.java`, `PromoService.java`, `InvoiceService.java`, `EmailService.java`, `QRCodeService.java`, `SplitBillService.java`, `CrowdCalculationService.java` (Otomatis menghitung keramaian), `MonitoringService.java`
* **Repositories (`.../repository/`):** `HotelRepository.java`, `RoomRepository.java`, `DestinationRepository.java`, `TransportRepository.java`, `BookingRepository.java`, `PaymentRepository.java`, `PromoRepository.java`, `SplitBillRepository.java`
* **Entities (`.../entity/`):** `Hotel.java`, `Room.java`, `Destination.java`, `Transport.java`, `Booking.java`, `Payment.java`, `Promo.java`, `Ticket.java`, `SplitBill.java`, `BillMember.java`
* **Enums (`.../entity/enums/`):** `BookingStatus.java` (PENDING, CONFIRMED, CANCELLED), `PaymentStatus.java`, `CrowdLevel.java` (SEPI, SEDANG, RAMAI), `BillStatus.java` (BELUM_BAYAR, SUDAH_BAYAR)
* **Penyedia API:**
* `GET /api/hotels`
* `GET /api/destinations`
* `POST /api/bookings`
* `GET /api/bookings`
* `DELETE /api/bookings/{id}`
* `POST /api/payments`
* `GET /api/invoice/{bookingId}`
* `POST /api/promos/validate`
* `GET /api/qrcode/{bookingId}`
* `POST /api/email/send`



---

## Workflow Harian GitHub (Wajib Diikuti)

Ikuti 3 langkah utama ini setiap hari agar pekerjaanmu tetap terhubung dengan progres teman satu tim:

### 1. SEBELUM NGODING: Tarik Update Terbaru dari Ruang Tengah (`dev`)

Posisi kamu harus tetap di branch pribadi (contoh: `frontend-faishal`). Tarik kode terbaru yang sudah diselesaikan oleh temanmu dari `dev` agar kodemu tidak tertinggal.

```bash
git pull origin dev

```

### 2. SAAT NGODING: Jalankan Proyek

* **Tim Frontend:** Masuk ke folder `frontend` lalu jalankan `npm run dev`.
* **Tim Backend:** Buka terminal, masuk ke folder `backend`, lalu jalankan `mvn spring-boot:run`. (Atau jalankan langsung dari IDE VS Code / IntelliJ).

### 3. SELESAI NGODING: Simpan & Push ke Branch Pribadi

Simpan pekerjaanmu dan unggah ke "kamarmu" sendiri di GitHub.

```bash
# Pastikan kamu ada di root folder (Project-Website-Pegi)
git add .
git commit -m "feat: tambah UI form login"
git push origin <nama-branch-kamu>

```

---

## Cara Pull Request (Setor Kode ke Dev)

Ketika fitur buatanmu sudah selesai dites dan siap digabungkan:

1. Buka repositori di GitHub.
2. Klik tombol **Pull Request**.
3. Arahkan *branch* kamu untuk digabung ke `dev` (Contoh: `frontend-faishal` -> `dev`).
4. Berikan judul yang jelas (Contoh: *Selesai Fitur Transport Frontend*).
5. Minta rekan setim untuk melakukan *Code Review* dan klik **Merge**.
*(Setelah di-Merge, kode kamu resmi masuk ke ruang tengah `dev` dan bisa di-pull oleh rekan tim lainnya).*

---

## Penyelesaian Error GitHub

Jika saat `git push` muncul pesan error seperti **`failed to push some refs`** atau **`fetch first`**:

* **Arti:** Git menolak unggahanmu karena ada *update* dari teman di *branch* tersebut yang belum kamu ambil ke laptopmu.
* **Solusi:** Tarik data tersebut untuk digabungkan secara otomatis oleh Git.

```bash
git pull origin <nama-branch-kamu>

```

Setelah *pull* berhasil (dan tidak ada *Merge Conflict*), ulangi perintah `git push origin <nama-branch-kamu>`.

---

## System Architecture Flow

```text
React Frontend (Faishal & Hamzah)
      ↓
Axios Service
      ↓
Spring Boot API (Haikal & Haris)
      ↓
MySQL Database

```

| Nama | Divisi | Branch Kerja |
| --- | --- | --- |
| Faishal | Frontend 1 | `frontend-faishal` |
| Hamzah | Frontend 2 | `frontend-hamzah` |
| Haikal | Backend 1 | `backend-haikal` |
| Haris | Backend 2 | `backend-haris` |

---

**Status:** Development

```

```
