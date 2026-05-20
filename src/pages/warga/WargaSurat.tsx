import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { Surat, Warga } from '../../types';
import { Send, FileText, History, CheckCircle, Clock, AlertCircle, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

const WargaSurat = () => {
  const { user } = useAuth();
  const [surats, setSurats] = useState<Surat[]>(dbService.getSurat().filter(s => s.warga_id === user?.wargaId));
  const [wargaData] = useState<Warga | undefined>(dbService.getWarga().find(w => w.id === user?.wargaId));
  const [rtProfile] = useState(dbService.getRTProfile());
  const [jenisSurat, setJenisSurat] = useState('Surat Pengantar Domisili');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedForPrint, setSelectedForPrint] = useState<Surat | null>(null);

  const handlePrint = (s: Surat) => {
    setSelectedForPrint(s);
  };

  const triggerPrint = () => {
    window.focus();
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newSurat: Surat = {
      id: `s-${Date.now()}`,
      warga_id: user?.wargaId || 'warga-1',
      jenis_surat: jenisSurat,
      tanggal_pengajuan: new Date().toISOString().split('T')[0],
      keterangan: keterangan,
      status: 'pending'
    };

    setTimeout(() => {
      try {
        dbService.addSurat(newSurat);
        setSurats([newSurat, ...surats]);
        setKeterangan('');
        setIsSubmitting(false);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Pengajuan surat Anda telah dikirim dan sedang menunggu verifikasi RT.',
          icon: 'success',
          confirmButtonColor: '#0ea5e9'
        });
      } catch (error) {
        setIsSubmitting(false);
        Swal.fire('Gagal!', 'Terjadi kesalahan saat mengirim pengajuan.', 'error');
      }
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start no-print">
        {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 sky-gradient text-white rounded-2xl shadow-lg shadow-sky-main/20"><Send size={24} /></div>
          <div>
            <h2 className="text-2xl font-black text-sky-dark">Ajukan Surat</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest leading-none mt-1">Formulir Pengantar RT</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-sky-dark">Jenis Surat</label>
            <select 
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium"
              value={jenisSurat}
              onChange={(e) => setJenisSurat(e.target.value)}
            >
              <option>Surat Pengantar Domisili</option>
              <option>Surat Keterangan Usaha</option>
              <option>Surat Keterangan Tidak Mampu</option>
              <option>Surat Pengantar Nikah</option>
              <option>Surat Kematian / Kelahiran</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-sky-dark">Keperluan / Keterangan</label>
            <textarea 
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-sky-main focus:bg-white rounded-2xl outline-none transition-all font-medium"
              rows={4}
              placeholder="Jelaskan tujuan pengajuan surat ini..."
              value={keterangan}
              required
              onChange={(e) => setKeterangan(e.target.value)}
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 sky-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-sky-main/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : <><Send size={20} /> Kirim Pengajuan</>}
          </button>
        </form>
      </motion.div>

      {/* History Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col"
      >
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black text-sky-dark flex items-center gap-3">
             <History className="text-gray-400" /> Riwayat
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-4 py-2 rounded-full">Total: {surats.length}</span>
        </div>

        <div className="space-y-6 flex-1 overflow-auto max-h-[600px] pr-2">
          {surats.map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={s.id} 
              className="p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    s.status === 'disetujui' ? 'bg-emerald-100 text-emerald-600' : 
                    s.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {s.status === 'disetujui' ? <CheckCircle size={18} /> : s.status === 'pending' ? <Clock size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-sky-main transition-colors">{s.jenis_surat}</h4>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{s.tanggal_pengajuan}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 relative z-50">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    s.status === 'disetujui' ? 'text-emerald-500' : 
                    s.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {s.status}
                  </span>
                  {s.status === 'disetujui' && (
                    <button 
                      type="button"
                      onClick={() => handlePrint(s)}
                      className="px-4 py-2 bg-sky-main text-white rounded-lg hover:bg-sky-dark font-bold text-xs flex items-center gap-2 cursor-pointer relative z-50 shadow-md"
                      title="Cetak Surat"
                    >
                      <Printer size={14} /> Cetak
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{s.keterangan}"</p>
            </motion.div>
          ))}
          {surats.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 font-bold italic">Belum ada riwayat pengajuan</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>

    {/* Printable Area & Preview Overlay */}
    {selectedForPrint && (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[9999] p-4 md:p-10 flex flex-col items-center overflow-auto animate-in fade-in duration-300">
        <div className="w-full max-w-4xl flex justify-between items-center mb-6 no-print bg-white p-4 rounded-2xl shadow-lg border border-gray-100 sticky top-0 z-[10000]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="font-black text-sky-dark leading-none">Pratinjau Surat</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Siap untuk dicetak</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setSelectedForPrint(null)}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-bold text-sm cursor-pointer"
            >
              Tutup
            </button>
            <button 
              onClick={triggerPrint}
              className="px-8 py-2.5 bg-sky-main text-white rounded-xl hover:bg-sky-dark transition-all font-black text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 cursor-pointer"
            >
              <Printer size={18} /> CETAK SEKARANG
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center pb-20">
          <div className="bg-white shadow-2xl border border-gray-200 p-8 md:p-16 w-full max-w-[21cm] min-h-[29.7cm] text-black">
            {/* Template Surat */}
            <div className="text-center border-b-4 border-black pb-6 space-y-1">
              <h1 className="text-2xl font-black uppercase">Rukun Tetangga {rtProfile.no_rt}</h1>
              <h2 className="text-xl font-bold uppercase">Sekretariat: {rtProfile.alamat}</h2>
              <p className="text-sm font-medium">Telepon: {rtProfile.telepon} | Email: {rtProfile.email} | Kode Pos: {rtProfile.kode_pos}</p>
            </div>
            <div className="text-center pt-8">
              <h3 className="text-xl font-black underline uppercase">{selectedForPrint.jenis_surat}</h3>
              <p className="text-sm font-bold mt-1">Nomor: {selectedForPrint.no_surat || `${selectedForPrint.id.toUpperCase()}/RT${rtProfile.no_rt}/${new Date().getFullYear()}`}</p>
            </div>
            <div className="space-y-6 pt-10 leading-relaxed text-sm">
              <p>Yang bertanda tangan di bawah ini, Pengurus RT {rtProfile.no_rt}, dengan ini menerangkan bahwa:</p>
              <div className="grid grid-cols-[140px_20px_1fr] gap-y-3">
                <span className="font-bold">Nama</span>
                <span>:</span>
                <span className="font-black capitalize">{wargaData?.nama || user?.email.split('@')[0]}</span>
                
                <span className="font-bold">NIK</span>
                <span>:</span>
                <span>{wargaData?.nik || '-'}</span>
                
                <span className="font-bold">Alamat</span>
                <span>:</span>
                <span>{wargaData?.alamat || 'Alamat tidak tersedia'}</span>
                
                <span className="font-bold">Keperluan</span>
                <span>:</span>
                <span className="font-medium italic border-b border-dashed border-gray-300">{selectedForPrint.keterangan}</span>
              </div>
              <p className="pt-4">Demikian surat pengantar ini diberikan untuk dapat dipergunakan sebagaimana mestinya. Atas perhatiannya kami ucapkan terima kasih.</p>
            </div>
            <div className="pt-24 flex justify-end">
              <div className="text-center w-80 space-y-20">
                <div>
                   <p className="font-medium text-sm">{rtProfile.kota.replace('Kota ', '')}, {new Date(selectedForPrint.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   <p className="font-black text-base mt-1">Ketua Rukun Tetangga {rtProfile.no_rt}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-black underline uppercase text-base">{rtProfile.nama_ketua}</p>
                  <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Jabatan: Ketua RT {rtProfile.no_rt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default WargaSurat;
