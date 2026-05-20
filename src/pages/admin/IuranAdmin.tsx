import React, { useState, useMemo } from 'react';
import { dbService } from '../../services/dbService';
import { Iuran, Warga } from '../../types';
import { CreditCard, Filter, CheckCircle, XCircle, Search, Calendar, Edit2, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

const IuranAdmin = () => {
  const [iurans, setIurans] = useState<Iuran[]>(dbService.getIuran());
  const [warga] = useState<Warga[]>(dbService.getWarga());
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    warga_id: '',
    bulan: filterMonth,
    jumlah: 50000,
    status: 'lunas' as 'lunas' | 'belum',
    tanggal_bayar: new Date().toISOString().split('T')[0]
  });

  const filteredData = useMemo(() => {
    return warga.map(w => {
      const payment = iurans.find(i => i.warga_id === w.id && i.bulan === filterMonth);
      return { 
        warga: w, 
        payment: payment || null 
      };
    }).filter(item => 
      item.warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warga.nik.includes(searchTerm)
    ).sort((a, b) => {
      // Prioritas yang sudah bayar di atas atau bisa juga sorting nama
      if (a.payment && !b.payment) return -1;
      if (!a.payment && b.payment) return 1;
      return a.warga.nama.localeCompare(b.warga.nama);
    });
  }, [warga, iurans, filterMonth, searchTerm]);

  const handleOpenModal = (wargaId?: string, payment?: Iuran | null) => {
    if (payment) {
      setEditId(payment.id);
      setFormData({
        warga_id: payment.warga_id,
        bulan: payment.bulan,
        jumlah: payment.jumlah,
        status: payment.status,
        tanggal_bayar: payment.tanggal_bayar || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditId(null);
      setFormData({
        warga_id: wargaId || '',
        bulan: filterMonth,
        jumlah: 50000,
        status: 'lunas',
        tanggal_bayar: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warga_id) return;

    try {
      const current = dbService.getIuran();
      if (editId) {
        const oldPayment = current.find(i => i.id === editId);
        const updated = current.map(i => i.id === editId ? { ...i, ...formData } : i);
        dbService.saveIuran(updated);
        setIurans(updated);

        // SYNC KEUANGAN IF STATUS CHANGED TO LUNAS
        if (oldPayment?.status !== 'lunas' && formData.status === 'lunas') {
          const w = warga.find(item => item.id === formData.warga_id);
          dbService.addTransaction({
            id: Date.now(),
            type: 'Masuk',
            category: 'Iuran Warga',
            amount: formData.jumlah,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            note: `Iuran ${formData.bulan} - ${w?.nama || 'Warga'}`
          });
        }
        
        // SYNC KEUANGAN IF STATUS CHANGED FROM LUNAS TO BELUM
        if (oldPayment?.status === 'lunas' && formData.status !== 'lunas') {
          const w = warga.find(item => item.id === formData.warga_id);
          const noteToFind = `Iuran ${formData.bulan} - ${w?.nama || 'Warga'}`;
          const transactions = dbService.getTransactions();
          const filteredTransactions = transactions.filter(t => t.note !== noteToFind);
          dbService.saveTransactions(filteredTransactions);
        }

        Swal.fire({ title: 'Berhasil!', text: 'Data iuran telah diperbarui.', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        // Cek double payment
        const exists = current.find(i => i.warga_id === formData.warga_id && i.bulan === formData.bulan);
        if (exists) {
          Swal.fire('Info', 'Warga ini sudah membayar iuran untuk bulan ini.', 'info');
          return;
        }

        const newPayment: Iuran = {
          id: `i-${Date.now()}`,
          ...formData
        };
        const updated = [...current, newPayment];
        dbService.saveIuran(updated);
        setIurans(updated);

        // SYNC KEUANGAN
        if (formData.status === 'lunas') {
          const w = warga.find(item => item.id === formData.warga_id);
          dbService.addTransaction({
            id: Date.now(),
            type: 'Masuk',
            category: 'Iuran Warga',
            amount: formData.jumlah,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            note: `Iuran ${formData.bulan} - ${w?.nama || 'Warga'}`
          });
        }

        Swal.fire({ title: 'Berhasil!', text: 'Iuran baru ditambahkan.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
      handleCloseModal();
    } catch (error) {
      Swal.fire('Error', 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = (id: string, payment?: Iuran) => {
    Swal.fire({
      title: 'Hapus Catatan Iuran?',
      text: "Catatan pembayaran ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = dbService.deleteIuran(id);
        setIurans(updated);

        // SYNC KEUANGAN (Try to remove transaction)
        if (payment?.status === 'lunas') {
          const w = warga.find(item => item.id === payment.warga_id);
          const noteToFind = `Iuran ${payment.bulan} - ${w?.nama || 'Warga'}`;
          const transactions = dbService.getTransactions();
          const filteredTransactions = transactions.filter(t => t.note !== noteToFind);
          dbService.saveTransactions(filteredTransactions);
        }

        Swal.fire('Terhapus!', 'Catatan iuran telah dihapus.', 'success');
      }
    });
  };

  const quickToggle = (wargaId: string, currentPayment: Iuran | null) => {
    if (currentPayment && currentPayment.status === 'lunas') {
      handleDelete(currentPayment.id, currentPayment);
    } else {
      // If 'belum' exists, we update it to 'lunas'
      // If no payment exists, we create new 'lunas'
      
      const paymentToSave: Iuran = currentPayment 
        ? { ...currentPayment, status: 'lunas', tanggal_bayar: new Date().toISOString().split('T')[0] }
        : {
            id: `i-${Date.now()}`,
            warga_id: wargaId,
            bulan: filterMonth,
            jumlah: 50000,
            status: 'lunas',
            tanggal_bayar: new Date().toISOString().split('T')[0]
          };
      
      const currentIurans = dbService.getIuran();
      let updated;
      if (currentPayment) {
        updated = currentIurans.map(i => i.id === currentPayment.id ? paymentToSave : i);
      } else {
        updated = [...currentIurans, paymentToSave];
      }
      
      dbService.saveIuran(updated);
      setIurans(updated);

      // SYNC KEUANGAN
      const w = warga.find(item => item.id === wargaId);
      dbService.addTransaction({
        id: Date.now(),
        type: 'Masuk',
        category: 'Iuran Warga',
        amount: paymentToSave.jumlah,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: `Iuran ${paymentToSave.bulan} - ${w?.nama || 'Warga'}`
      });
      
      Swal.fire({ title: 'Berhasil!', text: 'Status Lunas berhasil dicatat.', icon: 'success', timer: 1000, showConfirmButton: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm"><CheckCircle size={28} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warga Lunas</p>
            <p className="text-3xl font-black text-emerald-600">{iurans.filter(i => i.bulan === filterMonth && i.status === 'lunas').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-5 rounded-2xl bg-amber-50 text-amber-600 shadow-sm"><XCircle size={28} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Belum Bayar</p>
            <p className="text-3xl font-black text-amber-600">
              {warga.length - iurans.filter(i => i.bulan === filterMonth && i.status === 'lunas').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-5 rounded-2xl bg-sky-50 text-sky-main shadow-sm"><CreditCard size={28} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Dana ({filterMonth})</p>
            <p className="text-3xl font-black text-sky-dark">
              Rp {(iurans.filter(i => i.bulan === filterMonth && i.status === 'lunas').reduce((a, b) => a + b.jumlah, 0)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10">
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-center mb-10">
          <div className="relative flex-1 w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari warga berdasarkan nama atau NIK..." 
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-main/20 font-bold text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-2xl flex-1 justify-center xl:flex-none">
              <Calendar size={20} className="text-sky-main" />
              <input 
                type="month" 
                className="bg-transparent border-none outline-none font-black text-sky-dark text-lg"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="px-8 py-4 bg-sky-main text-white font-black rounded-2xl shadow-xl shadow-sky-main/20 hover:scale-[1.03] transition-transform flex items-center gap-2 flex-1 justify-center xl:flex-none"
            >
              <Plus size={20} /> Entri Manual
            </button>
          </div>
        </div>

        <div className="overflow-x-auto text-slate-900">
           <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Warga</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bulan</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Jumlah</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map(({ warga, payment }, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={warga.id} 
                  className="hover:bg-gray-50/40 transition-colors"
                >
                  <td className="px-6 py-6">
                    <p className="font-black text-gray-900 text-lg leading-tight">{warga.nama}</p>
                    <p className="text-[10px] font-mono text-gray-400 tracking-tighter mt-0.5">{warga.nik}</p>
                  </td>
                  <td className="px-6 py-6 font-black text-sky-dark">{filterMonth}</td>
                  <td className="px-6 py-6 font-black text-emerald-600">
                    {payment ? `Rp ${payment.jumlah.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      (payment && payment.status === 'lunas') ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {(payment && payment.status === 'lunas') ? 'Lunas' : 'Belum'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex items-center gap-2">
                        {(!payment || payment.status === 'belum') && (
                          <button 
                            onClick={() => quickToggle(warga.id, payment)}
                            className="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs hover:bg-emerald-100 transition-all shadow-sm"
                          >
                            Tandai Lunas
                          </button>
                        )}
                        {payment && (
                          <>
                            <button 
                              onClick={() => handleOpenModal(undefined, payment)}
                              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                              title="Edit Pembayaran"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(payment.id, payment)}
                              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                              title="Hapus Catatan"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-slate-900">
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative"
           >
              <button 
                onClick={handleCloseModal}
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Plus className="rotate-45" size={24} />
              </button>

              <h2 className="text-3xl font-black text-sky-dark mb-10 flex items-center gap-3">
                <CreditCard className="text-sky-main" size={32} />
                {editId ? 'Edit Iuran' : 'Entri Iuran'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Pilih Warga</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark disabled:opacity-50"
                    value={formData.warga_id}
                    onChange={(e) => setFormData({...formData, warga_id: e.target.value})}
                    disabled={!!editId}
                    required
                  >
                    <option value="">-- Pilih Warga --</option>
                    {warga.map(w => (
                      <option key={w.id} value={w.id}>{w.nama} - {w.nik}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Bulan Pembayaran</label>
                    <input 
                      type="month"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                      value={formData.bulan}
                      onChange={(e) => setFormData({...formData, bulan: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Tanggal Bayar</label>
                    <input 
                      type="date"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                      value={formData.tanggal_bayar}
                      onChange={(e) => setFormData({...formData, tanggal_bayar: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Jumlah (Rp)</label>
                    <input 
                      type="number"
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-black text-xl text-emerald-600"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({...formData, jumlah: parseInt(e.target.value) || 0})}
                      placeholder="Contoh: 50000"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Status</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'lunas' | 'belum'})}
                      required
                    >
                      <option value="lunas">Lunas</option>
                      <option value="belum">Belum Lunas</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-5 bg-sky-main text-white font-black rounded-2xl shadow-xl shadow-sky-main/20 hover:bg-sky-dark transition-all uppercase tracking-widest text-xs"
                  >
                    {editId ? 'Simpan Perubahan' : 'Catat Iuran'}
                  </button>
                </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default IuranAdmin;
