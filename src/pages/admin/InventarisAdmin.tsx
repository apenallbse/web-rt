import React, { useState, useMemo } from 'react';
import { Package, Plus, Trash2, Edit, Search, AlertCircle, CheckCircle, PackageOpen, Tag, Calendar, Save, X, Printer } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { Inventaris } from '../../types';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InventarisAdmin = () => {
  const [inventaris, setInventaris] = useState<Inventaris[]>(dbService.getInventaris());
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState<string>('semua');
  
  const [formData, setFormData] = useState({
    nama_barang: '',
    kode_barang: '',
    jumlah: 1,
    kondisi: 'baik' as 'baik' | 'rusak_ringan' | 'rusak_berat',
    tanggal_masuk: new Date().toISOString().split('T')[0],
    keterangan: ''
  });

  const handleOpenModal = (inv?: Inventaris) => {
    if (inv) {
      setEditId(inv.id);
      setFormData({
        nama_barang: inv.nama_barang,
        kode_barang: inv.kode_barang,
        jumlah: inv.jumlah,
        kondisi: inv.kondisi,
        tanggal_masuk: inv.tanggal_masuk,
        keterangan: inv.keterangan || ''
      });
    } else {
      setEditId(null);
      setFormData({
        nama_barang: '',
        kode_barang: '',
        jumlah: 1,
        kondisi: 'baik',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        keterangan: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        setInventaris(dbService.updateInventaris(editId, formData));
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data inventaris berhasil diperbarui',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const newItem: Inventaris = {
          id: `inv-${Date.now()}`,
          ...formData
        };
        dbService.addInventaris(newItem);
        setInventaris(dbService.getInventaris());
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Barang baru berhasil ditambahkan',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setShowModal(false);
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Barang?',
      text: `Anda yakin ingin menghapus ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setInventaris(dbService.deleteInventaris(id));
        Swal.fire('Terhapus!', 'Data barang telah dihapus.', 'success');
      }
    });
  };

  const filteredData = useMemo(() => {
    return inventaris.filter(inv => {
      const matchSearch = inv.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.kode_barang.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKondisi = filterKondisi === 'semua' || inv.kondisi === filterKondisi;
      return matchSearch && matchKondisi;
    }).sort((a, b) => new Date(b.tanggal_masuk).getTime() - new Date(a.tanggal_masuk).getTime());
  }, [inventaris, searchTerm, filterKondisi]);

  const summary = useMemo(() => {
    return {
      total: inventaris.reduce((acc, curr) => acc + curr.jumlah, 0),
      baik: inventaris.filter(i => i.kondisi === 'baik').reduce((acc, curr) => acc + curr.jumlah, 0),
      rusakRingan: inventaris.filter(i => i.kondisi === 'rusak_ringan').reduce((acc, curr) => acc + curr.jumlah, 0),
      rusakBerat: inventaris.filter(i => i.kondisi === 'rusak_berat').reduce((acc, curr) => acc + curr.jumlah, 0)
    };
  }, [inventaris]);

  const getKondisiBadge = (kondisi: string) => {
    switch(kondisi) {
      case 'baik': return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><CheckCircle size={10} /> Baik</span>;
      case 'rusak_ringan': return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><AlertCircle size={10} /> Rusak Ringan</span>;
      case 'rusak_berat': return <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><AlertCircle size={10} /> Rusak Berat</span>;
      default: return null;
    }
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.text('Laporan Inventaris RT', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Kode Barang', 'Nama Barang', 'Jumlah', 'Kondisi', 'Tanggal Masuk', 'Keterangan']],
      body: filteredData.map(inv => [
        inv.kode_barang,
        inv.nama_barang,
        inv.jumlah,
        inv.kondisi === 'baik' ? 'Baik' : inv.kondisi === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat',
        inv.tanggal_masuk,
        inv.keterangan || '-'
      ]),
    });
    
    doc.save('Laporan_Inventaris.pdf');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-sky-dark mb-2">Inventaris RT</h2>
          <p className="text-gray-500 font-medium">Kelola data aset dan barang milik warga RT</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <button 
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-4 bg-white border border-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer size={20} /> Cetak PDF
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto px-6 py-4 sky-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-sky-main/20"
          >
            <Plus size={20} /> Tambah Barang
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'Total Barang', val: summary.total, color: 'text-sky-600', bg: 'bg-sky-50' },
          { icon: CheckCircle, label: 'Kondisi Baik', val: summary.baik, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: AlertCircle, label: 'Rusak Ringan', val: summary.rusakRingan, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: AlertCircle, label: 'Rusak Berat', val: summary.rusakBerat, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari kode atau nama barang..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-transparent focus:border-sky-main rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {[
              { id: 'semua', label: 'Semua Status' },
              { id: 'baik', label: 'Baik' },
              { id: 'rusak_ringan', label: 'R. Ringan' },
              { id: 'rusak_berat', label: 'R. Berat' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterKondisi(f.id)}
                className={`px-6 py-3 whitespace-nowrap rounded-xl font-bold text-sm transition-all ${
                  filterKondisi === f.id 
                    ? 'bg-sky-dark text-white shadow-xl shadow-blue-900/20' 
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Kode</th>
                <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Barang</th>
                <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Jumlah</th>
                <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Kondisi</th>
                <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Keterangan</th>
                <th className="text-right px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredData.length > 0 ? filteredData.map((item) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={item.id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-sky-500" />
                        <span className="font-bold text-slate-700 font-mono text-sm">{item.kode_barang}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-slate-800">{item.nama_barang}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar size={12}/> {item.tanggal_masuk}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black flex items-center justify-center">
                        {item.jumlah}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {getKondisiBadge(item.kondisi)}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-500 max-w-xs truncate" title={item.keterangan || '-'}>
                        {item.keterangan || '-'}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item.nama_barang)}
                          className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <PackageOpen size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-500 font-medium">Tidak ada data inventaris ditemukan.</p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-6 sm:p-10 overflow-y-auto max-h-[95vh] sm:max-h-[90vh]"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute right-6 top-6 p-3 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center mb-6">
                  {editId ? <Edit size={28} /> : <Package size={28} />}
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                  {editId ? 'Edit Barang' : 'Tambah Barang'}
                </h3>
                <p className="text-slate-500 font-medium mt-2">
                  Lengkapi form berikut untuk pendataan aset RT
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Kode Barang</label>
                    <input 
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 uppercase"
                      value={formData.kode_barang}
                      onChange={(e) => setFormData({...formData, kode_barang: e.target.value.toUpperCase()})}
                      required
                      placeholder="Contoh: INV-01"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal Masuk</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      value={formData.tanggal_masuk}
                      onChange={(e) => setFormData({...formData, tanggal_masuk: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Nama Barang</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    value={formData.nama_barang}
                    onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
                    required
                    placeholder="Contoh: Kursi Lipat Chitose"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Jumlah</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({...formData, jumlah: parseInt(e.target.value) || 1})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Status/Kondisi</label>
                    <select
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 appearance-none"
                      value={formData.kondisi}
                      onChange={(e) => setFormData({...formData, kondisi: e.target.value as any})}
                    >
                      <option value="baik">Kondisi Baik</option>
                      <option value="rusak_ringan">Rusak Ringan</option>
                      <option value="rusak_berat">Rusak Berat</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Keterangan (Opsional)</label>
                  <textarea 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 resize-none h-24"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                    placeholder="Tuliskan detail spesifikasi atau lokasi penyimpanan..."
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full py-4 sky-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-xl shadow-sky-900/20"
                  >
                    <Save size={20} />
                    {editId ? 'Simpan Perubahan' : 'Tambahkan Barang'}
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

export default InventarisAdmin;
