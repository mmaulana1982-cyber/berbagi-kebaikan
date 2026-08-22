import React from 'react';
import { 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  MapPin, 
  Mail, 
  Phone, 
  FileText,
  Users,
  Building,
  Award
} from 'lucide-react';
import { AppSettings } from '../types';

interface AboutPageProps {
  settings: AppSettings;
  onOpenQuickDonate: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  settings,
  onOpenQuickDonate
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Hero Header */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-12 border border-emerald-800 text-center max-w-4xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-800 flex items-center justify-center text-amber-300 mx-auto shadow-inner">
          <Heart className="w-8 h-8 fill-amber-300" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Tentang {settings.appName || 'Sahabat Jariyah'}
        </h1>
        <p className="text-xs sm:text-base text-emerald-200 leading-relaxed max-w-2xl mx-auto">
          {settings.appTagline || 'Alirkan Kebaikan, Abadikan Keberkahan Jariyah'}
        </p>
      </div>

      {/* Profile & Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            <Building className="w-3.5 h-3.5" />
            <span>Latar Belakang & Visi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
            Menghubungkan Hati Dermawan dengan Saudara yang Membutuhkan
          </h2>
          <p>
            {settings.aboutText}
          </p>
          <p>
            Kami percaya bahwa sedekah dan wakaf adalah instrumen keadilan sosial dan pemberdayaan umat terbaik. Dengan sistem transparansi digital berbasis bukti foto dan nota kwitansi terbuka, donatur dapat melacak perjalanan setiap butir sedekahnya hingga sampai ke tangan penerima manfaat.
          </p>
        </div>

        <div className="lg:col-span-6 bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-4">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>4 Nilai Pokok Amanah Kami</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">100% Sesuai Kaidah Syariah</strong>
                <span className="text-stone-500 text-xs">Penyaluran diawasi oleh asatidz dan dewan pengawas syariah bersertifikasi.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Transparansi Real-Time</strong>
                <span className="text-stone-500 text-xs">Setiap penyaluran langsung diterbitkan di dasbor publik lengkap dengan invoice dan foto.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Akuntabilitas & Integritas</strong>
                <span className="text-stone-500 text-xs">Seluruh dana dikelola secara profesional, amanah, dan terverifikasi secara terbuka.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-stone-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Integrasi Pembayaran Nasional</strong>
                <span className="text-stone-500 text-xs">Mendukung QRIS, VA seluruh bank nasional, dan dompet digital Indonesia.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rekening Resmi */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-stone-900 text-xl">Rekening Resmi Pengelola Dana</h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Pastikan transfer donasi hanya ditujukan ke rekening atas nama yayasan resmi berikut:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {settings.bankAccounts?.map((acc) => (
            <div key={acc.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <span className="font-bold text-stone-800 text-xs block truncate">{acc.bank}</span>
              <span className="font-mono text-base font-extrabold text-emerald-800 block">{acc.accountNumber}</span>
              <span className="text-[11px] text-stone-500 block truncate">a/n {acc.accountHolder}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alamat & Kontak */}
      <div className="bg-stone-900 text-white p-6 sm:p-10 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <MapPin className="w-4 h-4" />
            <span>Alamat Kantor</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            {settings.contactAddress}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Phone className="w-4 h-4" />
            <span>Telepon & WhatsApp</span>
          </div>
          <p className="text-xs text-stone-300 font-mono">
            {settings.contactPhone}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Mail className="w-4 h-4" />
            <span>Email Layanan Donatur</span>
          </div>
          <p className="text-xs text-stone-300">
            {settings.contactEmail}
          </p>
        </div>
      </div>

    </div>
  );
};
