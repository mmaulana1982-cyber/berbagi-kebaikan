import React, { useState } from 'react';
import { 
  MessageSquareHeart, 
  ThumbsUp, 
  Search, 
  Heart, 
  Sparkles, 
  Send 
} from 'lucide-react';
import { DonorPrayer } from '../types';
import { storageService } from '../services/storageService';

interface PrayersPageProps {
  prayers: DonorPrayer[];
  onToggleLikePrayer: (prayerId: string) => void;
  onOpenQuickDonate: () => void;
}

export const PrayersPage: React.FC<PrayersPageProps> = ({
  prayers,
  onToggleLikePrayer,
  onOpenQuickDonate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newDoa, setNewDoa] = useState('');
  const [newName, setNewName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filtered = prayers.filter(p => 
    p.doa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoa.trim()) return;

    const prayerObj: DonorPrayer = {
      id: 'pry-' + Date.now(),
      donationId: 'manual',
      donorName: isAnonymous ? 'Hamba Allah' : (newName.trim() || 'Sahabat Jariyah'),
      campaignTitle: 'Doa Kebaikan Bersama',
      amount: 0,
      doa: newDoa.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false
    };

    storageService.addPrayer(prayerObj);
    setNewDoa('');
    setNewName('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800 text-center max-w-3xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 mx-auto shadow-inner">
          <MessageSquareHeart className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Dinding Doa Sahabat Jariyah
        </h1>
        <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
          Ruang silaturahmi spiritual di mana setiap rupiah sedekah diiringi munajat tulus para donatur. Mari bersama-sama mengaminkan doa kebaikan saudara kita.
        </p>
      </div>

      {/* Grid: Left Write Prayer, Right Prayer Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Tuliskan Doa Baru */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 sticky top-24">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Tulis Doa & Hajat Kebaikan</span>
          </h3>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-xs text-emerald-900">
              <span className="font-bold block">Alhamdulillah! Doa Anda telah diposting.</span>
              <p>Semoga Allah ijabah segala hajat baik yang dipanjatkan.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitPrayer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Anda
                </label>
                <input
                  type="text"
                  placeholder={isAnonymous ? 'Hamba Allah' : 'Nama atau inisial'}
                  value={newName}
                  disabled={isAnonymous}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anon_chk"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="anon_chk" className="text-xs text-stone-600 cursor-pointer">
                  Kirim sebagai Hamba Allah (Anonim)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Untaian Doa / Hajat
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan doa untuk diri sendiri, orang tua, keluarga, atau saudara kita yang membutuhkan..."
                  value={newDoa}
                  onChange={(e) => setNewDoa(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Doa</span>
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-stone-100 text-center">
            <button
              onClick={onOpenQuickDonate}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Heart className="w-3.5 h-3.5 fill-emerald-700" />
              <span>Iringi Doa dengan Sedekah Nyata</span>
            </button>
          </div>
        </div>

        {/* Right Column: Prayer List Feed & Search */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Daftar Doa Donatur ({filtered.length})
            </span>
            <div className="w-full sm:w-64 relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari doa donatur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-3.5">
            {filtered.map((prayer) => (
              <div 
                key={prayer.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {prayer.donorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-stone-900 block">{prayer.donorName}</span>
                      <span className="text-[11px] text-stone-500 block truncate max-w-[240px] sm:max-w-md">
                        {prayer.campaignTitle}
                      </span>
                    </div>
                  </div>

                  {prayer.amount > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                      Rp {prayer.amount.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic bg-stone-50/80 p-3.5 rounded-xl border border-stone-100">
                  "{prayer.doa}"
                </p>

                <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                  <span>{new Date(prayer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>

                  <button
                    onClick={() => onToggleLikePrayer(prayer.id)}
                    className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      prayer.isLiked 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'hover:bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${prayer.isLiked ? 'fill-emerald-800 text-emerald-800' : ''}`} />
                    <span>Aamiinkan Doa Ini ({prayer.likesCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
