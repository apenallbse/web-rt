import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Eye, Loader2, Send, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';

const WargaPengumuman = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const loadData = () => {
      // Only show ACTIVE announcements for warga
      const all = dbService.getPengumuman();
      setAnnouncements(all.filter(a => a.status === 'Aktif'));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleOpenComments = (item: any) => {
    setSelectedItem(item);
    setComments(dbService.getComments(item.id));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedItem) return;

    let authorName = 'Warga';
    let avatarUrl = undefined;

    if (user?.role === 'admin') {
      const adminProfile = dbService.getRTProfile();
      authorName = adminProfile.nama_ketua;
      avatarUrl = adminProfile.avatar_url;
    } else {
      const wargaProfile = dbService.getWarga().find(w => w.id === user?.wargaId);
      if (wargaProfile) {
        authorName = wargaProfile.nama;
        avatarUrl = wargaProfile.avatar_url;
      }
    }

    const comment = {
      id: Date.now(),
      text: newComment,
      authorId: user?.id,
      authorName,
      avatarUrl,
      date: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    dbService.saveComments(selectedItem.id, updatedComments);
    setNewComment('');
  };

  const handleDetails = (item: any) => {
    Swal.fire({
      title: `<span class="font-black tracking-tight text-slate-800">${item.title}</span>`,
      html: `
        <div class="text-left p-2 space-y-4">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-sky-50 text-sky-600 rounded text-[10px] font-bold uppercase tracking-widest leading-none">${item.category}</span>
            <span class="text-[10px] text-slate-400 font-mono font-bold">${item.date}</span>
          </div>
          <div class="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">${item.content}</div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Lihat Komentar',
      confirmButtonColor: '#0ea5e9',
    }).then((result) => {
      if (result.isConfirmed) {
        handleOpenComments(item);
      }
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 rounded-full blur-[80px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative">
          <h1 className="text-4xl font-black text-slate-800 mb-4 italic uppercase tracking-tight">Pusat Informasi Warga</h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">
            Dapatkan berita terbaru, jadwal kegiatan, dan pengumuman resmi dari pengelola RT dengan cepat dan akurat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4 relative min-h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={40} className="text-sky-main animate-spin" />
            </div>
          ) : (
            <AnimatePresence>
              {announcements.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleDetails(item)}
                  className={`group bg-white p-6 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center ${
                    selectedItem?.id === item.id ? 'border-sky-500 ring-2 ring-sky-50 shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01]'
                  }`}
                >
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${
                    item.category === 'Informasi' ? 'bg-blue-50 text-blue-600' : 
                    item.category === 'Kegiatan' ? 'bg-emerald-50 text-emerald-600' :
                    item.category === 'Peringatan' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <Megaphone size={28} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono px-2 py-0.5 bg-slate-50 rounded-lg">
                          {item.date}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          item.category === 'Informasi' ? 'bg-blue-100 text-blue-700' : 
                          item.category === 'Kegiatan' ? 'bg-emerald-100 text-emerald-700' :
                          item.category === 'Peringatan' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                        <MessageCircle size={14} />
                        {dbService.getComments(item.id).length}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{item.title}</h3>
                    <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed">{item.content}</p>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-sky-main group-hover:text-white transition-all">
                        <Eye size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!isLoading && announcements.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                <Megaphone size={40} />
              </div>
              <div>
                <p className="font-black text-slate-400 uppercase tracking-widest">Tidak ada pengumuman aktif</p>
              </div>
            </div>
          )}
        </div>

        {/* Comments Sidebar */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key="sidebar-active"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[600px] sticky top-8"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">Komentar Warga</h4>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest"
                    >Tutup</button>
                  </div>
                  <p className="text-xs font-bold text-slate-400 line-clamp-1 italic">"{selectedItem.title}"</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {comments.length > 0 ? (
                    comments.map((comment, i) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3"
                      >
                        <Avatar 
                          src={comment.avatarUrl} 
                          name={comment.authorName} 
                          size="sm" 
                          className="shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800">{comment.authorName}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{comment.date}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100">
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                      <MessageCircle size={40} className="text-slate-300" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Belum ada komentar<br/>Jadilah yang pertama!</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="p-6 border-t border-slate-100 bg-white">
                  <div className="relative">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis tanggapan Anda..."
                      rows={2}
                      className="w-full pl-5 pr-14 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-500/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all resize-none text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-3 bottom-4 p-3 bg-sky-main text-white rounded-xl shadow-lg shadow-sky-main/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="sidebar-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[600px] border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center p-10 space-y-4"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                  <MessageCircle size={32} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                  Pilih pengumuman<br/>untuk melihat diskusi warga
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WargaPengumuman;
