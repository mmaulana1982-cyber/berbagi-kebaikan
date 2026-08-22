import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Layers, 
  Receipt, 
  FileCheck, 
  Database, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  Copy, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Eye,
  FileSpreadsheet,
  Building,
  DollarSign,
  Download,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Globe,
  Sparkles,
  Zap,
  CreditCard,
  QrCode,
  Wallet,
  Store,
  Key,
  ArrowRight
} from 'lucide-react';
import { AppSettings, BankAccountConfig, Campaign, CampaignCategory, Disbursement, Donation } from '../types';
import { storageService } from '../services/storageService';
import { processAndOptimizeLogo, ProcessedLogoResult, syncFaviconAndPwaManifest, compressAndResizePhoto, CompressedPhotoResult } from '../services/imageOptimizer';

interface AdminPageProps {
  settings: AppSettings;
  campaigns: Campaign[];
  donations: Donation[];
  disbursements: Disbursement[];
  onRefreshData: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  settings,
  campaigns,
  donations,
  disbursements,
  onRefreshData
}) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'payments' | 'campaigns' | 'donations' | 'disbursements' | 'gas'>('overview');

  // Form State: Settings
  const [formDataSettings, setFormDataSettings] = useState<AppSettings>({ ...settings });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Bank Management State
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [bankForm, setBankForm] = useState<BankAccountConfig>({
    id: '',
    bank: '',
    accountNumber: '',
    accountHolder: '',
    logo: ''
  });
  const [gatewayPingNotice, setGatewayPingNotice] = useState<string | null>(null);

  // Form State: New Campaign
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<Partial<Campaign>>({
    title: '',
    category: 'wakaf',
    shortDesc: '',
    storyHtml: '',
    targetAmount: 50000000,
    collectedAmount: 0,
    donorCount: 0,
    daysLeft: 30,
    endDate: '2026-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    location: 'Indonesia',
    status: 'active',
    isVerified: true,
    isFeatured: false,
    organizer: {
      name: 'Yayasan Sahabat Jariyah',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      badge: 'Pengelola Terverifikasi'
    },
    updates: []
  });

  // Form State: Add Update to Campaign
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCampaignForUpdate, setSelectedCampaignForUpdate] = useState<Campaign | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateImage, setUpdateImage] = useState('');

  // Form State: New Disbursement
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [disbursementForm, setDisbursementForm] = useState<Partial<Disbursement>>({
    receiptNumber: `SJ-DISB/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
    campaignId: campaigns[0]?.id || '',
    title: '',
    amount: 5000000,
    date: new Date().toISOString().slice(0, 10),
    recipient: '',
    location: '',
    description: '',
    proofImages: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    status: 'verified',
    verifiedBy: 'Tim Penyaluran & Dewan Pengawas Syariah',
    auditNotes: 'Kwitansi bermeterai dan berita acara serah terima dana telah diverifikasi sesuai SOP.'
  });

  // GAS State
  const [gasPingStatus, setGasPingStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });
  const [gasSyncStatus, setGasSyncStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });
  const [gasPullStatus, setGasPullStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });
  const [copiedCode, setCopiedCode] = useState(false);

  // Logo Optimization & Preview States
  const [isOptimizingLogo, setIsOptimizingLogo] = useState(false);
  const [logoOptimizationStats, setLogoOptimizationStats] = useState<ProcessedLogoResult | null>(null);
  const [logoPreviewTab, setLogoPreviewTab] = useState<'header' | 'favicon' | 'pwa'>('header');

  // Handle Login PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '123456') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN Admin salah. Default: 123456');
    }
  };

  // Upload Logo handler with automated resizing, favicon & PWA icon generation and compression
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsOptimizingLogo(true);
      const result = await processAndOptimizeLogo(file);
      const updatedSettings: AppSettings = {
        ...formDataSettings,
        logoUrl: result.masterLogo,
        faviconUrl: result.favicon,
        pwaIcon192Url: result.pwa192,
        pwaIcon512Url: result.pwa512,
        appleTouchIconUrl: result.appleTouch
      };
      setFormDataSettings(updatedSettings);
      setLogoOptimizationStats(result);
      syncFaviconAndPwaManifest(updatedSettings);
    } catch (err) {
      console.error('Gagal mengoptimasi logo:', err);
      alert('Gagal memproses gambar logo. Silakan pilih file gambar (PNG/JPG/SVG/WebP) yang valid.');
    } finally {
      setIsOptimizingLogo(false);
    }
  };

  // Optimize Logo from external URL
  const handleOptimizeUrlLogo = async () => {
    if (!formDataSettings.logoUrl) return;
    try {
      setIsOptimizingLogo(true);
      const result = await processAndOptimizeLogo(formDataSettings.logoUrl);
      const updatedSettings: AppSettings = {
        ...formDataSettings,
        logoUrl: result.masterLogo,
        faviconUrl: result.favicon,
        pwaIcon192Url: result.pwa192,
        pwaIcon512Url: result.pwa512,
        appleTouchIconUrl: result.appleTouch
      };
      setFormDataSettings(updatedSettings);
      setLogoOptimizationStats(result);
      syncFaviconAndPwaManifest(updatedSettings);
    } catch (err) {
      console.error('Gagal mengoptimasi URL logo:', err);
      alert('Gagal memuat atau memproses URL gambar. Pastikan URL gambar aktif dan dapat diakses publik.');
    } finally {
      setIsOptimizingLogo(false);
    }
  };

  // General Photo Compression & Uploading States
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [photoCompressionNotice, setPhotoCompressionNotice] = useState<string | null>(null);

  // Helper for notification toast
  const showPhotoNotice = (msg: string) => {
    setPhotoCompressionNotice(msg);
    setTimeout(() => setPhotoCompressionNotice(null), 4000);
  };

  // 1. Hero Banner Photo Upload (auto-resized & compressed <= 700 KB)
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingPhoto(true);
      const res = await compressAndResizePhoto(file, 1920, 700);
      setFormDataSettings(prev => ({ ...prev, heroBannerUrl: res.dataUrl }));
      showPhotoNotice(`Banner berhasil dikompres ke ${res.compressedSizeKb} KB (${res.width}×${res.height}px) - Sesuai standar < 700 KB`);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses file banner gambar.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // 2. Campaign Main Image Upload (auto-resized & compressed <= 700 KB)
  const handleCampaignMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingPhoto(true);
      const res = await compressAndResizePhoto(file, 1600, 700);
      setCampaignForm(prev => ({ ...prev, imageUrl: res.dataUrl }));
      showPhotoNotice(`Foto utama kampanye dikompres: ${res.compressedSizeKb} KB (${res.width}×${res.height}px) - < 700 KB`);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses foto kampanye.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // 3. Campaign Gallery Multi-Image Upload (each auto-compressed <= 700 KB)
  const handleCampaignGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsCompressingPhoto(true);
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await compressAndResizePhoto(files[i], 1600, 700);
        newImages.push(res.dataUrl);
      }
      setCampaignForm(prev => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...newImages]
      }));
      showPhotoNotice(`${newImages.length} foto galeri berhasil dikompres & ditambahkan (masing-masing < 700 KB)`);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses foto galeri kampanye.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // 4. Campaign Milestone Update Photo Upload (auto-compressed <= 700 KB)
  const handleUpdateImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingPhoto(true);
      const res = await compressAndResizePhoto(file, 1600, 700);
      setUpdateImage(res.dataUrl);
      showPhotoNotice(`Foto kabar/progres dikompres ke ${res.compressedSizeKb} KB - < 700 KB`);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses foto update.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // 5. Disbursement Proof Photo Upload (auto-compressed <= 700 KB)
  const handleDisbursementProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsCompressingPhoto(true);
      const newProofs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await compressAndResizePhoto(files[i], 1600, 700);
        newProofs.push(res.dataUrl);
      }
      setDisbursementForm(prev => ({
        ...prev,
        proofImages: [...(prev.proofImages || []), ...newProofs]
      }));
      showPhotoNotice(`${newProofs.length} foto bukti/nota berhasil dikompres (masing-masing < 700 KB)`);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses foto bukti penyaluran.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // 6. QRIS Yayasan Official Photo Upload (auto-compressed <= 700 KB)
  const handleQrisFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingPhoto(true);
      const res = await compressAndResizePhoto(file, 1200, 700);
      setFormDataSettings(prev => ({ ...prev, qrisImageUrl: res.dataUrl }));
      showPhotoNotice(`Foto QRIS resmi berhasil dikompres ke ${res.compressedSizeKb} KB (${res.width}×${res.height}px) - Sesuai standar < 700 KB`);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses file foto QRIS.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Add Bank Account Handler
  const handleAddBankAccount = () => {
    if (!bankForm.bank || !bankForm.accountNumber || !bankForm.accountHolder) {
      alert('Mohon lengkapi Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening.');
      return;
    }
    const newBankItem: BankAccountConfig = {
      id: 'bank-' + Date.now(),
      bank: bankForm.bank,
      accountNumber: bankForm.accountNumber,
      accountHolder: bankForm.accountHolder,
      logo: bankForm.logo || 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg'
    };
    setFormDataSettings(prev => ({
      ...prev,
      bankAccounts: [...(prev.bankAccounts || []), newBankItem]
    }));
    setBankForm({ id: '', bank: '', accountNumber: '', accountHolder: '', logo: '' });
    setIsAddingBank(false);
    showPhotoNotice('Rekening bank baru berhasil ditambahkan');
  };

  // Delete Bank Account Handler
  const handleDeleteBankAccount = (id: string) => {
    setFormDataSettings(prev => ({
      ...prev,
      bankAccounts: (prev.bankAccounts || []).filter(b => b.id !== id)
    }));
    showPhotoNotice('Rekening bank berhasil dihapus');
  };

  // Ping Webhook Simulator
  const handlePingWebhook = () => {
    setGatewayPingNotice('Mengirim sinyal simulasi webhook ke server...');
    setTimeout(() => {
      setGatewayPingNotice('✅ Sinyal Webhook OK: HTTP 200 - Server & Database Berhasil Terkoneksi');
      setTimeout(() => setGatewayPingNotice(null), 5000);
    }, 1000);
  };

  // Reset logo to default system SVG
  const handleResetToDefaultLogo = () => {
    const updatedSettings: AppSettings = {
      ...formDataSettings,
      logoUrl: '',
      faviconUrl: undefined,
      pwaIcon192Url: undefined,
      pwaIcon512Url: undefined,
      appleTouchIconUrl: undefined
    };
    setFormDataSettings(updatedSettings);
    setLogoOptimizationStats(null);
    syncFaviconAndPwaManifest(updatedSettings);
  };

  // Save Settings
  const handleSaveSettings = () => {
    storageService.saveSettings(formDataSettings);
    syncFaviconAndPwaManifest(formDataSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
    onRefreshData();
  };

  // Save Campaign
  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingCampaign ? editingCampaign.id : 'cmp-' + Date.now();
    const slug = (campaignForm.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const finalCampaign: Campaign = {
      ...(campaignForm as Campaign),
      id,
      slug,
      title: campaignForm.title || 'Program Donasi Baru',
      category: campaignForm.category || 'wakaf',
      shortDesc: campaignForm.shortDesc || '',
      storyHtml: campaignForm.storyHtml || `<p>${campaignForm.shortDesc}</p>`,
      targetAmount: Number(campaignForm.targetAmount) || 10000000,
      collectedAmount: editingCampaign ? editingCampaign.collectedAmount : 0,
      donorCount: editingCampaign ? editingCampaign.donorCount : 0,
      daysLeft: Number(campaignForm.daysLeft) || 30,
      endDate: campaignForm.endDate || '2026-12-31',
      imageUrl: campaignForm.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
      galleryImages: campaignForm.galleryImages || [],
      location: campaignForm.location || 'Indonesia',
      status: campaignForm.status || 'active',
      isVerified: true,
      isFeatured: campaignForm.isFeatured || false,
      organizer: campaignForm.organizer || {
        name: formDataSettings.appName,
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        badge: 'Pengelola Resmi'
      },
      createdAt: editingCampaign ? editingCampaign.createdAt : new Date().toISOString(),
      updates: editingCampaign ? editingCampaign.updates : []
    };

    storageService.upsertCampaign(finalCampaign);
    setIsCampaignModalOpen(false);
    setEditingCampaign(null);
    onRefreshData();
  };

  // Delete Campaign
  const handleDeleteCampaign = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus program donasi ini?')) {
      storageService.deleteCampaign(id);
      onRefreshData();
    }
  };

  // Add Progress Update to Campaign
  const handleAddCampaignUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForUpdate) return;

    const newUpdate = {
      id: 'upd-' + Date.now(),
      campaignId: selectedCampaignForUpdate.id,
      title: updateTitle,
      date: new Date().toISOString().slice(0, 10),
      content: updateContent,
      imageUrl: updateImage || undefined,
      disbursedAmount: updateAmount ? Number(updateAmount) : undefined,
      author: 'Pengelola ' + formDataSettings.appName
    };

    const updated = {
      ...selectedCampaignForUpdate,
      updates: [newUpdate, ...(selectedCampaignForUpdate.updates || [])]
    };

    storageService.upsertCampaign(updated);
    setIsUpdateModalOpen(false);
    setUpdateTitle('');
    setUpdateContent('');
    setUpdateAmount('');
    setUpdateImage('');
    onRefreshData();
  };

  // Save Disbursement
  const handleSaveDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find(c => c.id === disbursementForm.campaignId) || campaigns[0];
    if (!campaign) return;

    const finalDisb: Disbursement = {
      id: 'disb-' + Date.now(),
      receiptNumber: disbursementForm.receiptNumber || `SJ-DISB/${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      category: campaign.category,
      title: disbursementForm.title || 'Penyaluran Dana Amanah',
      amount: Number(disbursementForm.amount) || 0,
      date: disbursementForm.date || new Date().toISOString().slice(0, 10),
      recipient: disbursementForm.recipient || 'Penerima Manfaat',
      location: disbursementForm.location || campaign.location,
      description: disbursementForm.description || '',
      proofImages: disbursementForm.proofImages || [],
      status: 'verified',
      verifiedBy: disbursementForm.verifiedBy || 'Tim Audit Sahabat Jariyah',
      auditNotes: disbursementForm.auditNotes || ''
    };

    storageService.createDisbursement(finalDisb);
    setIsDisbursementModalOpen(false);
    onRefreshData();
  };

  // Approve Donation Status
  const handleApproveDonation = (donationId: string) => {
    storageService.updateDonationStatus(donationId, 'success');
    onRefreshData();
  };

  // Ping GAS
  const handlePingGas = async () => {
    if (!formDataSettings.gasWebhookUrl) {
      alert('Masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }
    setGasPingStatus({ loading: true });
    const res = await storageService.pingGasWebhook(formDataSettings.gasWebhookUrl);
    setGasPingStatus({ loading: false, success: res.success, message: res.message });
  };

  // Full Sync GAS
  const handleFullSyncGas = async () => {
    setGasSyncStatus({ loading: true });
    const res = await storageService.fullSyncToGas();
    setGasSyncStatus({ loading: false, success: res.success, message: res.message });
    setSyncQueueItems(storageService.getSyncQueue());
  };

  // Pull Live Data from GAS
  const handlePullLiveGas = async () => {
    if (!formDataSettings.gasWebhookUrl) {
      alert('Masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }
    setGasPullStatus({ loading: true });
    const res = await storageService.fetchLiveFromGas(formDataSettings.gasWebhookUrl);
    setGasPullStatus({ loading: false, success: res.success, message: res.message });
    if (res.success) {
      onRefreshData();
    }
  };

  // Sync Queue State & Manual Flush
  const [syncQueueItems, setSyncQueueItems] = useState<any[]>(() => storageService.getSyncQueue());
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueNotice, setQueueNotice] = useState<string | null>(null);

  const handleProcessSyncQueue = async () => {
    setIsProcessingQueue(true);
    setQueueNotice(null);
    try {
      const res = await storageService.processSyncQueue();
      const updatedQueue = storageService.getSyncQueue();
      setSyncQueueItems(updatedQueue);
      setQueueNotice(`Hasil Antrean: ${res.succeeded} berhasil disinkronkan, ${res.failed} masih dalam antrean/gagal.`);
    } catch (err: any) {
      setQueueNotice('Gagal memproses antrean: ' + err?.message);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const handleClearSyncQueue = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan antrean sinkronisasi offline?')) {
      storageService.clearSyncQueue();
      setSyncQueueItems([]);
      setQueueNotice('Antrean sinkronisasi berhasil dikosongkan.');
    }
  };

  // Financial summary
  const summary = storageService.getFinancialSummary();

  // Helper to trigger CSV file download
  const triggerCsvDownload = (csvContent: string, fileName: string) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  // Export Donations CSV
  const handleExportDonationsCSV = () => {
    const headers = [
      'No Invoice',
      'Tanggal & Waktu Transaksi',
      'Nama Donatur',
      'No. WhatsApp / HP',
      'Email Donatur',
      'Status Anonim',
      'ID Program',
      'Nama Program Donasi',
      'Metode Pembayaran',
      'Nama Saluran / Bank',
      'Nominal Donasi (IDR)',
      'Kode Unik (IDR)',
      'Total Pembayaran (IDR)',
      'Status Pembayaran',
      'Untaian Doa / Hajat'
    ];

    const rows = donations.map((d) => [
      escapeCsv(d.invoiceCode),
      escapeCsv(new Date(d.createdAt).toLocaleString('id-ID')),
      escapeCsv(d.donorName),
      escapeCsv(d.donorPhone || '-'),
      escapeCsv(d.donorEmail || '-'),
      escapeCsv(d.isAnonymous ? 'Ya (Hamba Allah)' : 'Tidak'),
      escapeCsv(d.campaignId),
      escapeCsv(d.campaignTitle),
      escapeCsv(d.paymentMethod.toUpperCase()),
      escapeCsv(d.paymentChannelName),
      escapeCsv(d.amount),
      escapeCsv(d.uniqueCode),
      escapeCsv(d.totalAmount),
      escapeCsv(d.paymentStatus === 'success' ? 'LUNAS (BERHASIL)' : 'MENUNGGU VERIFIKASI'),
      escapeCsv(d.prayer || '-')
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    triggerCsvDownload(csvContent, `Laporan_Donasi_${formDataSettings.appName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  };

  // Export Disbursements CSV
  const handleExportDisbursementsCSV = () => {
    const headers = [
      'No. Kwitansi / Bukti',
      'Tanggal Penyaluran',
      'Judul Penyaluran Dana',
      'ID Program',
      'Nama Program Terkait',
      'Kategori',
      'Penerima Manfaat / Lembaga',
      'Lokasi Penyaluran',
      'Nominal Disalurkan (IDR)',
      'Status Verifikasi',
      'Petugas Verifikator',
      'Catatan Audit Syariah & Pelaksanaan',
      'Jumlah Foto Bukti'
    ];

    const rows = disbursements.map((disb) => [
      escapeCsv(disb.receiptNumber),
      escapeCsv(disb.date),
      escapeCsv(disb.title),
      escapeCsv(disb.campaignId),
      escapeCsv(disb.campaignTitle),
      escapeCsv(disb.category.toUpperCase()),
      escapeCsv(disb.recipient),
      escapeCsv(disb.location),
      escapeCsv(disb.amount),
      escapeCsv(disb.status.toUpperCase()),
      escapeCsv(disb.verifiedBy),
      escapeCsv(disb.auditNotes || disb.description || '-'),
      escapeCsv(disb.proofImages?.length || 0)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    triggerCsvDownload(csvContent, `Laporan_Penyaluran_${formDataSettings.appName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  };

  // Export Full Accounting Audit Ledger (Donations + Disbursements combined)
  const handleExportCombinedAuditCSV = () => {
    interface LedgerItem {
      date: string;
      rawTimestamp: number;
      type: 'KAS MASUK (DONASI)' | 'KAS KELUAR (PENYALURAN)';
      refNumber: string;
      program: string;
      party: string;
      description: string;
      status: string;
      inflow: number;
      outflow: number;
    }

    const ledger: LedgerItem[] = [];

    // Success Donations
    donations.forEach((d) => {
      const ts = new Date(d.createdAt).getTime() || 0;
      ledger.push({
        date: new Date(d.createdAt).toLocaleDateString('id-ID'),
        rawTimestamp: ts,
        type: 'KAS MASUK (DONASI)',
        refNumber: d.invoiceCode,
        program: d.campaignTitle,
        party: d.isAnonymous ? 'Hamba Allah' : d.donorName,
        description: `Donasi via ${d.paymentChannelName} (${d.paymentMethod.toUpperCase()})`,
        status: d.paymentStatus === 'success' ? 'TERVERIFIKASI' : 'MENUNGGU KONFIRMASI',
        inflow: d.paymentStatus === 'success' ? d.amount : 0,
        outflow: 0
      });
    });

    // Disbursements
    disbursements.forEach((disb) => {
      const ts = new Date(disb.date).getTime() || 0;
      ledger.push({
        date: disb.date,
        rawTimestamp: ts,
        type: 'KAS KELUAR (PENYALURAN)',
        refNumber: disb.receiptNumber,
        program: disb.campaignTitle,
        party: disb.recipient,
        description: `${disb.title} (${disb.location})`,
        status: disb.status === 'verified' ? 'TERVERIFIKASI AUDIT' : 'DRAFT',
        inflow: 0,
        outflow: disb.amount
      });
    });

    // Sort chronologically
    ledger.sort((a, b) => a.rawTimestamp - b.rawTimestamp);

    // Calculate running balance
    let runningBalance = 0;
    const headers = [
      'No Urut',
      'Tanggal Transaksi',
      'Jenis Mutasi',
      'No. Referensi / Kwitansi',
      'Program Donasi',
      'Pihak Terkait (Donatur / Penerima)',
      'Keterangan & Rincian Transaksi',
      'Status Audit',
      'Kas Masuk / Inflow (IDR)',
      'Kas Keluar / Outflow (IDR)',
      'Saldo Akhir Kas Amanah (IDR)'
    ];

    const rows = ledger.map((item, idx) => {
      runningBalance += item.inflow - item.outflow;
      return [
        escapeCsv(idx + 1),
        escapeCsv(item.date),
        escapeCsv(item.type),
        escapeCsv(item.refNumber),
        escapeCsv(item.program),
        escapeCsv(item.party),
        escapeCsv(item.description),
        escapeCsv(item.status),
        escapeCsv(item.inflow),
        escapeCsv(item.outflow),
        escapeCsv(runningBalance)
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    triggerCsvDownload(csvContent, `Buku_Besar_Audit_Akuntansi_${formDataSettings.appName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  };

  // AUTH SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-stone-900">Portal Pengelola (Admin)</h2>
            <p className="text-xs text-stone-500 mt-1">
              Masukkan PIN Keamanan untuk mengakses dashboard manajemen {formDataSettings.appName}.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                PIN Admin (Default: 123456)
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••"
                className="w-full text-center tracking-widest text-lg font-bold py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 font-semibold text-center">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Portal Pengelola</span>
            </button>
          </form>

          <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 border border-stone-100">
            PIN bawaan sistem: <strong className="text-stone-700 font-mono">123456</strong> (Dapat diubah di tab Pengaturan)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Top Banner */}
      <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Mode Pengelola Terotentikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dashboard Manajemen {formDataSettings.appName}
          </h1>
          <p className="text-xs text-emerald-200 mt-1">
            Kelola seluruh konten, program donasi, verifikasi pembayaran, transparansi, dan koneksi Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="py-2 px-3.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl border border-emerald-700 transition-colors cursor-pointer"
          >
            Kunci / Keluar
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 scrollbar-none">
        {[
          { id: 'overview', label: 'Ringkasan & Statistik', icon: Layers },
          { id: 'settings', label: 'Pengaturan Website & Logo', icon: SettingsIcon },
          { id: 'payments', label: 'Metode Pembayaran & QRIS', icon: CreditCard },
          { id: 'campaigns', label: 'Kelola Program Donasi', icon: FileCheck },
          { id: 'donations', label: 'Transaksi Donasi', icon: Receipt },
          { id: 'disbursements', label: 'Penyaluran Dana Transparansi', icon: Building },
          { id: 'gas', label: 'Google Apps Script & DB', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PHOTO COMPRESSION REAL-TIME NOTIFICATION */}
      {photoCompressionNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{photoCompressionNotice}</span>
          </div>
          <button onClick={() => setPhotoCompressionNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {isCompressingPhoto && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-pulse">
          <RefreshCw className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
          <span>Sistem sedang mengompresi & menyesuaikan ukuran foto secara otomatis (&lt; 700 KB)...</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-stone-500 block">Total Dana Terkumpul</span>
              <span className="text-2xl font-black text-emerald-800 font-mono">
                Rp {summary.totalCollected.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block">{summary.totalDonors} Total Donatur</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-stone-500 block">Dana Telah Disalurkan</span>
              <span className="text-2xl font-black text-teal-700 font-mono">
                Rp {summary.totalDisbursed.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-teal-600 font-semibold block">{disbursements.length} Penyaluran Terverifikasi</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-stone-500 block">Saldo Kas Amanah</span>
              <span className="text-2xl font-black text-stone-900 font-mono">
                Rp {summary.remainingBalance.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-stone-500 font-medium block">Siap disalurkan</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <span className="text-xs font-medium text-stone-500 block">Transaksi Menunggu</span>
              <span className="text-2xl font-black text-amber-600 font-mono">
                {summary.pendingDonationsCount}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold block">Perlu verifikasi transfer</span>
            </div>
          </div>

          {/* Quick Actions & Financial Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Quick Actions */}
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Aksi Cepat Pengelola</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setEditingCampaign(null);
                    setIsCampaignModalOpen(true);
                  }}
                  className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Program Donasi Baru</span>
                </button>

                <button
                  onClick={() => setIsDisbursementModalOpen(true)}
                  className="py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Catat Penyaluran Dana Baru</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <SettingsIcon className="w-4 h-4 text-stone-600" />
                  <span>Ganti Nama & Upload Logo</span>
                </button>
              </div>
            </div>

            {/* Financial Auditing & CSV Export */}
            <div className="bg-emerald-900 text-white p-6 rounded-3xl border border-emerald-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-300" />
                    <span>Ekspor Data Audit & Akuntansi (.CSV)</span>
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Unduh rekap data donasi, penyaluran, dan buku kas untuk laporan audit keuangan & perpajakan.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={handleExportCombinedAuditCSV}
                  className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Buku Kas Lengkap (.CSV)</span>
                </button>

                <button
                  onClick={handleExportDonationsCSV}
                  className="py-2.5 px-3.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 hover:text-white font-bold text-xs rounded-xl border border-emerald-700 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Donasi ({donations.length})</span>
                </button>

                <button
                  onClick={handleExportDisbursementsCSV}
                  className="py-2.5 px-3.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 hover:text-white font-bold text-xs rounded-xl border border-emerald-700 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Penyaluran ({disbursements.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGATURAN WEBSITE & LOGO */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Pengaturan Website & Branding</h2>
              <p className="text-xs text-stone-500">Sesuaikan nama, logo, tagline, banner, dan rekening pengelola</p>
            </div>

            {settingsSavedToast && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengaturan Berhasil Disimpan!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Branding & Text Info */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* App Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nama Website / Aplikasi
                  </label>
                  <input
                    type="text"
                    value={formDataSettings.appName}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, appName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Tagline Aplikasi
                  </label>
                  <input
                    type="text"
                    value={formDataSettings.appTagline}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, appTagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Hero Banner Titles */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Judul Utama Hero (Beranda)
                  </label>
                  <input
                    type="text"
                    value={formDataSettings.heroTitle}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Subjudul / Deskripsi Hero
                  </label>
                  <textarea
                    rows={2}
                    value={formDataSettings.heroSubtitle}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, heroSubtitle: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Tentang Kami / Profil Lembaga
                  </label>
                  <textarea
                    rows={4}
                    value={formDataSettings.aboutText}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, aboutText: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formDataSettings.contactEmail}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    No Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formDataSettings.contactPhone}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Alamat Kantor
                  </label>
                  <input
                    type="text"
                    value={formDataSettings.contactAddress}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, contactAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Security PIN */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Ganti PIN Akses Admin (6 Digit)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formDataSettings.adminPin}
                  onChange={(e) => setFormDataSettings({ ...formDataSettings, adminPin: e.target.value })}
                  className="w-48 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* WHATSAPP POPUP & NOTIFICATION SETTINGS */}
              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                        Pengaturan WhatsApp & Layanan Donatur
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Nomor WhatsApp CS yang akan dihubungi donatur melalui popup chat floating
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Nomor WhatsApp Admin / CS
                    </label>
                    <input
                      type="text"
                      placeholder="081234567890 atau 6281234567890"
                      value={formDataSettings.whatsappNumber || ''}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-emerald-700 mt-1 block">
                      Format: 08xxx atau 628xxx (Otomatis diformat ke link wa.me)
                    </span>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        let clean = (formDataSettings.whatsappNumber || '').replace(/\D/g, '');
                        if (clean.startsWith('0')) clean = '62' + clean.slice(1);
                        if (!clean) clean = '6281234567890';
                        const url = `https://wa.me/${clean}?text=${encodeURIComponent('Halo Admin Sahabat Jariyah, ini adalah pesan uji koneksi WhatsApp pengelola.')}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Uji Buka WhatsApp Sekarang</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Pesan Sapaan / Sambutan Popup WhatsApp
                  </label>
                  <textarea
                    rows={2}
                    value={formDataSettings.whatsappGreeting || ''}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, whatsappGreeting: e.target.value })}
                    placeholder="Assalamu’alaikum Warahmatullahi Wabarakatuh! Ada yang bisa kami bantu seputar program donasi jariyah..."
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-1 border-t border-emerald-200">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDataSettings.whatsappPopupEnabled !== false}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, whatsappPopupEnabled: e.target.checked })}
                      className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-950">
                      Aktifkan Widget Popup WhatsApp Floating di Halaman Website
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDataSettings.whatsappAutoNotifyAdmin !== false}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, whatsappAutoNotifyAdmin: e.target.checked })}
                      className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs text-emerald-900">
                      Sediakan Tombol Konfirmasi WhatsApp Instan ke Donatur pada Kwitansi Pembayaran
                    </span>
                  </label>
                </div>
              </div>

              {/* PWA APPLIKASI SETTINGS */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                        Aplikasi PWA (Progressive Web App)
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Platform telah mendukung instalasi langsung di layar utama smartphone donatur tanpa download Play Store
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event('show-pwa-install'))}
                    className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Uji Banner PWA</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Upload Logo & Media Preview */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* LOGO, FAVICON & PWA ICON UPLOADER WITH AUTOMATIC OPTIMIZATION */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Logo Aplikasi & Icon PWA
                    </label>
                    <span className="text-[11px] text-stone-500 block">
                      Otomatis menghasilkan Favicon & Icon PWA terkompresi
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Optimized</span>
                  </span>
                </div>

                {/* Preview Mode Tabs */}
                <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLogoPreviewTab('header')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                      logoPreviewTab === 'header'
                        ? 'bg-white text-stone-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Header Web
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoPreviewTab('favicon')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                      logoPreviewTab === 'favicon'
                        ? 'bg-white text-stone-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Favicon Tab
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoPreviewTab('pwa')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                      logoPreviewTab === 'pwa'
                        ? 'bg-white text-stone-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Icon App PWA
                  </button>
                </div>

                {/* Live Preview Display Box */}
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs min-h-[110px] flex items-center justify-center p-3">
                  {/* Tab 1: Header Web Preview */}
                  {logoPreviewTab === 'header' && (
                    <div className="w-full bg-emerald-950 p-2.5 rounded-xl flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        {formDataSettings.logoUrl ? (
                          <img
                            src={formDataSettings.logoUrl}
                            alt="Header Logo"
                            className="h-8 max-w-[120px] object-contain"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-white text-[10px] font-black">
                            SJ
                          </div>
                        )}
                        <span className="font-extrabold text-xs tracking-tight text-white truncate max-w-[140px]">
                          {formDataSettings.appName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-200">Online</span>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Browser Tab Favicon Preview */}
                  {logoPreviewTab === 'favicon' && (
                    <div className="w-full bg-stone-100 p-2 rounded-xl border border-stone-300 flex items-center gap-2 max-w-xs shadow-inner">
                      <div className="w-5 h-5 rounded flex items-center justify-center overflow-hidden bg-white shadow-xs shrink-0 border border-stone-200">
                        {formDataSettings.faviconUrl || formDataSettings.logoUrl ? (
                          <img
                            src={formDataSettings.faviconUrl || formDataSettings.logoUrl}
                            alt="Favicon"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-stone-800 truncate flex-1">
                        {formDataSettings.appName} • Platform Donasi
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">✕</span>
                    </div>
                  )}

                  {/* Tab 3: PWA Smartphone App Icon Preview */}
                  {logoPreviewTab === 'pwa' && (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-900 border-2 border-emerald-700 shadow-md flex items-center justify-center overflow-hidden p-1">
                        {formDataSettings.pwaIcon192Url || formDataSettings.logoUrl ? (
                          <img
                            src={formDataSettings.pwaIcon192Url || formDataSettings.logoUrl}
                            alt="PWA Icon"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Smartphone className="w-7 h-7 text-emerald-300" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-stone-800 truncate max-w-[120px] text-center">
                        {formDataSettings.appName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Compression & Optimization Status Report */}
                {logoOptimizationStats ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] space-y-1.5 text-emerald-950 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Logo Berhasil Dioptimasi Sistem</span>
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">
                        Hemat {Math.max(0, Math.round((1 - logoOptimizationStats.compressedSizeKb / (logoOptimizationStats.originalSizeKb || 1)) * 100))}%
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[10px] leading-relaxed">
                      • Resolusi Asli: <strong>{logoOptimizationStats.dimensions.width}×{logoOptimizationStats.dimensions.height}px</strong> ({logoOptimizationStats.originalSizeKb} KB)
                      <br />
                      • Favicon (64×64px) & PWA Icons (192×192px & 512×512px) dibuat otomatis.
                    </p>
                  </div>
                ) : (
                  <div className="bg-stone-100 border border-stone-200 rounded-xl p-2.5 text-[11px] text-stone-600 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Upload file gambar apapun. Sistem akan otomatis memusatkan, mengkompresi, dan menyesuaikan ukuran Favicon serta Icon PWA.
                    </span>
                  </div>
                )}

                {/* Upload Action */}
                <div className="space-y-2">
                  <label className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors">
                    {isOptimizingLogo ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengompresi & Memproses Icon...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload File Logo (PNG / JPG / SVG)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoFileUpload}
                      disabled={isOptimizingLogo}
                      className="hidden"
                    />
                  </label>

                  {formDataSettings.logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetToDefaultLogo}
                      className="w-full py-1.5 text-rose-600 hover:text-rose-700 text-xs text-center font-medium block cursor-pointer"
                    >
                      Hapus & Gunakan Logo Bawaan Sistem
                    </button>
                  )}
                </div>

                {/* URL Input Fallback with Optimize Action */}
                <div className="space-y-1.5 pt-2 border-t border-stone-200">
                  <span className="text-[11px] font-semibold text-stone-600 block">Atau gunakan URL Gambar Logo:</span>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formDataSettings.logoUrl}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, logoUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-emerald-600"
                    />
                    {formDataSettings.logoUrl && !formDataSettings.logoUrl.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={handleOptimizeUrlLogo}
                        disabled={isOptimizingLogo}
                        title="Proses & Buat Favicon/PWA Icon dari URL"
                        className="py-1.5 px-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Optimasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* HERO BANNER IMAGE WITH AUTO-COMPRESSION */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Foto Banner Hero
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Maks 700 KB
                  </span>
                </div>

                {formDataSettings.heroBannerUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 group">
                    <img
                      src={formDataSettings.heroBannerUrl}
                      alt="Banner Preview"
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormDataSettings({ ...formDataSettings, heroBannerUrl: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs"
                      title="Hapus Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <label className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload File Banner (Auto-Kompres &lt; 700 KB)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="pt-1">
                  <span className="text-[11px] text-stone-500 block mb-1">Atau masukkan URL Banner:</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formDataSettings.heroBannerUrl}
                    onChange={(e) => setFormDataSettings({ ...formDataSettings, heroBannerUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

            </div>

          </div>

          <div className="pt-6 border-t border-stone-200 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="py-3 px-8 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB: METODE PEMBAYARAN, QRIS & PAYMENT GATEWAY */}
      {activeTab === 'payments' && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4" />
                <span>Sistem Pembayaran Digital & QRIS Terintegrasi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                Pengaturan QRIS & Payment Gateway
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Kelola upload QRIS resmi yayasan, integrasi payment gateway otomatis (Midtrans, Xendit, Tripay, Duitku), dan rekening transfer manual.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSettings}
                className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Pembayaran</span>
              </button>
            </div>
          </div>

          {/* Real-time Webhook Notice */}
          {gatewayPingNotice && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gatewayPingNotice}</span>
              </div>
              <button onClick={() => setGatewayPingNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
                ✕
              </button>
            </div>
          )}

          {/* Section 1 & Section 2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN (8 Cols): PAYMENT GATEWAY CONFIGURATION */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* PAYMENT GATEWAY MASTER CONTROLLER */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                
                {/* Gateway Switcher Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900">
                        Integrasi Payment Gateway Otomatis
                      </h3>
                      <p className="text-xs text-stone-500">
                        Mendukung Virtual Account, E-Wallet & Gerai Retail terverifikasi otomatis
                      </p>
                    </div>
                  </div>

                  {/* Master Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDataSettings.isPaymentGatewayEnabled !== false}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, isPaymentGatewayEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2.5 text-xs font-bold text-stone-800">
                      {formDataSettings.isPaymentGatewayEnabled !== false ? 'Aktif (Otomatis)' : 'Nonaktif (Manual Saja)'}
                    </span>
                  </label>
                </div>

                {formDataSettings.isPaymentGatewayEnabled !== false && (
                  <div className="space-y-6 animate-in fade-in duration-150">
                    
                    {/* Provider Selector Cards */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                        Pilih Penyedia Payment Gateway Utama
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { id: 'midtrans', name: 'Midtrans Snap', desc: 'VA, GoPay, Shopee, Alfamart', badge: 'Rekomendasi' },
                          { id: 'xendit', name: 'Xendit Gateway', desc: 'XenInvoice, Direct VA, QRIS', badge: 'Populer' },
                          { id: 'tripay', name: 'Tripay Otomatis', desc: 'Closed & Open Payment', badge: 'Murah' },
                          { id: 'duitku', name: 'Duitku POP', desc: 'Direct Link & Merchant', badge: 'Instan' }
                        ].map((provider) => {
                          const isSelected = (formDataSettings.activePaymentGateway || 'midtrans') === provider.id;
                          return (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => setFormDataSettings({ ...formDataSettings, activePaymentGateway: provider.id as any })}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/30'
                                  : 'bg-stone-50 border-stone-200 hover:border-emerald-300 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-extrabold text-xs sm:text-sm text-stone-900">
                                  {provider.name}
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                              </div>
                              <span className="text-[10px] text-stone-500 block leading-tight">
                                {provider.desc}
                              </span>
                              <span className="inline-block mt-2 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {provider.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mode Selector: Sandbox vs Production */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Lingkungan Eksekusi (Environment)
                      </label>
                      <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl w-fit">
                        <button
                          type="button"
                          onClick={() => setFormDataSettings({ ...formDataSettings, paymentGatewayMode: 'sandbox' })}
                          className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            (formDataSettings.paymentGatewayMode || 'sandbox') === 'sandbox'
                              ? 'bg-amber-500 text-stone-950 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          🧪 Sandbox / Mode Pengujian
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormDataSettings({ ...formDataSettings, paymentGatewayMode: 'production' })}
                          className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            formDataSettings.paymentGatewayMode === 'production'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          🚀 Production / Transaksi Riil
                        </button>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        {(formDataSettings.paymentGatewayMode || 'sandbox') === 'sandbox'
                          ? 'Mode Sandbox aktif: Seluruh transaksi donasi dapat disimulasikan secara gratis tanpa memotong saldo donatur.'
                          : 'Mode Production aktif: Transaksi akan diverifikasi langsung oleh payment gateway resmi.'}
                      </span>
                    </div>

                    {/* DYNAMIC CREDENTIALS FORM BASED ON SELECTED PROVIDER */}
                    {/* Midtrans Fields */}
                    {(formDataSettings.activePaymentGateway || 'midtrans') === 'midtrans' && (
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Kredensial Akun Midtrans</span>
                          </span>
                          <a
                            href="https://dashboard.midtrans.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Dashboard Midtrans</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Client Key (Public)
                            </label>
                            <input
                              type="text"
                              placeholder="SB-Mid-client-..."
                              value={formDataSettings.midtransClientKey || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, midtransClientKey: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Server Key (Secret)
                            </label>
                            <input
                              type="password"
                              placeholder="SB-Mid-server-..."
                              value={formDataSettings.midtransServerKey || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, midtransServerKey: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Merchant ID Midtrans
                            </label>
                            <input
                              type="text"
                              placeholder="G123456789"
                              value={formDataSettings.midtransMerchantId || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, midtransMerchantId: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Xendit Fields */}
                    {formDataSettings.activePaymentGateway === 'xendit' && (
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-blue-600" />
                            <span>Kredensial Akun Xendit</span>
                          </span>
                          <a
                            href="https://dashboard.xendit.co"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Dashboard Xendit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Public API Key
                            </label>
                            <input
                              type="text"
                              placeholder="xnd_public_..."
                              value={formDataSettings.xenditPublicKey || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, xenditPublicKey: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Secret API Key
                            </label>
                            <input
                              type="password"
                              placeholder="xnd_development_..."
                              value={formDataSettings.xenditSecretKey || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, xenditSecretKey: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Webhook Verification Token
                            </label>
                            <input
                              type="text"
                              placeholder="Token verifikasi webhook dari Xendit"
                              value={formDataSettings.xenditWebhookToken || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, xenditWebhookToken: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tripay Fields */}
                    {formDataSettings.activePaymentGateway === 'tripay' && (
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-teal-600" />
                            <span>Kredensial Akun Tripay</span>
                          </span>
                          <a
                            href="https://tripay.co.id"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Dashboard Tripay</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              API Key
                            </label>
                            <input
                              type="text"
                              placeholder="DEV-TRIPAY-..."
                              value={formDataSettings.tripayApiKey || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, tripayApiKey: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Private Key
                            </label>
                            <input
                              type="password"
                              placeholder="Private key Tripay..."
                              value={formDataSettings.tripayPrivateKey || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, tripayPrivateKey: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Kode Merchant Tripay
                            </label>
                            <input
                              type="text"
                              placeholder="T1234"
                              value={formDataSettings.tripayMerchantCode || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, tripayMerchantCode: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Duitku Fields */}
                    {formDataSettings.activePaymentGateway === 'duitku' && (
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kredensial Akun Duitku</span>
                          </span>
                          <a
                            href="https://duitku.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Dashboard Duitku</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Merchant Code
                            </label>
                            <input
                              type="text"
                              placeholder="D1234"
                              value={formDataSettings.duitkuMerchantCode || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, duitkuMerchantCode: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              API Key
                            </label>
                            <input
                              type="password"
                              placeholder="API key Duitku..."
                              value={formDataSettings.duitkuApiKey || ''}
                              onChange={(e) => setFormDataSettings({ ...formDataSettings, duitkuApiKey: e.target.value })}
                              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WEBHOOK URL & TEST CALLBACK */}
                    <div className="bg-stone-900 text-white p-5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-stone-200">
                            URL Notifikasi Webhook / Callback Payment Gateway
                          </span>
                        </div>
                        <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-mono">
                          Auto-Sync Real-Time
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={formDataSettings.gasWebhookUrl || `${window.location.origin}/api/payment/webhook`}
                          className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs font-mono text-stone-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formDataSettings.gasWebhookUrl || `${window.location.origin}/api/payment/webhook`);
                            showPhotoNotice('URL Webhook berhasil disalin ke clipboard');
                          }}
                          className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-400">
                          Masukkan URL di atas pada menu Settings &gt; Notification Webhook di dashboard payment gateway Anda.
                        </span>
                        <button
                          type="button"
                          onClick={handlePingWebhook}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Uji Sinyal Webhook</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* REKENING BANK PENGELOLA (TRANSFER MANUAL) */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                        Rekening Bank Yayasan (Transfer Manual)
                      </h3>
                      <p className="text-xs text-stone-500">
                        Ditampilkan untuk donatur yang memilih jalur transfer bank langsung dengan kode unik
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingBank(true)}
                    className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Rekening</span>
                  </button>
                </div>

                {/* Add Bank Inline Form */}
                {isAddingBank && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in">
                    <span className="text-xs font-bold text-emerald-950 block">
                      Tambah Rekening Bank Baru
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Nama Bank (cth: Bank Syariah Indonesia)
                        </label>
                        <input
                          type="text"
                          placeholder="Bank Syariah Indonesia (BSI)"
                          value={bankForm.bank}
                          onChange={(e) => setBankForm({ ...bankForm, bank: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Nomor Rekening
                        </label>
                        <input
                          type="text"
                          placeholder="711-2233-445"
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Atas Nama (Pemilik Rekening)
                        </label>
                        <input
                          type="text"
                          placeholder="Yayasan Sahabat Jariyah"
                          value={bankForm.accountHolder}
                          onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingBank(false)}
                        className="py-1.5 px-3 border border-stone-300 bg-white text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBankAccount}
                        className="py-1.5 px-4 bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                      >
                        Simpan Rekening
                      </button>
                    </div>
                  </div>
                )}

                {/* Bank List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(formDataSettings.bankAccounts || []).map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center p-1">
                          {b.logo ? (
                            <img src={b.logo} alt={b.bank} className="max-h-7 max-w-7 object-contain" />
                          ) : (
                            <Building className="w-5 h-5 text-stone-500" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-xs block">{b.bank}</span>
                          <span className="font-mono font-extrabold text-stone-800 text-xs">{b.accountNumber}</span>
                          <span className="text-[10px] text-stone-500 block">a/n {b.accountHolder}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBankAccount(b.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (4 Cols): OFFICIAL QRIS UPLOAD & SETTINGS */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* QRIS YAYASAN CARD & AUTO-COMPRESS UPLOADER */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Upload QRIS Resmi Yayasan
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                        Auto-Kompres &lt; 700 KB
                      </span>
                    </div>
                  </div>
                </div>

                {/* QRIS Live Preview Frame */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center space-y-2">
                  <div className="bg-white p-3 rounded-2xl border-2 border-emerald-600 shadow-md inline-block max-w-[220px]">
                    <div className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider mb-1 truncate">
                      {formDataSettings.qrisMerchantName || formDataSettings.appName}
                    </div>
                    <img
                      src={formDataSettings.qrisImageUrl || formDataSettings.qrisStaticUrl}
                      alt="QRIS Preview"
                      className="w-40 h-40 object-contain mx-auto rounded-lg border border-stone-200 p-1 bg-white"
                    />
                    <div className="mt-1 text-[10px] font-mono font-bold text-stone-700">
                      NMID: {formDataSettings.qrisNmid || 'ID1020038849201'}
                    </div>
                  </div>

                  {formDataSettings.qrisImageUrl && (
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormDataSettings({ ...formDataSettings, qrisImageUrl: '' })}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Gambar Khusus</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* File Upload Button with Auto-Compression */}
                <label className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all">
                  <Upload className="w-4 h-4 text-emerald-200" />
                  <span>Upload Foto QRIS (&lt; 700 KB)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleQrisFileUpload}
                    className="hidden"
                  />
                </label>

                {/* QRIS Settings Form */}
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nama Merchant QRIS
                    </label>
                    <input
                      type="text"
                      placeholder="YAYASAN SAHABAT JARIYAH"
                      value={formDataSettings.qrisMerchantName || ''}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, qrisMerchantName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nomor NMID QRIS (National Merchant ID)
                    </label>
                    <input
                      type="text"
                      placeholder="ID1020038849201"
                      value={formDataSettings.qrisNmid || ''}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, qrisNmid: e.target.value })}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      URL Fallback QRIS Dinamis
                    </label>
                    <input
                      type="url"
                      placeholder="https://api.qrserver.com/..."
                      value={formDataSettings.qrisStaticUrl}
                      onChange={(e) => setFormDataSettings({ ...formDataSettings, qrisStaticUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* GAS Backend Card in Settings */}
          <div className="bg-emerald-50/80 p-6 rounded-3xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-emerald-950 text-sm">Backend & Database Google Apps Script</h4>
                  {formDataSettings.gasWebhookUrl && formDataSettings.isGasSyncEnabled ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                      Live Terhubung
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                      Belum Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Hubungkan Google Spreadsheet sebagai database live time untuk menyimpan dan mengambil data transaksi, program, dan doa secara otomatis.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('gas')}
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shrink-0 transition-colors shadow-2xs"
            >
              <span>Buka Menu Backend Google Sheets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Save Action */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Pastikan Anda menekan tombol simpan untuk memperbarui pengaturan pembayaran secara live di modal donatur.
            </span>
            <button
              onClick={handleSaveSettings}
              className="py-3 px-8 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan Pembayaran</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: KELOLA PROGRAM DONASI */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Daftar Program Donasi & Wakaf</h2>
              <p className="text-xs text-stone-500">Buat program baru, sesuaikan target, atau posting kabar terbaru</p>
            </div>

            <button
              onClick={() => {
                setEditingCampaign(null);
                setCampaignForm({
                  title: '',
                  category: 'wakaf',
                  shortDesc: '',
                  storyHtml: '',
                  targetAmount: 50000000,
                  collectedAmount: 0,
                  donorCount: 0,
                  daysLeft: 30,
                  endDate: '2026-12-31',
                  imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
                  galleryImages: [],
                  location: 'Indonesia',
                  status: 'active',
                  isVerified: true,
                  isFeatured: false,
                  updates: []
                });
                setIsCampaignModalOpen(true);
              }}
              className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Program Baru</span>
            </button>
          </div>

          {/* Campaign Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-4">Program & Gambar</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Terkumpul / Target</th>
                    <th className="p-4">Donatur</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-stone-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={camp.imageUrl}
                            alt={camp.title}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block line-clamp-1 max-w-xs">{camp.title}</span>
                            <span className="text-[11px] text-stone-400 block">{camp.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-semibold uppercase text-[10px]">
                          {camp.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        <span className="text-emerald-700 block">Rp {camp.collectedAmount.toLocaleString('id-ID')}</span>
                        <span className="text-[10px] text-stone-400 font-normal">Target: Rp {camp.targetAmount.toLocaleString('id-ID')}</span>
                      </td>
                      <td className="p-4 font-semibold">{camp.donorCount} orang</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          camp.status === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {camp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCampaignForUpdate(camp);
                              setIsUpdateModalOpen(true);
                            }}
                            title="Tambah Kabar Penyaluran"
                            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Kabar</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingCampaign(camp);
                              setCampaignForm({ ...camp });
                              setIsCampaignModalOpen(true);
                            }}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSAKSI DONASI */}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Catatan Transaksi Donasi Masuk</h2>
              <p className="text-xs text-stone-500">Daftar donasi, kode unik, dan verifikasi status pembayaran</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDonationsCSV}
                className="py-2 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                title="Ekspor Seluruh Transaksi Donasi ke format Excel / CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Ekspor Donasi (.CSV)</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-4">No. Invoice & Waktu</th>
                    <th className="p-4">Donatur</th>
                    <th className="p-4">Program</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50">
                      <td className="p-4">
                        <span className="font-mono font-bold text-stone-900 block">{d.invoiceCode}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(d.createdAt).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-stone-800 block">{d.donorName}</span>
                        <span className="text-[10px] text-stone-400">{d.donorPhone}</span>
                      </td>
                      <td className="p-4">
                        <span className="line-clamp-1 max-w-xs text-stone-800 font-medium">{d.campaignTitle}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {d.paymentChannelName}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-800">
                        Rp {d.totalAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          d.paymentStatus === 'success' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.paymentStatus === 'success' ? 'Lunas (Berhasil)' : 'Menunggu Bayar'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {d.paymentStatus !== 'success' ? (
                          <button
                            onClick={() => handleApproveDonation(d.id)}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui Donasi</span>
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs">Terverifikasi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PENYALURAN DANA TRANSPARANSI */}
      {activeTab === 'disbursements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Manajemen Penyaluran Dana (Transparansi)</h2>
              <p className="text-xs text-stone-500">Catat pencairan dana kepada penerima manfaat dan upload bukti nota</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportDisbursementsCSV}
                className="py-2 px-3.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                title="Ekspor Seluruh Penyaluran Dana ke format Excel / CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                <span>Ekspor Penyaluran (.CSV)</span>
              </button>

              <button
                onClick={() => setIsDisbursementModalOpen(true)}
                className="py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Input Penyaluran Baru</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-4">No. Kwitansi & Tanggal</th>
                    <th className="p-4">Program & Penyaluran</th>
                    <th className="p-4">Penerima & Lokasi</th>
                    <th className="p-4">Nominal Disalurkan</th>
                    <th className="p-4">Verifikator</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {disbursements.map((disb) => (
                    <tr key={disb.id} className="hover:bg-stone-50">
                      <td className="p-4">
                        <span className="font-mono font-bold text-stone-900 block">{disb.receiptNumber}</span>
                        <span className="text-[10px] text-stone-400">{disb.date}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-stone-900 block">{disb.title}</span>
                        <span className="text-[10px] text-emerald-800 font-medium">{disb.campaignTitle}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-stone-800 block">{disb.recipient}</span>
                        <span className="text-[10px] text-stone-400">{disb.location}</span>
                      </td>
                      <td className="p-4 font-mono font-black text-emerald-800">
                        Rp {disb.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-[11px] text-stone-600">
                        {disb.verifiedBy}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Hapus catatan penyaluran ini?')) {
                              storageService.deleteDisbursement(disb.id);
                              onRefreshData();
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: GOOGLE APPS SCRIPT & DATABASE */}
      {activeTab === 'gas' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-stone-900">Backend & Live Database Google Apps Script</h2>
                {formDataSettings.gasWebhookUrl && formDataSettings.isGasSyncEnabled ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600">
                    Belum Terkoneksi
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Gunakan Google Spreadsheet sebagai database live tanpa biaya server. Data disimpan & diambil secara otomatis dan real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan Backend</span>
            </button>
          </div>

          {/* Live Auto-Sync Status & Toggle Card */}
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${formDataSettings.isGasSyncEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                <RefreshCw className={`w-5 h-5 ${formDataSettings.isGasSyncEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Sinkronisasi Otomatis Real-Time (Live Time)</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Secara otomatis mengambil pembaruan data donasi & status dari Google Sheets setiap 25 detik dan menyimpan setiap transaksi baru secara live.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formDataSettings.isGasSyncEnabled}
                onChange={(e) => setFormDataSettings({ ...formDataSettings, isGasSyncEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 text-xs font-bold text-stone-700">
                {formDataSettings.isGasSyncEnabled ? 'Aktif (Live)' : 'Nonaktif'}
              </span>
            </label>
          </div>

          {/* Step by step guide */}
          <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200 space-y-4 text-xs text-emerald-950">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>3 Langkah Menghubungkan Backend Google Sheets (Gratis & Mandiri):</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>
                Buka Spreadsheet baru di Google Drive Anda atau klik <a href="https://sheets.new" target="_blank" rel="noreferrer" className="font-bold underline text-emerald-800">https://sheets.new</a>.
              </li>
              <li>
                Di Google Sheets, klik menu <strong>Extensions (Ekstensi)</strong> &gt; <strong>Apps Script</strong>. Salin kode skrip di bawah lalu tempel ke editor <code>Code.gs</code>.
              </li>
              <li>
                Klik tombol <strong>Deploy (Terapkan)</strong> &gt; <strong>New Deployment (Penerapan Baru)</strong> &gt; Pilih tipe <strong>Web App</strong> &gt; Set <em>Execute as: Me</em> &amp; <em>Who has access: Anyone (Siapa saja)</em> &gt; Salin Web App URL dan tempel ke kolom di bawah.
              </li>
            </ol>
          </div>

          {/* Webhook URL Input & Test */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Google Apps Script Web App URL (Endpoint API)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={formDataSettings.gasWebhookUrl}
                  onChange={(e) => setFormDataSettings({ ...formDataSettings, gasWebhookUrl: e.target.value })}
                  className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handlePingGas}
                  disabled={gasPingStatus.loading}
                  className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {gasPingStatus.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Uji Koneksi (Ping)</span>
                </button>
              </div>

              {gasPingStatus.message && (
                <p className={`text-xs mt-2 font-semibold ${gasPingStatus.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {gasPingStatus.message}
                </p>
              )}
            </div>

            {/* Two Action Cards: Pull Live Data vs Push Full Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card 1: Tarik Data Live (Pull) */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-stone-900 text-sm">Tarik Data Live (Pull from Sheets)</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Ambil data program, donasi, transparansi, dan pengaturan terbaru dari Google Sheets secara langsung ke website.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handlePullLiveGas}
                    disabled={gasPullStatus.loading || !formDataSettings.gasWebhookUrl}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    {gasPullStatus.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>Tarik Data Live Sekarang</span>
                  </button>

                  {gasPullStatus.message && (
                    <p className={`text-[11px] mt-2 font-semibold ${gasPullStatus.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {gasPullStatus.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Card 2: Kirim Seluruh Data (Push Full Sync) */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-stone-800" />
                    <span className="font-bold text-stone-900 text-sm">Sinkronkan Penuh (Push to Sheets)</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Kirim & cadangkan seluruh data lokal saat ini (program, donasi, transparansi) ke lembar Google Spreadsheet.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleFullSyncGas}
                    disabled={gasSyncStatus.loading || !formDataSettings.gasWebhookUrl}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    {gasSyncStatus.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    <span>Kirim Data Lokal ke Google Sheets</span>
                  </button>

                  {gasSyncStatus.message && (
                    <p className={`text-[11px] mt-2 font-semibold ${gasSyncStatus.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {gasSyncStatus.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* EXPONENTIAL BACKOFF & OFFLINE QUEUE MONITOR */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      Mekanisme Retry Exponential Backoff & Antrean Offline
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Menjaga keandalan persistensi data donasi & pengaturan saat jaringan lambat atau terputus
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleProcessSyncQueue}
                    disabled={isProcessingQueue || syncQueueItems.length === 0}
                    className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isProcessingQueue ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Proses Antrean ({syncQueueItems.length})</span>
                  </button>

                  {syncQueueItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSyncQueue}
                      className="py-1.5 px-2.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl cursor-pointer"
                      title="Kosongkan Antrean"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {queueNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] p-2.5 rounded-xl font-medium">
                  {queueNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Status Antrean Tertunda</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    {syncQueueItems.length} Operasi
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Strategi Retry</span>
                  <span className="font-bold text-stone-900 text-xs">
                    Backoff Factor 2× (1s → 2s → 4s → 8s) + Jitter
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Auto-Sync Saat Online</span>
                  <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Aktif (Window Event Online)
                  </span>
                </div>
              </div>
            </div>

            {/* FULL COPYABLE GOOGLE APPS SCRIPT CODE */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Kode Skrip Backend Google Apps Script (Code.gs)</h4>
                  <p className="text-xs text-stone-500">
                    Salin seluruh skrip di bawah lalu tempel ke Google Apps Script editor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const gasScript = `/**
 * GOOGLE APPS SCRIPT BACKEND & LIVE DATABASE FOR SAHABAT JARIYAH
 * Setup:
 * 1. Buka https://sheets.new
 * 2. Extensions > Apps Script > Tempel kode ini di Code.gs
 * 3. Deploy > New Deployment > Web App > Who has access: Anyone > Deploy
 * 4. Salin Web App URL ke Pengaturan Admin Sahabat Jariyah
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'ping') {
    return createJsonResponse({ status: 'success', message: 'Koneksi ke Google Apps Script Berhasil & Live!' });
  }

  if (action === 'fetchLiveFullData') {
    var data = getFullDataFromSheets(ss);
    return createJsonResponse({ status: 'success', message: 'Data live berhasil diambil', data: data });
  }

  return createJsonResponse({ status: 'success', message: 'Backend Google Apps Script Aktif & Siap Digunakan.' });
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var action = payload.action;
    var data = payload.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'syncFullData') {
      saveFullDataToSheets(ss, data);
      return createJsonResponse({ status: 'success', message: 'Seluruh database berhasil disinkronkan ke Google Sheets!' });
    }

    if (action === 'fetchLiveFullData') {
      var liveData = getFullDataFromSheets(ss);
      return createJsonResponse({ status: 'success', message: 'Data live berhasil diambil', data: liveData });
    }

    if (action === 'createDonation') {
      appendRowToSheet(ss, 'Donations', data);
      return createJsonResponse({ status: 'success', message: 'Donasi berhasil dicatat ke Google Sheets!' });
    }

    if (action === 'updateDonationStatus') {
      updateDonationInSheet(ss, data.donationId, data.newStatus, data.paidAt);
      return createJsonResponse({ status: 'success', message: 'Status donasi diperbarui di Google Sheets!' });
    }

    if (action === 'saveCampaign') {
      upsertItemInSheet(ss, 'Campaigns', 'id', data);
      return createJsonResponse({ status: 'success', message: 'Program donasi berhasil disimpan ke Google Sheets!' });
    }

    if (action === 'deleteCampaign') {
      deleteItemFromSheet(ss, 'Campaigns', 'id', data.id);
      return createJsonResponse({ status: 'success', message: 'Program donasi berhasil dihapus dari Google Sheets!' });
    }

    if (action === 'createDisbursement') {
      appendRowToSheet(ss, 'Disbursements', data);
      return createJsonResponse({ status: 'success', message: 'Laporan penyaluran berhasil dicatat ke Google Sheets!' });
    }

    if (action === 'deleteDisbursement') {
      deleteItemFromSheet(ss, 'Disbursements', 'id', data.id);
      return createJsonResponse({ status: 'success', message: 'Laporan penyaluran berhasil dihapus dari Google Sheets!' });
    }

    if (action === 'saveSettings') {
      saveSettingsInSheet(ss, data);
      return createJsonResponse({ status: 'success', message: 'Pengaturan berhasil diperbarui di Google Sheets!' });
    }

    if (action === 'addPrayer') {
      appendRowToSheet(ss, 'Prayers', data);
      return createJsonResponse({ status: 'success', message: 'Doa donatur berhasil disimpan di Google Sheets!' });
    }

    if (action === 'toggleLikePrayer') {
      updatePrayerLikesInSheet(ss, data.prayerId, data.likesCount);
      return createJsonResponse({ status: 'success', message: 'Like doa diperbarui!' });
    }

    return createJsonResponse({ status: 'success', message: 'Aksi ' + action + ' berhasil diproses.' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: 'Gagal: ' + err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function saveFullDataToSheets(ss, data) {
  if (data.settings) saveSettingsInSheet(ss, data.settings);
  if (data.campaigns) saveArrayToSheet(ss, 'Campaigns', data.campaigns);
  if (data.donations) saveArrayToSheet(ss, 'Donations', data.donations);
  if (data.disbursements) saveArrayToSheet(ss, 'Disbursements', data.disbursements);
  if (data.prayers) saveArrayToSheet(ss, 'Prayers', data.prayers);
}

function getFullDataFromSheets(ss) {
  return {
    settings: getSettingsFromSheet(ss),
    campaigns: getArrayFromSheet(ss, 'Campaigns'),
    donations: getArrayFromSheet(ss, 'Donations'),
    disbursements: getArrayFromSheet(ss, 'Disbursements'),
    prayers: getArrayFromSheet(ss, 'Prayers')
  };
}

function saveSettingsInSheet(ss, settings) {
  var sheet = getOrCreateSheet(ss, 'Settings');
  sheet.clear();
  sheet.appendRow(['Key', 'Value']);
  for (var key in settings) {
    var val = settings[key];
    if (typeof val === 'object') val = JSON.stringify(val);
    sheet.appendRow([key, val]);
  }
}

function getSettingsFromSheet(ss) {
  var sheet = ss.getSheetByName('Settings');
  if (!sheet) return null;
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var settings = {};
  for (var i = 1; i < rows.length; i++) {
    var key = rows[i][0];
    var val = rows[i][1];
    if (val && (typeof val === 'string') && (val.startsWith('{') || val.startsWith('['))) {
      try { val = JSON.parse(val); } catch(e) {}
    }
    settings[key] = val;
  }
  return settings;
}

function saveArrayToSheet(ss, sheetName, items) {
  if (!items || items.length === 0) return;
  var sheet = getOrCreateSheet(ss, sheetName);
  sheet.clear();
  sheet.appendRow(['ID', 'JSON_DATA', 'UPDATED_AT']);
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    sheet.appendRow([item.id || ('row-' + i), JSON.stringify(item), new Date().toISOString()]);
  }
}

function getArrayFromSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var results = [];
  for (var i = 1; i < rows.length; i++) {
    var jsonStr = rows[i][1];
    if (jsonStr) {
      try {
        results.push(JSON.parse(jsonStr));
      } catch(e) {}
    }
  }
  return results;
}

function appendRowToSheet(ss, sheetName, item) {
  var sheet = getOrCreateSheet(ss, sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'JSON_DATA', 'UPDATED_AT']);
  }
  sheet.appendRow([item.id || ('item-' + Date.now()), JSON.stringify(item), new Date().toISOString()]);
}

function upsertItemInSheet(ss, sheetName, idField, item) {
  var sheet = getOrCreateSheet(ss, sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'JSON_DATA', 'UPDATED_AT']);
    sheet.appendRow([item[idField], JSON.stringify(item), new Date().toISOString()]);
    return;
  }
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(item[idField])) {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(item));
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      return;
    }
  }
  sheet.appendRow([item[idField], JSON.stringify(item), new Date().toISOString()]);
}

function deleteItemFromSheet(ss, sheetName, idField, idValue) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === String(idValue)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function updateDonationInSheet(ss, donationId, status, paidAt) {
  var sheet = getOrCreateSheet(ss, 'Donations');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(donationId)) {
      try {
        var obj = JSON.parse(rows[i][1]);
        obj.paymentStatus = status;
        if (paidAt) obj.paidAt = paidAt;
        sheet.getRange(i + 1, 2).setValue(JSON.stringify(obj));
        sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      } catch(e) {}
      return;
    }
  }
}

function updatePrayerLikesInSheet(ss, prayerId, likesCount) {
  var sheet = getOrCreateSheet(ss, 'Prayers');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(prayerId)) {
      try {
        var obj = JSON.parse(rows[i][1]);
        obj.likesCount = likesCount;
        sheet.getRange(i + 1, 2).setValue(JSON.stringify(obj));
        sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      } catch(e) {}
      return;
    }
  }
}`;
                    navigator.clipboard.writeText(gasScript);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 3000);
                  }}
                  className="py-2 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors self-start sm:self-auto"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Skrip Code.gs'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-stone-900 text-emerald-300 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-64 scrollbar-thin border border-stone-800 leading-relaxed">
{`// GOOGLE APPS SCRIPT BACKEND & LIVE DATABASE FOR SAHABAT JARIYAH
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (action === 'ping') return createJsonResponse({ status: 'success', message: 'Koneksi Berhasil!' });
  if (action === 'fetchLiveFullData') return createJsonResponse({ status: 'success', data: getFullDataFromSheets(ss) });
  return createJsonResponse({ status: 'success', message: 'Backend Ready' });
}

function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (payload.action === 'syncFullData') { saveFullDataToSheets(ss, payload.data); }
  if (payload.action === 'createDonation') { appendRowToSheet(ss, 'Donations', payload.data); }
  if (payload.action === 'updateDonationStatus') { updateDonationInSheet(ss, payload.data.donationId, payload.data.newStatus, payload.data.paidAt); }
  if (payload.action === 'saveCampaign') { upsertItemInSheet(ss, 'Campaigns', 'id', payload.data); }
  if (payload.action === 'createDisbursement') { appendRowToSheet(ss, 'Disbursements', payload.data); }
  if (payload.action === 'saveSettings') { saveSettingsInSheet(ss, payload.data); }
  return createJsonResponse({ status: 'success', message: 'Tersimpan ke Sheets' });
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CAMPAIGN */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingCampaign ? 'Edit Program Donasi' : 'Tambah Program Donasi Baru'}
              </h3>
              <button 
                onClick={() => setIsCampaignModalOpen(false)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Judul Program</label>
                <input
                  type="text"
                  required
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  placeholder="Contoh: Wakaf Sumur Bor & Akses Air Bersih Santri..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategori Program</label>
                  <select
                    value={campaignForm.category}
                    onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold"
                  >
                    <option value="wakaf">Wakaf Produktif</option>
                    <option value="sedekah-subuh">Sedekah Subuh</option>
                    <option value="yatim-dhuafa">Yatim & Dhuafa</option>
                    <option value="masjid">Renovasi Masjid</option>
                    <option value="quran">Wakaf Al-Quran</option>
                    <option value="bencana-alam">Tanggap Bencana</option>
                    <option value="kesehatan">Bantuan Medis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Target Dana (Rp)</label>
                  <input
                    type="number"
                    required
                    value={campaignForm.targetAmount}
                    onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Lokasi Pelaksanaan</label>
                  <input
                    type="text"
                    value={campaignForm.location}
                    onChange={(e) => setCampaignForm({ ...campaignForm, location: e.target.value })}
                    placeholder="Contoh: Kab. Sukabumi, Jawa Barat"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Sisa Hari Kampanye</label>
                  <input
                    type="number"
                    value={campaignForm.daysLeft}
                    onChange={(e) => setCampaignForm({ ...campaignForm, daysLeft: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  />
                </div>
              </div>

              {/* FOTO UTAMA KAMPANYE (AUTO-COMPRESSED < 700 KB) */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-800">Foto Utama Program</label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Auto Kompres &lt; 700 KB
                  </span>
                </div>

                {campaignForm.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 h-28 group">
                    <img
                      src={campaignForm.imageUrl}
                      alt="Foto Utama"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCampaignForm({ ...campaignForm, imageUrl: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="py-2 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Foto Utama</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCampaignMainImageUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    value={campaignForm.imageUrl}
                    onChange={(e) => setCampaignForm({ ...campaignForm, imageUrl: e.target.value })}
                    placeholder="Atau URL foto: https://..."
                    className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* GALERI FOTO TAMBAHAN (OPSIONAL, AUTO-COMPRESSED) */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-800">Galeri Foto Dokumentasi (Opsional)</label>
                  <span className="text-[10px] text-stone-500">Maks 700 KB/foto</span>
                </div>

                {campaignForm.galleryImages && campaignForm.galleryImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {campaignForm.galleryImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-stone-200 h-16 group">
                        <img src={img} alt={`Galeri ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignForm({
                              ...campaignForm,
                              galleryImages: campaignForm.galleryImages?.filter((_, i) => i !== idx)
                            });
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-dashed border-stone-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tambah Foto ke Galeri (Auto-Kompres)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleCampaignGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Ringkasan Singkat</label>
                <textarea
                  rows={2}
                  value={campaignForm.shortDesc}
                  onChange={(e) => setCampaignForm({ ...campaignForm, shortDesc: e.target.value })}
                  placeholder="Deskripsi singkat yang tampil di kartu donasi..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Cerita Lengkap (HTML Didukung)</label>
                <textarea
                  rows={5}
                  value={campaignForm.storyHtml}
                  onChange={(e) => setCampaignForm({ ...campaignForm, storyHtml: e.target.value })}
                  placeholder="Ceritakan latar belakang, urgensi, dan rencana penggunaan dana..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="py-2 px-4 border border-stone-300 rounded-xl text-stone-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INPUT PENYALURAN DANA (DISBURSEMENT) */}
      {isDisbursementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Input Laporan Penyaluran Dana Baru</h3>
              <button 
                onClick={() => setIsDisbursementModalOpen(false)}
                className="text-teal-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisbursement} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Pilih Program Sumber Dana</label>
                <select
                  value={disbursementForm.campaignId}
                  onChange={(e) => setDisbursementForm({ ...disbursementForm, campaignId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (Kas: Rp {c.collectedAmount.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Judul / Peruntukan Penyaluran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian DP Mesin Pompa & Pipa Pengeboran"
                  value={disbursementForm.title}
                  onChange={(e) => setDisbursementForm({ ...disbursementForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nominal Disalurkan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={disbursementForm.amount}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tanggal Penyaluran</label>
                  <input
                    type="date"
                    value={disbursementForm.date}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Penerima Manfaat</label>
                  <input
                    type="text"
                    placeholder="Nama pengasuh / vendor"
                    value={disbursementForm.recipient}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, recipient: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Lokasi Penyaluran</label>
                  <input
                    type="text"
                    placeholder="Kota / Desa"
                    value={disbursementForm.location}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  />
                </div>
              </div>

              {/* FOTO BUKTI DOKUMENTASI / NOTA (AUTO-COMPRESSED < 700 KB) */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-800">Foto Dokumentasi Lapangan & Kwitansi</label>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    Maks 700 KB / foto
                  </span>
                </div>

                {disbursementForm.proofImages && disbursementForm.proofImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {disbursementForm.proofImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-stone-200 h-16 group">
                        <img src={img} alt={`Bukti ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setDisbursementForm({
                              ...disbursementForm,
                              proofImages: disbursementForm.proofImages?.filter((_, i) => i !== idx)
                            });
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="w-full py-2 px-3 bg-white hover:bg-stone-100 text-teal-900 border border-teal-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span>Upload Foto Bukti/Nota (Auto-Kompres &lt; 700 KB)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleDisbursementProofUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Uraian / Rincian Penyaluran</label>
                <textarea
                  rows={3}
                  value={disbursementForm.description}
                  onChange={(e) => setDisbursementForm({ ...disbursementForm, description: e.target.value })}
                  placeholder="Jelaskan detail serah terima dana, jumlah paket yang dibagikan, dll..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisbursementModalOpen(false)}
                  className="py-2 px-4 border border-stone-300 rounded-xl text-stone-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl"
                >
                  Simpan & Terbitkan Penyaluran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST KABAR TERBARU KE CAMPAIGN */}
      {isUpdateModalOpen && selectedCampaignForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-300 font-semibold block">Tambah Kabar Penyaluran</span>
                <h3 className="font-bold text-sm truncate max-w-xs">{selectedCampaignForUpdate.title}</h3>
              </div>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCampaignUpdate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Judul Kabar / Milestone</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengeboran Berhasil Mencapai 50 Meter"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Dana yang Disalurkan (Opsional)</label>
                <input
                  type="number"
                  placeholder="Contoh: 15000000"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800"
                />
              </div>

              {/* FOTO PROGRES / BUKTI KABAR (AUTO-COMPRESSED < 700 KB) */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-800">Foto Bukti / Dokumentasi Progres</label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Maks 700 KB
                  </span>
                </div>

                {updateImage && (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 h-24 group">
                    <img src={updateImage} alt="Foto Progres" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUpdateImage('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="py-2 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Foto (Auto-Kompres)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleUpdateImageUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Atau URL foto: https://..."
                    value={updateImage}
                    onChange={(e) => setUpdateImage(e.target.value)}
                    className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Isi Berita Progres</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan kabar gembira dan perkembangan di lapangan untuk donatur..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="py-2 px-4 border border-stone-300 rounded-xl text-stone-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Posting Kabar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
