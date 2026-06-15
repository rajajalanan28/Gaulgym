# Gym Management Website - Project Structure

Berikut adalah dokumentasi struktur file dan folder dari project **Gym Management Website**. Project ini dibangun menggunakan **Next.js (App Router)**, **TypeScript**, dan **Supabase** sebagai backend/database.

## 📁 Root Directory
Direktori utama berisi konfigurasi project, dokumentasi, skrip utilitas, dan skrip database.

### 📄 Konfigurasi Project
- `package.json` & `package-lock.json` - Daftar dependensi (NPM) dan skrip project.
- `tsconfig.json` & `next-env.d.ts` - Konfigurasi TypeScript.
- `next.config.ts` - Konfigurasi bawaan Next.js.
- `eslint.config.mjs` - Konfigurasi linter ESLint.
- `postcss.config.mjs` - Konfigurasi PostCSS (biasanya untuk Tailwind CSS).
- `vercel.json` - Konfigurasi deployment untuk Vercel.
- `.env.local` & `.env.example` - Environment variables (seperti API keys Supabase).

### 📚 Dokumentasi & Desain
- `README.md` - Dokumentasi utama project.
- `DESIGN.md`, `linear_design.md`, `vercel_design.md` - Panduan desain dan spesifikasi UI/UX.
- `CODE_REVIEW_REPORT.md` & `CODE_REVIEW_EXECUTIVE_SUMMARY.md` - Hasil code review.
- `hasilfix.md` - Catatan perbaikan bug atau error.

### 🗄️ Skrip Database (SQL)
Berbagai skrip SQL untuk mengelola database Supabase (membuat tabel, fungsi, atau memperbaiki RLS/kebijakan keamanan).
- `init.sql` (di dalam folder supabase)
- `setup_global_audit.sql`, `setup_pos_rpc.sql`, `setup-expenses-shifts.sql`, dll.
- Skrip perbaikan: `fix_auth_rls.sql`, `fix_security_warnings.sql`, `fix_register_error.sql`, dll.

### 🛠️ Skrip Utilitas (JS)
Skrip JavaScript untuk melakukan pengecekan atau perbaikan data manual.
- `check.js`, `check_db.js` - Mengecek koneksi atau data di database.
- `fix_owner.js`, `test-users.js`, `test_update.js` - Skrip testing dan modifikasi user.

---

## 📁 `/src` - Source Code Utama
Folder ini berisi seluruh kode aplikasi Next.js.

### 📂 `/src/app` (Next.js App Router)
Berisi halaman (pages), layout, dan API backend.
- **Halaman Publik:** `beranda`, `tentang`, `fasilitas`, `paket`, `pricing`, `kontak`, `kalkulator-bmi`.
- **Autentikasi:** `login`, `register`, `daftar`, `auth`.
- **Dashboard / Panel Pengguna:**
  - `admin/` - Dashboard khusus Admin.
  - `owner/` - Dashboard khusus Owner (Pemilik).
  - `member/` - Dashboard khusus Member Gym.
  - `dashboard/` - Dashboard umum / rute pengalihan.
  - `profile/` - Halaman profil pengguna.
- **Backend API & Actions:**
  - `api/` - Rute API (Backend endpoints).
  - `actions/` - Next.js Server Actions untuk memproses data dari sisi server.
- **File Inti:**
  - `layout.tsx` & `page.tsx` - Layout utama dan halaman utama (Root).
  - `globals.css` - File CSS utama (Tailwind CSS global).
  - `error.tsx`, `loading.tsx`, `not-found.tsx` - Tampilan saat error, loading, dan halaman 404.
  - `sitemap.ts` & `robots.ts` - Konfigurasi SEO.

### 📂 `/src/components` (UI Components)
Berisi komponen React yang dapat digunakan kembali.
- **Komponen Inti (UI):** `Button.tsx`, `Input.tsx`, `Table.tsx`, `Skeleton.tsx`.
- **Layout & Navigasi:** `PublicNavbar.tsx`, `PublicFooter.tsx`, `BottomNav.tsx`, `DashboardHeader.tsx`, `MenuItem.tsx`.
- **Komponen Fungsional:** `ShiftManager.tsx`, `StatCard.tsx`, `WelcomeCard.tsx`.
- **Sistem Keamanan:** `ProtectedRoute.tsx` (Untuk melindungi halaman yang memerlukan login).
- **Sub-folder Tambahan:** `auth/`, `charts/`, `pages/`.

### 📂 `/src/lib` (Utilities & Config)
Berisi konfigurasi library pihak ketiga dan fungsi pembantu.
- `supabase.ts` - Konfigurasi dan inisialisasi client Supabase.
- `auth-context.tsx` - React Context untuk mengelola state autentikasi (User Login State) secara global.
- `config.ts` - Konfigurasi umum aplikasi.
- `design-tokens.ts` - Variabel desain seperti warna, ukuran, dll.

### 📂 `/src/types`
Berisi definisi tipe data TypeScript (Interface & Types).
- `index.ts` - Definisi tipe global.

### 📄 `/src/middleware.ts`
Next.js Middleware. Biasanya digunakan untuk memeriksa sesi (session) user di setiap request dan mengarahkan mereka (redirect) jika belum login (melindungi rute secara dinamis).

---

## 📁 Direktori Lainnya

### 📂 `/supabase`
Konfigurasi spesifik untuk Supabase lokal.
- `init.sql` - Skrip inisialisasi awal database.
- `migrations/` - Folder berisi file migrasi skema database.

### 📂 `/public`
Berisi aset statis yang dapat diakses publik seperti gambar, ikon (`icon.png`), font, dan file lainnya.

### 📂 `/design-templates`
Berisi template atau file HTML/CSS referensi desain UI (seperti `temp.html`) sebelum diintegrasikan ke dalam Next.js (React).
