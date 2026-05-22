import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Users, Shield, Bell, Lock, Globe, Save, FileText, TrendingUp, Eye, EyeOff, Upload, Image } from 'lucide-react';
import Swal from 'sweetalert2';
import WargaList from './WargaList';
import { dbService } from '../../services/dbService';
import { NotificationSettings, RTProfile } from '../../types';
import * as OTPAuth from 'otpauth';
import { QRCodeSVG } from 'qrcode.react';

const SettingsAdmin = () => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [passwords, setPasswords] = useState({
    current: '',
    new: ''
  });
  const [profile, setProfile] = useState<RTProfile>({
    no_rt: '',
    nama_ketua: '',
    alamat: '',
    telepon: '',
    email: ''
  });
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    reports: true,
    finance: true,
    warga: false,
    announcements: true,
    twoFactorEnabled: false
  });
  const [setup2FA, setSetup2FA] = useState({
    active: false,
    secretRef: '',
    uri: '',
    code: ''
  });

  useEffect(() => {
    setNotifSettings(dbService.getSettings());
    setProfile(dbService.getRTProfile());
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      Swal.fire('Format Tidak Didukung', 'Gunakan JPG, PNG, WEBP, atau GIF.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('File Terlalu Besar', 'Maksimal ukuran file adalah 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfile(prev => ({ ...prev, tentang_gambar: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (title: string, message: string) => {
    if (activeTab === 'general') {
      dbService.saveRTProfile(profile);
      window.dispatchEvent(new Event('profile_updated'));
    }

    // If saving notifications OR security (for 2FA), persist to dbService
    if (activeTab === 'notifications') {
      dbService.saveSettings(notifSettings);
    }

    if (activeTab === 'security') {
      const rtProfile = dbService.getRTProfile();
      
      // If user is trying to change password
      if (passwords.current || passwords.new) {
        if (passwords.current !== rtProfile.password) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Password saat ini salah.',
            background: '#fff',
            color: '#1e293b',
            confirmButtonColor: '#0ea5e9'
          });
          return;
        }

        if (passwords.new.length < 3) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Password baru minimal 3 karakter.',
            background: '#fff',
            color: '#1e293b',
            confirmButtonColor: '#0ea5e9'
          });
          return;
        }

        // Update password in RT Profile
        dbService.saveRTProfile({
          ...rtProfile,
          password: passwords.new,
          two_factor_enabled: profile.two_factor_enabled,
          two_factor_secret: profile.two_factor_secret
        });
        
        // Reset fields
        setPasswords({ current: '', new: '' });
      } else {
        dbService.saveRTProfile({
          ...rtProfile,
          two_factor_enabled: profile.two_factor_enabled,
          two_factor_secret: profile.two_factor_secret
        });
      }

      // Save 2FA and potentially other security settings
      dbService.saveSettings(notifSettings);
    }

    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: 1500,
      showConfirmButton: false,
      background: '#fff',
      color: '#1e293b',
      iconColor: '#0ea5e9',
      customClass: {
        popup: 'rounded-[2rem] border border-slate-100 shadow-xl'
      }
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Pengaturan Aplikasi</h1>
          <p className="text-slate-500 font-medium font-mono text-xs">Konfigurasi sistem dan manajemen akses admin</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 space-y-2">
           <TabButton 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
            icon={<Settings size={18} />} 
            label="Umum" 
            sub="Dasar & Tampilan"
          />
           <TabButton 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
            icon={<Users size={18} />} 
            label="Manajemen Warga" 
            sub="Daftar & Status"
          />
           <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
            icon={<Shield size={18} />} 
            label="Keamanan" 
            sub="Password & Role"
          />
           <TabButton 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
            icon={<Bell size={18} />} 
            label="Notifikasi" 
            sub="Email & Push"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 min-h-[500px]">
          {activeTab === 'users' && <WargaList />}
          {activeTab === 'general' && (
            <div className="space-y-8">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800">Pengaturan Umum</h3>
                  <p className="text-sm text-slate-400 font-medium font-mono">Konfigurasi dasar portal SkyRT</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SettingItem 
                    label="Nama Aplikasi" 
                    desc="Nama yang muncul di header" 
                    value={profile.nama_aplikasi || ''} 
                    onChange={(val: string) => setProfile({ ...profile, nama_aplikasi: val })}
                  />
                  <SettingItem 
                    label="Warna Utama" 
                    desc="Tema branding portal" 
                    value={profile.warna_utama || ''} 
                    onChange={(val: string) => setProfile({ ...profile, warna_utama: val })}
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bahasa Sistem</label>
                    <select 
                      value={profile.bahasa || 'Bahasa Indonesia'}
                      onChange={(e) => setProfile({ ...profile, bahasa: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700"
                    >
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zona Waktu</label>
                    <select 
                      value={profile.zona_waktu || 'WIB (Jakarta) GMT+7'}
                      onChange={(e) => setProfile({ ...profile, zona_waktu: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700"
                    >
                      <option value="WIB (Jakarta) GMT+7">WIB (Jakarta) GMT+7</option>
                      <option value="WITA GMT+8">WITA GMT+8</option>
                      <option value="WIT GMT+9">WIT GMT+9</option>
                    </select>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest text-sky-dark">Kustomisasi Halaman Pembuka (Tentang Kami)</h4>
                     <p className="text-xs text-slate-400 font-medium">Atur foto dan deskripsi teks penjelasan di halaman depan secara dinamis</p>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Foto Tentang Halaman Pembuka</label>
                          
                          <div 
                            onClick={() => document.getElementById('about_image_file_input')?.click()}
                            className="border-2 border-dashed border-slate-200 hover:border-sky-500 rounded-3xl p-6 transition-all bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden min-h-[180px]"
                          >
                            <input 
                              type="file" 
                              id="about_image_file_input" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                            />
                            
                            {profile.tentang_gambar ? (
                              <div className="absolute inset-0 w-full h-full">
                                <img 
                                  src={profile.tentang_gambar} 
                                  alt="Pratinjau Tentang" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e: any) => {
                                    e.target.src = "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200";
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-4">
                                  <Upload size={24} className="animate-bounce" />
                                  <span className="text-xs font-black uppercase tracking-widest">Ganti Foto</span>
                                  <span className="text-[10px] text-slate-300 font-medium">Klik untuk memilih file baru</span>
                                </div>
                              </div>
                            ) : (
                              <div className="py-4 flex flex-col items-center">
                                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <Upload size={20} />
                                </div>
                                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Unggah Foto Tentang Kami</span>
                                <span className="text-[10px] text-slate-400 mt-1 block">Klik untuk memilih file JPG, PNG, atau WEBP</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-4 mt-2">
                            <span className="text-[10px] text-slate-400 font-medium italic">
                              *Direkomendasikan foto lanskap 4:3 / 16:9 (Maks 5MB)
                            </span>
                            {profile.tentang_gambar && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProfile({ ...profile, tentang_gambar: '' });
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                              >
                                Hapus Foto
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="pt-2">
                          <details className="cursor-pointer group">
                            <summary className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none hover:text-slate-600 transition-colors flex items-center gap-1">
                              <span>Atur menggunakan URL Gambar (Klik untuk memperluas)</span>
                            </summary>
                            <div className="mt-3 pl-1">
                              <SettingItem 
                                label="Atau gunakan URL Link Gambar" 
                                desc="Salin tautan luar jika Anda tidak ingin mengunggah file lokal" 
                                value={profile.tentang_gambar || ''} 
                                onChange={(val: string) => setProfile({ ...profile, tentang_gambar: val })}
                              />
                            </div>
                          </details>
                        </div>
                      </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teks Deskripsi Tentang</label>
                        <textarea 
                           rows={6}
                           value={profile.tentang_teks || ''}
                           onChange={(e) => setProfile({ ...profile, tentang_teks: e.target.value })}
                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700 font-sans text-sm leading-relaxed"
                           placeholder="Tulis deskripsi atau sejarah rincian mengenai RT Anda..."
                        />
                        <p className="text-[10px] text-slate-400 font-medium italic">Paragraf ini akan langsung memperbarui teks di halaman pembuka.</p>
                     </div>
                  </div>

                  {/* Additional customizable fields for Tentang section */}
                  <div className="pt-6 border-t border-slate-100/80 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Besar Tentang Kami</label>
                        <input 
                           type="text"
                           value={profile.tentang_judul || ''}
                           onChange={(e) => setProfile({ ...profile, tentang_judul: e.target.value })}
                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700 font-sans text-sm"
                           placeholder="Misal: Solusi Digital \nUntuk Masa Depan."
                        />
                        <p className="text-[10px] text-slate-400 font-medium italic">Gunakan \n untuk membuat baris baru pada judul.</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visi Utama RT</label>
                        <input 
                           type="text"
                           value={profile.tentang_visi || ''}
                           onChange={(e) => setProfile({ ...profile, tentang_visi: e.target.value })}
                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700 font-sans text-sm"
                           placeholder="Misal: Digitalisasi RT di seluruh Indonesia"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Misi Utama RT</label>
                        <input 
                           type="text"
                           value={profile.tentang_misi || ''}
                           onChange={(e) => setProfile({ ...profile, tentang_misi: e.target.value })}
                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700 font-sans text-sm"
                           placeholder="Misal: Memberdayakan pengurus dengan alat modern"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nilai-Nilai RT</label>
                        <input 
                           type="text"
                           value={profile.tentang_nilai || ''}
                           onChange={(e) => setProfile({ ...profile, tentang_nilai: e.target.value })}
                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700 font-sans text-sm"
                           placeholder="Misal: Aman, Terpercaya, dan Transparan"
                        />
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50">
                  <button 
                    onClick={() => handleSave('Berhasil!', 'Pengaturan umum telah diperbarui.')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 cursor-pointer"
                  >
                    <Save size={18} /> Simpan Perubahan
                  </button>
               </div>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="space-y-8">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800">Keamanan & Akses</h3>
                  <p className="text-sm text-slate-400 font-medium font-mono">Kelola password dan privasi akun admin</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <PasswordField 
                    label="Password Saat Ini" 
                    placeholder="••••••••" 
                    value={passwords.current}
                    onChange={(val: string) => setPasswords({...passwords, current: val})}
                  />
                  <PasswordField 
                    label="Password Baru" 
                    placeholder="Minimal 8 karakter" 
                    value={passwords.new}
                    onChange={(val: string) => setPasswords({...passwords, new: val})}
                  />
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Otentikasi Dua Faktor</h4>
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sky-main shadow-sm">
                           <Shield size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800">Aktifkan 2FA</p>
                           <p className="text-[10px] text-slate-400 font-medium font-mono">Lapisan keamanan tambahan saat login</p>
                        </div>
                     </div>
                     <Toggle 
                        checked={profile.two_factor_enabled || false} 
                        onChange={(val: boolean) => {
                          if (val) {
                            const secret = new OTPAuth.Secret({ size: 20 });
                            const totp = new OTPAuth.TOTP({
                              issuer: "SkyRT",
                              label: profile.email || "admin@skyrt.id",
                              algorithm: "SHA1",
                              digits: 6,
                              period: 30,
                              secret: secret
                            });
                            setSetup2FA({ ...setup2FA, active: true, secretRef: secret.base32, uri: totp.toString() });
                          } else {
                            setProfile({ ...profile, two_factor_enabled: false, two_factor_secret: undefined });
                            setSetup2FA({ active: false, secretRef: '', uri: '', code: '' });
                          }
                        }} 
                     />
                  </div>
               </div>

               {setup2FA.active && !profile.two_factor_enabled && (
                 <div className="p-6 mt-4 border border-sky-200 bg-sky-50 rounded-2xl flex flex-col items-center gap-4">
                   <p className="text-sm font-bold text-sky-dark text-center">Scan QR Code dengan Google Authenticator</p>
                   <div className="p-4 bg-white rounded-xl shadow-sm">
                     <QRCodeSVG value={setup2FA.uri} size={150} />
                   </div>
                   <input 
                     type="text" 
                     className="px-4 py-2 text-center text-xl tracking-widest font-mono bg-white border border-sky-200 rounded-lg outline-none"
                     placeholder="000000"
                     maxLength={6}
                     value={setup2FA.code}
                     onChange={(e) => setSetup2FA({ ...setup2FA, code: e.target.value.replace(/\D/g, '') })}
                   />
                   <button 
                     onClick={() => {
                        let totp = new OTPAuth.TOTP({
                          issuer: "SkyRT",
                          label: profile.email || "admin@skyrt.id",
                          algorithm: "SHA1",
                          digits: 6,
                          period: 30,
                          secret: OTPAuth.Secret.fromBase32(setup2FA.secretRef)
                        });
                        const delta = totp.validate({ token: setup2FA.code, window: 1 });
                        if (delta !== null) {
                          setProfile({ ...profile, two_factor_enabled: true, two_factor_secret: setup2FA.secretRef });
                          setSetup2FA({ ...setup2FA, active: false });
                          Swal.fire('Berhasil', '2FA telah diaktifkan. Ingat untuk menyimpan pengaturan!', 'success');
                        } else {
                          Swal.fire('Kode Salah', 'Kode Autentikator Google tidak valid.', 'error');
                        }
                     }}
                     className="px-6 py-2 bg-sky-main text-white font-bold rounded-lg hover:bg-sky-600 transition-colors"
                   >
                     Verifikasi & Aktifkan
                   </button>
                 </div>
               )}

               <div className="pt-8 border-t border-slate-50">
                  <button 
                    onClick={() => handleSave('Keamanan Diperbarui!', 'Password dan pengaturan akses telah disimpan.')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 cursor-pointer"
                  >
                    <Lock size={18} /> Update Keamanan
                  </button>
               </div>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800">Preferensi Notifikasi</h3>
                  <p className="text-sm text-slate-400 font-medium font-mono">Atur bagaimana sistem memberi tahu Anda</p>
               </div>

               <div className="space-y-4">
                  <NotificationToggle 
                    title="Notifikasi Laporan Masuk" 
                    desc="Terima pemberitahuan saat warga mengirim laporan/surat"
                    icon={<FileText size={20} />}
                    checked={notifSettings.reports}
                    onChange={(val: boolean) => setNotifSettings({...notifSettings, reports: val})}
                  />
                  <NotificationToggle 
                    title="Laporan Keuangan Mingguan" 
                    desc="Terima rangkuman transaksi kas setiap akhir pekan"
                    icon={<TrendingUp size={20} />}
                    checked={notifSettings.finance}
                    onChange={(val: boolean) => setNotifSettings({...notifSettings, finance: val})}
                  />
                  <NotificationToggle 
                    title="Update Status Warga" 
                    desc="Info saat ada perubahan data warga atau KK baru"
                    icon={<Users size={20} />}
                    checked={notifSettings.warga}
                    onChange={(val: boolean) => setNotifSettings({...notifSettings, warga: val})}
                  />
                  <NotificationToggle 
                    title="Pengumuman Penting" 
                    desc="Berita krusial dari pengembang sistem SkyRT"
                    icon={<Bell size={20} />}
                    checked={notifSettings.announcements}
                    onChange={(val: boolean) => setNotifSettings({...notifSettings, announcements: val})}
                  />
               </div>

               <div className="pt-8 border-t border-slate-50">
                  <button 
                    onClick={() => handleSave('Preferensi Disimpan!', 'Notifikasi Anda telah dikonfigurasi.')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 cursor-pointer"
                  >
                    <Save size={18} /> Simpan Preferensi
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, sub }: any) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${
      active 
        ? 'bg-sky-main text-white shadow-lg shadow-sky-200' 
        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
    }`}
  >
    <div className={`p-2.5 rounded-xl ${active ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white'}`}>
      {icon}
    </div>
    <div className="text-left">
       <p className="text-xs font-black uppercase tracking-tight leading-none">{label}</p>
       <p className={`text-[10px] font-bold mt-1 ${active ? 'text-white/60' : 'text-slate-400'}`}>{sub}</p>
    </div>
  </button>
);

const SettingItem = ({ label, desc, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700" 
    />
    <p className="text-[10px] text-slate-400 font-medium italic">{desc}</p>
  </div>
);

const NotificationToggle = ({ title, desc, icon, checked, onChange }: any) => {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-sky-100 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-sky-main shadow-sm transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">{title}</p>
          <p className="text-[10px] text-slate-400 font-medium font-mono">{desc}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
};

const Toggle = ({ checked, onChange }: any) => {
  const handleToggle = () => {
    if (onChange) onChange(!checked);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-sky-main' : 'bg-slate-200'}`}
    >
      <motion.div 
        animate={{ x: checked ? 26 : 4 }}
        initial={false}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
};

const PasswordField = ({ label, placeholder, value, onChange }: any) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <input 
          type={show ? "text" : "password"} 
          placeholder={placeholder} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700 pr-14" 
        />
        <button 
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-main transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default SettingsAdmin;
