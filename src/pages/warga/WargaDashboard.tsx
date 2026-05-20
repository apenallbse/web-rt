import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { CreditCard, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const WargaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const iurans = dbService.getIuran().filter(i => i.warga_id === user?.wargaId);
  const surats = dbService.getSurat().filter(s => s.warga_id === user?.wargaId);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthIuran = iurans.find(i => i.bulan === currentMonth);
  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 sky-gradient rounded-full blur-[80px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative">
          <h1 className="text-4xl font-black text-sky-dark mb-4">Halo, Selamat Datang!</h1>
          <p className="text-gray-500 font-medium text-lg max-w-xl leading-relaxed">
            Ini adalah portal layanan mandiri SkyRT Anda. Pantau status iuran dan kelola pengajuan surat dengan mudah.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Iuran Status */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-8">
             <div className="p-4 bg-sky-soft text-sky-main rounded-2xl"><CreditCard size={28} /></div>
             <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
               currentMonthIuran?.status === 'lunas' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
             }`}>
               Bulan Ini: {currentMonthIuran?.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
             </span>
          </div>
          <h3 className="text-2xl font-black text-sky-dark mb-2">Status Iuran Bulanan</h3>
          <p className="text-gray-500 font-medium mb-8">Iuran kebersihan & keamanan lingkungan ({monthName})</p>
          
          <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
             <span className="text-2xl font-black text-sky-dark leading-none">Rp 50.000</span>
             {currentMonthIuran?.status === 'lunas' ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle size={20} /> Lunas
                </div>
             ) : (
                <button 
                   onClick={() => navigate('/app/iuran-saya')}
                   className="px-6 py-3 bg-sky-main text-white font-bold rounded-2xl shadow-lg shadow-sky-main/20 hover:scale-105 transition-transform cursor-pointer"
                 >
                  Bayar Sekarang
                </button>
             )}
          </div>
        </motion.div>

        {/* Recent Letters */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-sky-dark">Status Surat</h3>
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><FileText size={28} /></div>
          </div>
          
          <div className="space-y-4 flex-1">
            {surats.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className={`p-2 rounded-xl ${
                  s.status === 'disetujui' ? 'bg-emerald-100 text-emerald-600' : 
                  s.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                }`}>
                  {s.status === 'disetujui' ? <CheckCircle size={20} /> : s.status === 'pending' ? <Clock size={20} /> : <AlertCircle size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{s.jenis_surat}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{s.tanggal_pengajuan}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/app/pengajuan-surat')}
            className="mt-6 w-full py-4 text-sky-main font-bold hover:bg-sky-soft rounded-2xl transition-colors cursor-pointer"
          >
            Lihat Semua Riwayat
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default WargaDashboard;
