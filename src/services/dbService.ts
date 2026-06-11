import { Warga, KartuKeluarga, Iuran, Surat, RTProfile, Agenda, NotificationSettings, AgendaIzin, Inventaris } from '../types';
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
  id: '33333333-3333-3333-3333-333333333333',
  no_rt: '',
  nama_ketua: '',
  alamat: '',
  telepon: '',
  email: '',
  nama_jalan: '',
  no_rumah: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
  kota: '',
  provinsi: '',
  kode_pos: '',
  negara: '',
  password: '123',
  nama_aplikasi: 'SkyRT',
  warna_utama: 'Sky Blue (#0ea5e9)',
  bahasa: 'Bahasa Indonesia',
  zona_waktu: 'WIB (Jakarta) GMT+7',
  tentang_gambar: '',
  tentang_teks: '',
  tentang_judul: '',
  tentang_visi: '',
  tentang_misi: '',
  tentang_nilai: ''
};

// Mock Initial Data
const INITIAL_WARGA: Warga[] = [];

const INITIAL_KK: KartuKeluarga[] = [];

const INITIAL_IURAN: Iuran[] = [];

const INITIAL_SURAT: Surat[] = [];

const INITIAL_PENGUMUMAN: any[] = [];

const INITIAL_TRANSACTIONS: any[] = [];

const INITIAL_AGENDA: Agenda[] = [];

const getStorage = <T,>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const setStorage = <T,>(key: string, data: T, skipSync = false) => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage'));
  
  if (!skipSync && isSupabaseConfigured()) {
    const tableMap: Record<string, string> = {
      'skyrt_warga_v8': 'warga',
      'skyrt_kk_v8': 'kartu_keluarga',
      'skyrt_iuran_v8': 'iuran',
      'skyrt_surat_v8': 'surat',
      'skyrt_rt_profile_v2': 'rt_profile',
      'skyrt_agenda_v1': 'agenda',
      'skyrt_agenda_izin_v1': 'agenda_izin'
    };
    
    const tableName = tableMap[key];
    if (tableName) {
      const sanitizeData = (items: any | any[]) => {
        const processItem = (item: any) => {
          const newItem = { ...item };
          if (newItem.kk_id === '') newItem.kk_id = null;
          return newItem;
        };
        return Array.isArray(items) ? items.map(processItem) : processItem(items);
      };

      const sanitizedData = sanitizeData(data);

      if (Array.isArray(sanitizedData)) {
        supabase.from(tableName).upsert(sanitizedData as any[]).then(({error}) => {
          if (error) console.error('Supabase sync error:', error);
        });
      } else {
        supabase.from(tableName).upsert([sanitizedData as any]).then(({error}) => {
          if (error) console.error('Supabase sync error:', error);
        });
      }
    }
  }
};

