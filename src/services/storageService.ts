import { AppSettings, Campaign, Disbursement, Donation, DonorPrayer } from '../types';
import { DEFAULT_SETTINGS, INITIAL_CAMPAIGNS, INITIAL_DISBURSEMENTS, INITIAL_PRAYERS } from '../data/mockData';

const STORAGE_KEYS = {
  SETTINGS: 'sj_settings_v1',
  CAMPAIGNS: 'sj_campaigns_v1',
  DONATIONS: 'sj_donations_v1',
  DISBURSEMENTS: 'sj_disbursements_v1',
  PRAYERS: 'sj_prayers_v1',
  SYNC_QUEUE: 'sj_sync_queue_v1'
};

export interface QueuedSyncItem {
  id: string;
  action: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: number;
  lastError?: string;
  createdAt: string;
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 4,
  initialDelayMs: 1000,
  maxDelayMs: 16000,
  backoffFactor: 2
};

/**
 * Executes an async operation with exponential backoff and randomized jitter.
 */
async function executeWithExponentialBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let attempt = 0;

  while (true) {
    try {
      return await fn(attempt);
    } catch (err: any) {
      attempt++;
      if (attempt > config.maxRetries) {
        throw err;
      }
      // Exponential delay: initialDelay * factor^(attempt - 1) + randomized jitter
      const rawDelay = config.initialDelayMs * Math.pow(config.backoffFactor, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      const delay = Math.min(rawDelay + jitter, config.maxDelayMs);
      
      console.warn(`[Sync] Operation failed (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms...`, err?.message || err);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Initial Seed Donations
const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-01',
    invoiceCode: 'INV-SJ-20260821-001',
    campaignId: 'cmp-01',
    campaignTitle: 'Wakaf Sumur Bor & Akses Air Bersih Santri Pelosok NTT',
    donorName: 'Hamba Allah',
    donorEmail: 'donatur@gmail.com',
    donorPhone: '081299887766',
    isAnonymous: true,
    amount: 500000,
    uniqueCode: 124,
    totalAmount: 500124,
    paymentMethod: 'qris',
    paymentChannelId: 'qris_gopay',
    paymentChannelName: 'QRIS Real-Time',
    paymentStatus: 'success',
    doa: 'Bismillah, niat wakaf atas nama almarhum ayahanda H. Soekarno bin Kartodirjo. Semoga menjadi amal jariyah yang mengalirkan kesejukan di alam barzakh.',
    createdAt: '2026-08-21T09:12:00.000Z',
    paidAt: '2026-08-21T09:12:45.000Z',
    paymentDetails: {
      qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SAHABAT_JARIYAH_DON_01'
    }
  },
  {
    id: 'don-02',
    invoiceCode: 'INV-SJ-20260821-002',
    campaignId: 'cmp-02',
    campaignTitle: 'Sedekah Subuh Pangan & Beasiswa 100 Yatim Penghafal Quran',
    donorName: 'Keluarga Rizky Pratama',
    donorEmail: 'rizky.p@gmail.com',
    donorPhone: '081388776655',
    isAnonymous: false,
    amount: 250000,
    uniqueCode: 489,
    totalAmount: 250489,
    paymentMethod: 'va',
    paymentChannelId: 'va_bsi',
    paymentChannelName: 'BSI Virtual Account',
    paymentStatus: 'success',
    doa: 'Ya Allah, berkahilah rezeki keluarga kami di waktu subuh ini. Lancarkan ikhtiar kami dan mudahkan kelahiran anak pertama kami.',
    createdAt: '2026-08-21T06:45:00.000Z',
    paidAt: '2026-08-21T06:46:12.000Z',
    paymentDetails: {
      vaNumber: '8880-9988-1234-5678'
    }
  },
  {
    id: 'don-03',
    invoiceCode: 'INV-SJ-20260820-003',
    campaignId: 'cmp-04',
    campaignTitle: 'Renovasi Masjid Tua Al-Barakah yang Nyaris Roboh Tergerus Erosi',
    donorName: 'Siti Nurhaliza',
    donorEmail: 'siti.n@yahoo.com',
    donorPhone: '085711223344',
    isAnonymous: false,
    amount: 1000000,
    uniqueCode: 312,
    totalAmount: 1000312,
    paymentMethod: 'transfer',
    paymentChannelId: 'transfer_bsi',
    paymentChannelName: 'Transfer BSI',
    paymentStatus: 'success',
    doa: 'Semoga renovasi rumah Allah ini lekas selesai dan jamaah bisa sholat berjamaah dengan nyaman dan aman tanpa rasa takut.',
    createdAt: '2026-08-20T21:10:00.000Z',
    paidAt: '2026-08-20T21:30:00.000Z',
    paymentDetails: {
      bankName: 'Bank Syariah Indonesia (BSI)',
      accountNumber: '711-2233-445',
      accountHolder: 'Yayasan Sahabat Jariyah Indonesia'
    }
  }
];

export const storageService = {
  // Settings
  getSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
        this.syncToGas('saveSettings', settings);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Campaigns
  getCampaigns(): Campaign[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load campaigns:', e);
    }
    this.saveCampaigns(INITIAL_CAMPAIGNS);
    return INITIAL_CAMPAIGNS;
  },

  saveCampaigns(campaigns: Campaign[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {
      console.error('Failed to save campaigns:', e);
    }
  },

  getCampaignById(id: string): Campaign | undefined {
    const campaigns = this.getCampaigns();
    return campaigns.find(c => c.id === id || c.slug === id);
  },

  upsertCampaign(campaign: Campaign): void {
    const campaigns = this.getCampaigns();
    const index = campaigns.findIndex(c => c.id === campaign.id);
    let updated: Campaign[];
    if (index >= 0) {
      updated = [...campaigns];
      updated[index] = campaign;
    } else {
      updated = [campaign, ...campaigns];
    }
    this.saveCampaigns(updated);

    const settings = this.getSettings();
    if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
      this.syncToGas('saveCampaign', campaign);
    }
  },

  deleteCampaign(id: string): void {
    const campaigns = this.getCampaigns().filter(c => c.id !== id);
    this.saveCampaigns(campaigns);

    const settings = this.getSettings();
    if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
      this.syncToGas('deleteCampaign', { id });
    }
  },

  // Donations
  getDonations(): Donation[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load donations:', e);
    }
    this.saveDonations(INITIAL_DONATIONS);
    return INITIAL_DONATIONS;
  },

  saveDonations(donations: Donation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    } catch (e) {
      console.error('Failed to save donations:', e);
    }
  },

  createDonation(donation: Donation): Donation {
    const donations = this.getDonations();
    const updatedDonations = [donation, ...donations];
    this.saveDonations(updatedDonations);

    // If success, increment campaign collected amount
    if (donation.paymentStatus === 'success') {
      this.applyDonationToCampaign(donation.campaignId, donation.amount);
    }

    // If prayer attached, save to prayers
    if (donation.doa && donation.doa.trim()) {
      this.addPrayer({
        id: 'pry-' + Date.now(),
        donationId: donation.id,
        donorName: donation.isAnonymous ? 'Hamba Allah' : donation.donorName,
        campaignTitle: donation.campaignTitle,
        amount: donation.amount,
        doa: donation.doa,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false
      });
    }

    const settings = this.getSettings();
    if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
      this.syncToGas('createDonation', donation);
    }

    return donation;
  },

  updateDonationStatus(donationId: string, status: 'pending' | 'success' | 'expired' | 'failed', paidAt?: string): void {
    const donations = this.getDonations();
    const donation = donations.find(d => d.id === donationId);
    if (!donation) return;

    const previousStatus = donation.paymentStatus;
    donation.paymentStatus = status;
    if (status === 'success') {
      donation.paidAt = paidAt || new Date().toISOString();
      if (previousStatus !== 'success') {
        this.applyDonationToCampaign(donation.campaignId, donation.amount);
      }
    }
    this.saveDonations([...donations]);

    const settings = this.getSettings();
    if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
      this.syncToGas('updateDonationStatus', { donationId, newStatus: status, paidAt: donation.paidAt });
    }
  },

  applyDonationToCampaign(campaignId: string, amount: number): void {
    const campaigns = this.getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.collectedAmount += amount;
      campaign.donorCount += 1;
      this.saveCampaigns([...campaigns]);
    }
  },

  // Disbursements (Penyaluran Dana Transparansi)
  getDisbursements(): Disbursement[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load disbursements:', e);
    }
    this.saveDisbursements(INITIAL_DISBURSEMENTS);
    return INITIAL_DISBURSEMENTS;
  },

  saveDisbursements(disbursements: Disbursement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(disbursements));
    } catch (e) {
      console.error('Failed to save disbursements:', e);
    }
  },

  createDisbursement(disbursement: Disbursement): void {
    const current = this.getDisbursements();
    this.saveDisbursements([disbursement, ...current]);

    // Also add to campaign updates if applicable
    const campaigns = this.getCampaigns();
    const campaign = campaigns.find(c => c.id === disbursement.campaignId);
    if (campaign) {
      const newUpdate = {
        id: 'upd-' + Date.now(),
        campaignId: campaign.id,
        title: disbursement.title,
        date: disbursement.date,
        content: `Telah disalurkan dana sebesar Rp ${disbursement.amount.toLocaleString('id-ID')} kepada ${disbursement.recipient} di ${disbursement.location}. ${disbursement.description}`,
        imageUrl: disbursement.proofImages[0] || '',
        disbursedAmount: disbursement.amount,
        author: disbursement.verifiedBy || 'Tim Penyaluran Sahabat Jariyah'
      };
      campaign.updates = [newUpdate, ...(campaign.updates || [])];
      this.saveCampaigns([...campaigns]);
    }

    const settings = this.getSettings();
    if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
      this.syncToGas('createDisbursement', disbursement);
    }
  },

  deleteDisbursement(id: string): void {
    const updated = this.getDisbursements().filter(d => d.id !== id);
    this.saveDisbursements(updated);

    const settings = this.getSettings();
    if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
      this.syncToGas('deleteDisbursement', { id });
    }
  },

  // Prayers
  getPrayers(): DonorPrayer[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRAYERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load prayers:', e);
    }
    this.savePrayers(INITIAL_PRAYERS);
    return INITIAL_PRAYERS;
  },

  savePrayers(prayers: DonorPrayer[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(prayers));
    } catch (e) {
      console.error('Failed to save prayers:', e);
    }
  },

  addPrayer(prayer: DonorPrayer): void {
    const prayers = this.getPrayers();
    this.savePrayers([prayer, ...prayers]);

    const settings = this.getSettings();
    if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
      this.syncToGas('addPrayer', prayer);
    }
  },

  toggleLikePrayer(prayerId: string): void {
    const prayers = this.getPrayers();
    const prayer = prayers.find(p => p.id === prayerId);
    if (prayer) {
      if (prayer.isLiked) {
        prayer.likesCount = Math.max(0, prayer.likesCount - 1);
        prayer.isLiked = false;
      } else {
        prayer.likesCount += 1;
        prayer.isLiked = true;
      }
      this.savePrayers([...prayers]);

      const settings = this.getSettings();
      if (settings.isGasSyncEnabled && settings.gasWebhookUrl) {
        this.syncToGas('toggleLikePrayer', { prayerId, likesCount: prayer.likesCount, isLiked: prayer.isLiked });
      }
    }
  },

  // Analytics & Summary
  getFinancialSummary() {
    const campaigns = this.getCampaigns();
    const disbursements = this.getDisbursements();
    const donations = this.getDonations();

    const totalCollected = campaigns.reduce((acc, c) => acc + c.collectedAmount, 0);
    const totalDisbursed = disbursements.reduce((acc, d) => acc + d.amount, 0);
    const remainingBalance = Math.max(0, totalCollected - totalDisbursed);
    const totalDonors = campaigns.reduce((acc, c) => acc + c.donorCount, 0);
    const successfulDonationsCount = donations.filter(d => d.paymentStatus === 'success').length;
    const pendingDonationsCount = donations.filter(d => d.paymentStatus === 'pending').length;

    return {
      totalCollected,
      totalDisbursed,
      remainingBalance,
      totalDonors,
      activeCampaignsCount: campaigns.filter(c => c.status === 'active' || c.status === 'urgent').length,
      successfulDonationsCount,
      pendingDonationsCount,
      disbursementPercentage: totalCollected > 0 ? Math.min(100, Math.round((totalDisbursed / totalCollected) * 100)) : 0
    };
  },

  // Google Apps Script API Bridge & Exponential Backoff Sync
  getSyncQueue(): QueuedSyncItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load sync queue:', e);
    }
    return [];
  },

  saveSyncQueue(queue: QueuedSyncItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save sync queue:', e);
    }
  },

  enqueueSyncItem(action: string, data: any, lastError?: string): void {
    const queue = this.getSyncQueue();
    // Avoid duplicate queue items for identical action and ID
    const existingIndex = queue.findIndex(q => q.action === action && JSON.stringify(q.data?.id || q.data) === JSON.stringify(data?.id || data));
    const item: QueuedSyncItem = {
      id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      action,
      data,
      attempts: existingIndex >= 0 ? queue[existingIndex].attempts + 1 : 1,
      maxAttempts: 5,
      nextRetryAt: Date.now() + 2000,
      lastError: lastError || 'Koneksi terputus / jaringan tidak stabil',
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      queue[existingIndex] = item;
    } else {
      queue.push(item);
    }
    this.saveSyncQueue(queue);
    console.info(`[SyncQueue] Enqueued item '${action}' for reliable background persistence.`);
  },

  async processSyncQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
    const queue = this.getSyncQueue();
    if (queue.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const settings = this.getSettings();
    if (!settings.gasWebhookUrl || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return { processed: 0, succeeded: 0, failed: queue.length };
    }

    let succeeded = 0;
    let failed = 0;
    const remainingQueue: QueuedSyncItem[] = [];

    for (const item of queue) {
      if (Date.now() < item.nextRetryAt) {
        remainingQueue.push(item);
        continue;
      }

      try {
        await executeWithExponentialBackoff(
          async () => {
            const response = await fetch(settings.gasWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: item.action, data: item.data })
            });
            if (!response.ok) {
              throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }
            const resJson = await response.json();
            if (resJson.status !== 'success') {
              throw new Error(resJson.message || 'Sinkronisasi ditolak oleh server');
            }
            return resJson;
          },
          { maxRetries: 2, initialDelayMs: 800, backoffFactor: 2 }
        );

        succeeded++;
        console.info(`[SyncQueue] Successfully flushed queued item ${item.action} (${item.id})`);
      } catch (err: any) {
        failed++;
        const nextAttempts = item.attempts + 1;
        if (nextAttempts <= item.maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, nextAttempts) + Math.random() * 500, 60000);
          remainingQueue.push({
            ...item,
            attempts: nextAttempts,
            nextRetryAt: Date.now() + delay,
            lastError: err?.message || 'Gagal tersambung'
          });
        } else {
          console.error(`[SyncQueue] Item ${item.action} (${item.id}) dropped after reaching max attempts (${item.maxAttempts})`);
        }
      }
    }

    this.saveSyncQueue(remainingQueue);
    return { processed: succeeded + failed, succeeded, failed };
  },

  clearSyncQueue(): void {
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  },

  async syncToGas(action: string, data: any, retryOptions?: RetryOptions): Promise<{ success: boolean; message: string }> {
    const settings = this.getSettings();
    if (!settings.gasWebhookUrl) {
      return { success: false, message: 'Google Apps Script Webhook URL belum diisi.' };
    }

    // If browser is explicitly offline, immediately queue for later without hanging
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.enqueueSyncItem(action, data, 'Perangkat sedang offline');
      return { success: false, message: 'Sedang offline: Data disimpan lokal & dijadwalkan untuk sinkronisasi otomatis.' };
    }

    try {
      const resJson = await executeWithExponentialBackoff(
        async (attempt) => {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller ? setTimeout(() => controller.abort(), 12000) : null;

          try {
            const response = await fetch(settings.gasWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action, data }),
              signal: controller?.signal
            });

            if (timeoutId) clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`Server returned HTTP ${response.status} ${response.statusText}`);
            }

            const json = await response.json();
            if (json.status !== 'success') {
              throw new Error(json.message || 'Server merespons status non-success');
            }
            return json;
          } catch (fetchErr: any) {
            if (timeoutId) clearTimeout(timeoutId);
            throw fetchErr;
          }
        },
        retryOptions || { maxRetries: 3, initialDelayMs: 1000, backoffFactor: 2, maxDelayMs: 8000 }
      );

      // Trigger background sync for any other pending queue items if connection is healthy
      this.processSyncQueue().catch(() => {});

      return { success: true, message: resJson.message || 'Sinkronisasi berhasil' };
    } catch (err: any) {
      console.warn(`[Sync] All exponential backoff retries failed for '${action}'. Persisting to offline queue:`, err?.message || err);
      this.enqueueSyncItem(action, data, err?.message);
      return { 
        success: false, 
        message: 'Gagal menghubungkan ke Google Apps Script setelah beberapa percobaan. Data telah diantrekan untuk sinkronisasi otomatis: ' + (err?.message || '')
      };
    }
  },

  async pingGasWebhook(url: string): Promise<{ success: boolean; message: string }> {
    if (!url) return { success: false, message: 'URL tidak boleh kosong.' };
    try {
      const targetUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
      const resJson = await executeWithExponentialBackoff(
        async () => {
          const response = await fetch(targetUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return await response.json();
        },
        { maxRetries: 2, initialDelayMs: 600, backoffFactor: 2 }
      );

      if (resJson.status === 'success') {
        return { success: true, message: resJson.message || 'Koneksi ke Google Apps Script Berhasil!' };
      }
      return { success: false, message: 'Respon gagal: ' + (resJson.message || 'Format tidak cocok') };
    } catch (e: any) {
      return { success: false, message: 'Koneksi gagal diperiksa: ' + e.message + '. Pastikan hak akses Web App diset ke Anyone.' };
    }
  },

  async fullSyncToGas(): Promise<{ success: boolean; message: string }> {
    const payload = {
      settings: this.getSettings(),
      campaigns: this.getCampaigns(),
      donations: this.getDonations(),
      disbursements: this.getDisbursements(),
      prayers: this.getPrayers()
    };
    return this.syncToGas('syncFullData', payload, { maxRetries: 4, initialDelayMs: 1500, backoffFactor: 2 });
  },

  async fetchLiveFromGas(urlOverride?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const settings = this.getSettings();
    const url = urlOverride || settings.gasWebhookUrl;
    if (!url) {
      return { success: false, message: 'Google Apps Script Webhook URL belum diisi.' };
    }

    try {
      const targetUrl = url.includes('?') ? `${url}&action=fetchLiveFullData` : `${url}?action=fetchLiveFullData`;
      const resJson = await executeWithExponentialBackoff(
        async () => {
          const response = await fetch(targetUrl, {
            method: 'GET'
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        },
        { maxRetries: 3, initialDelayMs: 800, backoffFactor: 2 }
      );

      if (resJson && resJson.status === 'success' && resJson.data) {
        const { campaigns, donations, disbursements, prayers, settings: remoteSettings } = resJson.data;
        if (campaigns && Array.isArray(campaigns) && campaigns.length > 0) {
          this.saveCampaigns(campaigns);
        }
        if (donations && Array.isArray(donations) && donations.length > 0) {
          this.saveDonations(donations);
        }
        if (disbursements && Array.isArray(disbursements) && disbursements.length > 0) {
          this.saveDisbursements(disbursements);
        }
        if (prayers && Array.isArray(prayers) && prayers.length > 0) {
          this.savePrayers(prayers);
        }
        if (remoteSettings && typeof remoteSettings === 'object') {
          // Keep local webhook credentials and sync preference
          const merged = { 
            ...remoteSettings, 
            gasWebhookUrl: settings.gasWebhookUrl, 
            isGasSyncEnabled: settings.isGasSyncEnabled 
          };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        }

        return { 
          success: true, 
          message: 'Data live berhasil disinkronkan secara real-time dari Google Sheets!', 
          data: resJson.data 
        };
      }
      return { success: false, message: resJson?.message || 'Data live tidak ditemukan di Google Sheets.' };
    } catch (err: any) {
      return { success: false, message: 'Gagal mengambil data live dari Google Apps Script: ' + (err?.message || err) };
    }
  },

  resetToInitial(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.DISBURSEMENTS);
    localStorage.removeItem(STORAGE_KEYS.PRAYERS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  }
};

// Global Online Listener to automatically flush pending sync queue when internet reconnects
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.info('[Network] Device is online. Flushing pending storageService sync queue...');
    storageService.processSyncQueue().catch(err => {
      console.warn('[Network] Error during background queue sync:', err);
    });
  });
}
