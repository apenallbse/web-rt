import React, { useState, useMemo } from 'react';
import { dbService } from '../../services/dbService';
import { Warga } from '../../types';
import { Search, Plus, MoreVertical, Edit2, Trash2, UserPlus, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';
import Avatar from '../../components/Avatar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const WargaList = () => {
  const [warga, setWarga] = useState<Warga[]>(dbService.getWarga());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // State for new warga form
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nik: '',
    no_hp: '',
    jenis_kelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    alamat: '',
    nama_jalan: '',
    no_rumah: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
    negara: 'Indonesia',
    tanggal_lahir: '',
    tempat_lahir: '',
    agama: '',
    pendidikan: '',
    jenis_pekerjaan: '',
    status_perkawinan: '',
    kewarganegaraan: 'WNI',
    no_paspor: '',
    no_kitap: '',
    nama_ayah: '',
    nama_ibu: '',
    kk_id: ''
  });

  const kkList = dbService.getKK();

  const filteredWarga = useMemo(() => {
    return warga.filter(w => 
      w.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.nik.includes(searchTerm)
    );
  }, [warga, searchTerm]);

  const handleDelete = (id: string) => {
    if (!id) return;
    
    Swal.fire({
      title: 'Hapus Data Warga?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#0f172a'
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const updatedWarga = dbService.deleteWarga(id);
          setWarga(updatedWarga);
          
          Swal.fire({
            title: 'Berhasil!',
            text: 'Data warga telah dihapus.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Gagal menghapus warga:', error);
          Swal.fire({
            title: 'Gagal!',
            text: 'Terjadi kesalahan saat menghapus data.',
            icon: 'error'
          });
        }
      }
    });
  };

  const handleEdit = (w: Warga) => {
    setEditId(w.id);
    setFormData({
      nama: w.nama,
      email: w.email || '',
      nik: w.nik,
      no_hp: w.no_hp,
      jenis_kelamin: w.jenis_kelamin,
      alamat: w.alamat,
      nama_jalan: w.nama_jalan || '',
      no_rumah: w.no_rumah || '',
      rt: w.rt || '',
      rw: w.rw || '',
      kelurahan: w.kelurahan || '',
      kecamatan: w.kecamatan || '',
      kota: w.kota || '',
      provinsi: w.provinsi || '',
      kode_pos: w.kode_pos || '',
      negara: w.negara || 'Indonesia',
      tanggal_lahir: w.tanggal_lahir || '',
      tempat_lahir: w.tempat_lahir || '',
      agama: w.agama || '',
      pendidikan: w.pendidikan || '',
      jenis_pekerjaan: w.jenis_pekerjaan || '',
      status_perkawinan: w.status_perkawinan || '',
      kewarganegaraan: w.kewarganegaraan || 'WNI',
      no_paspor: w.no_paspor || '',
      no_kitap: w.no_kitap || '',
      nama_ayah: w.nama_ayah || '',
      nama_ibu: w.nama_ibu || '',
      kk_id: w.kk_id || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.nik) {
      Swal.fire({
        title: 'Perhatian!',
        text: 'Nama dan NIK wajib diisi',
        icon: 'info'
      });
      return;
    }

    try {
      const currentWarga = dbService.getWarga();

      if (editId) {
        const updated = currentWarga.map(w => w.id === editId ? { ...w, ...formData } : w);
        dbService.saveWarga(updated);
        setWarga(updated);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data warga berhasil diperbarui.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const newWarga: Warga = {
          id: `warga-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          ...formData
        };
        const updated = [...currentWarga, newWarga];
        dbService.saveWarga(updated);
        setWarga(updated);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Warga baru telah ditambahkan.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }

      handleCloseModal();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Gagal memproses data.',
        icon: 'error'
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({
      nama: '',
      email: '',
      nik: '',
      no_hp: '',
      jenis_kelamin: 'Laki-laki',
      alamat: '',
      nama_jalan: '',
      no_rumah: '',
      rt: '',
      rw: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      kode_pos: '',
      negara: 'Indonesia',
      tanggal_lahir: '',
      tempat_lahir: '',
      agama: '',
      pendidikan: '',
      jenis_pekerjaan: '',
      status_perkawinan: '',
      kewarganegaraan: 'WNI',
      no_paspor: '',
      no_kitap: '',
      nama_ayah: '',
      nama_ibu: '',
      kk_id: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.text('Laporan Data Warga RT', 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Nama', 'NIK', 'No HP', 'Alamat/Kelurahan']],
      body: filteredWarga.map(w => [
        w.nama,
        w.nik,
        w.no_hp || '-',
        w.kelurahan || '-'
      ]),
    });
    
    doc.save('Data_Warga.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari nama atau NIK warga..."
            className="w-full pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-sm text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all"
          >
            <Printer size={18} /> Cetak PDF
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <UserPlus size={18} /> Tambah Warga
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-500">Nama Warga</th>
                <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-500">Email Login</th>
                <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-500">NIK</th>
                <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-500">No. HP</th>
                <th className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarga.map((w) => (
                <tr 
                  key={w.id} 
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center">
                      <Avatar 
                        src={w.avatar_url} 
                        name={w.nama} 
                        size="sm" 
                        className="mr-3"
                        fallbackColor="bg-blue-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">{w.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">{w.email || '-'}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-slate-600 tracking-tighter">{w.nik}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600 font-medium">{w.no_hp}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(w)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(w.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-slate-900">
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-10 overflow-auto max-h-[90vh]"
           >
              <h2 className="text-2xl font-black text-sky-dark mb-8">
                {editId ? 'Edit Data Warga' : 'Tambah Data Warga'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Nama Lengkap</label>
                    <input 
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Contoh: Andi Wijaya" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Email Login</label>
                    <input 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="warga@example.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">NIK</label>
                    <input 
                      name="nik"
                      value={formData.nik}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="16 Digit NIK" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">No. HP</label>
                    <input 
                      name="no_hp"
                      value={formData.no_hp}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="08xxxxxxxxxx" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Jenis Kelamin</label>
                    <select 
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Tempat Lahir</label>
                    <input 
                      name="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Contoh: Tangerang" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Tanggal Lahir</label>
                    <input 
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir}
                      onChange={handleInputChange}
                      type="date" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Agama</label>
                    <select 
                      name="agama"
                      value={formData.agama}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    >
                      <option value="">Pilih Agama</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Budha">Budha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Pendidikan</label>
                    <input 
                      name="pendidikan"
                      value={formData.pendidikan}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Contoh: SMA / S1" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Jenis Pekerjaan</label>
                    <input 
                      name="jenis_pekerjaan"
                      value={formData.jenis_pekerjaan}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Contoh: Karyawan Swasta" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Status Perkawinan</label>
                    <select 
                      name="status_perkawinan"
                      value={formData.status_perkawinan}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    >
                      <option value="">Pilih Status</option>
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Kewarganegaraan</label>
                    <select 
                      name="kewarganegaraan"
                      value={formData.kewarganegaraan}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    >
                      <option value="WNI">WNI</option>
                      <option value="WNA">WNA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">No. Paspor</label>
                    <input 
                      name="no_paspor"
                      value={formData.no_paspor}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Jika ada" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">No. KITAP</label>
                    <input 
                      name="no_kitap"
                      value={formData.no_kitap}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Jika ada" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Nama Ayah</label>
                    <input 
                      name="nama_ayah"
                      value={formData.nama_ayah}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Nama Ayah Kandung" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Nama Ibu</label>
                    <input 
                      name="nama_ibu"
                      value={formData.nama_ibu}
                      onChange={handleInputChange}
                      type="text" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      placeholder="Nama Ibu Kandung" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-sky-dark">Pilih Kartu Keluarga</label>
                    <select 
                      name="kk_id"
                      value={formData.kk_id}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    >
                      <option value="">Pilih Kartu Keluarga</option>
                      {kkList.map(kk => (
                        <option key={kk.id} value={kk.id}>{kk.no_kk} - {kk.kepala_keluarga}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Komponen Alamat Lengkap</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nama Jalan</label>
                        <input name="nama_jalan" value={formData.nama_jalan} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Jl. Merpati..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No. Rumah</label>
                        <input name="no_rumah" value={formData.no_rumah} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="123A" />
                      </div>
                      <div className="space-y-1 text-center font-bold">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">RT</label>
                        <input name="rt" value={formData.rt} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-center" placeholder="001" />
                      </div>
                      <div className="space-y-1 text-center font-bold">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">RW</label>
                        <input name="rw" value={formData.rw} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-center" placeholder="002" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kode Pos</label>
                        <input name="kode_pos" value={formData.kode_pos} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="15540" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kelurahan/Desa</label>
                        <input name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Sukatani" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kecamatan</label>
                        <input name="kecamatan" value={formData.kecamatan} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Rajeg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kota/Kabupaten</label>
                        <input name="kota" value={formData.kota} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Tangerang" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Provinsi</label>
                        <input name="provinsi" value={formData.provinsi} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Banten" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Negara</label>
                        <input name="negara" value={formData.negara} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Indonesia" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="block text-sm font-bold text-sky-dark">Alamat Lengkap (Ringkasan)</label>
                    <textarea 
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                      rows={3} 
                      placeholder="Alamat lengkap..."
                    ></textarea>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                    {editId ? 'Simpan Perubahan' : 'Tambah Warga'}
                  </button>
                </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default WargaList;
