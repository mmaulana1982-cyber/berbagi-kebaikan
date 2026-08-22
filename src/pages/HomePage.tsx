import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Receipt, 
  ChevronRight, 
  ArrowUpRight, 
  Clock, 
  Coins, 
  CheckCircle2, 
  Share2, 
  MessageSquareHeart, 
  ThumbsUp, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { AppSettings, Campaign, CampaignCategory, Disbursement, DonorPrayer } from '../types';
import { CampaignCard } from '../components/CampaignCard';
import { DisbursementCard } from '../components/DisbursementCard';
import { FaqSection } from '../components/FaqSection';

interface HomePageProps {
  settings: AppSettings;
  campaigns: Campaign[];
  disbursements: Disbursement[];
  prayers: DonorPrayer[];
  onSelectCampaign: (campaign: Campaign) => void;
  onDonateCampaign: (campaign: Campaign) => void;
  onViewAllCampaigns: () => void;
  onViewTransparency: () => void;
  onViewPrayers: () => void;
  onToggleLikePrayer: (prayerId: string) => void;
  onOpenZakatCalc: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  campaigns,
  disbursements,
  prayers,
  onSelectCampaign,
  onDonateCampaign,
  onViewAllCampaigns,
  onViewTransparency,
  onViewPrayers,
  onToggleLikePrayer,
  onOpenZakatCalc
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory>('semua');
  const [spotlightAnimated, setSpotlightAnimated] = useState(false);
  const [spotlightPercentage, setSpotlightPercentage] = useState(0);

  // Urgent Campaign for Spotlight
  const spotlightCampaign = campaigns.find(c => c.status === 'urgent') || campaigns[0];
  const targetSpotlightPct = spotlightCampaign 
    ? Math.min(100, Math.round((spotlightCampaign.collectedAmount / spotlightCampaign.targetAmount) * 100))
    : 0;

