import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  CheckCircle2,
  FileText,
  Smartphone
} from 'lucide-react';
import { AppSettings } from '../types';

interface FooterProps {
  settings: AppSettings;
  setActivePage: (page: string) => void;
  onOpenZakatCalc: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  setActivePage,
  onOpenZakatCalc,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.appName} 
                  className="h-10 w-auto max-w-[160px] object-contain rounded"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
              )}
              <div>
                <span className="font-bold text-lg text-white block">
                  {settings.appName || 'Sahabat Jariyah'}
                </span>
                <span className="text-xs text-stone-400">
                  {settings.appTagline || 'Alirkan Kebaikan Jariyah'}
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed">
              {settings.aboutText?.slice(0, 160)}...
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Transparansi Penyaluran 100% Terbuka Real-Time</span>
            </div>
          </div>

          {/* Col 2: Program Kategori */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Kategori Program
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setActivePage('campaigns')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Wakaf Sumur & Sarana Ibadah
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('campaigns')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Sedekah Subuh Berkelanjutan
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('campaigns')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Santunan Yatim & Penghafal Quran
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('campaigns')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Tebar 1.000 Mushaf Al-Quran
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('campaigns')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Tanggap Darurat & Bencana Alam
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi & Layanan */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Layanan & Transparansi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setActivePage('transparency')}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dasbor Penyaluran Dana</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenZakatCalc}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kalkulator Zakat & Nisab</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('prayers')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Dinding Doa Donatur
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('about')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Legalitas & Dewan Pengawas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActivePage('home');
                    setTimeout(() => {
                      const el = document.getElementById('faq-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Pusat Bantuan & FAQ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new Event('show-pwa-install'))}
                  className="hover:text-emerald-400 text-emerald-300 font-semibold transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pasang Aplikasi (PWA)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Rekening */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Kontak & Alamat
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{settings.contactAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs">{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs">{settings.contactEmail}</span>
              </div>
            </div>

            {/* Bank Accounts Mini Badges */}
            <div className="mt-4 pt-3 border-t border-stone-800">
              <span className="text-[11px] text-stone-500 block mb-2 font-medium">Rekening Resmi Yayasan:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {settings.bankAccounts?.slice(0, 4).map((acc) => (
                  <div key={acc.id} className="bg-stone-800/80 px-2 py-1.5 rounded border border-stone-700/50">
                    <span className="font-semibold text-stone-200 block truncate">{acc.bank.split('(')[0]}</span>
                    <span className="text-emerald-400 font-mono">{acc.accountNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            <button
              onClick={onOpenAdmin}
              className="hover:text-stone-300 transition-colors focus:outline-none cursor-default font-normal p-0 inline bg-transparent border-none text-inherit select-none"
              title=""
            >
              © {new Date().getFullYear()}
            </button>{' '}
            <span>{settings.appName}. Hak Cipta Dilindungi Undang-Undang.</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-medium">Amanah & Transparan</span>
            <span>•</span>
            <button onClick={() => setActivePage('about')} className="hover:underline">Syarat & Ketentuan</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
