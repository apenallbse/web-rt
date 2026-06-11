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

  const paidMonthsCount = availableMonths.filter(m => {
    const item = userIurans.find(ir => ir.bulan === m);
    return item?.status === 'lunas';
  }).length;

  const pendingMonthsCount = availableMonths.filter(m => {
    const item = userIurans.find(ir => ir.bulan === m);
    return item?.status === 'pending';
  }).length;

  const unpaidMonthsCount = availableMonths.length - paidMonthsCount - pendingMonthsCount;

  const totalPaidAmount = userIurans
    .filter(ir => availableMonths.includes(ir.bulan) && ir.status === 'lunas')
    .reduce((sum, ir) => sum + (ir.jumlah || defaultNominal), 0);

  const totalUnpaidAmount = unpaidMonthsCount * defaultNominal;

  const roundedPercentage = Math.round((paidMonthsCount / availableMonths.length) * 100) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-sky-dark mb-2">Iuran Saya</h2>
          <p className="text-gray-500 font-medium">Pantau status pembayaran bulanan Anda secara real-time</p>
        </div>
        <div className="bg-sky-50 border border-sky-100 px-4 py-2 rounded-2xl flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-black text-sky-dark font-mono uppercase tracking-wider">Status Terupdate</span>
        </div>
      </div>

      {/* Dashboard Status Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Status Pembayaran */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kepatuhan Iuran</span>
              <h3 className="text-2xl font-black text-slate-800">{paidMonthsCount} / {availableMonths.length} Bulan</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${roundedPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-emerald-600">Terbayar {roundedPercentage}%</span>
              <span className="text-gray-400">{availableMonths.length - paidMonthsCount} Tersisa</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Setoran */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Terbayar</span>
              <h3 className="text-2xl font-black text-slate-800">Rp {totalPaidAmount.toLocaleString('id-ID')}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400">
            Jumlah akumulasi iuran sukses untuk tahun ini.
          </p>
        </div>

        {/* Card 3: Sisa Tagihan */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sisa Tagihan</span>
              <h3 className="text-2xl font-black text-slate-800">Rp {totalUnpaidAmount.toLocaleString('id-ID')}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {unpaidMonthsCount} bulan belum terbayar atau lunas.
          </p>
        </div>
      </div>

      {pendingMonthsCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-blue-600 animate-pulse" />
            <p className="text-sm font-bold text-blue-900">
              Ada {pendingMonthsCount} pembayaran yang sedang dalam proses verifikasi oleh pengurus RT.
            </p>
          </div>
          <span className="text-xs font-black text-blue-600 bg-white/60 px-3 py-1 rounded-xl">PENDING</span>
        </motion.div>
      )}

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-sky-dark text-xl">Daftar Tagihan & Riwayat Bulanan</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Tahun {new Date().getFullYear()}</span>
        </div>
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
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-y-auto max-h-[95vh] sm:max-h-[90vh]"
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