  useEffect(() => {
    setSpotlightAnimated(false);
    setSpotlightPercentage(0);

    const timer = setTimeout(() => {
      setSpotlightAnimated(true);
    }, 60);

    const duration = 1000;
    const startTime = performance.now();
    let frameId: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setSpotlightPercentage(Math.round(eased * targetSpotlightPct));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [spotlightCampaign?.id, targetSpotlightPct]);

  // Calculate high-level financial summary
  const totalCollected = campaigns.reduce((acc, c) => acc + c.collectedAmount, 0);
  const totalDisbursed = disbursements.reduce((acc, d) => acc + d.amount, 0);
  const totalDonors = campaigns.reduce((acc, c) => acc + c.donorCount, 0);

  const categories: { id: CampaignCategory; label: string; icon: string }[] = [
    { id: 'semua', label: 'Semua Kebaikan', icon: '✨' },
    { id: 'wakaf', label: 'Wakaf Produktif', icon: '💧' },
    { id: 'sedekah-subuh', label: 'Sedekah Subuh', icon: '🌅' },
    { id: 'yatim-dhuafa', label: 'Yatim & Dhuafa', icon: '🤲' },
    { id: 'masjid', label: 'Renovasi Masjid', icon: '🕌' },
    { id: 'quran', label: 'Wakaf Al-Quran', icon: '📖' },
    { id: 'bencana-alam', label: 'Tanggap Bencana', icon: '🚨' },
    { id: 'kesehatan', label: 'Bantuan Medis', icon: '🩺' }
  ];

  // Filter campaigns
  const filteredCampaigns = selectedCategory === 'semua'
    ? campaigns
    : campaigns.filter(c => c.category === selectedCategory);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white pt-10 pb-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
          <img 
            src={settings.heroBannerUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1600&q=80'} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            
            {/* Syariah Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-700/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Platform Donasi & Wakaf Syariah Terpercaya</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {settings.heroTitle || 'Salurkan Sedekah & Wakaf Terbaik untuk Umat'}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl mx-auto">
              {settings.heroSubtitle || 'Platform donasi terpercaya dengan sistem pembayaran digital instan dan dasbor transparansi penyaluran dana 100% terbuka secara real-time.'}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onViewAllCampaigns}
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-6 py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Heart className="w-4 h-4 fill-emerald-950" />
                <span>Mulai Berdonasi</span>
              </button>
              
              <button
                onClick={onViewTransparency}
                className="bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold px-5 py-3.5 rounded-xl text-sm border border-emerald-600/60 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-300" />
                <span>Lihat Transparansi Penyaluran</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Impact Stats */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-white/95 backdrop-blur-md text-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-medium block">Total Dana Terhimpun</span>
              <span className="text-lg sm:text-2xl font-black text-emerald-800 font-mono">
                Rp {totalCollected.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block">Dari {totalDonors.toLocaleString('id-ID')} Donatur</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-medium block">Total Dana Tersalurkan</span>
              <span className="text-lg sm:text-2xl font-black text-teal-700 font-mono">
                Rp {totalDisbursed.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-teal-600 font-semibold block">{disbursements.length} Penyaluran Terverifikasi</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-medium block">Penerima Manfaat</span>
              <span className="text-lg sm:text-2xl font-black text-stone-800 font-mono">
                4.850+
              </span>
              <span className="text-[11px] text-stone-500 font-medium block">Jiwa di 14 Provinsi</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-medium block">Akuntabilitas & Audit</span>
              <span className="text-lg sm:text-2xl font-black text-amber-600 font-mono">
                100%
              </span>
              <span className="text-[11px] text-amber-700 font-semibold block">Nota & Foto Terbuka</span>
            </div>

          </div>
        </div>
      </section>

      {/* 2. URGENT CAMPAIGN SPOTLIGHT */}
      {spotlightCampaign && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl overflow-hidden shadow-lg border border-emerald-800 text-white p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-inner">
              <img 
                src={spotlightCampaign.imageUrl} 
                alt={spotlightCampaign.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Mendesak Butuh Bantuan</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{spotlightCampaign.location}</span>
                <span>•</span>
                <span>{spotlightCampaign.organizer.name}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black leading-snug">
                {spotlightCampaign.title}
              </h2>

              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed line-clamp-3">
                {spotlightCampaign.shortDesc}
              </p>

              {/* Progress bar with Smooth Transition Animation */}
              <div className="space-y-2 pt-2">
                <div className="w-full bg-emerald-950/80 h-3 rounded-full overflow-hidden border border-emerald-700/60 relative shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-sm"
                    style={{ width: `${spotlightAnimated ? targetSpotlightPct : 0}%` }}
                  >
                    {/* Animated Shimmer Light Wave */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between text-xs font-mono items-center">
                  <span>Terkumpul: <strong className="text-amber-300 font-bold">Rp {spotlightCampaign.collectedAmount.toLocaleString('id-ID')}</strong> <span className="text-amber-400 font-semibold ml-1">({spotlightPercentage}%)</span></span>
                  <span className="text-emerald-200">Target: Rp {spotlightCampaign.targetAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => onDonateCampaign(spotlightCampaign)}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow"
                >
                  <Heart className="w-4 h-4 fill-emerald-950" />
                  <span>Donasi Sekarang</span>
                </button>
                <button
                  onClick={() => onSelectCampaign(spotlightCampaign)}
                  className="bg-emerald-800/80 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-emerald-600 cursor-pointer"
                >
                  Pelajari Selengkapnya
                </button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 3. PROGRAM DONASI & FILTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Program Kebaikan Pilihan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Alirkan Pahala Abadi & Bantu Sesama
            </h2>
          </div>

          <button
            onClick={onViewAllCampaigns}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start md:self-auto cursor-pointer"
          >
            <span>Lihat Semua Program ({campaigns.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.slice(0, 6).map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onSelect={onSelectCampaign}
              onDonate={onDonateCampaign}
            />
          ))}
        </div>
      </section>

      {/* 4. REAL-TIME TRANSPARENCY STREAM (DASBOR PENYALURAN DANA) */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                <Receipt className="w-3.5 h-3.5" />
                <span>Transparansi Real-Time</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                Penyaluran Dana Terkini & Bukti Dokumentasi
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                Setiap rupiah yang Anda amanahkan disalurkan langsung kepada yang berhak, dilengkapi bukti foto serah terima, kuitansi bermeterai, dan berita acara terbuka.
              </p>
            </div>

            <button
              onClick={onViewTransparency}
              className="px-4 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5 shadow-sm self-start md:self-auto cursor-pointer"
            >
              <span>Buka Dasbor Transparansi Penuh</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Disbursement Cards Feed */}
          <div className="space-y-4">
            {disbursements.slice(0, 3).map((disb) => (
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

        </div>
      </section>

      {/* 5. WALL OF PRAYERS (DINDING DOA DONATUR) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <MessageSquareHeart className="w-4 h-4" />
              <span>Dinding Doa & Munajat Sahabat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Untaian Doa yang Mengalir Bersama Kebaikan
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Mari kita aminkan bersama setiap doa dan hajat baik para donatur.
            </p>
          </div>

          <button
            onClick={onViewPrayers}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start md:self-auto cursor-pointer"
          >
            <span>Lihat Semua Doa ({prayers.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Prayer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prayers.slice(0, 6).map((prayer) => (
            <div 
              key={prayer.id} 
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {prayer.donorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 block">{prayer.donorName}</span>
                      <span className="text-[11px] text-stone-400 block">{prayer.campaignTitle}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Rp {prayer.amount.toLocaleString('id-ID')}
                  </span>
                </div>

                <p className="text-xs text-stone-700 italic leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                  "{prayer.doa}"
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>{new Date(prayer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                <button
                  onClick={() => onToggleLikePrayer(prayer.id)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    prayer.isLiked 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${prayer.isLiked ? 'fill-emerald-800 text-emerald-800' : ''}`} />
                  <span>Aamiin ({prayer.likesCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ (PUSAT BANTUAN & FREQUENTLY ASKED QUESTIONS) */}
      <FaqSection settings={settings} />

      {/* 7. TRUST & VALUE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 mx-auto sm:mx-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white">100% Syariah & Terpercaya</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Dikelola di bawah pengawasan dewan syariah resmi dengan asas transparansi penuh dan pelaporan akuntabel real-time.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 mx-auto sm:mx-0 shadow-inner">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white">Pembayaran Digital Instan</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Terintegrasi dengan QRIS nasional, Virtual Account seluruh bank besar Indonesia, GoPay, dan DANA otomatis.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 mx-auto sm:mx-0 shadow-inner">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white">Laporan Penyaluran Berkala</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Donatur mendapatkan laporan penyaluran langsung via WhatsApp & Email dengan foto dokumentasi serah terima di lapangan.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
