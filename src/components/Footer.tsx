import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-main opacity-[0.03] blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sky-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white leading-tight tracking-tight">SkyRT</span>
                <span className="text-[10px] uppercase font-bold text-sky-light tracking-widest -mt-0.5">Management System</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Platform digital untuk membantu pengurus RT mengelola administrasi warga secara modern, aman, dan transparan.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-sky-main hover:text-white transition-all text-gray-400">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-sky-main hover:text-white transition-all text-gray-400">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-sky-main hover:text-white transition-all text-gray-400">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Fitur Utama */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white tracking-tight">Fitur Utama</h4>
            <ul className="space-y-4">
              {[
                { name: 'Data Warga', href: '#data-warga' },
                { name: 'Kartu Keluarga', href: '#kk' },
                { name: 'Iuran Online', href: '#iuran' },
                { name: 'Surat Pengantar', href: '#surat' },
                { name: 'Agenda Kegiatan', href: '#agenda' },
                { name: 'Pengumuman', href: '#pengumuman' },
                { name: 'Keamanan Data', href: '#keamanan' }
              ].map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-400 hover:text-sky-light text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white tracking-tight">Perusahaan</h4>
            <ul className="space-y-4">
              {[
                { name: 'Tentang Kami', href: '#tentang' },
                { name: 'Pusat Bantuan', href: '#kontak' },
                { name: 'Kebijakan Privasi', href: '#' },
                { name: 'Syarat & Ketentuan', href: '#' },
                { name: 'Karir', href: '#' }
              ].map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-400 hover:text-sky-light text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white tracking-tight">Kontak Kami</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-sky-light shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-300">admin@skyrt.id</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-sky-light shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-300">+62 812-3456-7890</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-sky-light shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Lokasi</p>
                  <p className="text-sm font-medium text-gray-300">Jakarta, Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-gray-500 text-xs font-medium">
              &copy; 2026 SkyRT. All rights reserved.
            </p>
            <p className="text-gray-600 text-[10px] mt-1 font-medium italic">
              Dibuat untuk mendukung digitalisasi RT di Indonesia.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-gray-500 hover:text-white text-xs font-medium transition-colors">Instagram</a>
            <a href="#" className="text-gray-500 hover:text-white text-xs font-medium transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-500 hover:text-white text-xs font-medium transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
