import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Users, CreditCard, FileText, ArrowRight, MessageCircle, Clock, Zap, ClipboardList } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { dbService } from '../services/dbService';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const currentMonth = useMemo(() => {
    return new Date().toISOString().slice(0, 7);
  }, []);

  const kk = useMemo(() => dbService.getKK(), []);
  const iuran = useMemo(() => dbService.getIuran(), []);

  const totalIuran = useMemo(() => {
    // Match Admin Dashboard logic: Monthly Collected Iuran
    return iuran
      .filter(i => i.status === 'lunas' && i.bulan === currentMonth)
      .reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [iuran, currentMonth]);

  const features = [
    {
      icon: <Users className="text-blue-600" />,
      title: "Data Warga",
      description: "Database warga terpusat dengan profil lengkap dan riwayat mutasi.",
      color: "bg-blue-100",
      href: "#data-warga"
    },
    {
      icon: <ClipboardList className="text-indigo-600" />,
      title: "Kartu Keluarga",
      description: "Manajemen data KK digital yang terintegrasi dengan data kependudukan.",
      color: "bg-indigo-100",
      href: "#kk"
    },
    {
      icon: <CreditCard className="text-emerald-600" />,
      title: "Iuran Online",
      description: "Catat iuran warga secara transparan dengan laporan otomatis.",
      color: "bg-emerald-100",
      href: "#iuran"
    },
    {
      icon: <FileText className="text-amber-600" />,
      title: "Surat Pengantar",
      description: "Pengajuan surat pengantar RT jadi lebih cepat melalui sistem digital.",
      color: "bg-amber-100",
      href: "#surat"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section id="beranda" className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full sky-soft-gradient opacity-10 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-soft/30 text-sky-dark rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 border border-sky-main/10 shadow-sm">
              <span className="w-1.5 h-1.5 bg-sky-main rounded-full animate-pulse"></span>
              Platform Management RT #1 di Indonesia
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-sky-dark leading-[0.9] tracking-tighter">
              Kelola RT <br />
              <span className="text-sky-main">Lebih Modern.</span>
            </h1>
            <p className="mt-10 text-xl text-gray-500 leading-relaxed max-w-lg font-medium">
              Ubah birokrasi manual menjadi sistem digital yang transparan, aman, dan dapat diakses dari mana saja oleh warga maupun pengurus.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-5">
              <button 
                onClick={() => navigate('/login')}
                className="px-10 py-5 sky-gradient text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-sky-main/30 hover:scale-105 transition-transform flex items-center justify-center gap-3"
              >
                Coba Sekarang <ArrowRight size={22} />
              </button>
              <button 
                onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white text-sky-dark rounded-[2rem] font-black text-lg shadow-xl shadow-gray-200/50 border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
              >
                Lihat Demo
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Float Cards */}
            <div className="absolute -top-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl z-10 border border-gray-50 animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Iuran Bulan Ini</p>
                  <p className="text-xl font-black text-sky-dark">Rp {totalIuran.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl z-10 border border-gray-50 animate-pulse-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Warga</p>
                  <p className="text-xl font-black text-sky-dark">{kk.length} KK</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[3.5rem] shadow-2xl shadow-sky-dark/5 border border-gray-100 relative overflow-hidden group">
              <div className="absolute inset-0 bg-sky-main opacity-0 group-hover:opacity-[0.02] transition-opacity"></div>
              <div className="bg-gray-50 rounded-[2.5rem] p-10 aspect-[4/3] flex flex-col justify-center gap-8 border border-gray-100/50">
                <div className="grid grid-cols-2 gap-6">
                  {features.map((f, i) => (
                    <motion.a 
                      key={i}
                      href={f.href}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-4 group-hover:shadow-xl transition-all hover:scale-[1.05] cursor-pointer"
                    >
                      <div className={`p-4 ${f.color} rounded-2xl transform group-hover:rotate-6 transition-transform`}>{f.icon}</div>
                      <span className="font-bold text-sky-dark text-sm">{f.title}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-32 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-sky-dark mb-6 tracking-tight leading-tight">
              Kekuatan Digital dalam <br />
              <span className="text-sky-main">Genggaman Pengurus.</span>
            </h2>
            <p className="text-gray-500 text-lg font-medium">
              Dirancang khusus untuk kebutuhan pengurus RT di Indonesia dengan fitur yang praktis dan data yang aman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'data-warga', icon: <Users className="text-blue-600" />, title: "Data Warga Digital", desc: "Kelola database warga terpusat dengan profil lengkap, status kependudukan, dan riwayat mutasi warga secara real-time." },
              { id: 'kk', icon: <ClipboardList className="text-indigo-600" />, title: "Kartu Keluarga", desc: "Manajemen dokumen Kartu Keluarga digital, pendataan anggota keluarga, dan sinkronisasi data kependudukan RT." },
              { id: 'iuran', icon: <CreditCard className="text-emerald-600" />, title: "Iuran Online", desc: "Transparansi keuangan dengan pencatatan iuran otomatis, laporan bulanan, dan kemudahan pembayaran bagi warga." },
              { id: 'surat', icon: <FileText className="text-amber-600" />, title: "Surat Pengantar", desc: "Permudah pengajuan surat pengantar RT secara digital tanpa harus datang ke rumah pengurus, cukup via aplikasi." },
              { id: 'agenda', icon: <Clock className="text-purple-600" />, title: "Agenda Kegiatan", desc: "Jadwalkan kegiatan warga, kerja bakti, rapat warga, dan hari besar dalam kalender terpadu yang dapat diakses semua." },
              { id: 'pengumuman', icon: <Zap className="text-sky-600" />, title: "Pengumuman", desc: "Sampaikan informasi penting, surat edaran, dan pengumuman mendesak kepada seluruh warga secara instan." },
              { id: 'keamanan', icon: <ShieldCheck className="text-blue-700" />, title: "Keamanan Data", desc: "Seluruh data warga dan keuangan tersimpan dengan enkripsi tingkat tinggi di infrastruktur cloud yang aman." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                id={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:shadow-sky-main/10 transition-all scroll-mt-24"
              >
                <div className="w-16 h-16 bg-sky-soft/20 text-sky-main rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {React.cloneElement(f.icon as React.ReactElement, { size: 32 })}
                </div>
                <h3 className="text-2xl font-black text-sky-dark mb-4">{f.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <div className="relative group">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-sky-main/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 z-20 bg-white p-5 rounded-3xl shadow-xl shadow-sky-dark/10 border border-sky-soft/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-soft text-sky-main rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Terpercaya Di</p>
                    <p className="text-sm font-black text-sky-dark leading-none">1.200+ RT</p>
                  </div>
                </div>
              </motion.div>

              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-sky-dark/20 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200" 
                  alt="SkyRT Digital Team" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-dark/40 to-transparent"></div>
              </div>

              {/* Verified Badge */}
              <div className="absolute -bottom-6 -right-6 z-20 bg-white py-3 px-6 rounded-2xl shadow-xl border border-sky-soft/30 flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <ShieldCheck size={14} />
                </div>
                <span className="text-xs font-black text-sky-dark uppercase tracking-wider">Sistem Terverifikasi</span>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black text-sky-dark mb-8 tracking-tight">Solusi Digital <br/> Untuk Masa Depan.</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
              SkyRT lahir dari keresahan pengurus RT terhadap sistem administrasi yang masih manual dan sulit dipantau. Kami menghadirkan platform yang mempermudah transparansi keuangan dan pendataan warga secara efisien.
            </p>
            <div className="space-y-4">
              {['Visi: Digitalisasi RT di seluruh Indonesia', 'Misi: Memberdayakan pengurus dengan alat modern', 'Nilai: Aman, Terpercaya, dan Transparan'].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-sky-main rounded-full flex items-center justify-center text-white">
                    <ShieldCheck size={14} />
                  </div>
                  <p className="font-bold text-sky-dark">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section Preview */}
      <section id="kontak" className="py-32 bg-sky-main relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent)]"></div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Siap Modernisasi RT Anda?</h2>
          <p className="text-sky-soft text-xl font-medium mb-12 max-w-2xl mx-auto opacity-90">
            Bergabunglah dengan ratusan pengurus RT lainnya yang telah beralih ke sistem digital SkyRT.
          </p>
          <button 
            onClick={() => window.open('https://wa.me/6285280136056', '_blank')}
            className="px-12 py-6 bg-white text-sky-main rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-transform"
          >
            Hubungi Tim Kami Sekarang
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
