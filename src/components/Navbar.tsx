import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Shield, ArrowRight, ChevronDown, Users, CreditCard, FileText, Clock, Zap, ClipboardList } from 'lucide-react';

import AppLogo from './AppLogo';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFiturDropdownOpen, setIsFiturDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Fitur', href: '#fitur', hasDropdown: true },
    { name: 'Tentang', href: '#tentang' },
    { name: 'Kontak', href: '#kontak' },
  ];

  const fiturItems = [
    { name: 'Data Warga', href: '#data-warga', icon: <Users size={16} /> },
    { name: 'Kartu Keluarga', href: '#kk', icon: <ClipboardList size={16} /> },
    { name: 'Iuran Online', href: '#iuran', icon: <CreditCard size={16} /> },
    { name: 'Surat Pengantar', href: '#surat', icon: <FileText size={16} /> },
    { name: 'Agenda & Pengumuman', href: '#agenda', icon: <Clock size={16} /> },
    { name: 'Keamanan Data', href: '#keamanan', icon: <Shield size={16} /> },
  ];

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform rounded-full">
            <AppLogo size={44} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-sky-dark leading-tight tracking-tight mt-1 flex items-center gap-1.5">
              RT 06 <span className="text-[12px] uppercase font-bold text-sky-500 tracking-widest leading-none pt-0.5">Teratai Putih</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-0">Portal Warga</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <div 
              key={link.name} 
              className="relative"
              onMouseEnter={() => link.hasDropdown && setIsFiturDropdownOpen(true)}
              onMouseLeave={() => link.hasDropdown && setIsFiturDropdownOpen(false)}
            >
              <a
                href={link.href}
                className="text-sm font-semibold text-gray-600 hover:text-sky-main transition-colors flex items-center gap-1.5 relative group py-2"
                onClick={(e) => link.hasDropdown && e.preventDefault()}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${isFiturDropdownOpen ? 'rotate-180' : ''}`} />}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-main transition-all group-hover:w-full"></span>
              </a>

              {/* Dropdown Menu */}
              {link.hasDropdown && (
                <AnimatePresence>
                  {isFiturDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 mt-1"
                    >
                      <div className="grid gap-1">
                        {fiturItems.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-soft/20 text-gray-600 hover:text-sky-main transition-all group"
                          >
                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-sky-main group-hover:text-white transition-colors">
                              {item.icon}
                            </div>
                            <span className="text-sm font-bold">{item.name}</span>
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Actions - Removed as requested */}

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-sky-dark"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col gap-2">
                  <a
                    href={link.href}
                    className="text-lg font-bold text-sky-dark flex items-center justify-between"
                    onClick={(e) => {
                      if (link.hasDropdown) {
                        e.preventDefault();
                        setIsFiturDropdownOpen(!isFiturDropdownOpen);
                      } else {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                  >
                    {link.name}
                    {link.hasDropdown && <ChevronDown size={20} className={`transition-transform ${isFiturDropdownOpen ? 'rotate-180' : ''}`} />}
                  </a>
                  
                  {link.hasDropdown && isFiturDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pl-4 flex flex-col gap-3 mt-2 border-l-2 border-sky-soft/30"
                    >
                      {fiturItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="text-sm font-bold text-gray-500 hover:text-sky-main flex items-center gap-2"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsFiturDropdownOpen(false);
                          }}
                        >
                          {item.icon}
                          {item.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
              {/* Mobile Actions - Removed as requested */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
