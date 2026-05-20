import { Warga, KartuKeluarga, Iuran, Surat, RTProfile, Agenda, NotificationSettings, AgendaIzin } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Mock Initial Data
const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  reports: true,
  finance: true,
  warga: false,
  announcements: true,
  twoFactorEnabled: false
};

const INITIAL_RT_PROFILE: RTProfile = {
  no_rt: '003',
  nama_ketua: 'H. Sudirman, S.H.',
  alamat: 'Jl. Melati Blok C No. 12, RT 003 / RW 015, Kelurahan Harapan Baru, Kecamatan Bekasi Timur, Kota Bekasi, Jawa Barat, 17112, Indonesia',
  telepon: '081234567890',
  email: 'rt003@skyrt.com',
  nama_jalan: 'Jl. Melati Blok C',
  no_rumah: '12',
  rt: '003',
  rw: '015',
  kelurahan: 'Harapan Baru',
  kecamatan: 'Bekasi Timur',
  kota: 'Kota Bekasi',
  provinsi: 'Jawa Barat',
  kode_pos: '17112',
  negara: 'Indonesia',
  password: '123'
};

// Mock Initial Data
const INITIAL_WARGA: Warga[] = [
  { id: 'warga-1', nama: 'Alex', email: 'alex@gmail.com', nik: '3210000000000003', alamat: 'Jl. Melati No. 5', no_hp: '081234567892', jenis_kelamin: 'Laki-laki', tanggal_lahir: '1995-01-01', kk_id: 'kk-4' },
  { id: 'warga-2', nama: 'Siti Aminah', email: 'siti@gmail.com', nik: '3210000000000002', alamat: 'Jl. Melati No. 2', no_hp: '081234567891', jenis_kelamin: 'Perempuan', tanggal_lahir: '1990-10-20', kk_id: 'kk-2' },
  { id: 'warga-3', nama: 'Budi Santoso', email: 'budi@gmail.com', nik: '3210000000000001', alamat: 'Jl. Melati No. 1', no_hp: '081234567890', jenis_kelamin: 'Laki-laki', tanggal_lahir: '1985-05-12', kk_id: 'kk-3' },
  { id: 'warga-4', nama: 'Warga Baru', email: 'warga.baru@skyrt.id', nik: '3210000000000004', alamat: 'Jl. Melati No. 4', no_hp: '081234567899', jenis_kelamin: 'Laki-laki', tanggal_lahir: '1995-01-01', kk_id: 'kk-1' },
];

const INITIAL_KK: KartuKeluarga[] = [
  { id: 'kk-1', no_kk: '3201010101010003', kepala_keluarga: 'Apen', alamat: 'Jl. Melati No. 4' },
  { id: 'kk-2', no_kk: '3201010101010002', kepala_keluarga: 'Siti Aminah', alamat: 'Jl. Melati No. 2' },
  { id: 'kk-3', no_kk: '3201010101010001', kepala_keluarga: 'Budi Santoso', alamat: 'Jl. Melati No. 1' },
  { id: 'kk-4', no_kk: '3201010101010004', kepala_keluarga: 'Alex', alamat: 'Jl. Melati No. 5' },
];

const INITIAL_IURAN: Iuran[] = [
  { id: 'i-1', warga_id: 'warga-1', bulan: new Date().toISOString().slice(0, 7), jumlah: 50000, status: 'lunas', tanggal_bayar: new Date().toISOString().split('T')[0] },
  { id: 'i-2', warga_id: 'warga-2', bulan: new Date().toISOString().slice(0, 7), jumlah: 50000, status: 'lunas', tanggal_bayar: new Date().toISOString().split('T')[0] },
  { id: 'i-3', warga_id: 'warga-3', bulan: new Date().toISOString().slice(0, 7), jumlah: 50000, status: 'lunas', tanggal_bayar: new Date().toISOString().split('T')[0] },
  { id: 'i-4', warga_id: 'warga-4', bulan: new Date().toISOString().slice(0, 7), jumlah: 50000, status: 'belum' },
];

const INITIAL_SURAT: Surat[] = [
  { id: 's-1', warga_id: 'warga-1', jenis_surat: 'Surat Pengantar Domisili', tanggal_pengajuan: '2026-04-10', keterangan: 'Untuk keperluan bank', status: 'disetujui' },
  { id: 's-2', warga_id: 'warga-2', jenis_surat: 'Surat Keterangan Usaha', tanggal_pengajuan: '2026-04-20', keterangan: 'Daftar KUR', status: 'pending' },
];

