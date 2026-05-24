import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, MapPin, Clock, Users, Edit3, Trash2, Loader2, FileText, Check, X, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { dbService } from '../../services/dbService';
import { Agenda, AgendaIzin } from '../../types';

const AgendaAdmin = () => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'izin'>('agenda');
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [izins, setIzins] = useState<AgendaIzin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      setAgendas(dbService.getAgenda());
      setIzins(dbService.getAgendaIzin());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleEditIzin = async (izin: AgendaIzin) => {
    const { value: formValues } = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Ubah Izin Warga</span>',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Izin</label>
            <select id="swal-status" class="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold">
              <option value="pending" ${izin.status === 'pending' ? 'selected' : ''}>Menunggu Verifikasi (Pending)</option>
              <option value="approved" ${izin.status === 'approved' ? 'selected' : ''}>Disetujui (Approved)</option>
              <option value="rejected" ${izin.status === 'rejected' ? 'selected' : ''}>Ditolak (Rejected)</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catatan Admin</label>
            <textarea id="swal-note" class="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-medium min-h-[100px]">${izin.catatan_admin || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      confirmButtonColor: '#0ea5e9',
      cancelButtonText: 'Batal',
      focusConfirm: false,
      customClass: {
        popup: 'rounded-[2.5rem]',
      },
      preConfirm: () => {
        return {
          status: (document.getElementById('swal-status') as HTMLSelectElement).value,
          catatan_admin: (document.getElementById('swal-note') as HTMLTextAreaElement).value
        };
      }
    });

    if (formValues) {
      const updated = dbService.updateAgendaIzin(izin.id, {
        status: formValues.status as any,
        catatan_admin: formValues.catatan_admin,
        reviewed_at: new Date().toISOString()
      });
      setIzins(updated);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data izin warga telah diperbarui.',
        confirmButtonColor: '#0ea5e9',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  const handleDeleteIzin = async (id: string) => {
    const result = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Hapus Izin?</span>',
      text: "Data izin ini akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#slate-400',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (result.isConfirmed) {
      const updated = dbService.deleteAgendaIzin(id);
      setIzins(updated);
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Data izin telah berhasil dihapus.',
        confirmButtonColor: '#0ea5e9',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { value: note, isConfirmed } = await Swal.fire({
      title: `<span class="font-black uppercase tracking-tight text-slate-800">${status === 'approved' ? 'Setujui Izin' : 'Tolak Izin'}</span>`,
      input: 'textarea',
      inputLabel: 'Berikan Catatan untuk Warga (Opsional)',
      inputPlaceholder: 'Contoh: Silakan istirahat, Semoga cepat sembuh...',
      showCancelButton: true,
      confirmButtonText: status === 'approved' ? 'Setujui' : 'Tolak',
      confirmButtonColor: status === 'approved' ? '#10b981' : '#f43f5e',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-[2rem]',
        input: 'rounded-xl font-medium border-slate-100 bg-slate-50'
      }
    });

    if (isConfirmed) {
      const updated = dbService.updateAgendaIzin(id, { 
        status,
        reviewed_at: new Date().toISOString(),
        catatan_admin: note || ''
      });
      setIzins(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Status izin telah diperbarui menjadi ${status === 'approved' ? 'Disetujui' : 'Ditolak'}.`,
        confirmButtonColor: '#0ea5e9',
        customClass: { popup: 'rounded-[2rem]' }
      });
    }
  };

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Tambah Agenda Baru</span>',
      html: `
        <div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Judul Kegiatan</label>
            <input id="swal-title" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="Contoh: Kerja Bakti">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal</label>
              <input id="swal-date" type="date" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu</label>
              <input id="swal-time" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="07:00 - 10:00">
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi</label>
            <input id="swal-location" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="Area Fasum RT">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peserta</label>
            <input id="swal-participants" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="Seluruh Warga">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deskripsi</label>
            <textarea id="swal-description" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 h-24" placeholder="Detail kegiatan..."></textarea>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
            <input id="swal-category" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="Kegiatan Rutin">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Agenda',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const date = (document.getElementById('swal-date') as HTMLInputElement).value;
        const time = (document.getElementById('swal-time') as HTMLInputElement).value;
        const location = (document.getElementById('swal-location') as HTMLInputElement).value;
        const participants = (document.getElementById('swal-participants') as HTMLInputElement).value;
        const description = (document.getElementById('swal-description') as HTMLTextAreaElement).value;
        const category = (document.getElementById('swal-category') as HTMLInputElement).value;

        if (!title || !date || !time || !location) {
          Swal.showValidationMessage('Harap isi field yang wajib (Judul, Tanggal, Waktu, Lokasi)');
          return false;
        }

        return { title, date, time, location, participants, description, category };
      }
    });

    if (formValues) {
      const newAgenda: Agenda = {
        id: Date.now(),
        ...formValues
      };
      
      const updated = [...agendas, newAgenda];
      setAgendas(updated);
      dbService.saveAgenda(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Agenda baru telah ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleEdit = async (agenda: Agenda) => {
    const { value: formValues } = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Edit Agenda</span>',
      html: `
        <div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Judul Kegiatan</label>
            <input id="swal-title" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${agenda.title}">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal</label>
              <input id="swal-date" type="date" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${agenda.date}">
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu</label>
              <input id="swal-time" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${agenda.time}">
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi</label>
            <input id="swal-location" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${agenda.location}">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peserta</label>
            <input id="swal-participants" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${agenda.participants}">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deskripsi</label>
            <textarea id="swal-description" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 h-24">${agenda.description}</textarea>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
            <input id="swal-category" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${agenda.category}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const date = (document.getElementById('swal-date') as HTMLInputElement).value;
        const time = (document.getElementById('swal-time') as HTMLInputElement).value;
        const location = (document.getElementById('swal-location') as HTMLInputElement).value;
        const participants = (document.getElementById('swal-participants') as HTMLInputElement).value;
        const description = (document.getElementById('swal-description') as HTMLTextAreaElement).value;
        const category = (document.getElementById('swal-category') as HTMLInputElement).value;

        if (!title || !date || !time || !location) {
          Swal.showValidationMessage('Harap isi field yang wajib');
          return false;
        }

        return { title, date, time, location, participants, description, category };
      }
    });

    if (formValues) {
      const updated = agendas.map(a => a.id === agenda.id ? { ...a, ...formValues } : a);
      setAgendas(updated);
      dbService.saveAgenda(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Agenda telah diperbarui.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Agenda?',
      text: "Kegiatan ini akan dihapus dari jadwal warga.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = agendas.filter(a => a.id !== id);
        setAgendas(updated);
        dbService.saveAgenda(updated);
        Swal.fire('Terhapus!', 'Agenda telah dihapus.', 'success');
      }
    });
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Agenda & Kegiatan</h1>
          <p className="text-slate-500 font-medium font-mono text-xs">Kelola jadwal kegiatan dan izin warga</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] self-start md:self-center">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-6 py-2.5 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'agenda' ? 'bg-white text-sky-main shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Daftar Agenda
          </button>
          <button
            onClick={() => setActiveTab('izin')}
            className={`px-6 py-2.5 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'izin' ? 'bg-white text-sky-main shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Izin Warga
            {izins.filter(i => i.status === 'pending').length > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-white text-[10px] flex items-center justify-center rounded-full">
                {izins.filter(i => i.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={40} className="text-sky-main animate-spin" />
          </div>
        ) : activeTab === 'agenda' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <Calendar className="text-sky-main" /> Semua Agenda
              </h2>
              <button 
                onClick={handleCreate}
                className="px-6 py-3 bg-sky-main text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-sky-200 cursor-pointer"
              >
                <Plus size={18} /> Tambah Agenda
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {agendas.map((agenda, i) => (
                  <motion.div
                    key={agenda.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    layout
                    className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex flex-col items-center justify-center border border-slate-100 group-hover:bg-sky-main group-hover:text-white transition-colors">
                        <span className="text-[10px] font-black uppercase opacity-60">{getMonthName(agenda.date)}</span>
                        <span className="text-xl font-black leading-none">{getDayPhone(agenda.date)}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
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

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(agenda)}
                          className="flex-1 py-3 text-xs font-black uppercase tracking-widest border-2 border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(agenda.id)}
                          className="flex-1 py-3 text-xs font-black uppercase tracking-widest border-2 border-red-50 text-red-400 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {agendas.length === 0 && (
                <div className="col-span-full text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                    <Calendar size={30} />
                  </div>
                  <div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada agenda terjadwal</p>
                    <button 
                      onClick={handleCreate}
                      className="mt-4 text-sky-main font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer"
                    >
                      Tambah agenda sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <FileText className="text-sky-main" /> Permohonan Izin Warga
            </h2>
            
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[700px] border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Warga</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kegiatan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alasan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tanggal</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {izins.map((izin) => {
                      const agenda = agendas.find(a => a.id === izin.agenda_id);
                      return (
                        <motion.tr 
                          key={izin.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white group"
                        >
                          <td className="px-6 py-5 first:rounded-l-[2rem] border-y border-l border-slate-100 group-hover:border-sky-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs">
                                {izin.nama_warga.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-700">{izin.nama_warga}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 group-hover:border-sky-100 transition-colors">
                            <span className="font-bold text-slate-600 truncate max-w-[150px] inline-block">{agenda?.title || 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 group-hover:border-sky-100 transition-colors">
                            <span className="text-sm font-medium text-slate-500 italic max-w-[200px] inline-block truncate">{izin.alasan}</span>
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 group-hover:border-sky-100 transition-colors text-xs font-mono font-bold text-slate-400 uppercase">
                            {new Date(izin.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 group-hover:border-sky-100 transition-colors">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              izin.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                              izin.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-rose-50 text-rose-600'
                            }`}>
                              {izin.status === 'pending' ? 'Pending' : 
                               izin.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                            </span>
                          </td>
                          <td className="px-6 py-5 last:rounded-r-[2rem] border-y border-r border-slate-100 group-hover:border-sky-100 transition-colors">
                            <div className="flex items-center justify-center gap-2">
                              {izin.status === 'pending' ? (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(izin.id, 'approved')}
                                    className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                    title="Setujui"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(izin.id, 'rejected')}
                                    className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                    title="Tolak"
                                  >
                                    <X size={18} />
                                  </button>
                                </>
                              ) : null}
                              <button 
                                onClick={() => handleEditIzin(izin)}
                                className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-sky-main hover:text-white transition-all shadow-sm"
                                title="Ubah Izin"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteIzin(izin.id)}
                                className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                title="Hapus Izin"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {izins.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                    <AlertCircle size={30} />
                  </div>
                  <div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada permohonan izin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaAdmin;
