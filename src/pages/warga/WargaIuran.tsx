import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { CreditCard, CheckCircle, Clock, Calendar, Wallet, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

const WargaIuran = () => {
  const { user } = useAuth();
  const [iurans, setIurans] = useState(() => dbService.getIuran());
  const [rtProfile, setRtProfile] = useState(() => dbService.getRTProfile());
  
  React.useEffect(() => {
    const handleStorageChange = () => {
      setIurans(dbService.getIuran());
      setRtProfile(dbService.getRTProfile());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const userIurans = iurans.filter(i => i.warga_id === user?.wargaId);
  
  const defaultNominal = rtProfile.nominal_iuran || 50000;
  
  const handlePayRequest = (bulan: string) => {
    setSelectedBulan(bulan);
    setSelectedFile(null);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedFile) {
      Swal.fire({
        title: 'Upload Bukti!',
        text: 'Silakan upload bukti pembayaran terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#1d4ed8',
        customClass: { popup: 'rounded-[3rem]' }
      });
      return;
    }

    setShowPaymentModal(false);

    Swal.fire({
      title: 'Memproses...',
      didOpen: () => {
        Swal.showLoading();
      },
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      padding: '2.5rem',
      customClass: { popup: 'rounded-[3rem]' }
    }).then(() => {
      const currentAll = dbService.getIuran();
      const existingIndex = currentAll.findIndex(i => i.warga_id === user?.wargaId && i.bulan === selectedBulan);
      
      let updated;
      if (existingIndex > -1) {
        updated = [...currentAll];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: 'pending',
          tanggal_bayar: new Date().toISOString().split('T')[0]
        };
      } else {
        const newPayment = {
          id: `i-${Date.now()}`,
          warga_id: user?.wargaId || '',
          bulan: selectedBulan,
          jumlah: defaultNominal,
          status: 'pending' as any,
          tanggal_bayar: new Date().toISOString().split('T')[0]
        };
        updated = [...currentAll, newPayment];
      }
      
      dbService.saveIuran(updated);
      setIurans(updated);

      Swal.fire({
        title: 'Berhasil!',
        text: `Bukti transfer iuran bulan ${new Date(selectedBulan).toLocaleDateString('id-ID', { month: 'long' })} telah berhasil diunggah.`,
        icon: 'success',
        confirmButtonText: 'MANTAP',
        confirmButtonColor: '#10b981',
        padding: '2.5rem',
        customClass: {
          popup: 'rounded-[3rem]',
          confirmButton: 'rounded-2xl px-10 py-4 font-black'
        }
      });
    });
  };


  const generateMonths = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    const months = [];
    // Generate from January of current year up to current month
    for (let i = currentMonth; i >= 0; i--) {
      const monthStr = (i + 1).toString().padStart(2, '0');
      months.push(`${currentYear}-${monthStr}`);
    }
    
    // Also include a few months from previous year if it's early in the year
    if (currentMonth < 2) {
      months.push(`${currentYear - 1}-12`, `${currentYear - 1}-11`);
    }
    
    return months;
  };

  const availableMonths = generateMonths();

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-sky-dark mb-2">Riwayat Iuran</h2>
        <p className="text-gray-500 font-medium">Pantau status pembayaran bulanan Anda</p>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {availableMonths.map((bulan) => {
            const item = userIurans.find(ir => ir.bulan === bulan);
            return (
              <div 
                key={bulan} 
                className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50 ${
                  item?.status === 'lunas' ? '' : 'bg-amber-50/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    item?.status === 'lunas' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-sky-dark text-lg">{new Date(bulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h4>
                    <p className="text-gray-500 font-bold text-sm">
                      Rp {((item?.status === 'lunas' || item?.status === 'pending') && item?.jumlah) ? item.jumlah.toLocaleString('id-ID') : defaultNominal.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-row items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item?.status === 'lunas' ? 'bg-emerald-100 text-emerald-600' : 
                    item?.status === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {item?.status === 'lunas' ? 'Lunas' : item?.status === 'pending' ? 'Verifikasi' : 'Belum'}
                  </span>
                  
                  {item?.status === 'lunas' ? (
                    <div className="flex flex-col items-end text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Selesai</span>
                      <span className="text-[10px]">{item.tanggal_bayar}</span>
                    </div>
                  ) : item?.status === 'pending' ? (
                    <div className="flex text-xs font-bold text-blue-500 opacity-80 whitespace-nowrap">
                       Menunggu Konfirmasi
                    </div>
                  ) : (
                    <button 
                      onClick={() => handlePayRequest(bulan)}
                      className="px-6 py-2.5 sky-gradient text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      Bayar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (() => {
          const selectedItem = userIurans.find(ir => ir.bulan === selectedBulan);
          const nominal = (selectedItem?.status === 'lunas' || selectedItem?.status === 'pending') 
            ? selectedItem.jumlah 
            : defaultNominal;
          return (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-sky-dark">Konfirmasi Bayar</h3>
                    <p className="text-gray-500 font-medium">Bulan {new Date(selectedBulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-sky-dark rounded-[2rem] text-white shadow-xl shadow-blue-900/20">
                    <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1">Total Bayar</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black italic">Rp {nominal.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] font-bold opacity-40">/ Bulan</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1 text-sky-200">Tujuan Transfer (Admin RT)</p>
                      <p className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        {rtProfile.info_rekening || '0812-3456-7890 (BCA / Mandiri)'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Upload Bukti Transfer</p>
                    <label className={`w-full cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all ${selectedFile ? 'border-sky-main bg-sky-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      {selectedFile ? (
                        <>
                          <CheckCircle className="text-sky-500 mb-2" size={32} />
                          <p className="text-sm font-bold text-sky-900 text-center">{selectedFile.name}</p>
                          <p className="text-[10px] text-sky-500 mt-1 uppercase font-bold tracking-widest">Klik untuk mengganti</p>
                        </>
                      ) : (
                        <>
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <p className="text-sm font-bold text-gray-600 text-center">Pilih file bukti transfer</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">JPG, PNG, atau PDF</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      BATAL
                    </button>
                    <button 
                      onClick={confirmPayment}
                      className="flex-[2] py-5 sky-gradient text-white font-black rounded-2xl shadow-lg shadow-sky-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedFile}
                    >
                      <CreditCard size={20} /> KONFIRMASI BAYAR
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default WargaIuran;