export const dbService = {
  // Warga
  getWarga: () => {
    return getStorage<Warga[]>('skyrt_warga_v8', INITIAL_WARGA);
  },
  
  saveWarga: (data: Warga[], skipSync = false) => {
    setStorage('skyrt_warga_v8', data, skipSync);
  },
  addWarga: (w: Warga) => {
    const all = dbService.getWarga();
    dbService.saveWarga([...all, w]);
  },
  deleteWarga: (id: string) => {
    const all = dbService.getWarga();
    const updated = all.filter(w => w.id !== id);
    dbService.saveWarga(updated);
    if (isSupabaseConfigured()) supabase.from('warga').delete().eq('id', id).then();
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
        id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
  saveKK: (data: KartuKeluarga[], skipSync = false) => setStorage('skyrt_kk_v8', data, skipSync),
  deleteKK: (id: string) => {
    const all = dbService.getKK();
    const updated = all.filter(k => k.id !== id);
    dbService.saveKK(updated);
    if (isSupabaseConfigured()) supabase.from('kartu_keluarga').delete().eq('id', id).then();
    return updated;
  },

  // Iuran
  getIuran: () => getStorage<Iuran[]>('skyrt_iuran_v8', INITIAL_IURAN),
  saveIuran: (data: Iuran[], skipSync = false) => setStorage('skyrt_iuran_v8', data, skipSync),
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
    if (isSupabaseConfigured()) supabase.from('iuran').delete().eq('id', id).then();
    return updated;
  },

  // Surat
  getSurat: () => getStorage<Surat[]>('skyrt_surat_v8', INITIAL_SURAT),
  saveSurat: (data: Surat[], skipSync = false) => setStorage('skyrt_surat_v8', data, skipSync),
  addSurat: (s: Surat) => {
    const all = dbService.getSurat();
    dbService.saveSurat([...all, s]);
  },
  deleteSurat: (id: string) => {
    const all = dbService.getSurat();
    const updated = all.filter(s => s.id !== id);
    dbService.saveSurat(updated);
    if (isSupabaseConfigured()) supabase.from('surat').delete().eq('id', id).then();
    return updated;
  },

  // RT Profile
  getRTProfile: () => getStorage<RTProfile>('skyrt_rt_profile_v2', INITIAL_RT_PROFILE),
  saveRTProfile: (data: RTProfile, skipSync = false) => setStorage('skyrt_rt_profile_v2', data, skipSync),

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
  saveAgenda: (data: Agenda[], skipSync = false) => setStorage('skyrt_agenda_v1', data, skipSync),
  addAgenda: (a: Agenda) => {
    const all = dbService.getAgenda();
    dbService.saveAgenda([...all, a]);
  },
  deleteAgenda: (id: number) => {
    const all = dbService.getAgenda();
    const updated = all.filter(a => a.id !== id);
    dbService.saveAgenda(updated);
    if (isSupabaseConfigured()) supabase.from('agenda').delete().eq('id', id).then();
    return updated;
  },

  // Agenda Izin
  getAgendaIzin: () => getStorage<AgendaIzin[]>('skyrt_agenda_izin_v1', []),
  saveAgendaIzin: (data: AgendaIzin[], skipSync = false) => setStorage('skyrt_agenda_izin_v1', data, skipSync),
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
    if (isSupabaseConfigured()) supabase.from('agenda_izin').delete().eq('id', id).then();
    return updated;
  },

  // Settings
  getSettings: () => getStorage<NotificationSettings>('skyrt_notifications_v1', INITIAL_NOTIFICATION_SETTINGS),
  saveSettings: (data: NotificationSettings) => setStorage('skyrt_notifications_v1', data),

  // Inventaris
  getInventaris: () => getStorage<Inventaris[]>('skyrt_inventaris_v1', []),
  saveInventaris: (data: Inventaris[]) => setStorage('skyrt_inventaris_v1', data),
  addInventaris: (inv: Inventaris) => {
    const all = dbService.getInventaris();
    dbService.saveInventaris([...all, inv]);
  },
  updateInventaris: (id: string, updates: Partial<Inventaris>) => {
    const all = dbService.getInventaris();
    const updated = all.map(inv => inv.id === id ? { ...inv, ...updates } : inv);
    dbService.saveInventaris(updated);
    return updated;
  },
  deleteInventaris: (id: string) => {
    const all = dbService.getInventaris();
    const updated = all.filter(inv => inv.id !== id);
    dbService.saveInventaris(updated);
    return updated;
  },

  // Reset database to completely empty collections
  resetDatabase: () => {
    localStorage.setItem('skyrt_warga_v8', JSON.stringify([]));
    localStorage.setItem('skyrt_kk_v8', JSON.stringify([]));
    localStorage.setItem('skyrt_iuran_v8', JSON.stringify([]));
    localStorage.setItem('skyrt_surat_v8', JSON.stringify([]));
    localStorage.setItem('skyrt_transactions_v1', JSON.stringify([]));
    localStorage.setItem('skyrt_pengumuman_v1', JSON.stringify([]));
    localStorage.setItem('skyrt_agenda_v1', JSON.stringify([]));
    localStorage.setItem('skyrt_agenda_izin_v1', JSON.stringify([]));
    localStorage.setItem('skyrt_inventaris_v1', JSON.stringify([]));
    localStorage.setItem('skyrt_rt_profile_v2', JSON.stringify({
      id: '33333333-3333-3333-3333-333333333333',
      no_rt: '',
      nama_ketua: '',
      alamat: '',
      telepon: '',
      email: '',
      nama_jalan: '',
      no_rumah: '',
      rt: '',
      rw: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      kode_pos: '',
      negara: '',
      password: '123',
      nama_aplikasi: 'SkyRT',
      warna_utama: 'Sky Blue (#0ea5e9)',
      bahasa: 'Bahasa Indonesia',
      zona_waktu: 'WIB (Jakarta) GMT+7',
      tentang_gambar: '',
      tentang_teks: '',
      tentang_judul: '',
      tentang_visi: '',
      tentang_misi: '',
      tentang_nilai: ''
    }));
    // Trigger custom event to notify components
    window.dispatchEvent(new Event('storage'));
  }
};
