import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Coins, 
  Briefcase, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';

interface ZakatCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAmountForDonation: (amount: number, note: string) => void;
}

export const ZakatCalculatorModal: React.FC<ZakatCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectAmountForDonation
}) => {
  const [activeTab, setActiveTab] = useState<'penghasilan' | 'maal' | 'fidyah' | 'wakaf'>('penghasilan');

  // State Zakat Penghasilan
  const [gajiBulanan, setGajiBulanan] = useState<string>('12500000');
  const [bonusBulanan, setBonusBulanan] = useState<string>('0');
  const [kebutuhanPokok, setKebutuhanPokok] = useState<string>('0');
  
  // State Zakat Maal
  const [tabungan, setTabungan] = useState<string>('150000000');
  const [asetEmas, setAsetEmas] = useState<string>('0');
  const [asetSaham, setAsetSaham] = useState<string>('0');
  const [hutangJatuhTempo, setHutangJatuhTempo] = useState<string>('0');

  // State Fidyah
  const [hariFidyah, setHariFidyah] = useState<number>(7);
  const TARIF_FIDYAH_PER_HARI = 45000; // Standar BAZNAS makanan matang & bergizi

  // Standar Nisab Emas Terkini (85 Gram Emas @ Rp 1.625.000/gram = Rp 138.125.000 / tahun -> Rp 11.510.416 / bulan)
  const HARGA_EMAS_PER_GRAM = 1625000;
  const NISAB_TAHUNAN = 85 * HARGA_EMAS_PER_GRAM; // Rp 138.125.000
  const NISAB_BULANAN = Math.round(NISAB_TAHUNAN / 12); // ~ Rp 11.510.416

  if (!isOpen) return null;

  const parseNum = (val: string) => parseInt(val.replace(/\D/g, ''), 10) || 0;

  // Hitung Zakat Penghasilan
  const totalPenghasilanBersih = Math.max(0, (parseNum(gajiBulanan) + parseNum(bonusBulanan)) - parseNum(kebutuhanPokok));
  const isPenghasilanWajib = totalPenghasilanBersih >= NISAB_BULANAN;
  const zakatPenghasilanNominal = isPenghasilanWajib ? Math.round(totalPenghasilanBersih * 0.025) : 0;

  // Hitung Zakat Maal
  const totalHartaSimpanan = Math.max(0, (parseNum(tabungan) + parseNum(asetEmas) + parseNum(asetSaham)) - parseNum(hutangJatuhTempo));
  const isMaalWajib = totalHartaSimpanan >= NISAB_TAHUNAN;
  const zakatMaalNominal = isMaalWajib ? Math.round(totalHartaSimpanan * 0.025) : 0;

  // Hitung Fidyah
  const totalFidyah = hariFidyah * TARIF_FIDYAH_PER_HARI;

  const handleSalurkan = (amount: number, typeLabel: string) => {
    if (amount <= 0) return;
    onSelectAmountForDonation(amount, `Tunaikan ${typeLabel}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300 shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Kalkulator Zakat & Wakaf Syariah</h3>
              <p className="text-xs text-emerald-200">Hitung kewajiban zakat berdasarkan nisab emas terkini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 bg-stone-100 p-1.5 border-b border-stone-200 text-xs font-semibold text-stone-600">
          <button
            onClick={() => setActiveTab('penghasilan')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'penghasilan' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-stone-900'
            }`}
          >
            Zakat Profesi
          </button>
          <button
            onClick={() => setActiveTab('maal')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'maal' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-stone-900'
            }`}
          >
            Zakat Maal
          </button>
          <button
            onClick={() => setActiveTab('fidyah')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'fidyah' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-stone-900'
            }`}
          >
            Fidyah Puasa
          </button>
          <button
            onClick={() => setActiveTab('wakaf')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer truncate ${
              activeTab === 'wakaf' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-stone-900'
            }`}
          >
            Wakaf Tunai
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: ZAKAT PENGHASILAN */}
          {activeTab === 'penghasilan' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Nisab Bulanan:</strong> Rp {NISAB_BULANAN.toLocaleString('id-ID')} (setara 85 gram emas / 12 bulan). Jika penghasilan bersih mencapai nisab, kadar zakat adalah <strong>2,5%</strong>.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Gaji / Pendapatan Pokok Bulanan (Rp)
                </label>
                <input
                  type="text"
                  value={Number(parseNum(gajiBulanan)).toLocaleString('id-ID')}
                  onChange={(e) => setGajiBulanan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Tunjangan / Bonus / Pendapatan Lain (Rp)
                </label>
                <input
                  type="text"
                  value={Number(parseNum(bonusBulanan)).toLocaleString('id-ID')}
                  onChange={(e) => setBonusBulanan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Result Card */}
              <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
                <div className="flex justify-between text-xs text-emerald-300">
                  <span>Status Kewajiban:</span>
                  <span className="font-bold">
                    {isPenghasilanWajib ? 'Wajib Zakat (Mencapai Nisab)' : 'Belum Wajib Zakat (Dianjurkan Infaq/Sedekah)'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-800">
                  <span className="text-sm font-semibold">Zakat Profesi Anda:</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300">
                    Rp {zakatPenghasilanNominal.toLocaleString('id-ID')} / bln
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSalurkan(zakatPenghasilanNominal || 100000, 'Zakat Penghasilan / Profesi')}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Heart className="w-4 h-4 fill-emerald-950" />
                <span>Salurkan Zakat Profesi Sekarang</span>
              </button>
            </div>
          )}

          {/* TAB 2: ZAKAT MAAL */}
          {activeTab === 'maal' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Nisab Tahunan:</strong> Rp {NISAB_TAHUNAN.toLocaleString('id-ID')} (senilai 85 gram emas murni dan telah mengendap selama 1 tahun hijriyah/haul). Kadar zakat adalah <strong>2,5%</strong>.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Tabungan / Deposito / Giro (Rp)
                </label>
                <input
                  type="text"
                  value={Number(parseNum(tabungan)).toLocaleString('id-ID')}
                  onChange={(e) => setTabungan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nilai Emas / Logam Mulia / Surat Berharga (Rp)
                </label>
                <input
                  type="text"
                  value={Number(parseNum(asetEmas)).toLocaleString('id-ID')}
                  onChange={(e) => setAsetEmas(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Result Card */}
              <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
                <div className="flex justify-between text-xs text-emerald-300">
                  <span>Status Haul & Nisab:</span>
                  <span className="font-bold">
                    {isMaalWajib ? 'Wajib Zakat Maal' : 'Belum Mencapai Nisab'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-800">
                  <span className="text-sm font-semibold">Total Zakat Maal:</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300">
                    Rp {zakatMaalNominal.toLocaleString('id-ID')} / thn
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSalurkan(zakatMaalNominal || 500000, 'Zakat Maal / Harta')}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Heart className="w-4 h-4 fill-emerald-950" />
                <span>Salurkan Zakat Maal Sekarang</span>
              </button>
            </div>
          )}

          {/* TAB 3: FIDYAH */}
          {activeTab === 'fidyah' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed">
                Fidyah wajib dibayarkan bagi orang yang tidak mampu berpuasa Ramadan karena sakit menahun, usia senja, atau ibu hamil/menyusui dengan kekhawatiran kondisi bayi.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Jumlah Hari Puasa yang Ditinggalkan:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={hariFidyah}
                    onChange={(e) => setHariFidyah(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <span className="w-16 text-center font-bold text-sm bg-stone-100 py-1.5 rounded-lg border border-stone-200">
                    {hariFidyah} Hari
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Standar Makanan Siap Santap:</span>
                  <span className="font-bold text-stone-900">Rp {TARIF_FIDYAH_PER_HARI.toLocaleString('id-ID')} / hari</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
                  <span>Total Tebusan Fidyah:</span>
                  <span className="text-lg font-mono text-emerald-700 font-extrabold">
                    Rp {totalFidyah.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSalurkan(totalFidyah, `Tebusan Fidyah Puasa (${hariFidyah} Hari)`)}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Salurkan Fidyah Pangan Yatim & Dhuafa</span>
              </button>
            </div>
          )}

          {/* TAB 4: WAKAF TUNAI PRODUKTIF */}
          {activeTab === 'wakaf' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                Wakaf Uang / Tunai adalah sedekah jariyah dengan pokok dana yang dikelola untuk manfaat abadi (seperti sumur air, mushaf Al-Quran, dan sarana ibadah).
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Wakaf 1 Mushaf Al-Quran Standar Kemenag', amount: 100000 },
                  { label: 'Wakaf Pipa Saluran Air Bersih 10 Meter', amount: 250000 },
                  { label: 'Wakaf 1 Lembar Sajadah Masjid Tebal', amount: 500000 },
                  { label: 'Wakaf 1 Titik Sumur Gali Air Bersih Desa', amount: 2500000 }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSalurkan(item.amount, item.label)}
                    className="p-3.5 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-500 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-emerald-900 block">
                        {item.label}
                      </span>
                      <span className="text-emerald-700 font-mono font-bold text-xs">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
