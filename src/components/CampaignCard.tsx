import React, { useState, useEffect } from 'react';
import { Heart, Users, Clock, MapPin, CheckCircle2, AlertCircle, Share2 } from 'lucide-react';
import { Campaign } from '../types';
import { SocialShareModal } from './SocialShareModal';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onDonate: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onSelect,
  onDonate
}) => {
  const [animated, setAnimated] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const percentage = Math.min(100, Math.round((campaign.collectedAmount / campaign.targetAmount) * 100));

  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [campaign.id, campaign.collectedAmount, campaign.targetAmount]);


  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'wakaf': return 'Wakaf Produktif';
      case 'sedekah-subuh': return 'Sedekah Subuh';
      case 'masjid': return 'Masjid & Mushola';
      case 'yatim-dhuafa': return 'Yatim & Dhuafa';
      case 'quran': return 'Wakaf Quran';
      case 'bencana-alam': return 'Tanggap Bencana';
      case 'kesehatan': return 'Bantuan Medis';
      case 'pendidikan': return 'Pendidikan';
      default: return 'Kebaikan Umum';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col group">
      {/* Thumbnail Container */}
      <div 
        onClick={() => onSelect(campaign)} 
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img 
          src={campaign.imageUrl} 
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-emerald-900/85 backdrop-blur-sm text-emerald-100 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {getCategoryLabel(campaign.category)}
          </span>
          {campaign.status === 'urgent' && (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Mendesak
            </span>
          )}
        </div>

        {/* Location pill */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-300" />
          <span className="truncate max-w-[180px]">{campaign.location}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Organizer */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-medium text-stone-600 truncate">{campaign.organizer.name}</span>
            {campaign.organizer.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(campaign)}
            className="font-bold text-stone-900 text-base leading-snug line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer mb-2"
          >
            {campaign.title}
          </h3>

          {/* Short Desc */}
          <p className="text-stone-500 text-xs line-clamp-2 mb-4 leading-relaxed">
            {campaign.shortDesc}
          </p>
        </div>

        {/* Progress & Stats */}
        <div className="space-y-3 pt-3 border-t border-stone-100">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden relative shadow-inner">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${animated ? percentage : 0}%` }}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-700 font-bold">
                Rp {campaign.collectedAmount.toLocaleString('id-ID')}
              </span>
              <span className="text-stone-500 font-semibold font-mono">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Target & Days Left info */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span><strong>{campaign.donorCount}</strong> donatur</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span><strong>{campaign.daysLeft}</strong> hari lagi</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onSelect(campaign)}
              className="flex-1 py-2 px-3 border border-stone-300 hover:border-emerald-600 hover:text-emerald-700 text-stone-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
            >
              Lihat Rincian
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 border border-stone-200 hover:bg-emerald-50 hover:text-emerald-700 text-stone-500 rounded-xl transition-colors cursor-pointer"
              title="Bagikan Program"
              aria-label="Bagikan Program"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDonate(campaign)}
              className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Donasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Share Modal for this card */}
      <SocialShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        campaign={campaign}
      />
    </div>
  );
};


