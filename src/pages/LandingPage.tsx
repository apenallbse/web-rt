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
  const rtProfile = useMemo(() => dbService.getRTProfile(), []);

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
      <section id="beranda" className="relative pt-40 pb-32 overflow-hidden bg-white">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-2/3 h-[800px] bg-gradient-to-br from-sky-400 via-sky-300 to-emerald-200 opacity-20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-[600px] bg-gradient-to-tr from-blue-600 to-sky-400 opacity-10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-50 to-emerald-50 text-sky-700 border border-sky-100 rounded-full text-xs md:text-sm font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Portal Integrasi Warga RT {rtProfile?.no_rt || "06"}
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black text-slate-800 leading-[0.95] tracking-tighter mb-8">
              Koneksi Warga, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                Aksi Nyata.
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-500 leading-relaxed max-w-3xl font-medium mb-12">
              Platform modern yang menyatukan transparansi iuran, administrasi digital, dan kebersamaan warga dalam satu genggaman.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="group relative px-12 py-5 bg-slate-900 text-white rounded-full font-black text-lg overflow-hidden shadow-2xl hover:shadow-sky-500/30 transition-all hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Masuk / Login <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
                </span>
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="w-full max-w-6xl mt-20 relative"
          >
            {/* Visual Glassmorphism Dashboard Preview/Cards */}
            <div className="relative rounded-[3rem] p-4 bg-slate-50/50 backdrop-blur-3xl border border-white/60 shadow-[0_40px_100px_-20px_rgba(14,165,233,0.15)] overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-50"></div>
               <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100/80 shadow-inner overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck size={200} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {features.map((f, i) => (
                      <motion.a 
                        key={i}
                        href={f.href}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + (i * 0.1) }}
                        className="p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 transition-all group hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-2 cursor-pointer flex flex-col items-start gap-5"
                      >
                        <div className={`p-4 ${f.color} rounded-2xl transform group-hover:scale-110 transition-transform`}>{f.icon}</div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg mb-2">{f.title}</h3>
                          <p className="text-sm font-medium text-slate-500 leading-relaxed">{f.description}</p>
                        </div>
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
          <div className="lg:w-1/2 w-full max-w-[500px] mx-auto">
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

              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-sky-dark/20 border-8 border-white mx-auto max-w-[500px] w-full">
                <img 
                  src={rtProfile?.tentang_gambar || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200"} 
                  alt="SkyRT Digital Team" 
                  className="w-full h-[350px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
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
            <h2 className="text-4xl md:text-5xl font-black text-sky-dark mb-8 tracking-tight whitespace-pre-wrap">
              {rtProfile?.tentang_judul || "Solusi Digital \nUntuk Masa Depan."}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium whitespace-pre-wrap">
              {rtProfile?.tentang_teks || "SkyRT lahir dari keresahan pengurus RT terhadap sistem administrasi yang masih manual dan sulit dipantau. Kami menghadirkan platform yang mempermudah transparansi keuangan dan pendataan warga secara efisien."}
            </p>
            <div className="space-y-4">
              {[
                `Visi: ${rtProfile?.tentang_visi || 'Digitalisasi RT di seluruh Indonesia'}`,
                `Misi: ${rtProfile?.tentang_misi || 'Memberdayakan pengurus dengan alat modern'}`,
                `Nilai: ${rtProfile?.tentang_nilai || 'Aman, Terpercaya, dan Transparan'}`
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-sky-main rounded-full flex items-center justify-center text-white shrink-0">
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
            Bergabunglah dengan ratusan pengurus RT lainnya yang telah beralih ke sistem digital.
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
