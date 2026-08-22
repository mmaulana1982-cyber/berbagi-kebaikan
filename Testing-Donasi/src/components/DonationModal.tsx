import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Check, 
  Copy, 
  Clock, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Wallet, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Share2, 
  Download, 
  RefreshCw, 
  Store, 
  Upload, 
  Image as ImageIcon,
  Zap,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppSettings, Campaign, Donation, PaymentChannel } from '../types';
import { PAYMENT_CHANNELS } from '../data/mockData';
import { storageService } from '../services/storageService';
import { compressAndResizePhoto } from '../services/imageOptimizer';
import { SocialShareModal } from './SocialShareModal';

interface DonationModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onDonationComplete?: (donation: Donation) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onDonationComplete
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [doa, setDoa] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  
  // App Settings
  const [appSettings, setAppSettings] = useState<AppSettings>(() => storageService.getSettings());

  // Donor Details
  const [donorName, setDonorName] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  
  // Payment Method
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'qris' | 'va' | 'ewallet' | 'cstore' | 'transfer'>('all');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>(PAYMENT_CHANNELS[0]);
  const [currentDonation, setCurrentDonation] = useState<Donation | null>(null);
  
  // Simulation Timer & States
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null);
  const [isCompressingProof, setIsCompressingProof] = useState<boolean>(false);

  // Preset Amounts
  const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

  useEffect(() => {
    if (isOpen) {
      setAppSettings(storageService.getSettings());
      setStep(1);
      setTimeLeft(900);
      setIsSimulating(false);
      setCurrentDonation(null);
      setUploadedProofUrl(null);
      setSelectedCategory('all');
      setSelectedChannel(PAYMENT_CHANNELS[0]);
    }
  }, [isOpen, campaign]);

  // Countdown timer for step 4
  useEffect(() => {
    let timer: any;
    if (step === 4 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen || !campaign) return null;

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = parseInt(rawVal, 10) || 0;
    setCustomAmount(rawVal ? num.toLocaleString('id-ID') : '');
    setAmount(num);
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Filter payment channels by category
  const filteredChannels = PAYMENT_CHANNELS.filter(ch => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'qris') return ch.type === 'qris';
    if (selectedCategory === 'va') return ch.type === 'va';
    if (selectedCategory === 'ewallet') return ch.type === 'ewallet';
    if (selectedCategory === 'cstore') return ch.type === 'cstore';
    if (selectedCategory === 'transfer') return ch.type === 'transfer';
    return true;
  });

  // Handle Proof Upload (< 700 KB auto-compression)
  const handleProofFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingProof(true);
      const res = await compressAndResizePhoto(file, 1400, 700);
      setUploadedProofUrl(res.dataUrl);
      if (currentDonation) {
        currentDonation.paymentDetails.transferProofUrl = res.dataUrl;
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengompresi foto bukti transfer.');
    } finally {
      setIsCompressingProof(false);
    }
  };

  // Handle Download QRIS Image
  const handleDownloadQris = () => {
    const qrisSrc = appSettings.qrisImageUrl || currentDonation?.paymentDetails?.qrisUrl || appSettings.qrisStaticUrl;
    const link = document.createElement('a');
    link.href = qrisSrc;
    link.download = `QRIS-Donasi-${campaign.slug || 'sahabat-jariyah'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process and Create Donation Transaction
  const handleProceedToPayment = () => {
    const uniqueCode = Math.floor(100 + Math.random() * 900); // 3-digit random unique code
    const totalAmount = amount + (selectedChannel.type === 'transfer' ? uniqueCode : 0);
    const invoiceCode = `INV-SJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const qrisImage = appSettings.qrisImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=00020101021226580014ID.GO.QRIS.WWW01189360099800000000000210000000000000003033605802ID5915SAHABAT_JARIYAH6005DEPOK540${totalAmount}6304`;

    const donationData: Donation = {
      id: 'don-' + Date.now(),
      invoiceCode,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      donorName: isAnonymous ? 'Hamba Allah' : (donorName || 'Sahabat Dermawan'),
      donorEmail: donorEmail || 'donatur@sahabatjariyah.id',
      donorPhone: donorPhone || '08123456789',
      isAnonymous,
      amount,
      uniqueCode,
      totalAmount,
      paymentMethod: selectedChannel.type,
      paymentChannelId: selectedChannel.id,
      paymentChannelName: selectedChannel.name,
      paymentStatus: 'pending',
      doa,
      createdAt: new Date().toISOString(),
      paymentDetails: {
        vaNumber: selectedChannel.accountNumber || '8880-9988-1234-5678',
        qrisUrl: qrisImage,
        bankName: selectedChannel.name,
        accountNumber: selectedChannel.accountNumber || '711-2233-445',
        accountHolder: selectedChannel.accountHolder || 'Yayasan Sahabat Jariyah Indonesia'
      }
    };

    // Save to storage
    const created = storageService.createDonation(donationData);
    setCurrentDonation(created);
    setStep(4);
  };

  // Instant Payment Simulation
  const handleSimulateSuccess = () => {
    if (!currentDonation) return;
    setIsSimulating(true);

    setTimeout(() => {
      storageService.updateDonationStatus(currentDonation.id, 'success');
      currentDonation.paymentStatus = 'success';
      currentDonation.paidAt = new Date().toISOString();
      
      setIsSimulating(false);
      setStep(5);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (onDonationComplete) {
        onDonationComplete(currentDonation);
      }
    }, 1200);
  };

  const activeQrisImage = appSettings.qrisImageUrl || currentDonation?.paymentDetails?.qrisUrl || appSettings.qrisStaticUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
              <Heart className="w-4 h-4 fill-emerald-200" />
            </div>
            <div>
              <span className="text-xs text-emerald-300 font-medium block">
                {step === 5 ? 'Donasi Berhasil' : 'Salurkan Donasi & Wakaf'}
              </span>
              <h3 className="font-bold text-sm sm:text-base line-clamp-1 max-w-[260px] sm:max-w-[340px]">
                {campaign.title}
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

        {/* Step Indicator (Steps 1-3) */}
        {step < 4 && (
          <div className="bg-stone-50 px-6 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500 font-medium">
            <span className={step === 1 ? 'text-emerald-700 font-bold' : ''}>1. Nominal</span>
            <span>→</span>
            <span className={step === 2 ? 'text-emerald-700 font-bold' : ''}>2. Donatur</span>
            <span>→</span>
            <span className={step === 3 ? 'text-emerald-700 font-bold' : ''}>3. Pembayaran</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* STEP 1: NOMINAL & DOA */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                  Pilih Nominal Donasi / Wakaf
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-3">
                  {PRESET_AMOUNTS.map((val) => {
                    const isSelected = amount === val && !customAmount;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectPreset(val)}
                        className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm ring-1 ring-emerald-600'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-stone-50'
                        }`}
                      >
                        Rp {val.toLocaleString('id-ID')}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    placeholder="Nominal lainnya (Min. Rp 10.000)"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Doa / Hajat Khusus */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Tuliskan Doa / Hajat Kebaikan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={doa}
                  onChange={(e) => setDoa(e.target.value)}
                  placeholder="Contoh: Semoga menjadi amal jariyah almarhum orang tua, dilapangkan rezekinya, dan dimudahkan segala urusan..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Doa Anda akan ditampilkan di Dinding Doa Sahabat Jariyah agar diaminkan bersama donatur lainnya.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: DONOR IDENTITY */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Anonymous Toggle */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between cursor-pointer"
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                <div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-950 block">
                    Sembunyikan Nama Saya (Hamba Allah)
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Nama Anda tidak akan ditampilkan di daftar donatur publik
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-emerald-700 rounded focus:ring-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder={isAnonymous ? 'Hamba Allah' : 'Masukkan nama Anda'}
                  value={donorName}
                  disabled={isAnonymous}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nomor WhatsApp (Untuk Bukti & Laporan Penyaluran)
                </label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="email@anda.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD WITH GATEWAY TABS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Pilih Saluran Pembayaran
                </label>
                <span className="text-[11px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                  {appSettings.isPaymentGatewayEnabled !== false ? 'Payment Gateway Aktif' : 'Pembayaran Langsung'}
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'Semua Opsi' },
                  { id: 'qris', label: '⚡ QRIS' },
                  { id: 'va', label: '💳 Virtual Account' },
                  { id: 'ewallet', label: '📱 E-Wallet' },
                  { id: 'cstore', label: '🏪 Retail' },
                  { id: 'transfer', label: '🏦 Transfer Bank' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Payment Channels List */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredChannels.map((channel) => {
                  const isSelected = selectedChannel.id === channel.id;
                  return (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-600 ring-1 ring-emerald-600'
                          : 'bg-white border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 p-1.5 flex items-center justify-center border border-stone-200 shrink-0">
                          {channel.type === 'qris' && <QrCode className="w-6 h-6 text-emerald-700" />}
                          {channel.type === 'va' && <CreditCard className="w-6 h-6 text-indigo-700" />}
                          {channel.type === 'ewallet' && <Wallet className="w-6 h-6 text-teal-700" />}
                          {channel.type === 'cstore' && <Store className="w-6 h-6 text-amber-700" />}
                          {channel.type === 'transfer' && <CreditCard className="w-6 h-6 text-stone-700" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900 text-xs sm:text-sm">
                              {channel.name}
                            </span>
                            {channel.badge && (
                              <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                {channel.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500 block">
                            {channel.type === 'qris' && 'Verifikasi otomatis seketika via scan QRIS resmi'}
                            {channel.type === 'va' && 'Virtual Account otomatis 24 jam'}
                            {channel.type === 'ewallet' && 'Buka aplikasi e-wallet langsung'}
                            {channel.type === 'cstore' && 'Bayar tunai di kasir gerai retail'}
                            {channel.type === 'transfer' && 'Verifikasi kode unik rekening yayasan'}
                          </span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Nominal Donasi:</span>
                  <span className="font-bold text-stone-900">Rp {amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Biaya Administrasi:</span>
                  <span className="text-emerald-700 font-bold">Rp 0 (Gratis)</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                  <span>Total Donasi:</span>
                  <span className="text-emerald-700 font-mono">Rp {amount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT INSTRUCTIONS & DYNAMIC QRIS / VA / UPLOAD PROOF */}
          {step === 4 && currentDonation && (
            <div className="space-y-5">
              {/* Countdown Timer */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Selesaikan pembayaran dalam:</span>
                </div>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {formatMinutes(timeLeft)}
                </span>
              </div>

              {/* QRIS PAYMENT VIEW WITH DOWNLOAD & PREVIEW */}
              {selectedChannel.type === 'qris' && (
                <div className="text-center space-y-3">
                  <div className="inline-block p-4 bg-white rounded-3xl border-2 border-emerald-600 shadow-md max-w-[280px] mx-auto">
                    <div className="text-[11px] font-bold text-emerald-950 mb-1.5 uppercase tracking-wider">
                      {appSettings.qrisMerchantName || 'YAYASAN SAHABAT JARIYAH'}
                    </div>
                    <img
                      src={activeQrisImage}
                      alt="QRIS Donasi Sahabat Jariyah"
                      className="w-48 h-48 mx-auto object-contain rounded-xl border border-stone-200 p-1 bg-white"
                    />
                    <div className="mt-2 text-[11px] font-mono font-bold text-stone-700">
                      NMID: {appSettings.qrisNmid || 'ID1020038849201'}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQris}
                      className="py-2 px-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Gambar QRIS</span>
                    </button>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-xl text-xs text-emerald-900 leading-relaxed max-w-sm mx-auto">
                    Buka <strong>GoPay, OVO, DANA, BCA Mobile, Livin, BRImo, BSI Mobile</strong> atau seluruh aplikasi m-banking / e-wallet di Indonesia, lalu scan atau unggah gambar QRIS dari galeri Anda.
                  </div>
                </div>
              )}

              {/* VIRTUAL ACCOUNT VIEW */}
              {selectedChannel.type === 'va' && (
                <div className="space-y-3">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Nomor Virtual Account ({selectedChannel.name}):</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Payment Gateway Otomatis
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-300">
                      <span className="font-mono font-bold text-base sm:text-lg text-stone-900">
                        {currentDonation.paymentDetails.vaNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(currentDonation.paymentDetails.vaNumber || '', 'va')}
                        className="p-1.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedText === 'va' ? 'Disalin!' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONVENIENCE STORE (INDOMARET / ALFAMART) VIEW */}
              {selectedChannel.type === 'cstore' && (
                <div className="space-y-3">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <span className="text-xs text-stone-500 block">Kode Pembayaran Kasir Retail:</span>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-300">
                      <span className="font-mono font-bold text-base sm:text-lg text-stone-900">
                        {currentDonation.paymentDetails.vaNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(currentDonation.paymentDetails.vaNumber || '', 'cstore')}
                        className="p-1.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedText === 'cstore' ? 'Disalin!' : 'Salin Kode'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Sampaikan kepada kasir {selectedChannel.name} ingin membayar tagihan donasi dengan kode di atas.
                    </p>
                  </div>
                </div>
              )}

              {/* MANUAL BANK TRANSFER VIEW */}
              {selectedChannel.type === 'transfer' && (
                <div className="space-y-3">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div>
                      <span className="text-xs text-stone-500 block">Bank Tujuan:</span>
                      <span className="font-bold text-stone-900 text-sm">{currentDonation.paymentDetails.bankName}</span>
                    </div>

                    <div>
                      <span className="text-xs text-stone-500 block">Nomor Rekening:</span>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-300 mt-1">
                        <span className="font-mono font-bold text-stone-900">
                          {currentDonation.paymentDetails.accountNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(currentDonation.paymentDetails.accountNumber || '', 'rek')}
                          className="px-2 py-1 bg-stone-100 text-stone-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedText === 'rek' ? 'Disalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-stone-500 block">Atas Nama:</span>
                      <span className="font-medium text-stone-800 text-xs">{currentDonation.paymentDetails.accountHolder}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Amount with Unique Code */}
              <div className="p-4 bg-emerald-950 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-300 block">Total Pembayaran:</span>
                  <span className="text-xl font-black font-mono text-emerald-200">
                    Rp {currentDonation.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(currentDonation.totalAmount.toString(), 'nominal')}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'nominal' ? 'Disalin!' : 'Salin Jumlah'}</span>
                </button>
              </div>

              {/* UPLOAD PROOF OF PAYMENT (OPTIONAL FOR DONOR CONVENIENCE) */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    Upload Bukti Pembayaran / Screenshot (Opsional)
                  </span>
                  <span className="text-[10px] text-stone-500">Auto-kompres &lt; 700 KB</span>
                </div>

                {uploadedProofUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <img
                      src={uploadedProofUrl}
                      alt="Bukti Transfer"
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-300"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-emerald-950 block">Bukti Siap Diverifikasi</span>
                      <span className="text-[11px] text-emerald-800">Foto bukti berhasil dilampirkan</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedProofUrl(null)}
                      className="text-xs text-rose-600 hover:underline px-2"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <label className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-dashed border-stone-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    {isCompressingProof ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                        <span>Mengompresi Foto...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pilih Foto Bukti Transfer / QRIS</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleProofFileUpload}
                      disabled={isCompressingProof}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* TEST SIMULATION BUTTON */}
              <div className="p-3.5 bg-stone-100 rounded-2xl border border-dashed border-stone-300 text-center space-y-2">
                <span className="text-[11px] text-stone-500 block">
                  Mode Pengujian / Payment Gateway Verification Sandbox:
                </span>
                <button
                  type="button"
                  onClick={handleSimulateSuccess}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Transaksi Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulasikan Pembayaran Berhasil (Instan)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CELEBRATION & RECEIPT */}
          {step === 5 && currentDonation && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h4 className="font-extrabold text-stone-900 text-lg sm:text-xl mb-1">
                  Jazakallah Khair! Donasi Diterima
                </h4>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                  Terima kasih <strong>{currentDonation.donorName}</strong>, dana wakaf/sedekah Anda sebesar{' '}
                  <strong className="text-emerald-700">Rp {currentDonation.amount.toLocaleString('id-ID')}</strong> telah berhasil masuk ke kas amanah program.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Nomor Kwitansi:</span>
                  <span className="font-mono font-bold text-stone-800">{currentDonation.invoiceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Program:</span>
                  <span className="font-medium text-stone-900 text-right truncate max-w-[200px]">{currentDonation.campaignTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Metode:</span>
                  <span className="font-medium text-stone-900">{currentDonation.paymentChannelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Waktu Transaksi:</span>
                  <span className="font-medium text-stone-900">
                    {new Date(currentDonation.paidAt || currentDonation.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                {currentDonation.paymentDetails?.transferProofUrl && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-500">Lampiran Bukti:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Terlampir
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm">
                  <span className="text-stone-800">Status Pembayaran:</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Lunas Terverifikasi
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan Kebaikan</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Selesai</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls (Steps 1-3) */}
        {step < 4 && (
          <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="py-2.5 px-4 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <button
                type="button"
                disabled={amount < 10000}
                onClick={() => setStep(2)}
                className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <span>Lanjut (Rp {amount.toLocaleString('id-ID')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Instruksi Bayar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>

      {/* Social Sharing Modal on Success */}
      {currentDonation && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          campaign={campaign}
          customTitle={`Donasi untuk ${campaign.title}`}
          customText={`Alhamdulillah, saya baru saja menyalurkan donasi/wakaf sebesar Rp ${currentDonation.amount.toLocaleString('id-ID')} untuk program "${campaign.title}" melalui platform Sahabat Jariyah. Mari alirkan kebaikan bersama!`}
        />
      )}
    </div>
  );
};

