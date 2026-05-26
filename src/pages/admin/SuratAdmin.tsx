import React, { useState } from 'react';
import { dbService } from '../../services/dbService';
import { Surat, Warga } from '../../types';
import { Check, X, Clock, FileText, Printer, Search, Trash2, Plus, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

const SuratAdmin = () => {
  const [surats, setSurats] = useState<Surat[]>(dbService.getSurat());
  const [wargas] = useState<Warga[]>(dbService.getWarga());
  const [rtProfile] = useState(dbService.getRTProfile());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    warga_id: '',
    no_surat: '',
    jenis_surat: 'Surat Pengantar Domisili',
    keterangan: '',
    status: 'pending' as 'pending' | 'disetujui' | 'ditolak'
  });

  const getWargaName = (id: string) => wargas.find(w => w.id === id)?.nama || 'Unknown';

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({
      warga_id: '',
      no_surat: '',
      jenis_surat: 'Surat Pengantar Domisili',
      keterangan: '',
      status: 'pending'
    });
  };

  const handleEdit = (s: Surat) => {
    setEditId(s.id);
    setFormData({
      warga_id: s.warga_id,
      no_surat: s.no_surat || '',
      jenis_surat: s.jenis_surat,
      keterangan: s.keterangan,
      status: s.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warga_id || !formData.keterangan) {
      Swal.fire('Info', 'Warga dan Keterangan wajib diisi', 'info');
      return;
    }

    try {
      const current = dbService.getSurat();
      if (editId) {
        const updated = current.map(s => s.id === editId ? { ...s, ...formData } : s);
        dbService.saveSurat(updated);
        setSurats(updated);
        Swal.fire({ title: 'Berhasil!', text: 'Data pengajuan diperbarui.', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        const newSurat: Surat = {
          id: `s-${Date.now()}`,
          ...formData,
          tanggal_pengajuan: new Date().toISOString().split('T')[0]
        };
        const updated = [...current, newSurat];
        dbService.saveSurat(updated);
        setSurats(updated);
        Swal.fire({ title: 'Berhasil!', text: 'Pengajuan surat baru ditambahkan.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
      handleCloseModal();
    } catch (error) {
      Swal.fire('Error', 'Gagal memproses data.', 'error');
    }
  };

  const updateStatus = (id: string, status: 'disetujui' | 'ditolak') => {
    Swal.fire({
      title: 'Update Status Surat?',
      text: `Apakah Anda yakin ingin mengubah status surat menjadi ${status}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Update',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = surats.map(s => s.id === id ? { ...s, status } : s);
        setSurats(updated);
        dbService.saveSurat(updated);
        Swal.fire('Berhasil!', `Status surat telah diperbarui menjadi ${status}.`, 'success');
      }
    });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus Pengajuan?',
      text: "Data pengajuan surat akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const updated = dbService.deleteSurat(id);
          setSurats(updated);
          Swal.fire('Terhapus!', 'Pengajuan surat berhasil dihapus.', 'success');
        } catch (error) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
        }
      }
    });
  };

  const filteredSurat = surats.filter(s => 
    getWargaName(s.warga_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.jenis_surat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedForPrint, setSelectedForPrint] = useState<Surat | null>(null);

  const handlePrint = (s: Surat) => {
    setSelectedForPrint(s);
  };

  const triggerPrint = async () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari pengajuan surat..." 
              className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-main/20 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
               onClick={() => setShowModal(true)}
               className="flex-1 md:flex-none px-6 py-4 bg-sky-main text-white font-black rounded-2xl shadow-lg shadow-sky-main/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
             >
               <Plus size={20} /> Tambah Pengajuan
             </button>
             <div className="flex flex-col items-end px-4 border-l border-gray-100 hidden md:flex">
                <span className="text-xs font-bold text-gray-400 uppercase">Menunggu</span>
                <span className="text-xl font-black text-amber-500">{surats.filter(s => s.status === 'pending').length}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[...filteredSurat].reverse().map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={s.id} 
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8 items-start md:items-center"
            >
              <div className={`p-6 rounded-3xl ${
                s.status === 'disetujui' ? 'bg-emerald-50 text-emerald-600' : 
                s.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
              }`}>
                <FileText size={36} />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <h4 className="text-xl font-black text-sky-dark">{s.jenis_surat}</h4>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    s.status === 'disetujui' ? 'bg-emerald-100 text-emerald-600' : 
                    s.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-gray-500 font-bold">Pemohon: <span className="text-sky-dark font-black">{getWargaName(s.warga_id)}</span></p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg"><Clock size={14} /> {s.tanggal_pengajuan}</span>
                    {s.no_surat && <span className="bg-sky-50 text-sky-600 px-3 py-1.5 rounded-lg">No: {s.no_surat}</span>}
                    <span className="bg-gray-50 px-3 py-1.5 rounded-lg truncate max-w-xs">{s.keterangan}</span>
                  </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 relative z-50">
                 <button 
                    onClick={() => handleEdit(s)}
                    className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"
                    title="Edit Data"
                  >
                    <Edit2 size={20} />
                 </button>
                 <button 
                    onClick={() => handleDelete(s.id)}
                    className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={20} />
                 </button>
                 <div className="w-[1px] h-10 bg-gray-100 mx-2 hidden md:block"></div>
                {s.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => updateStatus(s.id, 'ditolak')}
                      className="p-4 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-colors lg:px-6 flex items-center gap-2"
                      title="Tolak"
                    >
                      <X size={20} /> <span className="hidden lg:inline font-bold">Tolak</span>
                    </button>
                    <button 
                      onClick={() => updateStatus(s.id, 'disetujui')}
                      className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors lg:px-8 flex items-center gap-2 shadow-lg shadow-emerald-100"
                      title="Setujui"
                    >
                      <Check size={20} /> <span className="hidden lg:inline font-bold">Setujui</span>
                    </button>
                  </>
                ) : s.status === 'disetujui' && (
                  <button 
                    type="button"
                    className="flex items-center gap-2 px-6 py-3 bg-sky-main text-white font-bold text-sm rounded-xl shadow-lg hover:bg-sky-dark transition-all relative z-50 cursor-pointer"
                    onClick={() => handlePrint(s)}
                  >
                    <Printer size={18} /> Cetak Surat
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-slate-900 no-print">
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative"
           >
              <button 
                onClick={handleCloseModal}
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black text-sky-dark mb-10 flex items-center gap-3">
                <FileText className="text-sky-main" size={32} />
                {editId ? 'Edit Pengajuan' : 'Tambah Pengajuan'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Pilih Warga</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                    value={formData.warga_id}
                    onChange={(e) => setFormData({...formData, warga_id: e.target.value})}
                    required
                  >
                    <option value="">-- Pilih Warga --</option>
                    {wargas.map(w => (
                      <option key={w.id} value={w.id}>{w.nama} - {w.nik}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Nomor Surat</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                    placeholder="Contoh: 001/RT003/2026"
                    value={formData.no_surat}
                    onChange={(e) => setFormData({...formData, no_surat: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Jenis Surat</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                    value={formData.jenis_surat}
                    onChange={(e) => setFormData({...formData, jenis_surat: e.target.value})}
                  >
                    <option>Surat Pengantar Domisili</option>
                    <option>Surat Keterangan Usaha</option>
                    <option>Surat Keterangan Tidak Mampu</option>
                    <option>Surat Pengantar Nikah</option>
                    <option>Surat Kematian / Kelahiran</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Keterangan / Keperluan</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                    rows={4}
                    placeholder="Contoh: Mengurus KPR Bank"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                    required
                  ></textarea>
                </div>

                {editId && (
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Status</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-bold text-sky-dark"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="pending">Menunggu (Pending)</option>
                      <option value="disetujui">Disetujui</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-5 bg-sky-main text-white font-black rounded-2xl shadow-xl shadow-sky-main/20 hover:bg-sky-dark transition-all uppercase tracking-widest text-xs"
                  >
                    {editId ? 'Simpan Perubahan' : 'Tambah Pengajuan'}
                  </button>
                </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* Printable Area & Preview Overlay */}
      {selectedForPrint && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[9999] p-4 md:p-10 flex flex-col items-center overflow-auto animate-in fade-in duration-300">
          <div className="w-full max-w-4xl flex justify-between items-center mb-6 no-print bg-white p-5 rounded-[2rem] shadow-xl border border-gray-100 sticky top-0 z-[10000]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                <Printer size={24} />
              </div>
              <div>
                <h3 className="font-black text-sky-dark text-lg leading-none">Pratinjau Cetak Admin</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Sistem Siap Cetak
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedForPrint(null)}
                className="px-8 py-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold text-sm cursor-pointer border border-gray-200"
              >
                Kembali
              </button>
              <button 
                onClick={triggerPrint}
                className="px-10 py-3 bg-sky-main text-white rounded-2xl hover:bg-sky-dark transition-all font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-900/20 cursor-pointer"
              >
                <Printer size={20} /> CETAK DOKUMEN
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center pb-24">
            {(() => {
              const targetWarga = wargas.find(w => w.id === selectedForPrint.warga_id);
              return (
                <div id="print-area-admin" className="bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-200 p-12 md:p-16 w-full max-w-[21cm] min-h-[29.7cm] text-black font-serif text-sm leading-relaxed">
            {/* Header / Kop Surat */}
            <div className="flex border-b-4 border-double border-black pb-4 mb-2">
              <div className="flex-1 text-center pr-12 space-y-0.5">
                <h1 className="text-xl font-bold uppercase tracking-wider">
                  RUKUN TETANGGA {rtProfile.no_rt || "....."} / RUKUN WARGA {rtProfile.rw || "...."}
                </h1>
                <h2 className="text-lg font-bold uppercase tracking-wider">
                  KELURAHAN {rtProfile.kelurahan || "......................."}
                </h2>
                <h3 className="text-md font-bold uppercase tracking-wider">
                  KECAMATAN {rtProfile.kecamatan || "......................."} 
                  {rtProfile.kota ? ` - KOTA ${rtProfile.kota.toUpperCase()}` : " - ......................................."}
                </h3>
                <p className="text-xs font-normal mt-2 leading-relaxed">
                  Sekretariat: {rtProfile.alamat || "..................."} <br />
                  Telp: {rtProfile.telepon || "..................."} | Email: {rtProfile.email || "..................."} | Kode Pos: {rtProfile.kode_pos || "......"}
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center pt-8 font-bold space-y-1">
              <h3 className="text-base underline uppercase">SURAT PENGANTAR</h3>
              <p className="text-sm">
                NOMOR: {selectedForPrint.no_surat || "......................................."}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4 pt-8 text-sm">
              <p className="ml-10">Yang bertanda tangan di bawah ini, menerangkan bahwa:</p>
              
              <div className="grid grid-cols-[180px_10px_1fr] gap-y-3.5 ml-4 mt-6">
                <span>Nama</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5 font-bold uppercase">{getWargaName(selectedForPrint.warga_id) || "..................................................."}</span>

                <span>Tempat/Tgl. Lahir</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5">
                  {targetWarga?.tempat_lahir || "........................."} / {targetWarga?.tanggal_lahir ? new Date(targetWarga.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "........................."}
                </span>

                <span>Jenis Kelamin</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5">{targetWarga?.jenis_kelamin || "Laki-laki/Perempuan"}</span>

                <span>Agama</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5">{targetWarga?.religion || targetWarga?.agama || "..................................................."}</span>

                <span>Pekerjaan</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5">{targetWarga?.jenis_pekerjaan || "..................................................."}</span>

                <span>Nomor KTP</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5 font-mono tracking-wider">{targetWarga?.nik || "..................................................."}</span>

                <span>Alamat</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5">{targetWarga?.alamat || "..................................................."}</span>

                <span>Keperluan</span>
                <span>:</span>
                <span className="border-b-[1.5px] border-dotted border-black/50 pb-0.5">{selectedForPrint.keterangan || "..................................................."}</span>
              </div>

              <p className="pt-8 text-justify">
                Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan yang berkepentingan untuk menjadi maklum.
              </p>
            </div>

            {/* Dual Signatures */}
            <div className="pt-12 text-sm">
              <div className="mb-6">
                <p>Nomor : ............................</p>
                <p>Tanggal : ............................</p>
              </div>

              <div className="grid grid-cols-2 gap-8 text-center mt-2">
                {/* Left Column: Ketua RW */}
                <div className="flex flex-col justify-between h-36">
                  <div>
                    <p>KETUA RW {rtProfile.rw || "......"}</p>
                    <p>KELURAHAN {rtProfile.kelurahan?.toUpperCase() || "......................."}</p>
                  </div>
                  <div>
                    <p className="border-b border-dotted border-black/50 pb-1 mb-1 text-transparent">.</p>
                  </div>
                </div>

                {/* Right Column: Ketua RT */}
                <div className="flex flex-col justify-between h-36">
                  <div>
                    <p>KETUA RT {rtProfile.no_rt || "...."} / {rtProfile.rw || "......."}</p>
                    <p>KELURAHAN {rtProfile.kelurahan?.toUpperCase() || "......................."}</p>
                  </div>
                  <div>
                    <p className="border-b border-dotted border-black/50 pb-1 mb-1 font-bold uppercase">{rtProfile.nama_ketua || ".........................................................."}</p>
                  </div>
                </div>
              </div>
            </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratAdmin;
