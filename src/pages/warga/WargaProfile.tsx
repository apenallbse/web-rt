import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { User, Shield, Phone, MapPin, Calendar, CreditCard, Mail, Globe, Briefcase, GraduationCap, Heart, Info, Home, Edit2, Save, X, Clock, Camera, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import Avatar from '../../components/Avatar';

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

const WargaProfile = () => {
  const { user } = useAuth();
  const rtProfile = dbService.getRTProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = React.useState(() => {
    if (user?.role === 'warga' && user?.email) {
      const data = dbService.getOrCreateWarga(user.email);
      
      // Auto-fix "Warga Baru" if it was set previously
      if (data.nama === 'Warga Baru' && user.email) {
        const derivedName = user.email.split('@')[0]
          .split(/[._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        
        if (derivedName && derivedName !== 'Warga Baru') {
          const updatedWarga = { ...data, nama: derivedName };
          const allWarga = dbService.getWarga();
          dbService.saveWarga(allWarga.map(w => w.id === data.id ? updatedWarga : w));
          return updatedWarga;
        }
      }
      return data;
    }
    return null;
  });

  const [profileColor, setProfileColor] = React.useState(() => {
    if (!profile) return 'sky-gradient';
    return localStorage.getItem(`profile-color-${profile.id}`) || 'sky-gradient';
  });

  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState(() => profile || {} as any);

  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({ ...profile });
    }
  }, [profile, isEditing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire('Format Tidak Didukung', 'Gunakan JPG, PNG, atau WEBP.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('File Terlalu Besar', 'Maksimal ukuran file adalah 5MB.', 'error');
      return;
    }

    // Convert to Base64 for local storage (Simulating Upload)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, avatar_url: base64String }));
      
      // If not in editing mode, save immediately for better UX
      if (!isEditing) {
        saveAvatar(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = (url: string | null) => {
    if (!profile) return;
    const allWarga = dbService.getWarga();
    const updated = allWarga.map(w => w.id === profile.id ? { ...w, avatar_url: url, updated_at: new Date().toISOString() } : w);
    dbService.saveWarga(updated);
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
    
    // Trigger event for other components in same tab
    window.dispatchEvent(new Event('profile_updated'));

    Swal.fire({
      title: 'Berhasil!',
      text: url ? 'Foto profil telah diperbarui.' : 'Foto profil telah dihapus.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSelectIllustration = async () => {
    const { value: selectedAvatar } = await Swal.fire({
      title: 'Pilih Avatar Ilustrasi',
      html: `
        <div class="grid grid-cols-4 gap-4 p-4">
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
            options.forEach(o => o.classList.remove('ring-4', 'ring-sky-main'));
            opt.classList.add('ring-4', 'ring-sky-main');
            (popup as any)._selectedUrl = (opt as HTMLElement).dataset.url;
          });
        });
      },
      preConfirm: () => {
        const selected = (Swal.getPopup() as any)._selectedUrl;
        if (!selected) {
          Swal.showValidationMessage('Silakan pilih salah satu avatar');
        }
        return selected;
      },
      customClass: {
        popup: 'rounded-[2rem]'
      }
    });

    if (selectedAvatar) {
      setFormData(prev => ({ ...prev, avatar_url: selectedAvatar }));
      if (!isEditing) {
        saveAvatar(selectedAvatar);
      }
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar_url: null }));
    if (!isEditing) {
      saveAvatar(null);
    }
  };

  if (!profile) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
        <User size={40} />
      </div>
      <h2 className="text-xl font-bold text-gray-700">Profil tidak ditemukan</h2>
      <p className="text-gray-500">Silakan hubungi admin untuk verifikasi data warga Anda.</p>
    </div>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const allWarga = dbService.getWarga();
      const updatedData = { 
        ...formData, 
        updated_at: new Date().toISOString() 
      };
      const updated = allWarga.map(w => w.id === profile.id ? { ...w, ...updatedData } : w);
      dbService.saveWarga(updated);
      
      // Trigger event for other components in same tab
      window.dispatchEvent(new Event('profile_updated'));

      Swal.fire({
        title: 'Berhasil!',
        text: 'Profil Anda telah diperbarui.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setIsEditing(false);
      // Removed window.location.reload() to maintain state but manually triggered layout update
    } catch (error) {
      Swal.fire('Error', 'Gagal memperbarui profil.', 'error');
    }
  };

  const colors = [
    { name: 'Sky', class: 'sky-gradient' },
    { name: 'Emerald', class: 'bg-emerald-500' },
    { name: 'Amber', class: 'bg-amber-500' },
    { name: 'Rose', class: 'bg-rose-500' },
    { name: 'Slate', class: 'bg-slate-700' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Profile */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-10 relative z-20">
        <div className="relative">
          <Avatar 
            src={formData.avatar_url} 
            name={profile.nama} 
            size="2xl" 
            fallbackColor={profileColor}
            className="shadow-xl shadow-sky-main/20 ring-4 ring-white"
          />
          
          <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 bg-sky-main text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
              title="Upload Foto"
            >
              <Camera size={20} />
              <span className="absolute left-12 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Upload Foto</span>
            </button>

            <button 
              onClick={handleSelectIllustration}
              className="w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
              title="Pilih Avatar"
            >
              <ImageIcon size={20} />
              <span className="absolute left-12 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Pilih Avatar</span>
            </button>

            {formData.avatar_url && (
              <button 
                onClick={handleRemoveAvatar}
                className="w-10 h-10 bg-rose-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
                title="Hapus Foto"
              >
                <Trash2 size={20} />
                <span className="absolute left-12 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Hapus Foto</span>
              </button>
            )}
          </div>

          <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {colors.map(c => (
              <button 
                key={c.class}
                onClick={() => {
                  setProfileColor(c.class);
                  localStorage.setItem(`profile-color-${profile.id}`, c.class);
                }}
                className={`w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer ${c.class}`}
                title={c.name}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h1 className="text-3xl font-black text-sky-dark">{profile.nama}</h1>
            {profile.status === 'pending' ? (
              <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                <Clock size={12} /> Menunggu Verifikasi
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                <Shield size={12} /> Terverifikasi
              </span>
            )}
          </div>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em] mb-4">Warga Rukun Tetangga {rtProfile.no_rt}</p>
          
          <button 
            type="button"
            onClick={() => {
              console.log('Edit button clicked, current isEditing:', isEditing);
              setIsEditing(!isEditing);
            }}
            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer relative z-[30] shadow-xl ${isEditing ? 'bg-slate-200 text-slate-600' : 'bg-sky-600 text-white shadow-sky-200 hover:bg-sky-700 active:scale-95'}`}
          >
            {isEditing ? <><X size={18} /> Batalkan Edit</> : <><Edit2 size={18} /> Edit Profil Saya</>}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form 
            key="edit-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onSubmit={handleSubmit}
            className="space-y-8 relative z-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-sky-dark flex items-center gap-3">
                  <div className="p-2 bg-sky-50 text-sky-main rounded-xl"><User size={20} /></div>
                  Edit Data Personal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <EditInput label="Nama Lengkap" name="nama" value={formData.nama} onChange={handleInputChange} required />
                  <EditInput label="Email" name="email" value={formData.email} onChange={handleInputChange} readOnly />
                  <EditInput label="NIK" name="nik" value={formData.nik} onChange={handleInputChange} required />
                  <EditInput label="No. WhatsApp/HP" name="no_hp" value={formData.no_hp} onChange={handleInputChange} />
                  <EditInput label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} />
                  <EditInput label="Tanggal Lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} onChange={handleInputChange} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Jenis Kelamin</label>
                    <select 
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-sky-dark"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Agama</label>
                    <select 
                      name="agama"
                      value={formData.agama}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-sky-dark"
                    >
                      <option value="">Pilih Agama</option>
                      {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu'].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-sky-dark flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Info size={20} /></div>
                  Pekerjaan & Detail Lain
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <EditInput label="Pekerjaan" name="jenis_pekerjaan" value={formData.jenis_pekerjaan} onChange={handleInputChange} />
                  <EditInput label="Pendidikan Terakhir" name="pendidikan" value={formData.pendidikan} onChange={handleInputChange} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status Pernikahan</label>
                    <select 
                      name="status_perkawinan"
                      value={formData.status_perkawinan}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-sky-dark"
                    >
                      <option value="">Pilih Status</option>
                      {['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Kewarganegaraan</label>
                    <select 
                      name="kewarganegaraan"
                      value={formData.kewarganegaraan}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-sky-dark"
                    >
                      <option value="WNI">WNI</option>
                      <option value="WNA">WNA</option>
                    </select>
                  </div>
                  <EditInput label="No. Paspor" name="no_paspor" value={formData.no_paspor} onChange={handleInputChange} />
                  <EditInput label="No. KITAP" name="no_kitap" value={formData.no_kitap} onChange={handleInputChange} />
                  <EditInput label="Nama Ayah" name="nama_ayah" value={formData.nama_ayah} onChange={handleInputChange} />
                  <EditInput label="Nama Ibu" name="nama_ibu" value={formData.nama_ibu} onChange={handleInputChange} />
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-sky-dark flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Home size={20} /></div>
                  Komponen Alamat Lengkap
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2"><EditInput label="Nama Jalan" name="nama_jalan" value={formData.nama_jalan} onChange={handleInputChange} /></div>
                  <EditInput label="No. Rumah" name="no_rumah" value={formData.no_rumah} onChange={handleInputChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <EditInput label="RT" name="rt" value={formData.rt} onChange={handleInputChange} />
                    <EditInput label="RW" name="rw" value={formData.rw} onChange={handleInputChange} />
                  </div>
                  <EditInput label="Kelurahan / Desa" name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} />
                  <EditInput label="Kecamatan" name="kecamatan" value={formData.kecamatan} onChange={handleInputChange} />
                  <EditInput label="Kota / Kabupaten" name="kota" value={formData.kota} onChange={handleInputChange} />
                  <EditInput label="Provinsi" name="provinsi" value={formData.provinsi} onChange={handleInputChange} />
                  <EditInput label="Kode Pos" name="kode_pos" value={formData.kode_pos} onChange={handleInputChange} />
                  <EditInput label="Negara" name="negara" value={formData.negara} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Alamat Lengkap</label>
                  <textarea 
                    name="alamat"
                    value={formData.alamat} 
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main rounded-2xl outline-none font-bold text-sky-dark"
                    rows={2}
                    placeholder="Masukkan alamat lengkap secara manual..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-10 py-4 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all uppercase tracking-widest text-sm cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-10 py-4 bg-sky-600 text-white font-black rounded-3xl shadow-xl shadow-sky-200 hover:bg-sky-700 transition-all uppercase tracking-widest text-sm flex items-center gap-2 cursor-pointer"
              >
                <Save size={20} /> Simpan Perubahan
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="display-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Left Column: Personal Data */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8"
              >
                <h3 className="text-xl font-bold text-sky-dark flex items-center gap-3">
                  <div className="p-2 bg-sky-50 text-sky-main rounded-xl"><User size={20} /></div>
                  Data Personal & Kontak
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <ProfileItem label="Nama Lengkap" value={profile.nama} />
                  <ProfileItem label="Tempat, Tgl Lahir" value={`${profile.tempat_lahir || '-'}, ${profile.tanggal_lahir}`} />
                  <ProfileItem label="Jenis Kelamin" value={profile.jenis_kelamin} />
                  <ProfileItem label="Email" value={profile.email} icon={<Mail size={14} />} />
                  <ProfileItem label="Phone / WhatsApp" value={profile.no_hp} icon={<Phone size={14} />} />
                  <ProfileItem label="Nomor Identitas" value={profile.nik} icon={<CreditCard size={14} />} />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8"
              >
                <h3 className="text-xl font-bold text-sky-dark flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Info size={20} /></div>
                  Pekerjaan & Pendidikan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <ProfileItem label="Pekerjaan" value={profile.jenis_pekerjaan} icon={<Briefcase size={14} />} />
                  <ProfileItem label="Pendidikan Terakhir" value={profile.pendidikan} icon={<GraduationCap size={14} />} />
                  <ProfileItem label="Status Pernikahan" value={profile.status_perkawinan} icon={<Heart size={14} />} />
                  <ProfileItem label="Agama" value={profile.agama} />
                  <ProfileItem label="Kewarganegaraan" value={profile.kewarganegaraan} icon={<Globe size={14} />} />
                  <ProfileItem label="Status Keluarga" value={profile.status_keluarga || 'Anggota'} />
                </div>
              </motion.div>
            </div>

            {/* Right Column: Address Data */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 flex flex-col"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-sky-dark flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Home size={20} /></div>
                  Komponen Alamat Lengkap
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ProfileItem label="Nama Jalan" value={profile.nama_jalan} fullWidth />
                  <ProfileItem label="Nomor Rumah" value={profile.no_rumah} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <ProfileItem label="RT" value={profile.rt} />
                  <ProfileItem label="RW" value={profile.rw} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ProfileItem label="Kelurahan / Desa" value={profile.kelurahan} />
                  <ProfileItem label="Kecamatan" value={profile.kecamatan} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ProfileItem label="Kota / Kabupaten" value={profile.kota} />
                  <ProfileItem label="Provinsi" value={profile.provinsi} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ProfileItem label="Kode Pos" value={profile.kode_pos} />
                  <ProfileItem label="Negara" value={profile.negara} />
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-50">
                <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Alamat Ringkasan</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm leading-relaxed italic">
                    "{profile.alamat || 'Alamat belum disinkronkan'}"
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditInput = ({ label, name, value, onChange, type = 'text', required = false, readOnly = false }: { label: string, name: string, value?: string, onChange: (e: any) => void, type?: string, required?: boolean, readOnly?: boolean }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      readOnly={readOnly}
      className={`w-full px-5 py-3.5 rounded-2xl outline-none font-bold transition-all border-2 ${readOnly ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent' : 'bg-gray-50 border-transparent focus:border-sky-main text-sky-dark focus:bg-white'}`}
      placeholder={`Masukkan ${label.toLowerCase()}...`}
    />
  </div>
);
const ProfileItem = ({ label, value, icon, fullWidth }: { label: string, value?: string, icon?: React.ReactNode, fullWidth?: boolean }) => (
  <div className={`space-y-1 ${fullWidth ? 'col-span-full' : ''}`}>
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
    </div>
    <p className={`font-black text-sky-dark ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
      {value || 'Belum diisi'}
    </p>
  </div>
);

export default WargaProfile;

