export type CampaignCategory = 
  | 'semua'
  | 'wakaf'
  | 'sedekah-subuh'
  | 'masjid'
  | 'pendidikan'
  | 'yatim-dhuafa'
  | 'bencana-alam'
  | 'kesehatan'
  | 'quran';

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  date: string;
  content: string;
  imageUrl?: string;
  disbursedAmount?: number;
  author: string;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  category: CampaignCategory;
  shortDesc: string;
  storyHtml: string;
  targetAmount: number;
  collectedAmount: number;
  donorCount: number;
  daysLeft: number;
  endDate: string;
  imageUrl: string;
  galleryImages: string[];
  organizer: {
    name: string;
    isVerified: boolean;
    avatarUrl: string;
    badge: string;
  };
  isVerified: boolean;
  isFeatured: boolean;
  status: 'active' | 'completed' | 'urgent';
  location: string;
  createdAt: string;
  updates: CampaignUpdate[];
}

export type PaymentMethodType = 'qris' | 'va' | 'ewallet' | 'transfer' | 'gateway' | 'cstore';

export interface PaymentChannel {
  id: string;
  name: string;
  type: PaymentMethodType;
  category?: 'qris' | 'va' | 'ewallet' | 'transfer' | 'cstore';
  gatewayProvider?: 'midtrans' | 'xendit' | 'tripay' | 'duitku' | 'direct';
  logo: string;
  accountNumber?: string;
  accountHolder?: string;
  fee: number;
  badge?: string;
  instructions: string[];
}

export interface Donation {
  id: string;
  invoiceCode: string;
  campaignId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  isAnonymous: boolean;
  amount: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentChannelId: string;
  paymentChannelName: string;
  paymentStatus: 'pending' | 'success' | 'expired' | 'failed';
  doa?: string;
  createdAt: string;
  paidAt?: string;
  paymentDetails: {
    vaNumber?: string;
    qrisUrl?: string;
    qrString?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    transferProofUrl?: string;
    gatewayRef?: string;
    checkoutUrl?: string;
  };
}

export interface Disbursement {
  id: string;
  receiptNumber: string;
  campaignId: string;
  campaignTitle: string;
  category: CampaignCategory;
  title: string;
  amount: number;
  date: string;
  recipient: string;
  location: string;
  description: string;
  proofImages: string[];
  status: 'verified' | 'in_progress';
  verifiedBy: string;
  auditNotes?: string;
}

export interface BankAccountConfig {
  id: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
  logo: string;
}

export interface AppSettings {
  appName: string;
  appTagline: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  qrisStaticUrl: string;
  qrisImageUrl?: string;
  qrisNmid?: string;
  qrisMerchantName?: string;
  isPaymentGatewayEnabled?: boolean;
  activePaymentGateway?: 'midtrans' | 'xendit' | 'tripay' | 'duitku' | 'manual';
  paymentGatewayMode?: 'sandbox' | 'production';
  midtransClientKey?: string;
  midtransServerKey?: string;
  midtransMerchantId?: string;
  xenditPublicKey?: string;
  xenditSecretKey?: string;
  xenditWebhookToken?: string;
  tripayApiKey?: string;
  tripayPrivateKey?: string;
  tripayMerchantCode?: string;
  duitkuMerchantCode?: string;
  duitkuApiKey?: string;
  enabledPaymentChannels?: string[];
  gasWebhookUrl: string;
  isGasSyncEnabled: boolean;
  aboutText: string;
  operationalDeductionPercent?: number;
  bankAccounts: BankAccountConfig[];
  adminPin: string;
  whatsappNumber: string;
  whatsappGreeting: string;
  whatsappPopupEnabled: boolean;
  whatsappAutoNotifyAdmin: boolean;
  faviconUrl?: string;
  pwaIcon192Url?: string;
  pwaIcon512Url?: string;
  appleTouchIconUrl?: string;
}

export interface DonorPrayer {
  id: string;
  donationId: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
  doa: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  campaignId: string;
  donorName: string;
  donorPhone: string;
  message: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
}
