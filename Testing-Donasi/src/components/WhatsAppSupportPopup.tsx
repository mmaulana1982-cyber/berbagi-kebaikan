import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  CheckCheck, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  Receipt,
  Calculator,
  HeartHandshake
} from 'lucide-react';
import { AppSettings } from '../types';

interface WhatsAppSupportPopupProps {
  settings: AppSettings;
}

export const WhatsAppSupportPopup: React.FC<WhatsAppSupportPopupProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Clean phone number (convert 08... to 628...)
  const getCleanPhone = (phoneStr: string) => {
    let clean = (phoneStr || '').replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean || '6281234567890';
  };

  const whatsappNumber = getCleanPhone(settings.whatsappNumber || settings.contactPhone || '6281234567890');
  const greeting = settings.whatsappGreeting || 'Assalamu’alaikum Warahmatullahi Wabarakatuh! Ada yang bisa kami bantu seputar program donasi jariyah, konfirmasi pembayaran, atau konsultasi zakat?';

  // Proactive welcome tooltip after 4 seconds
  useEffect(() => {
    if (settings.whatsappPopupEnabled === false) return;

    const timer = setTimeout(() => {
      const hasDismissed = sessionStorage.getItem('sj_wa_bubble_dismissed');
      if (!hasDismissed && !isOpen) {
        setShowWelcomeBubble(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [settings.whatsappPopupEnabled, isOpen]);

  if (settings.whatsappPopupEnabled === false) {
    return null;
  }

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWelcomeBubble(false);
    sessionStorage.setItem('sj_wa_bubble_dismissed', 'true');
  };

  const handleSelectQuickTopic = (topicText: string, defaultMsg: string) => {
    setSelectedTopic(topicText);
    setMessage(defaultMsg);
  };

  const handleSendMessage = () => {
    const finalMsg = message.trim() || greeting;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMsg)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto">
      
      {/* Proactive Welcome Bubble */}
      {showWelcomeBubble && !isOpen && (
        <div 
          onClick={() => {
            setShowWelcomeBubble(false);
            setIsOpen(true);
          }}
          className="mb-3 max-w-[280px] bg-white text-stone-800 p-3.5 rounded-2xl shadow-xl border border-emerald-100 flex items-start gap-3 cursor-pointer hover:shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800">Layanan Donatur</span>
              <button 
                onClick={handleDismissBubble}
                className="text-stone-400 hover:text-stone-600 p-0.5"
                aria-label="Tutup pesan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
              Ada pertanyaan seputar donasi atau konfirmasi transfer? Chat admin kami sekarang.
            </p>
          </div>
        </div>
      )}

      {/* Main WhatsApp Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[330px] sm:w-[360px] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-black text-sm border border-emerald-500 shadow-inner">
                  SJ
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>CS Layanan Donatur</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </h4>
                <span className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Respon Cepat</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Canvas / Message Area */}
          <div className="p-4 bg-stone-50 max-h-[360px] overflow-y-auto space-y-3.5 text-xs">
            
            {/* Admin Message Bubble */}
            <div className="flex items-start gap-2">
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-stone-200 text-stone-800 shadow-sm max-w-[85%] space-y-1.5">
                <p className="leading-relaxed text-stone-800">
                  {greeting}
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                  <span>Admin Sahabat Jariyah</span>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Topik Bantuan Populer:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                
                <button
                  type="button"
                  onClick={() => handleSelectQuickTopic(
                    'Konfirmasi Donasi',
                    'Assalamu’alaikum Admin, saya ingin konfirmasi pembayaran donasi/transfer dengan rincian:\n- No Invoice:\n- Atas Nama:\n- Nominal:\nTerima kasih.'
                  )}
                  className={`p-2 rounded-xl text-left font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                    selectedTopic === 'Konfirmasi Donasi'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">Konfirmasi Transfer / Donasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickTopic(
                    'Konsultasi Zakat',
                    'Assalamu’alaikum Admin, saya ingin berkonsultasi mengenai perhitungan zakat maal / zakat penghasilan & nisab terkini. Mohon bantuannya.'
                  )}
                  className={`p-2 rounded-xl text-left font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                    selectedTopic === 'Konsultasi Zakat'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  <span className="truncate">Konsultasi Zakat & Nisab</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickTopic(
                    'Jemput Wakaf',
                    'Assalamu’alaikum Admin, apakah tersedia layanan jemput wakaf/donasi tunai atau barang untuk wilayah saya?'
                  )}
                  className={`p-2 rounded-xl text-left font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                    selectedTopic === 'Jemput Wakaf'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">Layanan Jemput Wakaf / Donasi</span>
                </button>

              </div>
            </div>

          </div>

          {/* Input & Send Area */}
          <div className="p-3 bg-white border-t border-stone-200 space-y-2">
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan atau pertanyaan Anda di sini..."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
            />
            
            <button
              onClick={handleSendMessage}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mulai Chat via WhatsApp</span>
            </button>
          </div>

        </div>
      )}

      {/* Floating Circular Trigger Button */}
      <button
        onClick={() => {
          setShowWelcomeBubble(false);
          setIsOpen(!isOpen);
        }}
        className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative group"
        aria-label="Buka Chat WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-7 h-7 fill-white/20 stroke-[2.2]" />
        )}

        {/* Pulse effect when closed */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white" />
          </span>
        )}
      </button>

    </div>
  );
};
