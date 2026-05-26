import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { syncService } from './services/syncService';

const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSyncing, setIsSyncing] = React.useState(true);

  React.useEffect(() => {
    syncService.initSync().finally(() => {
      setIsSyncing(false);
    });
  }, []);

  if (isSyncing) return <div className="h-screen flex flex-col items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-sky-main border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-gray-500 font-medium">Sinkronisasi Database...</p></div>;
  return <>{children}</>;
};
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import WargaList from './pages/admin/WargaList';
import KKList from './pages/admin/KKList';
import IuranAdmin from './pages/admin/IuranAdmin';
import SuratAdmin from './pages/admin/SuratAdmin';
import AdminProfile from './pages/admin/AdminProfile';
import AgendaAdmin from './pages/admin/AgendaAdmin';
import PengumumanAdmin from './pages/admin/PengumumanAdmin';
import LaporanAdmin from './pages/admin/LaporanAdmin';
import KeuanganAdmin from './pages/admin/KeuanganAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import InventarisAdmin from './pages/admin/InventarisAdmin';
import WargaDashboard from './pages/warga/WargaDashboard';
import WargaProfile from './pages/warga/WargaProfile';
import WargaIuran from './pages/warga/WargaIuran';
import WargaSurat from './pages/warga/WargaSurat';
import WargaPengumuman from './pages/warga/WargaPengumuman';
import WargaAgenda from './pages/warga/WargaAgenda';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/app" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/app" /> : <RegisterPage />} />
      
      <Route path="/app" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={user?.role === 'admin' ? <AdminDashboard /> : <WargaDashboard />} />
        
        {/* Admin Routes */}
        <Route path="warga" element={<ProtectedRoute roles={['admin']}><WargaList /></ProtectedRoute>} />
        <Route path="kk" element={<ProtectedRoute roles={['admin']}><KKList /></ProtectedRoute>} />
        <Route path="iuran" element={<ProtectedRoute roles={['admin']}><IuranAdmin /></ProtectedRoute>} />
        <Route path="surat" element={<ProtectedRoute roles={['admin']}><SuratAdmin /></ProtectedRoute>} />
        <Route path="profil-rt" element={<ProtectedRoute roles={['admin']}><AdminProfile /></ProtectedRoute>} />
        <Route path="agenda" element={<ProtectedRoute roles={['admin']}><AgendaAdmin /></ProtectedRoute>} />
        <Route path="pengumuman" element={<ProtectedRoute roles={['admin']}><PengumumanAdmin /></ProtectedRoute>} />
        <Route path="laporan" element={<ProtectedRoute roles={['admin']}><LaporanAdmin /></ProtectedRoute>} />
        <Route path="keuangan" element={<ProtectedRoute roles={['admin']}><KeuanganAdmin /></ProtectedRoute>} />
        <Route path="inventaris" element={<ProtectedRoute roles={['admin']}><InventarisAdmin /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute roles={['admin']}><SettingsAdmin /></ProtectedRoute>} />
        
        {/* Warga Routes */}
        <Route path="profil" element={<ProtectedRoute roles={['warga']}><WargaProfile /></ProtectedRoute>} />
        <Route path="pengumuman-warga" element={<ProtectedRoute roles={['warga']}><WargaPengumuman /></ProtectedRoute>} />
        <Route path="agenda-warga" element={<ProtectedRoute roles={['warga']}><WargaAgenda /></ProtectedRoute>} />
        <Route path="iuran-saya" element={<ProtectedRoute roles={['warga']}><WargaIuran /></ProtectedRoute>} />
        <Route path="pengajuan-surat" element={<ProtectedRoute roles={['warga']}><WargaSurat /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <SyncProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </SyncProvider>
  );
}
