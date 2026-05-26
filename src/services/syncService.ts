import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbService } from './dbService';

export const syncService = {
  async initSync() {
    if (!isSupabaseConfigured()) return false;

    try {
      // Fetch all tables
      const [
        { data: warga },
        { data: kk },
        { data: iuran },
        { data: surat },
        { data: rtProfile },
        { data: agenda },
        { data: agendaIzin }
      ] = await Promise.all([
        supabase.from('warga').select('*'),
        supabase.from('kartu_keluarga').select('*'),
        supabase.from('iuran').select('*'),
        supabase.from('surat').select('*'),
        supabase.from('rt_profile').select('*').limit(1),
        supabase.from('agenda').select('*'),
        supabase.from('agenda_izin').select('*')
      ]);

      if (warga && warga.length > 0) dbService.saveWarga(warga as any, true);
      if (kk && kk.length > 0) dbService.saveKK(kk as any, true);
      if (iuran && iuran.length > 0) dbService.saveIuran(iuran as any, true);
      if (surat && surat.length > 0) dbService.saveSurat(surat as any, true);
      if (rtProfile && rtProfile.length > 0) dbService.saveRTProfile(rtProfile[0] as any, true);
      if (agenda && agenda.length > 0) dbService.saveAgenda(agenda as any, true);
      if (agendaIzin && agendaIzin.length > 0) dbService.saveAgendaIzin(agendaIzin as any, true);

      return true;
    } catch (e) {
      console.error('Error syncing from Supabase:', e);
      return false;
    }
  }
};
