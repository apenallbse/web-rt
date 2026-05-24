import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { motion } from 'motion/react';
import * as OTPAuth from 'otpauth';
import { LogIn, User, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import AppLogo from '../components/AppLogo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const verifyCredentialsFirst = () => {
    const isAdminEmail = email === 'admin@skyrt.id';
    
    if (isAdminEmail) {
      const rtProfile = dbService.getRTProfile();
      // Allow 123 as fallback password in case of lockout
      if (password && password !== '123' && rtProfile.password && password !== rtProfile.password) {
        return { success: false };
      }
      return { success: true, user2FAEnabled: !!rtProfile.two_factor_enabled, secret: rtProfile.two_factor_secret || null };
    }
    
    const warga = dbService.getWarga().find(w => w.email === email);
    if (!warga) {
      // Just returning false for not found or incorrect
      return { success: false };
    }
    
    if (warga.password && password && warga.password !== password) {
      return { success: false };
    }
    
    return { success: true, user2FAEnabled: !!warga.two_factor_enabled, secret: warga.two_factor_secret || null };
  };

  const executeLogin = () => {
    const success = login(email, password);
    if (success) {
      navigate('/app');
    } else {
      Swal.fire('Login Gagal', 'Sesi login tidak valid.', 'error');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    if (show2FA) {
      if (!twoFactorSecret) {
        executeLogin();
        return;
      }

      let totp = new OTPAuth.TOTP({
        issuer: "SkyRT",
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(twoFactorSecret)
      });
      
      const delta = totp.validate({ token: totpCode, window: 1 });
      if (delta === null) {
        Swal.fire('Kode Salah', 'Kode Autentikator Google tidak valid atau kadaluarsa.', 'error');
        return;
      }
      
      executeLogin();
      return;
    }

    const { success, user2FAEnabled, secret } = verifyCredentialsFirst();
    if (success) {
      if (user2FAEnabled && secret) {
        setTwoFactorSecret(secret);
        setShow2FA(true);
      } else {
        executeLogin();
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Email atau Password yang Anda masukkan salah.',
        confirmButtonColor: '#0ea5e9',
        customClass: { popup: 'rounded-[2rem]' }
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
            <div className="w-16 h-16 flex items-center justify-center shadow-lg rounded-full">
              <AppLogo size={64} />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-center text-sky-dark mb-2">{show2FA ? 'Verifikasi 2FA' : 'Selamat Datang'}</h2>
          <p className="text-center text-gray-500 mb-10">{show2FA ? 'Masukkan kode dari Google Authenticator' : 'Masuk ke portal RT 06'}</p>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {!show2FA ? (
              <>
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
              </>
            ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Kode Autentikator Google</label>
                 <input 
                   type="text" 
                   className="w-full px-5 py-4 text-center text-3xl tracking-widest font-mono bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all"
                   placeholder="000000"
                   maxLength={6}
                   value={totpCode}
                   onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                   required
                 />
               </motion.div>
            )}

            <button className="w-full py-5 sky-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-sky-main/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
              <LogIn size={22} /> {show2FA ? 'Verifikasi' : 'Masuk Sekarang'}
            </button>
            {!show2FA && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Belum punya akun? {' '}
                  <Link to="/register" className="text-sky-main font-bold hover:underline">
                    Daftar Sekarang
                  </Link>
                </p>
              </div>
            )}
            <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
              {show2FA ? 'Buka aplikasi Google Authenticator di HP Anda' : 'Harap gunakan email yang terdaftar sebagai Warga atau Admin'}
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