const INITIAL_PENGUMUMAN = [
  {
    id: 1,
    title: 'Pemutakhiran Data Warga 2026',
    content: 'Harap segera memperbarui data KK dan domisili melalui aplikasi atau langsung menemui sekretaris RT.',
    date: '2026-05-10',
    status: 'Aktif',
    category: 'Informasi',
  },
  {
    id: 2,
    title: 'Peringatan Hari Kemerdekaan',
    content: 'Diharapkan partisipasi warga dalam lomba-lomba HUT RI ke-81 yang akan dilaksanakan Agustus mendatang.',
    date: '2026-05-05',
    status: 'Draft',
    category: 'Kegiatan',
  },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, type: 'Masuk', category: 'Iuran Warga', amount: 1250000, date: '12 Mei 2026', note: 'Iuran bulan Mei gelombang 1' },
  { id: 2, type: 'Keluar', category: 'Listrik Fasum', amount: 210000, date: '10 Mei 2026', note: 'Tagihan bulan April-Mei' },
  { id: 3, type: 'Masuk', category: 'Donasi', amount: 500000, date: '08 Mei 2026', note: 'Donasi dari Bpk. Ahmad' },
  { id: 4, type: 'Keluar', category: 'Alat Kebersihan', amount: 85000, date: '05 Mei 2026', note: 'Pembelian sapu lidi & pengki' },
];

const INITIAL_AGENDA: Agenda[] = [
  {
    id: 1,
    title: 'Kerja Bakti Lingkungan',
    date: '2026-05-20',
    time: '07:00 - 10:00',
    location: 'Area Fasum RT 003',
    description: 'Membersihkan selokan dan area taman bermain.',
    participants: 'Pria Dewasa',
    category: 'Kegiatan Rutin'
  },
  {
    id: 2,
    title: 'Posyandu Bulanan',
    date: '2026-05-25',
    time: '09:00 - 12:00',
    location: 'Balai Warga',
    description: 'Pemeriksaan rutin bayi dan balita.',
    participants: 'Ibu & Balita',
    category: 'Kegiatan Rutin'
  },
];

