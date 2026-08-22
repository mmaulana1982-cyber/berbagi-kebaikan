import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Send, 
  Download, 
  Globe, 
  Sparkles,
  Heart
} from 'lucide-react';
import { Campaign } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  customTitle?: string;
  customUrl?: string;
  customText?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  campaign,
  customTitle,
  customUrl,
  customText
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  // Build clean, direct URL for social link previews (e.g. ?campaign=c-1 or hash fallback)
  const currentUrl = customUrl || (campaign 
    ? `${window.location.origin}${window.location.pathname}?campaign=${encodeURIComponent(campaign.id)}` 
    : window.location.href);
  const shareTitle = customTitle || (campaign ? campaign.title : 'Sahabat Jariyah - Platform Donasi & Transparansi');
  
  const shareText = customText || (campaign 
    ? `Bismillah, mari bantu program "${campaign.title}" melalui Sahabat Jariyah. Setiap rupiah sedekah & wakaf kita akan menjadi aliran pahala jariyah abadi. Donasi & pantau transparansi penyaluran di sini:`
    : `Mari alirkan kebaikan dan raih berkah jariyah bersama Sahabat Jariyah. Platform donasi transparan dan amanah.`);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${currentUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Social Share Handlers (Open directly with formatted URL for rich preview)
  const shareToWhatsApp = () => {
    // WhatsApp auto-generates rich card previews with Open Graph image & title
    const text = encodeURIComponent(`${shareText}\n\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(currentUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        console.log('Share dismissed or not supported');
      }
    } else {
      handleCopyLink();
    }
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-emerald-300 font-medium block">Sebarkan Kebaikan Jariyah</span>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Bagikan Program
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Campaign Preview Card (if campaign provided) */}
          {campaign && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex gap-3 items-center">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                  {campaign.category}
                </span>
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                  {campaign.title}
                </h4>
              </div>
            </div>
          )}

          {/* Hadith Motivation Quote */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-center">
            <p className="text-xs text-emerald-950 font-medium italic">
              "Barangsiapa yang menunjuki kepada suatu kebaikan, maka dia akan mendapatkan pahala seperti pahala orang yang mengerjakannya."
            </p>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">
              (HR. Muslim No. 1893)
            </span>
          </div>

          {/* Social Share Grid */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              Pilih Media Sosial
            </label>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              
              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl border border-emerald-200 transition-all cursor-pointer group"
                title="Bagikan ke WhatsApp"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 group-hover:scale-105 transition-transform flex items-center justify-center text-white shadow-sm">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={shareToTelegram}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-2xl border border-sky-200 transition-all cursor-pointer group"
                title="Bagikan ke Telegram"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500 group-hover:scale-105 transition-transform flex items-center justify-center text-white shadow-sm">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Telegram</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-2xl border border-blue-200 transition-all cursor-pointer group"
                title="Bagikan ke Facebook"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 group-hover:scale-105 transition-transform flex items-center justify-center text-white shadow-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold">Facebook</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={shareToTwitter}
                className="flex flex-col items-center gap-1.5 p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-2xl border border-stone-300 transition-all cursor-pointer group"
                title="Bagikan ke X / Twitter"
              >
                <div className="w-10 h-10 rounded-full bg-stone-900 group-hover:scale-105 transition-transform flex items-center justify-center text-white shadow-sm font-black text-sm">
                  𝕏
                </div>
                <span className="text-[11px] font-bold">X (Twitter)</span>
              </button>

            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Salin Tautan Donasi
            </label>
            <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="bg-transparent border-none text-xs text-stone-600 px-2 flex-1 focus:outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`py-2 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* QR Code & Native Share Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setShowQr(!showQr)}
              className="flex-1 py-2.5 px-3 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>{showQr ? 'Tutup QR Code' : 'Lihat QR Code'}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={shareNative}
                className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Menu Share HP</span>
              </button>
            )}
          </div>

          {/* QR Code Popup View */}
          {showQr && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-3 animate-in fade-in zoom-in duration-150">
              <div className="inline-block p-3 bg-white rounded-xl border border-stone-200 shadow-sm">
                <img
                  src={qrImageUrl}
                  alt="QR Code Donasi"
                  className="w-40 h-40 mx-auto"
                />
              </div>
              <p className="text-xs text-stone-600">
                Pindai menggunakan kamera HP untuk langsung membuka program donasi ini.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
