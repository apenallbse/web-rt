import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { UserPlus, User, Shield, IdCard, Phone, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { dbService } from '../services/dbService';
import Swal from 'sweetalert2';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nik: '',
    no_hp: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      dbService.registerWarga(formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Akun Anda telah dibuat. Silakan masuk.',
        confirmButtonColor: '#0ea5e9',
        customClass: {
          popup: 'rounded-[2rem]'
        }
      }).then(() => {
        navigate('/login');
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: error.message || 'Terjadi kesalahan saat mendaftar.',
        confirmButtonColor: '#0ea5e9',
        customClass: {
          popup: 'rounded-[2rem]'
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative">
      <div className="absolute top-0 inset-x-0 h-96 sky-gradient -skew-y-6 transform -translate-y-48"></div>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/login')}
        className="absolute top-8 left-8 flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-black hover:bg-white/30 transition-all z-50 cursor-pointer shadow-lg"
      >
        <ArrowLeft size={18} />
        <span className="text-sm uppercase tracking-widest">Kembali</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 sky-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus size={32} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-center text-sky-dark mb-2">Daftar Akun Baru</h2>
          <p className="text-center text-gray-500 mb-10">Bergabunglah dengan komunitas SkyRT</p>
          
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <User size={14} className="text-sky-main" /> Nama Lengkap
                </label>
                <input 
                  type="text" 
                  name="nama"
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
                  placeholder="Nama Lengkap"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Shield size={14} className="text-sky-main" /> Alamat Email
                </label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
                  placeholder="email@anda.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <IdCard size={14} className="text-sky-main" /> NIK (16 Digit)
                </label>
                <input 
                  type="text" 
                  name="nik"
                  maxLength={16}
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
                  placeholder="3200xxxxxxxxxxxx"
                  value={formData.nik}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={14} className="text-sky-main" /> No. Handphone
                </label>
                <input 
                  type="tel" 
                  name="no_hp"
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm"
                  placeholder="08xxxxxxxxxx"
                  value={formData.no_hp}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Lock size={14} className="text-sky-main" /> Password Akun
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-main transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 ml-1">Minimal 6 karakter untuk keamanan akun Anda</p>
            </div>

            <div className="pt-4">
              <button className="w-full py-5 sky-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-sky-main/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                <UserPlus size={22} /> Daftar Akun
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Sudah punya akun? {' '}
                <Link to="/login" className="text-sky-main font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
