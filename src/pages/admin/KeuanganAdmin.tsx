import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, DollarSign, Filter, Search, Edit2, Trash2, RefreshCcw, Loader2, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import { dbService } from '../../services/dbService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const KeuanganAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const handleDataChange = () => {
      setTransactions(dbService.getTransactions());
    };
    handleDataChange();
    window.addEventListener('storage', handleDataChange);
    window.addEventListener('focus', handleDataChange);
    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('focus', handleDataChange);
    };
  }, []);

  const [showAll, setShowAll] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setTransactions(dbService.getTransactions());
      setIsLoading(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Data diperbarui',
        showConfirmButton: false,
        timer: 2000
      });
    }, 1500);
  };

  const calculateTotal = (type: string) => {
    return transactions
      .filter(t => t.type === type)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const totalMasuk = calculateTotal('Masuk');
  const totalKeluar = calculateTotal('Keluar');
  const saldo = totalMasuk - totalKeluar; 

  const handleEditTransaction = async (transaction: any) => {
    const { value: formValues } = await Swal.fire({
      title: `<span class="font-black uppercase tracking-tight text-slate-800">Edit Transaksi</span>`,
      html:
        `<div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
            <input id="swal-input1" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${transaction.category}">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah (Rp)</label>
            <input id="swal-input2" type="number" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" value="${transaction.amount}">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</label>
            <textarea id="swal-input3" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700">${transaction.note}</textarea>
          </div>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const category = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const amount = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const note = (document.getElementById('swal-input3') as HTMLTextAreaElement).value;
        
        if (!category || !amount) {
          Swal.showValidationMessage('Harap isi kategori dan jumlah');
          return false;
        }
        return { category, amount: parseInt(amount), note };
      }
    });

    if (formValues) {
      const updated = transactions.map(t => 
        t.id === transaction.id 
          ? { ...t, ...formValues } 
          : t
      );
      setTransactions(updated);
      dbService.saveTransactions(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Diupdate!',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      dbService.saveTransactions(updated);
      Swal.fire('Terhapus!', 'Transaksi telah dihapus.', 'success');
    }
  };

  const handleAddTransaction = async (type: 'Masuk' | 'Keluar') => {
    const { value: formValues } = await Swal.fire({
      title: `<span class="font-black uppercase tracking-tight text-slate-800">Catat ${type}</span>`,
      html:
        `<div class="space-y-4 text-left p-2">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
            <input id="swal-input1" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="Contoh: Iuran, Konsumsi, dll">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah (Rp)</label>
            <input id="swal-input2" type="number" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="0">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</label>
            <textarea id="swal-input3" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-slate-700" placeholder="Catatan tambahan..."></textarea>
          </div>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Catatan',
      confirmButtonColor: type === 'Masuk' ? '#059669' : '#e11d48',
      preConfirm: () => {
        const category = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const amount = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const note = (document.getElementById('swal-input3') as HTMLTextAreaElement).value;
        
        if (!category || !amount) {
          Swal.showValidationMessage('Harap isi kategori dan jumlah');
          return false;
        }
        return { category, amount: parseInt(amount), note };
      }
    });

    if (formValues) {
      const newTransaction = {
        id: Date.now(),
        type,
        category: formValues.category,
        amount: formValues.amount,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: formValues.note
      };
      
      const updated = [newTransaction, ...transactions];
      setTransactions(updated);
      dbService.saveTransactions(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Tersimpan!',
        text: 'Transaksi berhasil dicatat ke dalam sistem.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.text('Laporan Keuangan RT', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Jumlah (Rp)', 'Keterangan']],
      body: transactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.amount.toLocaleString('id-ID'),
        t.note || '-'
      ]),
    });
    
    doc.save('Laporan_Keuangan_RT.pdf');
  };

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Keuangan RT</h1>
          <p className="text-slate-500 font-medium font-mono text-xs">Arus kas dan catatan transaksi keuangan wilayah</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handlePrint}
            className="px-5 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Printer size={18} /> Cetak PDF
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-5 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Memproses...' : 'Segarkan'}
          </button>
          <button 
            onClick={() => handleAddTransaction('Masuk')}
            className="px-5 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-200 cursor-pointer"
          >
            <Plus size={18} /> Masuk
          </button>
          <button 
            onClick={() => handleAddTransaction('Keluar')}
            className="px-5 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-200 cursor-pointer"
          >
            <Plus size={18} /> Keluar
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] rounded-[3rem] flex items-center justify-center"
            >
              <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col items-center gap-4">
                <Loader2 size={40} className="text-sky-main animate-spin" />
                <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Memperbarui Data...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Wallet size={24} className="text-sky-main" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Saldo Kas</p>
              <h2 className="text-4xl font-black tracking-tight mt-1">Rp {saldo.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[3rem] space-y-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
              <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">Total Pemasukan</p>
            <h2 className="text-3xl font-black text-emerald-900 tracking-tight mt-1">Rp {totalMasuk.toLocaleString()}</h2>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[3rem] space-y-4">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
              <ArrowDownLeft size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600/60">Total Pengeluaran</p>
            <h2 className="text-3xl font-black text-rose-900 tracking-tight mt-1">Rp {totalKeluar.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <History size={20} className="text-slate-400" />
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Riwayat Transaksi</h3>
            </div>
            <button 
              onClick={() => Swal.fire('Filter', 'Fitur filter sedang dikembangkan', 'info')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
                <Filter size={18} />
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori & Keterangan</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Jumlah</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedTransactions.map((tr, i) => (
                <motion.tr 
                  key={tr.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tr.type === 'Masuk' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                         {tr.type === 'Masuk' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{tr.category}</p>
                        <p className="text-xs text-slate-400 font-medium">{tr.note}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-black font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {tr.date}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-lg font-black tracking-tight ${
                      tr.type === 'Masuk' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tr.type === 'Masuk' ? '+' : '-'} Rp {tr.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditTransaction(tr)}
                        className="p-2 text-slate-400 hover:text-sky-main hover:bg-sky-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(tr.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 text-center border-t border-slate-50">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-[10px] font-black uppercase tracking-widest text-sky-main hover:underline cursor-pointer"
            >
              {showAll ? 'Sembunyikan' : 'Lihat Semua Transaksi'}
            </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default KeuanganAdmin;

