import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  BarChart3, 
  Sparkles, 
  Calculator, 
  Info, 
  Menu, 
  X, 
  Lock,
  Layers,
  Search,
  Smartphone,
  Download
} from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  settings: AppSettings;
  activePage: string;
  setActivePage: (page: string) => void;
  onOpenQuickDonate: () => void;
  onOpenZakatCalc: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activePage,
  setActivePage,
  onOpenQuickDonate,
  onOpenZakatCalc,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Beranda' },
    { id: 'campaigns', label: 'Program Donasi' },
    { id: 'transparency', label: 'Transparansi Dana' },
    { id: 'prayers', label: 'Dinding Doa' },
    { id: 'about', label: 'Tentang Kami' }
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${
      scrolled 
        ? 'bg-emerald-950/95 text-white backdrop-blur-md shadow-md border-b border-emerald-800/40' 
        : 'bg-emerald-900 text-white border-b border-emerald-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* ZONE 1: BRAND TITLE (Single Line / Clean Logo) */}
          <button 
            onClick={() => { setActivePage('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg py-1 px-1 group cursor-pointer"
          >
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.appName} 
                className="h-10 w-auto max-w-[160px] object-contain rounded-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-sm border border-emerald-300/30">
                <Heart className="w-5 h-5 fill-emerald-100 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap">
                {settings.appName || 'Sahabat Jariyah'}
              </span>
              <span className="text-[11px] text-emerald-200/80 -mt-0.5 font-medium hidden sm:inline whitespace-nowrap truncate max-w-[200px]">
                {settings.appTagline || 'Alirkan Kebaikan Jariyah'}
              </span>
            </div>
          </button>

          {/* ZONE 2: NAV LINKS (Clean Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActivePage(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-emerald-200 shadow-inner'
                      : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Zakat Calc Quick Nav */}
            <button
              onClick={onOpenZakatCalc}
              className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-200 hover:text-white hover:bg-emerald-800/50 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-300" />
              <span>Kalkulator Zakat</span>
            </button>
          </nav>

          {/* ZONE 3: ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary Action: Donasi Sekarang */}
            <button
              onClick={onOpenQuickDonate}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-all flex items-center gap-2 whitespace-nowrap active:scale-98 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-emerald-950" />
              <span>Donasi Sekarang</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 focus:outline-none"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-b border-emerald-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActivePage(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                activePage === link.id
                  ? 'bg-emerald-800 text-emerald-200'
                  : 'text-emerald-100 hover:bg-emerald-900'
              }`}
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => {
              onOpenZakatCalc();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-emerald-200 hover:bg-emerald-900 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>Kalkulator Zakat & Wakaf</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new Event('show-pwa-install'));
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-emerald-300 hover:bg-emerald-900 flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Pasang Aplikasi (PWA)</span>
          </button>

          <div className="pt-2 border-t border-emerald-800">
            <button
              onClick={() => {
                onOpenQuickDonate();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-amber-400 text-emerald-950 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Heart className="w-4 h-4 fill-emerald-950" />
              <span>Donasi Sekarang</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
