import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  Calendar, 
  Receipt, 
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Disbursement } from '../types';

interface DisbursementCardProps {
  disbursement: Disbursement;
  onViewCampaign?: (campaignId: string) => void;
}

export const DisbursementCard: React.FC<DisbursementCardProps> = ({
  disbursement,
  onViewCampaign
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formattedDate = new Date(disbursement.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:border-emerald-300 transition-all">
      {/* Header Bar */}
      <div className="bg-stone-50/80 px-5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-700" />
          <span className="font-mono text-xs font-bold text-stone-700">
            {disbursement.receiptNumber}
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            Terverifikasi Terbuka
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-1 flex-1">
            <h4 className="font-bold text-stone-900 text-base leading-snug">
              {disbursement.title}
            </h4>

            {disbursement.campaignTitle && (
              <p className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                <span>Program:</span>
                <span 
                  onClick={() => onViewCampaign && onViewCampaign(disbursement.campaignId)}
                  className="hover:underline cursor-pointer font-semibold text-emerald-700"
                >
                  {disbursement.campaignTitle}
                </span>
              </p>
            )}
          </div>

          <div className="text-left md:text-right shrink-0 bg-emerald-50 md:bg-transparent p-3 md:p-0 rounded-xl border md:border-none border-emerald-100">
            <span className="text-[11px] text-stone-500 block">Nominal Penyaluran:</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono">
              Rp {disbursement.amount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Beneficiary & Location Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl mb-4 border border-stone-100">
          <div className="flex items-center gap-2 text-stone-700">
            <UserCheck className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="truncate"><strong>Penerima:</strong> {disbursement.recipient}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="truncate"><strong>Lokasi:</strong> {disbursement.location}</span>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
          {disbursement.description}
        </p>

        {/* Photo Proofs Gallery */}
        {disbursement.proofImages && disbursement.proofImages.length > 0 && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dokumentasi Lapangan & Kwitansi:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {disbursement.proofImages.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className="group relative h-24 rounded-xl overflow-hidden bg-stone-100 cursor-pointer border border-stone-200 hover:border-emerald-500"
                >
                  <img 
                    src={imgUrl} 
                    alt={`Bukti penyaluran ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                    Perbesar
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit & Verifier Toggle */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Diverifikasi oleh: <strong className="text-stone-700">{disbursement.verifiedBy}</strong></span>
          {disbursement.auditNotes && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>{isExpanded ? 'Tutup Catatan Audit' : 'Catatan Audit Syariah'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {isExpanded && disbursement.auditNotes && (
          <div className="mt-2.5 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong className="block mb-1 text-amber-950 font-semibold">Catatan Tim Audit & Kepatuhan:</strong>
            {disbursement.auditNotes}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden p-2">
            <img 
              src={selectedImage} 
              alt="Bukti Dokumentasi Besar" 
              className="max-h-[80vh] w-auto mx-auto rounded-lg object-contain"
            />
            <div className="p-3 text-center text-white text-xs">
              <span>Klik di mana saja untuk menutup gambar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
