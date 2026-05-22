import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { dbService } from '../../services/dbService';

const LaporanAdmin = () => {
  const [stats, setStats] = useState({
    totalWarga: 0,
    totalKK: 0,
    saldoKas: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataIuran, setDataIuran] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const warga = dbService.getWarga();
      const kk = dbService.getKK();
      const transactions = dbService.getTransactions();
      
      const totalMasuk = transactions
        .filter(t => t.type === 'Masuk')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalKeluar = transactions
        .filter(t => t.type === 'Keluar')
        .reduce((sum, t) => sum + t.amount, 0);

      const saldo = totalMasuk - totalKeluar;

      setStats({
        totalWarga: warga.length,
        totalKK: kk.length,
        saldoKas: saldo
      });

      // Calculate trend pemasukan from transactions starting from Mei 2026 onwards
      const monthsList = [
        { name: 'Mei', key: 'mei' },
        { name: 'Juni', key: 'juni' },
        { name: 'Juli', key: 'juli' },
        { name: 'Agustus', key: 'agustus' },
        { name: 'September', key: 'september' },
        { name: 'Oktober', key: 'oktober' },
        { name: 'November', key: 'november' },
        { name: 'Desember', key: 'desember' },
      ];

      const getMonthKey = (dateStr: string) => {
        if (!dateStr) return '';
        const dNode = dateStr.toLowerCase();
        if (dNode.includes('mei') || dNode.includes('may')) return 'mei';
        if (dNode.includes('juni') || dNode.includes('june') || dNode.includes('jun')) return 'juni';
        if (dNode.includes('juli') || dNode.includes('july') || dNode.includes('jul')) return 'juli';
        if (dNode.includes('agustus') || dNode.includes('august') || dNode.includes('agt') || dNode.includes('aug')) return 'agustus';
        if (dNode.includes('september') || dNode.includes('sep')) return 'september';
        if (dNode.includes('oktober') || dNode.includes('october') || dNode.includes('okt') || dNode.includes('oct')) return 'oktober';
        if (dNode.includes('november') || dNode.includes('nov')) return 'november';
        if (dNode.includes('desember') || dNode.includes('december') || dNode.includes('des') || dNode.includes('dec')) return 'desember';
        return '';
      };

      // Sum up Masuk amounts by month key
      const monthlyTotals: { [key: string]: number } = {
        mei: 0,
        juni: 0,
        juli: 0,
        agustus: 0,
        september: 0,
        oktober: 0,
        november: 0,
        desember: 0,
      };

      transactions.forEach(t => {
        if (t.type === 'Masuk') {
          const key = getMonthKey(t.date);
          if (key && monthlyTotals[key] !== undefined) {
            monthlyTotals[key] += t.amount;
          }
        }
      });

      const calculatedData = monthsList.map(m => ({
        name: m.name,
        total: monthlyTotals[m.key]
      }));

      setDataIuran(calculatedData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const formatCurrency = (number: number) => {
    return `Rp ${number.toLocaleString('id-ID')}`;
  };

  const statCards = [
    { 
      label: 'Total Warga', 
      value: stats.totalWarga.toString(), 
      sub: 'Berjalan Lancar', 
      icon: <TrendingUp size={20} />, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total KK', 
      value: stats.totalKK.toString(), 
      sub: 'Berjalan Lancar', 
      icon: <FileText size={20} />, 
      color: 'bg-indigo-500' 
    },
    { 
      label: 'Saldo Kas', 
      value: formatCurrency(stats.saldoKas), 
      sub: 'Kas RT Saat Ini', 
      icon: <TrendingUp size={20} />, 
      color: 'bg-emerald-500' 
    },
  ];

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.text('LAPORAN BULANAN RT 003', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

      // Stats Section
      doc.setFontSize(16);
      doc.text('Ringkasan Statistik', 14, 45);
      
      const statsData = statCards.map(s => [s.label, s.value, s.sub]);
      autoTable(doc, {
        startY: 50,
        head: [['Kategori', 'Jumlah', 'Keterangan']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] as any }
      });

      // Financial Data Section
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(16);
      doc.text('Data Pemasukan Iuran 2026', 14, finalY + 15);
      
      const iuranRows = dataIuran.map(d => [d.name, `Rp ${d.total.toLocaleString()}`]);
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Bulan', 'Total Pemasukan']],
        body: iuranRows,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] as any }
      });

      doc.save('Laporan_RT003_2026.pdf');
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Laporan PDF telah diunduh.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      Swal.fire('Error', 'Gagal membuat laporan PDF', 'error');
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Iuran Sheet
      const iuranWS = XLSX.utils.json_to_sheet(dataIuran.map(d => ({
        'Bulan': d.name,
        'Pemasukan (Rp)': d.total
      })));
      XLSX.utils.book_append_sheet(workbook, iuranWS, "Pemasukan Iuran");

      // Stats Sheet
      const statsWS = XLSX.utils.json_to_sheet(statCards.map(s => ({
        'Label': s.label,
        'Nilai': s.value,
        'Keterangan': s.sub
      })));
      XLSX.utils.book_append_sheet(workbook, statsWS, "Statistik");

      XLSX.writeFile(workbook, "Laporan_RT003_2026.xlsx");
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Laporan Excel telah diunduh.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Excel Export Error:', error);
      Swal.fire('Error', 'Gagal membuat laporan Excel', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 size={48} className="text-sky-main animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Laporan & Statistik</h1>
          <p className="text-slate-500 font-medium font-mono text-xs">Visualisasi data dan ringkasan kinerja RT</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToPDF}
            className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Download size={14} /> PDF
          </button>
          <button 
            onClick={exportToExcel}
            className="px-5 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 cursor-pointer"
          >
            <FileSpreadsheet size={14} /> EXCEL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg shadow-blue-200`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
              <p className="text-[10px] font-bold text-green-600 mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BarChart3 size={18} className="text-sky-main" /> Trend Pemasukan Iuran
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">2026</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataIuran}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '0.25rem' }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" /> Pertumbuhan Warga
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">Semester 1</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataIuran}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '0.25rem' }}
                />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanAdmin;
