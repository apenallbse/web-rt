import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Users, Shield, Bell, Lock, Globe, Save, FileText, TrendingUp, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import WargaList from './WargaList';
import { dbService } from '../../services/dbService';
import { NotificationSettings } from '../../types';

const SettingsAdmin = () => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [passwords, setPasswords] = useState({
    current: '',
    new: ''
  });
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    reports: true,
    finance: true,
    warga: false,
    announcements: true,
    twoFactorEnabled: false
  });

  useEffect(() => {
    setNotifSettings(dbService.getSettings());
  }, []);

  const handleSave = (title: string, message: string) => {
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
          password: passwords.new
        });
        
        // Reset fields
        setPasswords({ current: '', new: '' });
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
                    value="SkyRT Management System" 
                  />
                  <SettingItem 
                    label="Warna Utama" 
                    desc="Tema branding portal" 
                    value="Sky Blue (#0ea5e9)" 
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bahasa Sistem</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700">
                      <option>Bahasa Indonesia</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zona Waktu</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-slate-700">
                      <option>WIB (Jakarta) GMT+7</option>
                      <option>WITA GMT+8</option>
                      <option>WIT GMT+9</option>
                    </select>
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
                        checked={notifSettings.twoFactorEnabled} 
                        onChange={(val: boolean) => setNotifSettings({...notifSettings, twoFactorEnabled: val})} 
                     />
                  </div>
               </div>

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

const SettingItem = ({ label, desc, value }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <input 
      type="text" 
      defaultValue={value}
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
