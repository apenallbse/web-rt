import React, { useState, useMemo } from 'react';
import { dbService } from '../../services/dbService';
import { KartuKeluarga, Warga } from '../../types';
import { Search, ClipboardList, Plus, MapPin, User, Edit2, Trash2, X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

const KKList = () => {
  const [kkList, setKKList] = useState<KartuKeluarga[]>(dbService.getKK());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<Warga | null>(null);
  const [selectedKK, setSelectedKK] = useState<KartuKeluarga | null>(null);
  const [selectedWargaToLink, setSelectedWargaToLink] = useState<Warga | null>(null);
  const [familyStatus, setFamilyStatus] = useState('Anak ke-1');
  const [wargaList, setWargaList] = useState<Warga[]>(dbService.getWarga());
  
  const [formData, setFormData] = useState({
    no_kk: '',
    kepala_keluarga: '',
    alamat: ''
  });

  const filteredKK = useMemo(() => {
    return kkList.filter(kk => 
      kk.no_kk.includes(searchTerm) || 
      kk.kepala_keluarga.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [kkList, searchTerm]);

  const membersOfSelectedKK = useMemo(() => {
    if (!selectedKK) return [];
    return wargaList.filter(w => w.kk_id === selectedKK.id);
  }, [selectedKK, wargaList]);

  const unlinkedWarga = useMemo(() => {
    return wargaList.filter(w => !w.kk_id);
  }, [wargaList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ no_kk: '', kepala_keluarga: '', alamat: '' });
  };

  const handleEdit = (kk: KartuKeluarga, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditId(kk.id);
    setFormData({
      no_kk: kk.no_kk,
      kepala_keluarga: kk.kepala_keluarga,
      alamat: kk.alamat
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    Swal.fire({
      title: 'Hapus Kartu Keluarga?',
      text: "Data KK dan relasi warga mungkin akan terpengaruh!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const updated = dbService.deleteKK(id);
          setKKList(updated);
          Swal.fire({
            title: 'Terhapus!',
            text: 'Data KK berhasil dihapus.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
      }
    });
  };

  const handleShowMembers = (kk: KartuKeluarga) => {
    setSelectedKK(kk);
    setShowMembersModal(true);
  };

  const handleLinkWarga = (wargaId: string, status: string) => {
    if (!selectedKK) return;
    
    try {
      const allWarga = dbService.getWarga();
      const updated = allWarga.map(w => w.id === wargaId ? { ...w, kk_id: selectedKK.id, status_keluarga: status } : w);
      dbService.saveWarga(updated);
      setWargaList(updated);
      Swal.fire({
        title: 'Berhasil!',
        text: 'Anggota keluarga ditambahkan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setShowAddMemberModal(false);
      setSelectedWargaToLink(null);
    } catch (error) {
      Swal.fire('Error', 'Gagal menambahkan anggota.', 'error');
    }
  };

  const handleUnlinkWarga = (wargaId: string) => {
    Swal.fire({
      title: 'Hapus dari KK?',
      text: "Warga ini tidak akan lagi terhubung dengan Kartu Keluarga ini.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const allWarga = dbService.getWarga();
        const updated = allWarga.map(w => w.id === wargaId ? { ...w, kk_id: undefined } : w);
        dbService.saveWarga(updated);
        setWargaList(updated);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.no_kk || !formData.kepala_keluarga) {
      Swal.fire('Perhatian', 'No KK dan Kepala Keluarga wajib diisi', 'info');
      return;
    }

    try {
      const current = dbService.getKK();
      if (editId) {
        const updated = current.map(kk => kk.id === editId ? { ...kk, ...formData } : kk);
        dbService.saveKK(updated);
        setKKList(updated);
        Swal.fire({ title: 'Berhasil!', text: 'Data KK diperbarui.', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        const newKK: KartuKeluarga = {
          id: `kk-${Date.now()}`,
          ...formData
        };
        const updated = [...current, newKK];
        dbService.saveKK(updated);
        setKKList(updated);
        Swal.fire({ title: 'Berhasil!', text: 'Kartu Keluarga ditambahkan.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
      handleCloseModal();
    } catch (error) {
      Swal.fire('Error', 'Gagal memproses data.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari No. KK atau Kepala Keluarga..." 
            className="w-full pl-11 pr-5 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-sky-main/20 outline-none font-medium text-sky-dark"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus size={20} /> Tambah Kartu Keluarga
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKK.map((kk, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={kk.id} 
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative group overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-sky-soft/20 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-sky-soft text-sky-main rounded-2xl"><ClipboardList size={28} /></div>
                <div className="flex gap-1">
                  <button onClick={(e) => handleEdit(kk, e)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={18} /></button>
                  <button onClick={(e) => handleDelete(kk.id, e)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                </div>
             </div>

             <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Nomor Kartu Keluarga</p>
                  <p className="text-xl font-black text-sky-dark tracking-tight">{kk.no_kk}</p>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><User size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight leading-none mb-1">Kepala Keluarga</p>
                    <p className="font-bold text-gray-800">{kk.kepala_keluarga}</p>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><MapPin size={16} /></div>
                  <p className="text-sm font-medium text-gray-500 line-clamp-1">{kk.alamat}</p>
               </div>
             </div>

             <button 
                onClick={() => handleShowMembers(kk)}
                className="mt-8 w-full py-4 bg-slate-50 text-sky-dark font-black rounded-2xl hover:bg-sky-soft transition-colors border border-transparent hover:border-sky-main/10 flex items-center justify-center gap-2"
              >
                Detail Anggota Keluarga
             </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-slate-800">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-10 relative"
            >
              <button onClick={handleCloseModal} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-sky-dark mb-8">
                {editId ? 'Edit Kartu Keluarga' : 'Tambah Kartu Keluarga'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-600">Nomor Kartu Keluarga</label>
                  <input 
                    name="no_kk"
                    value={formData.no_kk}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                    placeholder="16 Digit No. KK" 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-600">Kepala Keluarga</label>
                  <input 
                    name="kepala_keluarga"
                    value={formData.kepala_keluarga}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                    placeholder="Nama Kepala Keluarga" 
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-600">Alamat</label>
                  <textarea 
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" 
                    rows={3} 
                    placeholder="Alamat Lengkap..."
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                    {editId ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showMembersModal && selectedKK && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 text-slate-800">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-gray-100 bg-sky-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white text-sky-main rounded-2xl shadow-sm"><Users size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-sky-dark leading-none">Anggota Keluarga</h3>
                    <p className="text-xs font-bold text-sky-main uppercase tracking-widest mt-1">No. KK: {selectedKK.no_kk}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddMemberModal(true)}
                    className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 px-5"
                  >
                    <Plus size={20} /> <span className="text-xs font-black uppercase">Tambah</span>
                  </button>
                  <button 
                    onClick={() => setShowMembersModal(false)}
                    className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl shadow-sm transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-8 space-y-4">
                {membersOfSelectedKK.length > 0 ? (
                  membersOfSelectedKK.map((m, idx) => (
                    <div key={m.id} className="p-5 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-sky-main shadow-sm border border-gray-100 capitalize">
                          {m.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sky-dark">{m.nama}</p>
                          <div className="flex items-center gap-2">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">NIK: {m.nik}</p>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{m.status_keluarga || 'Anggota'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`hidden sm:block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${m.jenis_kelamin === 'Laki-laki' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                          {m.jenis_kelamin}
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setSelectedMemberForDetails(m); setShowDetailsModal(true); }}
                            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                            title="Detail Lengkap"
                          >
                            <ClipboardList size={18} />
                          </button>
                          <button 
                            onClick={() => handleUnlinkWarga(m.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">Belum ada anggota keluarga terdaftar</p>
                    <p className="text-xs text-gray-300 mt-1 uppercase tracking-widest">Gunakan menu warga untuk menghubungkan ke KK ini</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-gray-100 shrink-0">
                <button 
                  onClick={() => setShowMembersModal(false)}
                  className="w-full py-4 bg-sky-dark text-white font-black rounded-2xl hover:bg-black transition-colors shadow-lg shadow-sky-900/10"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showAddMemberModal && selectedKK && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-6 text-slate-800">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
            >
              <div className="p-8 border-b border-gray-100 bg-blue-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm"><User size={24} /></div>
                  <h3 className="text-xl font-black text-sky-dark">
                    {selectedWargaToLink ? 'Detail Hubungan' : 'Pilih Warga'}
                  </h3>
                </div>
                <button onClick={() => { setShowAddMemberModal(false); setSelectedWargaToLink(null); }} className="p-2 text-gray-400 hover:text-red-500">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8">
                {!selectedWargaToLink ? (
                  <div className="space-y-4">
                    {unlinkedWarga.length > 0 ? (
                      unlinkedWarga.map((w) => (
                        <div key={w.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                          <div>
                            <p className="font-black text-sky-dark">{w.nama}</p>
                            <p className="text-xs font-bold text-gray-400">NIK: {w.nik}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedWargaToLink(w)}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all"
                          >
                            Pilih
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 px-6">
                        <p className="text-gray-400 font-bold">Semua warga sudah terdaftar di KK</p>
                        <p className="text-xs text-gray-300 mt-2 uppercase tracking-widest">Tambahkan warga baru di menu data warga terlebih dahulu</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Menambahkan Anggota</p>
                       <p className="text-lg font-black text-sky-dark">{selectedWargaToLink.nama}</p>
                       <p className="text-sm font-bold text-gray-500">NIK: {selectedWargaToLink.nik}</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Status Hubungan Keluarga</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Kepala Keluarga', 'Istri', 'Papah', 'Mamah', 'Anak ke-1', 'Anak ke-2', 'Anak ke-3', 'Anak ke-4', 'Anak ke-5'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setFamilyStatus(status)}
                            className={`p-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-between border-2 ${familyStatus === status ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-400 border-transparent hover:border-blue-200 hover:text-blue-600'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Atau Custom Status:</label>
                        <input 
                          type="text"
                          className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none font-bold text-sky-dark text-sm transition-all"
                          placeholder="Contoh: Cucu, Menantu..."
                          value={familyStatus}
                          onChange={(e) => setFamilyStatus(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setSelectedWargaToLink(null)}
                        className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => handleLinkWarga(selectedWargaToLink.id, familyStatus)}
                        className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm"
                      >
                        Konfirmasi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
        {showDetailsModal && selectedMemberForDetails && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-6 text-slate-800">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 bg-sky-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white text-sky-main rounded-2xl shadow-sm"><User size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-sky-dark leading-none">Detail Anggota Keluarga</h3>
                    <p className="text-xs font-bold text-sky-main uppercase tracking-widest mt-1">Status: {selectedMemberForDetails.status_keluarga || 'Anggota'}</p>
                  </div>
                </div>
                <button onClick={() => { setShowDetailsModal(false); setSelectedMemberForDetails(null); }} className="p-2 text-gray-400 hover:text-red-500">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Nama Lengkap" value={selectedMemberForDetails.nama} />
                    <DetailItem label="NIK" value={selectedMemberForDetails.nik} />
                    <DetailItem label="Jenis Kelamin" value={selectedMemberForDetails.jenis_kelamin} />
                    <DetailItem label="Email" value={selectedMemberForDetails.email} />
                    <DetailItem label="WhatsApp/Telp" value={selectedMemberForDetails.no_hp} />
                    <DetailItem label="Tempat, Tgl Lahir" value={`${selectedMemberForDetails.tempat_lahir || '-'}, ${selectedMemberForDetails.tanggal_lahir}`} />
                    <DetailItem label="Agama" value={selectedMemberForDetails.agama} />
                    <DetailItem label="Pendidikan" value={selectedMemberForDetails.pendidikan} />
                    <DetailItem label="Jenis Pekerjaan" value={selectedMemberForDetails.jenis_pekerjaan} />
                    <DetailItem label="Status Perkawinan" value={selectedMemberForDetails.status_perkawinan} />
                    <DetailItem label="Kewarganegaraan" value={selectedMemberForDetails.kewarganegaraan} />
                    <DetailItem label="Hubungan Keluarga" value={selectedMemberForDetails.status_keluarga} />
                  </div>

                  <div className="h-px bg-gray-100 my-4"></div>

                  {/* Address Details */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Informasi Alamat Lengkap</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DetailItem label="Nama Jalan" value={selectedMemberForDetails.nama_jalan} />
                      <DetailItem label="No. Rumah" value={selectedMemberForDetails.no_rumah} />
                      <DetailItem label="RT / RW" value={`${selectedMemberForDetails.rt || '-'} / ${selectedMemberForDetails.rw || '-'}`} />
                      <DetailItem label="Kelurahan/Desa" value={selectedMemberForDetails.kelurahan} />
                      <DetailItem label="Kecamatan" value={selectedMemberForDetails.kecamatan} />
                      <DetailItem label="Kota/Kabupaten" value={selectedMemberForDetails.kota} />
                      <DetailItem label="Provinsi" value={selectedMemberForDetails.provinsi} />
                      <DetailItem label="Kode Pos" value={selectedMemberForDetails.kode_pos} />
                      <DetailItem label="Negara" value={selectedMemberForDetails.negara} />
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <DetailItem label="Alamat Ringkas" value={selectedMemberForDetails.alamat} />
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 my-4"></div>

                  {/* Immigration Info */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Dokumen Imigrasi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailItem label="No. Paspor" value={selectedMemberForDetails.no_paspor} />
                      <DetailItem label="No. KITAP" value={selectedMemberForDetails.no_kitap} />
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 my-4"></div>

                  {/* Parents Info */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Orang Tua</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailItem label="Nama Ayah" value={selectedMemberForDetails.nama_ayah} />
                      <DetailItem label="Nama Ibu" value={selectedMemberForDetails.nama_ibu} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end">
                 <button 
                  onClick={() => { setShowDetailsModal(false); setSelectedMemberForDetails(null); }}
                  className="px-8 py-3 bg-white text-sky-dark border border-gray-200 font-black rounded-2xl hover:bg-sky-50 transition-colors"
                 >
                   Tutup
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string, value?: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="font-bold text-sky-dark">{value || '-'}</p>
  </div>
);

export default KKList;
