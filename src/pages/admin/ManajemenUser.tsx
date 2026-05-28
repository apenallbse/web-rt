import React, { useState, useMemo } from 'react';
import { dbService } from '../../services/dbService';
import { Warga, UserRole } from '../../types';
import { Search, UserCog, KeyRound, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

const ManajemenUser = () => {
  const [wargaList, setWargaList] = useState<Warga[]>(dbService.getWarga());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWarga = useMemo(() => {
    return wargaList.filter(w => 
      w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.nik.includes(searchTerm)
    );
  }, [wargaList, searchTerm]);

  const handleChangeRole = async (user: Warga) => {
    const { value: newRole } = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Ubah Role Pengguna</span>',
      html: `
        <div class="text-left space-y-4">
          <p class="text-sm font-medium text-slate-600">Pilih role baru untuk <b>${user.nama}</b></p>
          <select id="swal-role" class="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold">
            <option value="warga" ${user.role === 'warga' ? 'selected' : ''}>Warga</option>
            <option value="sekretaris" ${user.role === 'sekretaris' ? 'selected' : ''}>Sekretaris</option>
            <option value="bendahara" ${user.role === 'bendahara' ? 'selected' : ''}>Bendahara</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin (Ketua RT)</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0ea5e9',
      preConfirm: () => {
        const role = (document.getElementById('swal-role') as HTMLSelectElement).value as UserRole;
        return role;
      }
    });

    if (newRole && newRole !== user.role) {
      if (newRole === 'admin') {
        const currentAdmin = wargaList.find(w => w.role === 'admin');
        if (currentAdmin) {
          const confirm = await Swal.fire({
            title: 'Peringatan',
            text: `Saat ini ${currentAdmin.nama} adalah Admin. Ubah role mereka menjadi Warga dan jadikan ${user.nama} Admin baru?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Ubah',
            cancelButtonText: 'Batal'
          });
          
          if (!confirm.isConfirmed) return;
        }
      }

      const updatedWargaList = wargaList.map(w => {
        if (w.id === user.id) return { ...w, role: newRole };
        if (newRole === 'admin' && w.role === 'admin') return { ...w, role: 'warga' as UserRole };
        return w;
      });

      dbService.saveWarga(updatedWargaList);
      setWargaList(updatedWargaList);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Role ${user.nama} berhasil diubah menjadi ${newRole}.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleResetPassword = async (user: Warga) => {
    const { value: newPassword } = await Swal.fire({
      title: '<span class="font-black uppercase tracking-tight text-slate-800">Reset Password</span>',
      html: `
        <div class="text-left space-y-4">
          <p class="text-sm font-medium text-slate-600">Masukkan password baru untuk <b>${user.nama}</b></p>
          <input type="text" id="swal-password" class="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold" placeholder="Password Baru" value="123456">
          <p class="text-xs text-slate-400">Default password adalah 123456</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Reset Password',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      preConfirm: () => {
        const pass = (document.getElementById('swal-password') as HTMLInputElement).value;
        if (!pass) {
          Swal.showValidationMessage('Password tidak boleh kosong');
        }
        return pass;
      }
    });

    if (newPassword) {
      const updatedWargaList = wargaList.map(w => w.id === user.id ? { ...w, password: newPassword } : w);
      dbService.saveWarga(updatedWargaList);
      setWargaList(updatedWargaList);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password berhasil direset.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handletoggleStatus = async (user: Warga) => {
    const newStatus = user.status === 'aktif' ? 'non-aktif' : 'aktif';
    const confirm = await Swal.fire({
      title: newStatus === 'aktif' ? 'Aktifkan Akun?' : 'Non-aktifkan Akun?',
      text: newStatus === 'aktif' 
        ? 'User akan dapat login kembali ke sistem.' 
        : 'User tidak akan dapat login ke sistem.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: newStatus === 'aktif' ? '#10b981' : '#f59e0b',
    });

    if (confirm.isConfirmed) {
      const updatedWargaList = wargaList.map(w => w.id === user.id ? { ...w, status: newStatus } : w);
      dbService.saveWarga(updatedWargaList);
      setWargaList(updatedWargaList);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Status akun berhasil diubah menjadi ${newStatus}.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Manajemen User</h1>
          <p className="text-slate-500 font-medium font-mono text-xs">Kelola akses, role, dan keamanan akun pengguna</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Cari nama, email, atau NIK..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition-all font-medium text-slate-700"
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest w-1/3">Pengguna</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredWarga.map((w, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={w.id} 
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-black">
                        {w.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{w.nama}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-400 font-mono">{w.nik}</span>
                          {w.email && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{w.email}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
                      w.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      w.role === 'sekretaris' ? 'bg-blue-100 text-blue-700' :
                      w.role === 'bendahara' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {w.role || 'warga'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                     <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      w.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' :
                      w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {w.status || 'aktif'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleChangeRole(w)}
                        className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 rounded-xl transition-all tooltip"
                        title="Ubah Role"
                      >
                        <UserCog size={16} />
                      </button>
                      <button 
                        onClick={() => handletoggleStatus(w)}
                        className={`p-2 bg-white border border-slate-200 rounded-xl transition-all tooltip ${
                           w.status === 'aktif' ? 'text-slate-600 hover:text-orange-500 hover:border-orange-300' : 'text-emerald-600 hover:border-emerald-300'
                        }`}
                        title={w.status === 'aktif' ? "Non-aktifkan Akun" : "Aktifkan Akun"}
                      >
                         {w.status === 'aktif' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <button 
                        onClick={() => handleResetPassword(w)}
                        className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 rounded-xl transition-all tooltip"
                        title="Reset Password"
                      >
                        <KeyRound size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              
              {filteredWarga.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data pengguna ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManajemenUser;
