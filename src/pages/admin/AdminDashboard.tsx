import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../services/dbService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Users, FileUser, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Avatar from '../../components/Avatar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [warga, setWarga] = useState(() => dbService.getWarga());
  const [kk, setKk] = useState(() => dbService.getKK());
  const [iuran, setIuran] = useState(() => dbService.getIuran());
  const [surat, setSurat] = useState(() => dbService.getSurat());

  useEffect(() => {
    const handleDataChange = () => {
      setWarga(dbService.getWarga());
      setKk(dbService.getKK());
      setIuran(dbService.getIuran());
      setSurat(dbService.getSurat());
    };

    window.addEventListener('storage', handleDataChange);
    window.addEventListener('focus', handleDataChange);
    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('focus', handleDataChange);
    };
  }, []);

  const currentMonth = useMemo(() => {
    return new Date().toISOString().slice(0, 7);
  }, []);

  const stats = useMemo(() => {
    const validIurans = iuran.filter(i => 
      i.bulan === currentMonth && 
      i.status === 'lunas' &&
      warga.some(w => w.id === i.warga_id)
    );
    const totalDuit = validIurans.reduce((acc, curr) => acc + curr.jumlah, 0);

    return [
      { label: 'Total Warga', value: warga.length, icon: <Users />, color: 'bg-blue-500', path: '/app/warga' },
      { label: 'Total KK', value: kk.length, icon: <FileUser />, color: 'bg-purple-500', path: '/app/kk' },
      { label: 'Iuran Bulan Ini', value: `Rp ${totalDuit.toLocaleString()}`, icon: <CreditCard />, color: 'bg-emerald-500', path: '/app/iuran' },
      { label: 'Surat Pending', value: surat.filter(s => s.status === 'pending').length, icon: <Clock />, color: 'bg-orange-500', path: '/app/surat' },
    ];
  }, [warga, kk, iuran, surat, currentMonth]);

  const iuranData = useMemo(() => {
    const lunasCount = iuran.filter(i => 
      i.bulan === currentMonth && 
      i.status === 'lunas' &&
      warga.some(w => w.id === i.warga_id)
    ).length;
    const belumCount = warga.length - lunasCount;
    
    return [
      { name: 'Lunas', value: lunasCount, color: '#10b981' },
      { name: 'Belum Lunas', value: belumCount > 0 ? belumCount : 0, color: '#f59e0b' }
    ];
  }, [iuran, warga, currentMonth]);

  const recentSurat = surat.slice(0, 5).reverse();

  const wargaBelumBayar = useMemo(() => {
    const lunasIds = iuran.filter(i => i.bulan === currentMonth && i.status === 'lunas').map(i => i.warga_id);
    return warga.filter(w => !lunasIds.includes(w.id)).slice(0, 5);
  }, [warga, iuran, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            onClick={() => navigate(stat.path)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-colors group"
          >
            <div className="space-y-1">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 leading-none mt-1">
                   {typeof stat.value === 'string' && stat.value.includes('Rp') ? stat.value.replace('Rp ', '') : stat.value}
                </p>
              </div>
              <div className="flex items-center text-[10px] text-green-600 font-semibold">
                <span className="mr-1">↑</span> Berjalan lancar
              </div>
            </div>
            <div className={`p-3 rounded-xl text-2xl ${stat.color.replace('bg-', 'bg-opacity-10 text-')}`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800">Ringkasan Pembayaran Iuran</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> <span className="text-[10px] font-bold text-slate-500 uppercase">Lunas</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> <span className="text-[10px] font-bold text-slate-500 uppercase">Belum</span></div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={iuranData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                  {iuranData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          {/* Recent Letters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Pengajuan Surat Terbaru</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {recentSurat.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#1d4ed8]">{item.jenis_surat}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.tanggal_pengajuan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-xs text-slate-800 font-medium">Status: <span className="font-bold capitalize">{item.status}</span></p>
                     <button 
                        onClick={() => navigate('/app/surat')}
                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >Detail</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <button 
                onClick={() => navigate('/app/surat')}
                className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Lihat Semua Pengajuan
              </button>
            </div>
          </div>

          {/* Unpaid Residents */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Belum Bayar Iuran ({currentMonth})</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {wargaBelumBayar.length > 0 ? (
                wargaBelumBayar.map((item) => (
                  <div key={item.id} className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={item.avatar_url} 
                        name={item.nama} 
                        size="sm" 
                        fallbackColor="bg-amber-100 text-amber-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-amber-900">{item.nama}</p>
                        <p className="text-[10px] text-amber-700">{item.nik}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/app/iuran')}
                      className="p-2 bg-white text-amber-600 rounded-lg shadow-sm border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <CreditCard size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 p-4 font-bold text-xs">
                  <CheckCircle size={16} /> Semua warga sudah lunas!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
