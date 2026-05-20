-- SQL Schema untuk Supabase SkyRT

-- 1. Tabel Kartu Keluarga
CREATE TABLE IF NOT EXISTS kartu_keluarga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  no_kk TEXT UNIQUE NOT NULL,
  kepala_keluarga TEXT NOT NULL,
  alamat TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Warga
CREATE TABLE IF NOT EXISTS warga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE,
  nik TEXT UNIQUE NOT NULL,
  alamat TEXT NOT NULL,
  no_hp TEXT,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  tanggal_lahir DATE,
  tempat_lahir TEXT,
  agama TEXT,
  pendidikan TEXT,
  jenis_pekerjaan TEXT,
  status_perkawinan TEXT,
  status_keluarga TEXT,
  kewarganegaraan TEXT,
  no_paspor TEXT,
  no_kitap TEXT,
  nama_ayah TEXT,
  nama_ibu TEXT,
  kk_id UUID REFERENCES kartu_keluarga(id) ON DELETE SET NULL,
  -- Address Components
  nama_jalan TEXT,
  no_rumah TEXT,
  rt TEXT,
  rw TEXT,
  kelurahan TEXT,
  kecamatan TEXT,
  kota TEXT,
  provinsi TEXT,
  kode_pos TEXT,
  negara TEXT,
  role TEXT DEFAULT 'warga' CHECK (role IN ('admin', 'warga')),
  status TEXT DEFAULT 'aktif',
  avatar_url TEXT,
  password TEXT, -- Opsional, sebaiknya gunakan Supabase Auth
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Iuran
CREATE TABLE IF NOT EXISTS iuran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warga_id UUID REFERENCES warga(id) ON DELETE CASCADE,
  bulan TEXT NOT NULL, -- Format YYYY-MM
  jumlah NUMERIC NOT NULL,
  status TEXT DEFAULT 'belum' CHECK (status IN ('lunas', 'belum')),
  tanggal_bayar DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Surat
CREATE TABLE IF NOT EXISTS surat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warga_id UUID REFERENCES warga(id) ON DELETE CASCADE,
  no_surat TEXT,
  jenis_surat TEXT NOT NULL,
  tanggal_pengajuan DATE DEFAULT CURRENT_DATE,
  keterangan TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'disetujui', 'ditolak')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Profil RT
CREATE TABLE IF NOT EXISTS rt_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  no_rt TEXT NOT NULL,
  nama_ketua TEXT NOT NULL,
  alamat TEXT NOT NULL,
  telepon TEXT,
  email TEXT,
  nama_jalan TEXT,
  no_rumah TEXT,
  rt TEXT,
  rw TEXT,
  kelurahan TEXT,
  kecamatan TEXT,
  kota TEXT,
  provinsi TEXT,
  kode_pos TEXT,
  negara TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Agenda
CREATE TABLE IF NOT EXISTS agenda (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  participants TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Izin Agenda
CREATE TABLE IF NOT EXISTS agenda_izin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agenda_id INTEGER REFERENCES agenda(id) ON DELETE CASCADE,
  user_id UUID, -- Referensi ke auth.users(id) jika menggunakan Auth
  nama_warga TEXT NOT NULL,
  alasan TEXT NOT NULL,
  bukti_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE kartu_keluarga ENABLE ROW LEVEL SECURITY;
ALTER TABLE warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE iuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE rt_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_izin ENABLE ROW LEVEL SECURITY;

-- Contoh Policy Sederhana (Izinkan Baca Semua untuk Demo)
-- Peringatan: Harap perketat policy ini untuk produksi!
CREATE POLICY "Allow public read access" ON kartu_keluarga FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON warga FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON iuran FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON surat FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON rt_profile FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON agenda FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON agenda_izin FOR SELECT USING (true);
