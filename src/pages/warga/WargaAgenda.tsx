import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Clock, Users, Loader2, FileText, X, ChevronRight, AlertCircle, CheckCircle2, Clock3 } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { Agenda, AgendaIzin } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const WargaAgenda = () => {
  const { user } = useAuth();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [izins, setIzins] = useState<AgendaIzin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [alasan, setAlasan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setAgendas(dbService.getAgenda());
      setIzins(dbService.getAgendaIzin());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAjukanIzin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgenda || !user || !alasan) return;

    setIsSubmitting(true);
    
    // Get profile for name
    const profile = dbService.getOrCreateWarga(user.email);
    
    const newIzin: AgendaIzin = {
      id: `izin-${Math.random().toString(36).substr(2, 9)}`,
      agenda_id: selectedAgenda.id,
      user_id: user.id,
      nama_warga: profile.nama,
      alasan: alasan,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    dbService.addAgendaIzin(newIzin);
    
    // Update local state
    setIzins([...izins, newIzin]);
    
    setIsSubmitting(false);
    setSelectedAgenda(null);
    setAlasan('');
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Permohonan izin Anda telah dikirim.',
      confirmButtonColor: '#0ea5e9',
      customClass: { popup: 'rounded-[2rem]' }
    });
  };

  const getIzinForAgenda = (agendaId: number) => {
    return izins.find(izin => izin.agenda_id === agendaId && izin.user_id === user?.id);
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'short' });
  };

  const getDayPhone = (dateString: string) => {
    return dateString.split('-')[2];
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Agenda & Kegiatan</h1>
          <p className="text-slate-500 font-medium font-mono text-xs">Jadwal kegiatan rukun tetangga</p>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={40} className="text-sky-main animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {agendas.map((agenda, i) => {
                const izin = getIzinForAgenda(agenda.id);
                return (
                  <motion.div
                    key={agenda.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    layout
                    className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden flex flex-col h-full"
                  >
                    <div className="absolute top-0 right-0 p-8">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex flex-col items-center justify-center border border-slate-100 group-hover:bg-sky-main group-hover:text-white transition-colors">
                        <span className="text-[10px] font-black uppercase opacity-60">{getMonthName(agenda.date)}</span>
                        <span className="text-xl font-black leading-none">{getDayPhone(agenda.date)}</span>
                      </div>
                    </div>

                    <div className="space-y-6 flex-1">
                      <div className="space-y-1">
                        <div className="inline-flex px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">
                          {agenda.category}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight pr-20">{agenda.title}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-slate-500">
                          <Clock size={16} className="text-sky-main" />
                          <span className="text-sm font-bold font-mono">{agenda.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <MapPin size={16} className="text-sky-main" />
                          <span className="text-sm font-bold truncate">{agenda.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <Users size={16} className="text-sky-main" />
                          <span className="text-sm font-bold">{agenda.participants}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed font-medium">
                        {agenda.description}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50">
                      {izin ? (
                        <div className={`p-6 rounded-[2rem] border ${
                          izin.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                          izin.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                          'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                izin.status === 'pending' ? 'bg-amber-100' :
                                izin.status === 'approved' ? 'bg-emerald-100' :
                                'bg-rose-100'
                              }`}>
                                {izin.status === 'pending' ? <Clock3 size={20} /> :
                                 izin.status === 'approved' ? <CheckCircle2 size={20} /> :
                                 <AlertCircle size={20} />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Izin</p>
                                <p className="text-sm font-black">
                                  {izin.status === 'pending' ? 'Menunggu Verifikasi' :
                                   izin.status === 'approved' ? 'Izin Disetujui' :
                                   'Izin Ditolak'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Diajukan</p>
                               <p className="text-[10px] font-mono font-bold">
                                 {new Date(izin.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} {new Date(izin.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                               </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="p-3 bg-white/50 rounded-xl">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Alasan Anda</p>
                              <p className="text-xs font-medium leading-relaxed">{izin.alasan}</p>
                            </div>

                            {izin.status !== 'pending' && (
                              <div className="p-3 bg-white/50 rounded-xl border border-white/40">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Catatan Pengurus</p>
                                <p className="text-xs font-bold leading-relaxed">
                                  {izin.catatan_admin || 'Tidak ada catatan tambahan.'}
                                </p>
                                <div className="mt-2 flex items-center justify-end gap-1 opacity-40">
                                  <Clock size={10} />
                                  <span className="text-[9px] font-mono font-black uppercase">
                                    Diverifikasi: {new Date(izin.reviewed_at!).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAgenda(agenda)}
                          className="w-full py-4 bg-slate-50 hover:bg-sky-main hover:text-white text-slate-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all border-2 border-transparent hover:border-sky-main flex items-center justify-center gap-2 group/btn"
                        >
                          <FileText size={16} className="group-hover/btn:scale-110 transition-transform" />
                          Ajukan Izin Ketidakhadiran
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {agendas.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                  <Calendar size={30} />
                </div>
                <div>
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada agenda terjadwal</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Ajukan Izin */}
      <AnimatePresence>
        {selectedAgenda && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgenda(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sky-gradient text-white relative">
                <button
                  onClick={() => setSelectedAgenda(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase">Formulir Izin</h2>
                    <p className="text-white/60 text-xs font-mono">Ajukan ketidakhadiran kegiatan</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAjukanIzin} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kegiatan</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-bold">
                      <Calendar size={18} className="text-sky-main" />
                      {selectedAgenda.title}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alasan Ketidakhadiran</label>
                    <textarea
                      required
                      value={alasan}
                      onChange={(e) => setAlasan(e.target.value)}
                      placeholder="Contoh: Sedang sakit, Acara keluarga di luar kota, dll."
                      className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700 min-h-[120px]"
                    />
                  </div>

                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-4">
                    <AlertCircle size={20} className="text-sky-600 shrink-0 mt-1" />
                    <p className="text-xs text-sky-700 leading-relaxed">
                      Permohonan izin akan ditinjau oleh Ketua RT atau pengurus terkait. Mohon berikan alasan yang jelas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAgenda(null)}
                    className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 sky-gradient text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Kirim Izin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WargaAgenda;
