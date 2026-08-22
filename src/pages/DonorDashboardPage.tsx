import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Heart, 
  Calendar, 
  Receipt, 
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { Donation, Campaign } from '../types';
import { storageService } from '../services/storageService';

interface DonorDashboardPageProps {
  onBack: () => void;
  campaigns: Campaign[];
}

export const DonorDashboardPage: React.FC<DonorDashboardPageProps> = ({
  onBack,
  campaigns
}) => {
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);

  useEffect(() => {
    const savedName = localStorage.getItem('sj_donor_name_v1') || '';
    const savedPhone = localStorage.getItem('sj_donor_phone_v1') || '';
    setDonorName(savedName);
    setDonorPhone(savedPhone);
  }, []);

  const handleSearch = () => {
    if (!donorName.trim() && !donorPhone.trim()) return;
    
    const allDonations = storageService.getDonations();
    const filtered = allDonations.filter(d => {
      const matchName = donorName.trim() ? d.donorName.toLowerCase().includes(donorName.trim().toLowerCase()) : true;
      const matchPhone = donorPhone.trim() ? d.donorPhone.includes(donorPhone.trim()) : true;
      return matchName && matchPhone;
    });
    
    const successful = filtered.filter(d => d.paymentStatus === 'success');
    setDonations(successful);
    setTotalDonated(successful.reduce((sum, d) => sum + d.amount, 0));
    setTotalDonations(successful.length);
    setIsSearched(true);
  };

  const getCampaignTitle = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title || 'Program Tidak Diketahui';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-8 sm:px-10 sm:py-10 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <User className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Dashboard Donatur</h1>
              <p className="text-emerald-200 text-sm mt-0.5">Lacak riwayat donasi Anda</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="p-6 sm:p-10 border-b border-stone-200 bg-stone-50">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Nama Donatur</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Nomor Telepon</label>
                <input
                  type="text"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="Masukkan nomor telepon"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={!donorName.trim() && !donorPhone.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Cari Riwayat Donasi</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {isSearched && (
          <div className="p-6 sm:p-10">
            {donations.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                    <Receipt className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
                    <span className="text-2xl font-black text-emerald-900">{totalDonations}</span>
                    <span className="block text-xs text-emerald-700 font-medium">Transaksi Berhasil</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                    <Heart className="w-6 h-6 text-amber-700 mx-auto mb-2" />
                    <span className="text-2xl font-black text-amber-900">
                      Rp {(totalDonated / 1000).toFixed(0)}K
                    </span>
                    <span className="block text-xs text-amber-700 font-medium">Total Donasi</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-stone-700 mx-auto mb-2" />
                    <span className="text-2xl font-black text-stone-900">
                      Rp {totalDonated > 0 ? (totalDonated / totalDonations).toLocaleString('id-ID') : 0}
                    </span>
                    <span className="block text-xs text-stone-600 font-medium">Rata-rata Donasi</span>
                  </div>
                </div>

                {/* Donation List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-stone-900 text-sm">Detail Donasi</h3>
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {donation.paymentStatus === 'success' ? 'Berhasil' : donation.paymentStatus}
                            </span>
                            <span className="text-[11px] text-stone-400 font-mono">
                              {donation.invoiceCode}
                            </span>
                          </div>
                          <h4 className="font-bold text-stone-900 text-sm truncate">
                            {getCampaignTitle(donation.campaignId)}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(donation.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right sm:text-left">
                          <span className="text-lg font-black text-emerald-800 font-mono">
                            Rp {donation.amount.toLocaleString('id-ID')}
                          </span>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {donation.paymentChannelName}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="font-bold text-stone-900 text-lg mb-1">Tidak Ada Donasi Ditemukan</h3>
                <p className="text-sm text-stone-500">
                  Coba masukkan nama atau nomor telepon yang berbeda.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
