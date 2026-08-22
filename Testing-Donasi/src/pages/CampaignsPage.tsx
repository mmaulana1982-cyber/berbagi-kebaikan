import React, { useState } from 'react';
import { Search, Filter, Sparkles, Heart } from 'lucide-react';
import { Campaign, CampaignCategory } from '../types';
import { CampaignCard } from '../components/CampaignCard';

interface CampaignsPageProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onDonateCampaign: (campaign: Campaign) => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({
  campaigns,
  onSelectCampaign,
  onDonateCampaign
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory>('semua');
  const [sortBy, setSortBy] = useState<'urgent' | 'popular' | 'newest'>('urgent');

  const categories: { id: CampaignCategory; label: string }[] = [
    { id: 'semua', label: 'Semua Kategori' },
    { id: 'wakaf', label: 'Wakaf Produktif' },
    { id: 'sedekah-subuh', label: 'Sedekah Subuh' },
    { id: 'yatim-dhuafa', label: 'Yatim & Dhuafa' },
    { id: 'masjid', label: 'Renovasi Masjid' },
    { id: 'quran', label: 'Wakaf Al-Quran' },
    { id: 'bencana-alam', label: 'Tanggap Bencana' },
    { id: 'kesehatan', label: 'Bantuan Medis' }
  ];

  // Filtering
  const filtered = campaigns.filter((c) => {
    const matchesCat = selectedCategory === 'semua' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'urgent') {
      if (a.status === 'urgent' && b.status !== 'urgent') return -1;
      if (b.status === 'urgent' && a.status !== 'urgent') return 1;
      return a.daysLeft - b.daysLeft;
    }
    if (sortBy === 'popular') {
      return b.donorCount - a.donorCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Katalog Program Kebaikan
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Pilih Program Sedekah & Wakaf
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200">
            Salurkan donasi Anda langsung ke program yang paling membutuhkan bantuan darurat dan pembangunan sarana umat.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari program donasi, lokasi, atau kebutuhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="urgent">Paling Mendesak</option>
              <option value="popular">Paling Banyak Donatur</option>
              <option value="newest">Program Terbaru</option>
            </select>
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
                className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campaign List Results */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onSelect={onSelectCampaign}
              onDonate={onDonateCampaign}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-800 text-base">Tidak ada program yang cocok</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian lain atau ganti filter kategori ke Semua.
          </p>
        </div>
      )}

    </div>
  );
};
