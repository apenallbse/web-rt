import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { CreditCard, CheckCircle, Clock, Calendar, Wallet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

const WargaIuran = () => {
  const { user } = useAuth();
  const [iurans, setIurans] = useState(dbService.getIuran());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  
  const userIurans = iurans.filter(i => i.warga_id === user?.wargaId);

  const paymentMethods = [
    { id: 'ovo', name: 'OVO', color: 'purple', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_spirit_darah_biru.png' },
    { id: 'gopay', name: 'GoPay', color: 'emerald', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg' },
    { id: 'dana', name: 'DANA', color: 'blue', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_danamon_2017.svg' },
    { id: 'shopeepay', name: 'ShopeePay', color: 'orange', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg' }
  ];

  const handlePayRequest = (bulan: string) => {
    setSelectedBulan(bulan);
    setSelectedMethod('');
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!selectedMethod) {
      Swal.fire({
        title: 'Pilih Metode!',
        text: 'Silakan pilih metode pembayaran terlebih dahulu.',
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
          status: 'lunas',
          tanggal_bayar: new Date().toISOString().split('T')[0]
        };
      } else {
        const newPayment = {
          id: `i-${Date.now()}`,
          warga_id: user?.wargaId || '',
          bulan: selectedBulan,
          jumlah: 50000,
          status: 'lunas',
          tanggal_bayar: new Date().toISOString().split('T')[0]
        };
        updated = [...currentAll, newPayment];
      }
      
      dbService.saveIuran(updated);
      setIurans(updated);

      Swal.fire({
        title: 'Berhasil!',
        text: `Iuran bulan ${new Date(selectedBulan).toLocaleDateString('id-ID', { month: 'long' })} telah berhasil dibayar menggunakan ${paymentMethods.find(m => m.id === selectedMethod)?.name}.`,
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
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div>
          <h2 className="text-3xl font-black text-sky-dark mb-2">Riwayat Iuran</h2>
          <p className="text-gray-500 font-medium">Pantau status pembayaran bulanan Anda</p>
        </div>
        <div className="hidden md:block">
           <div className="bg-sky-soft p-6 rounded-[2rem] border border-sky-main/10">
              <span className="text-[10px] font-black text-sky-main uppercase tracking-widest block mb-1">Total Terbayar ({new Date().getFullYear()})</span>
              <span className="text-2xl font-black text-sky-dark italic">Rp {(userIurans.filter(i => i.status === 'lunas' && i.bulan.startsWith(new Date().getFullYear().toString())).length * 50000).toLocaleString()}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableMonths.map((bulan, i) => {
          const item = userIurans.find(ir => ir.bulan === bulan);
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={bulan} 
              className={`p-8 rounded-[2.5rem] border ${
                item?.status === 'lunas' ? 'bg-white border-emerald-100' : 'bg-white border-amber-100 ring-4 ring-amber-50'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${
                  item?.status === 'lunas' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Calendar size={28} />
                </div>
                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item?.status === 'lunas' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {item?.status === 'lunas' ? 'Terbayar' : 'Belum Bayar'}
                </span>
              </div>
              
              <h4 className="text-xl font-black text-sky-dark mb-1">{new Date(bulan).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h4>
              <p className="text-2xl font-black text-gray-900 mb-6 underline decoration-sky-main/20">Rp 50.000</p>
              
              {item?.status === 'lunas' ? (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <CheckCircle size={14} className="text-emerald-500" /> Dibayar pada: {item.tanggal_bayar}
                </div>
              ) : (
                <button 
                  onClick={() => handlePayRequest(bulan)}
                  className="w-full py-4 sky-gradient text-white font-bold rounded-2xl shadow-lg shadow-sky-main/20 hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard size={18} /> Bayar Sekarang
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showPaymentModal && (
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
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Pilih Metode Pembayaran</p>
                    <div className="grid grid-cols-2 gap-4">
                      {paymentMethods.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMethod(m.id)}
                          className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group cursor-pointer ${
                            selectedMethod === m.id 
                              ? 'bg-sky-50 border-sky-main shadow-md ring-4 ring-sky-100' 
                              : 'bg-gray-50 border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className={`h-10 flex items-center justify-center transition-all ${selectedMethod === m.id ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>
                            <img src={m.icon} className="h-6 object-contain" alt={m.name} />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-tight ${selectedMethod === m.id ? 'text-sky-main' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            {m.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-sky-dark rounded-[2rem] text-white shadow-xl shadow-blue-900/20">
                    <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1">Total Bayar</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black italic">Rp 50.000</span>
                      <span className="text-[10px] font-bold opacity-40">/ Bulan</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1 text-sky-200">Tujuan Transfer (Admin RT)</p>
                      <p className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        0812-3456-7890
                      </p>
                    </div>
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
                      disabled={!selectedMethod}
                    >
                      <CreditCard size={20} /> KONFIRMASI BAYAR
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WargaIuran;
