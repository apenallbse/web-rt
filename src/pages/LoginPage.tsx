import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { LogIn, User, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const success = login(email, password);
    if (success) {
      navigate('/app');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Email atau Password yang Anda masukkan salah.',
        confirmButtonColor: '#0ea5e9',
        customClass: {
          popup: 'rounded-[2rem]'
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative">
      <div className="absolute top-0 inset-x-0 h-96 sky-gradient -skew-y-6 transform -translate-y-48"></div>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-black hover:bg-white/30 transition-all z-50 cursor-pointer shadow-lg"
      >
        <ArrowLeft size={18} />
        <span className="text-sm uppercase tracking-widest">Kembali</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 sky-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-center text-sky-dark mb-2">Selamat Datang</h2>
          <p className="text-center text-gray-500 mb-10">Masuk ke portal SkyRT</p>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email</label>
              <input 
                type="email" 
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium"
                placeholder="email@anda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium pr-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-main transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button className="w-full py-5 sky-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-sky-main/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
              <LogIn size={22} /> Masuk Sekarang
            </button>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Belum punya akun? {' '}
                <Link to="/register" className="text-sky-main font-bold hover:underline">
                  Daftar Sekarang
                </Link>
              </p>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
              Harap gunakan email yang terdaftar sebagai Warga atau Admin
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
