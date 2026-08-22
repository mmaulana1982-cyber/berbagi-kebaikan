import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Receipt, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar, 
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  HeartHandshake
} from 'lucide-react';
import { Campaign, CampaignCategory, Disbursement } from '../types';
import { DisbursementCard } from '../components/DisbursementCard';

interface TransparencyPageProps {
  campaigns: Campaign[];
  disbursements: Disbursement[];
  onSelectCampaign: (campaign: Campaign) => void;
}

export const TransparencyPage: React.FC<TransparencyPageProps> = ({
  campaigns,
  disbursements,
  onSelectCampaign
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory>('semua');

  // Calculations
  const totalCollected = campaigns.reduce((acc, c) => acc + c.collectedAmount, 0);
  const totalDisbursed = disbursements.reduce((acc, d) => acc + d.amount, 0);
  const remainingBalance = Math.max(0, totalCollected - totalDisbursed);
  const disbursementRate = totalCollected > 0 ? Math.min(100, Math.round((totalDisbursed / totalCollected) * 100)) : 0;

  // Category Breakdown
  const categoryTotals: Record<string, number> = {};
  disbursements.forEach((d) => {
    categoryTotals[d.category] = (categoryTotals[d.category] || 0) + d.amount;
  });

  const categories: { id: CampaignCategory; label: string }[] = [
    { id: 'semua', label: 'Semua Kategori' },
    { id: 'wakaf', label: 'Wakaf' },
    { id: 'masjid', label: 'Masjid' },
    { id: 'sedekah-subuh', label: 'Sedekah Subuh' },
    { id: 'bencana-alam', label: 'Bencana Alam' },
    { id: 'yatim-dhuafa', label: 'Yatim Dhuafa' },
    { id: 'quran', label: 'Al-Quran' },
    { id: 'kesehatan', label: 'Kesehatan' }
  ];

  // Filtering
  const filteredDisbursements = disbursements.filter((d) => {
    const matchesCat = selectedCategory === 'semua' || d.category === selectedCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No Resi', 'Tanggal', 'Judul Penyaluran', 'Program', 'Kategori', 'Penerima', 'Lokasi', 'Nominal (Rp)', 'Diverifikasi Oleh'];
    const rows = filteredDisbursements.map(d => [
      `"${d.receiptNumber}"`,
      `"${d.date}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.campaignTitle.replace(/"/g, '""')}"`,
      `"${d.category}"`,
      `"${d.recipient.replace(/"/g, '""')}"`,
      `"${d.location.replace(/"/g, '""')}"`,
      d.amount,
      `"${d.verifiedBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penyaluran_Sahabat_Jariyah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-emerald-900/80 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dasbor Akuntabilitas Publik 100% Real-Time</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Transparansi Penyaluran Dana Umat
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            Seluruh penerimaan donasi dan pengeluaran dana disalurkan secara amanah dengan bukti nota, foto serah terima, dan verifikasi dewan audit syariah.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start md:self-auto py-3 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-600 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
          <span>Unduh Laporan Keuangan (.CSV)</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-xs font-medium text-stone-500 block">Total Dana Terkumpul</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono block">
            Rp {totalCollected.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Masuk ke Rekening Amanah
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-xs font-medium text-stone-500 block">Total Dana Disalurkan</span>
          <span className="text-xl sm:text-2xl font-black text-teal-700 font-mono block">
            Rp {totalDisbursed.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-teal-600 font-medium flex items-center gap-1">
            <HeartHandshake className="w-3 h-3" /> {disbursements.length} Penyaluran Terlaksana
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-xs font-medium text-stone-500 block">Saldo Kas Siap Disalurkan</span>
          <span className="text-xl sm:text-2xl font-black text-stone-800 font-mono block">
            Rp {remainingBalance.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-stone-500 font-medium">
            Siap untuk termin berikutnya
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <span className="text-xs font-medium text-stone-500 block">Tingkat Penyerapan Dana</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono block">
            {disbursementRate}%
          </span>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${disbursementRate}%` }} />
          </div>
        </div>

      </div>

      {/* Program Category Allocation Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-700" />
          <span>Alokasi Penyaluran per Kategori Program</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryTotals).map(([cat, amt]) => {
            const pct = totalDisbursed > 0 ? Math.round((amt / totalDisbursed) * 100) : 0;
            return (
              <div key={cat} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-800 uppercase tracking-wider">{cat}</span>
                  <span className="font-bold text-emerald-700 font-mono">{pct}%</span>
                </div>
                <span className="text-base font-extrabold text-stone-900 font-mono block">
                  Rp {amt.toLocaleString('id-ID')}
                </span>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Live Disbursement Feed */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-stone-900 text-xl">
              Catatan Penyaluran Real-Time ({filteredDisbursements.length})
            </h3>
            <p className="text-xs text-stone-500">
              Menampilkan bukti dokumen dan foto pertanggungjawaban terbuka
            </p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari resi, penerima, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-emerald-600 shadow-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* List of Disbursements */}
        {filteredDisbursements.length > 0 ? (
          <div className="space-y-4">
            {filteredDisbursements.map((disb) => (
              <DisbursementCard
                key={disb.id}
                disbursement={disb}
                onViewCampaign={(cmpId) => {
                  const cmp = campaigns.find(c => c.id === cmpId);
                  if (cmp) onSelectCampaign(cmp);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <Receipt className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800 text-sm">Tidak ada catatan penyaluran ditemukan</h4>
            <p className="text-xs text-stone-500">Coba ubah kata kunci pencarian Anda</p>
          </div>
        )}

      </div>

    </div>
  );
};