const getStorage = <T,>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const setStorage = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dbService = {
  // Warga
  getWarga: () => {
    return getStorage<Warga[]>('skyrt_warga_v8', INITIAL_WARGA);
  },
  
  saveWarga: (data: Warga[]) => {
    setStorage('skyrt_warga_v8', data);
  },
  addWarga: (w: Warga) => {
    const all = dbService.getWarga();
    dbService.saveWarga([...all, w]);
  },
  deleteWarga: (id: string) => {
    const all = dbService.getWarga();
    const updated = all.filter(w => w.id !== id);
    dbService.saveWarga(updated);
    return updated;
  },

  getOrCreateWarga: (email: string, fullName?: string): Warga => {
    const all = dbService.getWarga();
    let warga = all.find(w => w.email === email);
    
    if (!warga) {
      // Derive name from email if fullName is missing (e.g. anis@gmail.com -> Anis)
      const derivedName = email.split('@')[0]
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      warga = {
        id: `warga-${Math.random().toString(36).substr(2, 9)}`,
        nama: fullName || derivedName || 'Warga Baru',
        email: email,
        nik: '0000000000000000', // Default placeholder
        alamat: '',
        no_hp: '',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: new Date().toISOString().split('T')[0],
        role: 'warga',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dbService.saveWarga([...all, warga]);
    }
    
    return warga;
  },

  registerWarga: (data: { email: string; nama: string; nik: string; no_hp: string; password?: string }) => {
    const all = dbService.getWarga();
    if (all.find(w => w.email === data.email)) {
      throw new Error('Email sudah terdaftar');
    }
    if (all.find(w => w.nik === data.nik)) {
      throw new Error('NIK sudah terdaftar');
    }

    const warga: Warga = {
      id: `warga-${Math.random().toString(36).substr(2, 9)}`,
      nama: data.nama,
      email: data.email,
      nik: data.nik,
      alamat: '',
      no_hp: data.no_hp,
      jenis_kelamin: 'Laki-laki',
      tanggal_lahir: new Date().toISOString().split('T')[0],
      role: 'warga',
      status: 'pending',
      password: data.password,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbService.saveWarga([...all, warga]);
    return warga;
  },

  // KK
  getKK: () => getStorage<KartuKeluarga[]>('skyrt_kk_v8', INITIAL_KK),
  saveKK: (data: KartuKeluarga[]) => setStorage('skyrt_kk_v8', data),
  deleteKK: (id: string) => {
    const all = dbService.getKK();
    const updated = all.filter(k => k.id !== id);
    dbService.saveKK(updated);
    return updated;
  },

  // Iuran
  getIuran: () => getStorage<Iuran[]>('skyrt_iuran_v8', INITIAL_IURAN),
  saveIuran: (data: Iuran[]) => setStorage('skyrt_iuran_v8', data),
  addIuran: (i: Iuran) => {
    const all = dbService.getIuran();
    // Check for double payment same month
    const exists = all.find(item => item.warga_id === i.warga_id && item.bulan === i.bulan);
    if (exists) throw new Error('Warga sudah membayar iuran untuk bulan ini');
    dbService.saveIuran([...all, i]);
  },
  deleteIuran: (id: string) => {
    const all = dbService.getIuran();
    const updated = all.filter(i => i.id !== id);
    dbService.saveIuran(updated);
    return updated;
  },

  // Surat
  getSurat: () => getStorage<Surat[]>('skyrt_surat_v8', INITIAL_SURAT),
  saveSurat: (data: Surat[]) => setStorage('skyrt_surat_v8', data),
  addSurat: (s: Surat) => {
    const all = dbService.getSurat();
    dbService.saveSurat([...all, s]);
  },
  deleteSurat: (id: string) => {
    const all = dbService.getSurat();
    const updated = all.filter(s => s.id !== id);
    dbService.saveSurat(updated);
    return updated;
  },

  // RT Profile
  getRTProfile: () => getStorage<RTProfile>('skyrt_rt_profile_v2', INITIAL_RT_PROFILE),
  saveRTProfile: (data: RTProfile) => setStorage('skyrt_rt_profile_v2', data),

  // Keuangan
  getTransactions: () => getStorage<any[]>('skyrt_transactions_v1', INITIAL_TRANSACTIONS),
  saveTransactions: (data: any[]) => setStorage('skyrt_transactions_v1', data),
  addTransaction: (t: any) => {
    const all = dbService.getTransactions();
    dbService.saveTransactions([t, ...all]);
  },

  // Pengumuman
  getPengumuman: () => getStorage<any[]>('skyrt_pengumuman_v1', INITIAL_PENGUMUMAN),
  savePengumuman: (data: any[]) => setStorage('skyrt_pengumuman_v1', data),
  addPengumuman: (p: any) => {
    const all = dbService.getPengumuman();
    dbService.savePengumuman([p, ...all]);
  },
  deletePengumuman: (id: number) => {
    const all = dbService.getPengumuman();
    const updated = all.filter(p => p.id !== id);
    dbService.savePengumuman(updated);
    return updated;
  },

  // Comments
  getComments: (pengumumanId: number) => getStorage<any[]>(`skyrt_comments_${pengumumanId}`, []),
  saveComments: (pengumumanId: number, data: any[]) => setStorage(`skyrt_comments_${pengumumanId}`, data),
  addComment: (pengumumanId: number, comment: any) => {
    const all = dbService.getComments(pengumumanId);
    dbService.saveComments(pengumumanId, [...all, comment]);
  },

  // Agenda
  getAgenda: () => getStorage<Agenda[]>('skyrt_agenda_v1', INITIAL_AGENDA),
  saveAgenda: (data: Agenda[]) => setStorage('skyrt_agenda_v1', data),
  addAgenda: (a: Agenda) => {
    const all = dbService.getAgenda();
    dbService.saveAgenda([...all, a]);
  },
  deleteAgenda: (id: number) => {
    const all = dbService.getAgenda();
    const updated = all.filter(a => a.id !== id);
    dbService.saveAgenda(updated);
    return updated;
  },

  // Agenda Izin
  getAgendaIzin: () => getStorage<AgendaIzin[]>('skyrt_agenda_izin_v1', []),
  saveAgendaIzin: (data: AgendaIzin[]) => setStorage('skyrt_agenda_izin_v1', data),
  addAgendaIzin: (izin: AgendaIzin) => {
    const all = dbService.getAgendaIzin();
    dbService.saveAgendaIzin([...all, izin]);
  },
  updateAgendaIzin: (id: string, updates: Partial<AgendaIzin>) => {
    const all = dbService.getAgendaIzin();
    const updated = all.map(izin => izin.id === id ? { ...izin, ...updates } : izin);
    dbService.saveAgendaIzin(updated);
    return updated;
  },
  deleteAgendaIzin: (id: string) => {
    const all = dbService.getAgendaIzin();
    const updated = all.filter(izin => izin.id !== id);
    dbService.saveAgendaIzin(updated);
    return updated;
  },

  // Settings
  getSettings: () => getStorage<NotificationSettings>('skyrt_notifications_v1', INITIAL_NOTIFICATION_SETTINGS),
  saveSettings: (data: NotificationSettings) => setStorage('skyrt_notifications_v1', data)
};
