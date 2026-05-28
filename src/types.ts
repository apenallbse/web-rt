/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'sekretaris' | 'bendahara' | 'warga';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  wargaId?: string;
}

export interface Warga {
  id: string;
  nama: string;
  email?: string;
  nik: string;
  alamat: string;
  no_hp: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  tempat_lahir?: string;
  agama?: string;
  pendidikan?: string;
  jenis_pekerjaan?: string;
  status_perkawinan?: string;
  status_keluarga?: string;
  kewarganegaraan?: string;
  no_paspor?: string;
  no_kitap?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  kk_id?: string;
  // Address Components
  nama_jalan?: string;
  no_rumah?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  negara?: string;
  role?: UserRole;
  status?: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  password?: string;
  two_factor_secret?: string;
  two_factor_enabled?: boolean;
}

export interface KartuKeluarga {
  id: string;
  no_kk: string;
  kepala_keluarga: string;
  alamat: string;
}

export interface Iuran {
  id: string;
  warga_id: string;
  bulan: string; // YYYY-MM
  jumlah: number;
  status: 'lunas' | 'belum' | 'pending';
  tanggal_bayar?: string;
}

export interface Surat {
  id: string;
  warga_id: string;
  no_surat?: string; // Optional field for the official letter number
  jenis_surat: string;
  tanggal_pengajuan: string;
  keterangan: string;
  status: 'pending' | 'disetujui' | 'ditolak';
}

export interface RTProfile {
  id?: string;
  no_rt: string;
  nama_ketua: string;
  alamat: string;
  telepon: string;
  email: string;
  // Detailed Address Components
  nama_jalan?: string;
  no_rumah?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  negara?: string;
  password?: string;
  avatar_url?: string;
  nama_aplikasi?: string;
  warna_utama?: string;
  bahasa?: string;
  zona_waktu?: string;
  tentang_gambar?: string;
  tentang_teks?: string;
  tentang_judul?: string;
  tentang_visi?: string;
  tentang_misi?: string;
  tentang_nilai?: string;
  two_factor_secret?: string;
  two_factor_enabled?: boolean;
  nominal_iuran?: number;
  info_rekening?: string;
}

export interface Agenda {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: string;
  category: string;
}

export interface AgendaIzin {
  id: string;
  agenda_id: number;
  user_id: string;
  nama_warga: string;
  alasan: string;
  bukti_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  catatan_admin?: string;
  created_at: string;
}

export interface Inventaris {
  id: string;
  nama_barang: string;
  kode_barang: string;
  jumlah: number;
  kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat';
  tanggal_masuk: string;
  keterangan: string;
}

export interface NotificationSettings {
  reports: boolean;
  finance: boolean;
  warga: boolean;
  announcements: boolean;
  twoFactorEnabled: boolean;
}
