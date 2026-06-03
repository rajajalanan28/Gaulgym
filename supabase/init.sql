-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Mewakili Owner, Admin, dan Member Login)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin', 'Member')),
  phone TEXT,
  gym_id UUID, -- For Admin
  owner_id UUID, -- If Admin is owned by an Owner
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Gyms Table (Data Cabang Gym)
CREATE TABLE IF NOT EXISTS gyms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  opening_time TEXT NOT NULL,
  closing_time TEXT NOT NULL,
  closed_days TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Add foreign key to users.gym_id now that gyms exist
ALTER TABLE users ADD CONSTRAINT fk_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL;

-- 3. Packages Table (Daftar Harga Paket Membership & Harian)
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 30,
  price INTEGER NOT NULL,
  price_display TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  color TEXT DEFAULT 'blue',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Members Table (Data Diri Member)
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable if they haven't logged in via app
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  display_id TEXT NOT NULL UNIQUE, -- e.g. MBR-001
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  join_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Subscriptions Table (Transaksi & Paket Aktif Member)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'pending', 'cancelled')),
  amount INTEGER NOT NULL,
  payment_status TEXT NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  midtrans_order_id TEXT,
  midtrans_transaction_id TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Kasir/Admin
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Attendance Table (Riwayat Check-in / Kedatangan)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE,
  check_in_by TEXT NOT NULL, -- 'Admin', 'Scanner', 'App'
  checked_in_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('checked_in', 'checked_out')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- DUMMY DATA UNTUK TESTING
-- ==========================================

-- Bikin 1 Owner (Password bebas karena kita mock login)
INSERT INTO users (id, email, name, role) 
VALUES ('11111111-1111-1111-1111-111111111111', 'owner@gaulgym.com', 'Boss Gaul', 'Owner');

-- Bikin 1 Gym yang dimiliki Owner
INSERT INTO gyms (id, owner_id, name, address, opening_time, closing_time) 
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Gaul Gym Pusat', 'Jl. Sudirman No 1', '06:00', '22:00');

-- Bikin 1 Admin buat cabang tersebut
INSERT INTO users (id, email, name, role, gym_id, owner_id) 
VALUES ('33333333-3333-3333-3333-333333333333', 'admin@gaulgym.com', 'Admin Resepsionis', 'Admin', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111');

-- Bikin Paket Harian dan Bulanan
INSERT INTO packages (id, gym_id, name, duration_days, price, price_display, color, features)
VALUES 
('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222222', 'Day Pass', 1, 35000, 'Rp 35.000', 'red', '{"1x Kunjungan", "Akses semua alat"}'),
('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'Paket Bulanan Basic', 30, 150000, 'Rp 150.000', 'blue', '{"Akses 1 Bulan", "Bebas Jam Kunjung"}');

-- Bikin 1 Akun Login Member
INSERT INTO users (id, email, name, role)
VALUES ('55555555-5555-5555-5555-555555555555', 'member@gaulgym.com', 'Si Member Gaul', 'Member');

-- Bikin Profil Member
INSERT INTO members (id, user_id, gym_id, display_id, name, email, join_date)
VALUES ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'MBR-001', 'Si Member Gaul', 'member@gaulgym.com', CURRENT_DATE);

-- Bikin Transaksi Subscriptions Aktif untuk Member
INSERT INTO subscriptions (member_id, gym_id, package_id, package_name, start_date, end_date, status, amount, payment_status, created_by, created_by_name)
VALUES ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444442', 'Paket Bulanan Basic', CURRENT_DATE, CURRENT_DATE + 30, 'active', 150000, 'success', '33333333-3333-3333-3333-333333333333', 'Admin Resepsionis');
