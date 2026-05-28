import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/dbService';
import { RTProfile } from '../../types';
import { Save, Building, User, MapPin, Phone, Mail, Hash, Globe, Home, Navigation, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import Avatar from '../../components/Avatar';
import Swal from 'sweetalert2';

const ILLUSTRATION_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George'
];

const AdminProfile = () => {
  const [profile, setProfile] = useState<RTProfile>(dbService.getRTProfile());
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveRTProfile(profile);
    
    // Trigger event for other components in same tab
    window.dispatchEvent(new Event('profile_updated'));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire('Format Tidak Didukung', 'Gunakan JPG, PNG, atau WEBP.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('File Terlalu Besar', 'Maksimal ukuran file adalah 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfile(prev => ({ ...prev, avatar_url: base64String }));
      dbService.saveRTProfile({ ...profile, avatar_url: base64String });
      
      // Trigger event for other components in same tab
      window.dispatchEvent(new Event('profile_updated'));

      Swal.fire({
        title: 'Berhasil!',
        text: 'Foto profil telah diperbarui.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectIllustration = async () => {
    const { value: selectedAvatar } = await Swal.fire({
      title: 'Pilih Avatar Ilustrasi',
      html: `
        <div class="grid grid-cols-4 gap-4 p-4 max-h-[60vh] overflow-y-auto">
          ${ILLUSTRATION_AVATARS.map(url => `
            <div class="avatar-option cursor-pointer hover:scale-110 transition-transform" data-url="${url}">
              <img src="${url}" class="w-full h-full rounded-2xl bg-slate-50" />
            </div>
          `).join('')}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Pilih',
      didOpen: (popup) => {
        const options = popup.querySelectorAll('.avatar-option');
        options.forEach(opt => {
          opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('ring-4', 'ring-blue-500'));
            opt.classList.add('ring-4', 'ring-blue-500');
            (popup as any)._selectedUrl = (opt as HTMLElement).dataset.url;
          });
        });
      },
      preConfirm: () => (Swal.getPopup() as any)._selectedUrl,
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (selectedAvatar) {
      setProfile(prev => ({ ...prev, avatar_url: selectedAvatar }));
      dbService.saveRTProfile({ ...profile, avatar_url: selectedAvatar });
      // Trigger event for other components in same tab
      window.dispatchEvent(new Event('profile_updated'));
    }
  };

  const handleRemoveAvatar = () => {
    setProfile(prev => ({ ...prev, avatar_url: null }));
    dbService.saveRTProfile({ ...profile, avatar_url: null });
    // Trigger event for other components in same tab
    window.dispatchEvent(new Event('profile_updated'));
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar 
              src={profile.avatar_url} 
              name={profile.nama_ketua} 
              size="2xl" 
              className="ring-4 ring-white shadow-xl shadow-slate-200"
              fallbackColor="bg-slate-800"
            />
            <div className="absolute -bottom-2 -right-2 flex flex-col gap-1">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
              >
                <Camera size={14} />
              </button>
              <button 
                type="button"
                onClick={handleSelectIllustration}
                className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
              >
                <ImageIcon size={14} />
              </button>
              {profile.avatar_url && (
                <button 
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Profil RT</h1>
            <p className="text-slate-500 font-medium">Lengkapi identitas dan detail wilayah Rukun Tetangga</p>
          </div>
        </div>
        {isSaved && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm border border-emerald-100 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Perubahan berhasil disimpan!
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <User size={20} />
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Kepengurusan RT</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <ProfileInput 
                  label="Nomor RT" 
                  name="no_rt" 
                  value={profile.no_rt} 
                  onChange={handleChange} 
                  icon={<Hash size={14} />} 
                  placeholder="Contoh: 003"
                />
                <ProfileInput 
                  label="Nama Ketua RT" 
                  name="nama_ketua" 
                  value={profile.nama_ketua} 
                  onChange={handleChange} 
                  icon={<User size={14} />} 
                  placeholder="Nama Lengkap Beserta Gelar"
                />
                <ProfileInput 
                  label="Alamat Email" 
                  name="email" 
                  type="email"
                  value={profile.email} 
                  onChange={handleChange} 
                  icon={<Mail size={14} />} 
                  placeholder="rt003@desa.com"
                />
                <ProfileInput 
                  label="Nomor Telepon" 
                  name="telepon" 
                  value={profile.telepon} 
                  onChange={handleChange} 
                  icon={<Phone size={14} />} 
                  placeholder="0812XXXXXXXX"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <MapPin size={20} />
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Detail Alamat Wilayah</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <ProfileInput 
                  label="Nama Jalan" 
                  name="nama_jalan" 
                  value={profile.nama_jalan} 
                  onChange={handleChange} 
                  icon={<Navigation size={14} />}
                  placeholder="Jl. Melati / Blok..."
                />
                <ProfileInput 
                  label="Nomor Rumah" 
                  name="no_rumah" 
                  value={profile.no_rumah} 
                  onChange={handleChange} 
                  icon={<Home size={14} />}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <ProfileInput label="RT" name="rt" value={profile.rt} onChange={handleChange} />
                  <ProfileInput label="RW" name="rw" value={profile.rw} onChange={handleChange} />
                </div>

                <ProfileInput label="Kelurahan / Desa" name="kelurahan" value={profile.kelurahan} onChange={handleChange} />
                <ProfileInput label="Kecamatan" name="kecamatan" value={profile.kecamatan} onChange={handleChange} />
                <ProfileInput label="Kota / Kabupaten" name="kota" value={profile.kota} onChange={handleChange} />
                <ProfileInput label="Provinsi" name="provinsi" value={profile.provinsi} onChange={handleChange} />
                
                <div className="grid grid-cols-2 gap-4">
                  <ProfileInput label="Kode Pos" name="kode_pos" value={profile.kode_pos} onChange={handleChange} />
                  <ProfileInput label="Negara" name="negara" value={profile.negara} onChange={handleChange} icon={<Globe size={14} />} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ringkasan Alamat Lengkap</label>
                <textarea
                  name="alamat"
                  value={profile.alamat}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all resize-none italic"
                  placeholder="Alamat lengkap yang akan ditampilkan di surat..."
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Instructions */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 text-white space-y-6">
              <h3 className="font-black text-xl leading-tight">Konfigurasi Sistem RT</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Data yang Anda masukkan di sini akan digunakan sebagai kop surat otomatis dan informasi publik bagi warga di dashboard mereka.
              </p>
              
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="w-full bg-white text-slate-900 font-black py-4 px-8 rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  <Save size={18} />
                  Simpan Profil
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
              <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm">
                <Building size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-blue-900 text-sm">Update Real-time</h4>
                <p className="text-blue-700/70 text-xs leading-relaxed">
                  Semua perubahan akan langsung terlihat oleh warga yang sedang login ke portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const ProfileInput = ({ label, name, value, onChange, icon, type = 'text', placeholder }: any) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 px-1">
      {icon && <span className="text-slate-400">{icon}</span>}
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    </div>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-800 transition-all"
      placeholder={placeholder || `Masukkan ${label.toLowerCase()}...`}
    />
  </div>
);

export default AdminProfile;
