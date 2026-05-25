import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  UserCircle, 
  LogOut,
  ChevronRight,
  Menu,
  Settings,
  ClipboardList,
  Calendar,
  Megaphone,
  BarChart3,
  Wallet,
  Package
} from 'lucide-react';
import { dbService } from '../services/dbService';
import Avatar from './Avatar';
import AppLogo from './AppLogo';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get current profile for avatar
  const [profile, setProfile] = React.useState<any>(null);
  const [rtProfile, setRtProfile] = React.useState<any>(dbService.getRTProfile());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = () => {
      const adminData = dbService.getRTProfile();
      setRtProfile(adminData);
      if (user?.role === 'admin') {
        setProfile({ name: adminData.nama_ketua, avatar_url: adminData.avatar_url, id: 'admin' });
      } else if (user?.role === 'warga' && user?.email) {
        const wargaData = dbService.getOrCreateWarga(user.email);
        setProfile({ name: wargaData.nama, avatar_url: wargaData.avatar_url, id: wargaData.id });
      }
    };

    loadProfile();
    
    // Listen for storage changes to update avatar in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('skyrt_warga') || e.key?.startsWith('skyrt_rt_profile')) {
        loadProfile();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profile_updated', loadProfile);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profile_updated', loadProfile);
    };
  }, [user]);

  const adminMenu = [
    { label: 'Dashboard', path: '/app', icon: <LayoutDashboard size={20} /> },
    { label: 'Agenda & Kegiatan', path: '/app/agenda', icon: <Calendar size={20} /> },
    { label: 'Pengumuman', path: '/app/pengumuman', icon: <Megaphone size={20} /> },
    { label: 'Data Warga', path: '/app/warga', icon: <Users size={20} /> },
    { label: 'Kartu Keluarga', path: '/app/kk', icon: <ClipboardList size={20} /> },
    { label: 'Iuran Warga', path: '/app/iuran', icon: <CreditCard size={20} /> },
    { label: 'Keuangan RT', path: '/app/keuangan', icon: <Wallet size={20} /> },
    { label: 'Inventaris RT', path: '/app/inventaris', icon: <Package size={20} /> },
    { label: 'Laporan', path: '/app/laporan', icon: <BarChart3 size={20} /> },
    { label: 'Surat Pengantar', path: '/app/surat', icon: <FileText size={20} /> },
    { label: 'Profil RT', path: '/app/profil-rt', icon: <UserCircle size={20} /> },
  ];

  const wargaMenu = [
    { label: 'Dashboard', path: '/app', icon: <LayoutDashboard size={20} /> },
    { label: 'Agenda Kegiatan', path: '/app/agenda-warga', icon: <Calendar size={20} /> },
    { label: 'Pengumuman', path: '/app/pengumuman-warga', icon: <Megaphone size={20} /> },
    { label: 'Profil Saya', path: '/app/profil', icon: <UserCircle size={20} /> },
    { label: 'Iuran Saya', path: '/app/iuran-saya', icon: <CreditCard size={20} /> },
    { label: 'Pengajuan Surat', path: '/app/pengajuan-surat', icon: <FileText size={20} /> },
  ];

  const menu = user?.role === 'admin' ? adminMenu : wargaMenu;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 overflow-hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col items-center space-y-3 space-x-0 md:space-x-3 md:flex-row md:items-center text-white relative">
          <button 
             className="absolute top-4 right-4 md:hidden text-slate-400 hover:text-white"
             onClick={() => setIsMobileMenuOpen(false)}
          >
             {/* Use basic 'X' instead of relying on missing icon import if not available, or X is imported from somewhere? Let's use string */}
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg rounded-full">
            <AppLogo size={40} />
          </div>
          <div className="leading-none">
            <h1 className="text-xl font-bold tracking-tight text-[#bae6fd]">
              RT {rtProfile?.no_rt || '00'}
            </h1>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[150px]">
              {rtProfile?.nama_jalan || 'Aplikasi RT'}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 pt-4 space-y-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">Main Menu</div>
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) => `
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all group
                ${isActive 
                  ? 'bg-[#1d4ed8] text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
            >
              <span className="w-5 h-5 mr-3 opacity-80 shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
          
          {user?.role === 'admin' && (
            <div className="pt-4">
               <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">System Settings</div>
               <NavLink
                to="/app/settings"
                className={({ isActive }) => `
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all
                  ${isActive 
                    ? 'bg-[#1d4ed8] text-white shadow-md shadow-blue-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                `}
              >
                <div className="w-5 h-5 mr-3 opacity-80 shrink-0"><Settings size={20} /></div>
                <span className="flex-1">Pengaturan</span>
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center p-3 rounded-lg bg-slate-800/50">
            <Avatar 
              src={profile?.avatar_url} 
              name={profile?.name || user?.email} 
              size="sm" 
              className="mr-3"
              fallbackColor={profile?.id === 'admin' ? 'bg-indigo-500' : 'bg-sky-500'}
            />
            <div className="text-xs overflow-hidden">
              <p className="text-white font-medium truncate">{profile?.name || user?.email.split('@')[0]}</p>
              <p className="text-slate-400 capitalize">{user?.role} RT</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-2">
            <button 
              className="md:hidden mr-2 text-slate-500 hover:text-slate-800"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 capitalize truncate">
              {window.location.pathname.split('/').pop()?.replace('-', ' ') === 'app' ? 'Dashboard' : window.location.pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wide">Live System</span>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-4 border-r border-slate-200 pr-4 md:pr-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-tight">Status User</p>
                <p className="text-sm font-bold text-blue-700 capitalize">{user?.role}</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => navigate(user?.role === 'admin' ? '/app/profil-rt' : '/app/profil')}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-105"
                  title="Klik untuk ke profil"
                >
                   <Avatar 
                    src={profile?.avatar_url} 
                    name={profile?.name || user?.email} 
                    size="md" 
                    fallbackColor={profile?.id === 'admin' ? 'bg-indigo-500' : 'bg-sky-500'}
                  />
                </button>
              </div>
            </div>
            <button 
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center space-x-2 text-slate-500 hover:text-red-600 font-medium text-sm transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 overflow-auto flex-1 h-[calc(100vh-64px)]">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
