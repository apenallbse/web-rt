import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Plus, Eye, Trash2, Edit3, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { dbService } from '../../services/dbService';

const PengumumanAdmin = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'Aktif' | 'Draft'>('Aktif');

  useEffect(() => {
    const loadData = () => {
      setAnnouncements(dbService.getPengumuman());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Buat Pengumuman</span>',
      html: `
        <div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Judul Pengumuman</label>
            <input id="swal-title" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="Contoh: Kerja Bakti Rutin">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
            <select id="swal-category" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700">
              <option value="Informasi">Informasi</option>
              <option value="Kegiatan">Kegiatan</option>
              <option value="Peringatan">Peringatan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Konten / Isi</label>
            <textarea id="swal-content" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 h-32" placeholder="Tulis pengumuman di sini..."></textarea>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
            <select id="swal-status" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700">
              <option value="Aktif">Aktif (Langsung Terbit)</option>
              <option value="Draft">Draft (Simpan Saja)</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Terbitkan',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const category = (document.getElementById('swal-category') as HTMLSelectElement).value;
        const content = (document.getElementById('swal-content') as HTMLTextAreaElement).value;
        const status = (document.getElementById('swal-status') as HTMLSelectElement).value;

        if (!title || !content) {
          Swal.showValidationMessage('Harap isi judul dan konten');
          return false;
        }

        return { title, category, content, status };
      }
    });

    if (formValues) {
      const newAnnouncement = {
        id: Date.now(),
        ...formValues,
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      
      const updated = [newAnnouncement, ...announcements];
      setAnnouncements(updated);
      dbService.savePengumuman(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengumuman telah berhasil dibuat.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleEdit = async (item: any) => {
    const { value: formValues } = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Edit Pengumuman</span>',
      html: `
        <div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Judul Pengumuman</label>
            <input id="swal-title" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${item.title}">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
            <select id="swal-category" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700">
              <option value="Informasi" ${item.category === 'Informasi' ? 'selected' : ''}>Informasi</option>
              <option value="Kegiatan" ${item.category === 'Kegiatan' ? 'selected' : ''}>Kegiatan</option>
              <option value="Peringatan" ${item.category === 'Peringatan' ? 'selected' : ''}>Peringatan</option>
              <option value="Lainnya" ${item.category === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Konten / Isi</label>
            <textarea id="swal-content" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700 h-32">${item.content}</textarea>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
            <select id="swal-status" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700">
              <option value="Aktif" ${item.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
              <option value="Draft" ${item.status === 'Draft' ? 'selected' : ''}>Draft</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const category = (document.getElementById('swal-category') as HTMLSelectElement).value;
        const content = (document.getElementById('swal-content') as HTMLTextAreaElement).value;
        const status = (document.getElementById('swal-status') as HTMLSelectElement).value;

        if (!title || !content) {
          Swal.showValidationMessage('Harap isi judul dan konten');
          return false;
        }

        return { title, category, content, status };
      }
    });

    if (formValues) {
      const updated = announcements.map(a => a.id === item.id ? { ...a, ...formValues } : a);
      setAnnouncements(updated);
      dbService.savePengumuman(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengumuman telah diperbarui.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Pengumuman?',
      text: "Warga tidak akan bisa melihat pengumuman ini lagi.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = announcements.filter(p => p.id !== id);
        setAnnouncements(updated);
        dbService.savePengumuman(updated);
        Swal.fire('Terhapus!', 'Pengumuman telah dihapus.', 'success');
      }
    });
  };

  const handlePreview = (item: any) => {
    Swal.fire({
      title: `<span class="font-black tracking-tight text-slate-800">${item.title}</span>`,
      html: `
        <div class="text-left p-2 space-y-4">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest leading-none">${item.category}</span>
            <span class="text-[10px] text-slate-400 font-mono font-bold">${item.date}</span>
          </div>
          <div class="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">${item.content}</div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  const toggleStatus = (item: any) => {
    const newStatus = item.status === 'Aktif' ? 'Draft' : 'Aktif';
    const updated = announcements.map(a => a.id === item.id ? { ...a, status: newStatus } : a);
    setAnnouncements(updated);
    dbService.savePengumuman(updated);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Status diubah ke ${newStatus}`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const filteredAnnouncements = announcements.filter(a => a.status === filterStatus);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Pengumuman</h1>
          <p className="text-slate-500 font-medium font-mono text-xs">Siarkan berita penting untuk seluruh warga</p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-6 py-3 bg-sky-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 cursor-pointer"
        >
          <Plus size={18} /> Buat Pengumuman
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 self-start shadow-sm w-fit">
        {['Aktif', 'Draft'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              filterStatus === status 
                ? 'bg-sky-main text-white shadow-lg shadow-sky-main/20' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4 relative min-h-[300px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={40} className="text-sky-main animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 items-start md:items-center ${
                  item.status === 'Draft' ? 'opacity-75 grayscale-[0.3]' : ''
                }`}
              >
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  item.category === 'Informasi' ? 'bg-blue-50 text-blue-600' : 
                  item.category === 'Kegiatan' ? 'bg-emerald-50 text-emerald-600' :
                  item.category === 'Peringatan' ? 'bg-rose-50 text-rose-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  <Megaphone size={24} />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                      {item.date}
                    </span>
                    <button 
                      onClick={() => toggleStatus(item)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      item.status === 'Aktif' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                      {item.status}
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">{item.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button 
                    onClick={() => handlePreview(item)}
                    className="p-3 text-slate-400 hover:text-sky-main hover:bg-sky-50 rounded-xl transition-all cursor-pointer"
                    title="Pratinjau"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-3 text-slate-400 hover:text-sky-main hover:bg-sky-50 rounded-xl transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && announcements.length === 0 && (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
              <Megaphone size={30} />
            </div>
            <div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada pengumuman</p>
              <button 
                onClick={handleCreate}
                className="mt-4 text-sky-main font-black text-[10px] uppercase tracking-widest hover:underline"
              >
                Buat pengumuman pertama Anda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PengumumanAdmin;
