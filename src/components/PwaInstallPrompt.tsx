import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  Sparkles,
  Zap,
  Bell,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { AppSettings } from '../types';

interface PwaInstallPromptProps {
  settings: AppSettings;
  activePage?: string;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ settings, activePage = 'home' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  useEffect(() => {
    // Check if running as standalone PWA
    const isAppStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isAppStandalone);
    if (isAppStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Chrome / Edge / Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // On home page, display install popup for 30 seconds
      setShowBanner(true);
      setSecondsRemaining(30);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Custom listener to force open prompt from menu/footer
    const handleCustomOpen = () => {
      setShowBanner(true);
      setShowGuideModal(true);
    };
    window.addEventListener('show-pwa-install', handleCustomOpen);

    // If on home page, trigger popup after 1 second
    const timerInit = setTimeout(() => {
      setShowBanner(true);
      setSecondsRemaining(30);
    }, 1000);

    return () => {
      clearTimeout(timerInit);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('show-pwa-install', handleCustomOpen);
    };
  }, []);

  // 30 Seconds countdown auto-dismiss timer
  useEffect(() => {
    if (!showBanner || showGuideModal) return;

    if (secondsRemaining <= 0) {
      setShowBanner(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowBanner(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showBanner, secondsRemaining, showGuideModal]);

  const handleDismissBanner = () => {
    setShowBanner(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Install Banner with 30s Auto-Dismiss & Countdown */}
      {showBanner && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-stone-900/95 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-emerald-500/30 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Top 30-second progress bar */}
          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsRemaining / 30) * 100}%` }}
            />
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 border border-emerald-400/40 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-950/50">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Aplikasi Resmi</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50">
                    ⏱️ {secondsRemaining}s
                  </span>
                </div>
                <button
                  onClick={handleDismissBanner}
                  className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
                  aria-label="Tutup banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-extrabold text-xs sm:text-sm text-white mt-1.5 leading-snug">
                Pasang Aplikasi {settings.appName || 'Sahabat Jariyah'}
              </h4>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                Akses instan 1-klik di layar HP, hemat kuota, dan pantau penyaluran donasi lebih mudah.
              </p>

              <div className="flex items-center gap-2 mt-3.5">
                <button
                  onClick={handleInstallClick}
                  className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIOS ? 'Cara Install (iOS)' : 'Install Sekarang'}</span>
                </button>

                <button
                  onClick={handleDismissBanner}
                  className="py-2 px-3 bg-stone-800/90 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Tutup ({secondsRemaining}s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Install Guide Modal (For iOS or Manual Install) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col">
            
            {/* Header */}
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-emerald-300 font-medium block">PWA Progressive Web App</span>
                  <h3 className="font-bold text-base text-white">
                    Pasang di Smartphone
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* Feature Perks */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Zap className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-emerald-950 block">Akses 1-Klik</span>
                </div>
                <div className="p-2.5 bg-teal-50 rounded-2xl border border-teal-100">
                  <ShieldCheck className="w-5 h-5 text-teal-700 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-teal-950 block">100% Aman</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100">
                  <Sparkles className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-amber-950 block">Hemat Kuota</span>
                </div>
              </div>

              {/* iOS Step Guide */}
              {isIOS ? (
                <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Panduan Pasang di iPhone / iPad (Safari):
                  </h4>
                  <ol className="space-y-2.5 text-xs text-stone-700">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Buka website ini menggunakan browser <strong>Safari</strong> di perangkat iOS Anda.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span className="flex items-center gap-1 flex-wrap">
                        Tekan tombol <strong>Bagikan / Share</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-600" />) di bilah navigasi bawah Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span className="flex items-center gap-1 flex-wrap">
                        Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama"</strong> (<em>Add to Home Screen</em> <PlusSquare className="w-3.5 h-3.5 inline text-stone-700" />).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        4
                      </span>
                      <span>
                        Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi siap digunakan langsung dari layar utama!
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android / Chrome / Edge Guide */
                <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Panduan Pasang di Android & Laptop:
                  </h4>
                  <ol className="space-y-2.5 text-xs text-stone-700">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Klik tombol <strong>"Pasang Sekarang"</strong> di bawah untuk memicu konfirmasi instalasi otomatis.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Atau tekan menu titik tiga (<strong>⋮</strong>) di browser Google Chrome / Edge Anda, lalu pilih <strong>"Instal Aplikasi Sahabat Jariyah"</strong>.
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isIOS && deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Sekarang</span>
                  </button>
                )}

                <button
                  onClick={() => setShowGuideModal(false)}
                  className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Mengerti
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
