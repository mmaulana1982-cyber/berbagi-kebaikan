import { AppSettings, Campaign, Disbursement, DonorPrayer, PaymentChannel } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Sahabat Jariyah',
  appTagline: 'Alirkan Kebaikan, Abadikan Keberkahan Jariyah',
  logoUrl: '', // When empty, the app renders a clean Islamic-geometric SVG wordmark logo
  heroTitle: 'Salurkan Sedekah & Wakaf Terbaik untuk Umat',
  heroSubtitle: 'Platform donasi terpercaya dengan sistem pembayaran digital instan dan dasbor transparansi penyaluran dana 100% terbuka secara real-time.',
  heroBannerUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1600&q=80',
  contactEmail: 'salam@sahabatjariyah.id',
  contactPhone: '+62 812-3456-7890',
  contactAddress: 'Gedung Filantropi Sahabat Jariyah Lt. 3, Jl. Margonda Raya No. 88, Depok, Jawa Barat',
  qrisStaticUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226580014ID.GO.QRIS.WWW01189360099800000000000210000000000000003033605802ID5915SAHABAT_JARIYAH6005DEPOK62070703A01630489AB',
  qrisImageUrl: '',
  qrisNmid: 'ID1020038849201',
  qrisMerchantName: 'YAYASAN SAHABAT JARIYAH',
  isPaymentGatewayEnabled: true,
  activePaymentGateway: 'midtrans',
  paymentGatewayMode: 'sandbox',
  midtransClientKey: 'SB-Mid-client-demo12345678',
  midtransServerKey: 'SB-Mid-server-demo87654321',
  midtransMerchantId: 'G123456789',
  xenditPublicKey: 'xnd_public_development_123456',
  xenditSecretKey: 'xnd_development_secret_876543',
  tripayApiKey: 'DEV-TRIPAY-API-KEY',
  tripayMerchantCode: 'T1234',
  duitkuMerchantCode: 'D1234',
  duitkuApiKey: 'duitku-demo-api-key',
  gasWebhookUrl: '',
  isGasSyncEnabled: false,
  aboutText: 'Sahabat Jariyah adalah wadah crowdfunding dan filantropi Islam modern yang berfokus pada penyaluran wakaf produktif, sedekah jariyah, renovasi rumah ibadah, pembagian mushaf Al-Quran ke pelosok nusantara, serta program santunan yatim dan dhuafa. Seluruh penyaluran dilaporkan dengan nota pertanggungjawaban terbuka dan foto dokumentasi lapangan.',
  operationalDeductionPercent: 0,
  adminPin: '123456',
  whatsappNumber: '6281234567890',
  whatsappGreeting: 'Assalamu’alaikum Warahmatullahi Wabarakatuh! Ada yang bisa kami bantu seputar program donasi jariyah, konfirmasi pembayaran donasi, atau konsultasi zakat & wakaf?',
  whatsappPopupEnabled: true,
  whatsappAutoNotifyAdmin: true,
  bankAccounts: [
    {
      id: 'bsi',
      bank: 'Bank Syariah Indonesia (BSI)',
      accountNumber: '711-2233-445',
      accountHolder: 'Yayasan Sahabat Jariyah Indonesia',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg'
    },
    {
      id: 'bca',
      bank: 'Bank Central Asia (BCA)',
      accountNumber: '883-0912-341',
      accountHolder: 'Yayasan Sahabat Jariyah',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg'
    },
    {
      id: 'mandiri',
      bank: 'Bank Mandiri',
      accountNumber: '157-00-9876543-1',
      accountHolder: 'Yayasan Sahabat Jariyah',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg'
    },
    {
      id: 'bri',
      bank: 'Bank BRI',
      accountNumber: '0206-01-002345-30-8',
      accountHolder: 'Yayasan Sahabat Jariyah',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg'
    }
  ]
};

export const PAYMENT_CHANNELS: PaymentChannel[] = [
  {
    id: 'qris_all',
    name: 'QRIS (GoPay, OVO, DANA, BCA, Semua Bank)',
    type: 'qris',
    category: 'qris',
    gatewayProvider: 'direct',
    badge: 'Paling Populer & Instan',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    fee: 0,
    instructions: [
      'Buka aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay) atau Mobile Banking favorit Anda.',
      'Pilih menu Scan / Bayar QRIS pada aplikasi.',
      'Arahkan kamera ke kode QRIS dinamis yang muncul di layar.',
      'Periksa nominal yang tertera dan konfirmasi pembayaran dengan PIN Anda.',
      'Donasi Anda akan otomatis terverifikasi dalam hitungan detik!'
    ]
  },
  {
    id: 'va_bsi',
    name: 'BSI Virtual Account',
    type: 'va',
    category: 'va',
    gatewayProvider: 'midtrans',
    badge: 'Syariah Otomatis',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg',
    accountNumber: '8880-9988-1234-5678',
    fee: 0,
    instructions: [
      'Buka aplikasi BSI Mobile atau ATM BSI.',
      'Pilih menu Pembayaran / Bayar > Institusi / Virtual Account.',
      'Masukkan nomor Virtual Account BSI: 8880-9988-1234-5678.',
      'Konfirmasi rincian pembayaran dan masukkan PIN transaksi.',
      'Sistem memverifikasi donasi secara otomatis.'
    ]
  },
  {
    id: 'va_bca',
    name: 'BCA Virtual Account',
    type: 'va',
    category: 'va',
    gatewayProvider: 'midtrans',
    badge: 'Instant 24 Jam',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
    accountNumber: '1182-0891-2345-6789',
    fee: 0,
    instructions: [
      'Buka aplikasi BCA Mobile / myBCA / KlikBCA.',
      'Pilih menu m-Transfer > BCA Virtual Account.',
      'Masukkan nomor BCA Virtual Account: 1182-0891-2345-6789.',
      'Periksa nominal donasi dan konfirmasi dengan PIN m-BCA.',
      'Sistem akan memverifikasi pembayaran secara otomatis.'
    ]
  },
  {
    id: 'va_mandiri',
    name: 'Mandiri Virtual Account (Livin)',
    type: 'va',
    category: 'va',
    gatewayProvider: 'midtrans',
    badge: 'Instant Otomatis',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
    accountNumber: '8902-2145-6789-0123',
    fee: 0,
    instructions: [
      'Buka aplikasi Livin by Mandiri.',
      'Pilih menu Bayar > Buat Pembayaran Baru > Multipayment / Virtual Account.',
      'Masukkan nomor VA Mandiri Sahabat Jariyah: 8902-2145-6789-0123.',
      'Pastikan jumlah tagihan sesuai dan selesaikan pembayaran.'
    ]
  },
  {
    id: 'va_bri',
    name: 'BRI BRIVA',
    type: 'va',
    category: 'va',
    gatewayProvider: 'midtrans',
    badge: 'Instant Otomatis',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg',
    accountNumber: '1280-0192-8374-6501',
    fee: 0,
    instructions: [
      'Buka aplikasi BRImo.',
      'Pilih menu BRIVA > Pembayaran Baru.',
      'Masukkan nomor BRIVA: 1280-0192-8374-6501.',
      'Konfirmasi nama donatur dan nominal, lalu masukkan PIN BRImo.'
    ]
  },
  {
    id: 'va_bni',
    name: 'BNI Virtual Account',
    type: 'va',
    category: 'va',
    gatewayProvider: 'midtrans',
    badge: 'Instant Otomatis',
    logo: 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg',
    accountNumber: '9881-2345-6789-0012',
    fee: 0,
    instructions: [
      'Buka aplikasi BNI Mobile Banking atau ATM BNI.',
      'Pilih menu Transfer > Virtual Account Billing.',
      'Masukkan nomor Virtual Account BNI: 9881-2345-6789-0012.',
      'Konfirmasi rincian pembayaran dan masukkan Password Transaksi.'
    ]
  },
  {
    id: 'va_permata',
    name: 'Permata Virtual Account',
    type: 'va',
    category: 'va',
    gatewayProvider: 'midtrans',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/PermataBank_logo.svg',
    accountNumber: '8528-0912-3456-7890',
    fee: 0,
    instructions: [
      'Buka aplikasi PermataME atau ATM Permata.',
      'Pilih menu Pembayaran > Virtual Account.',
      'Masukkan nomor Permata VA: 8528-0912-3456-7890.',
      'Konfirmasi nominal dan selesaikan transaksi.'
    ]
  },
  {
    id: 'ewallet_gopay',
    name: 'GoPay / GoPay Later',
    type: 'ewallet',
    category: 'ewallet',
    gatewayProvider: 'midtrans',
    badge: 'Klik Langsung',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
    fee: 0,
    instructions: [
      'Tekan tombol Bayar dengan GoPay.',
      'Aplikasi Gojek akan terbuka secara otomatis di smartphone Anda.',
      'Konfirmasi jumlah donasi dan selesaikan transaksi dengan PIN GoPay.'
    ]
  },
  {
    id: 'ewallet_dana',
    name: 'DANA Dompet Digital',
    type: 'ewallet',
    category: 'ewallet',
    gatewayProvider: 'midtrans',
    badge: 'Instan',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg',
    fee: 0,
    instructions: [
      'Buka aplikasi DANA atau scan QR DANA yang disediakan.',
      'Konfirmasi pembayaran donasi.',
      'Status donasi akan langsung diperbarui menjadi Terverifikasi.'
    ]
  },
  {
    id: 'ewallet_shopee',
    name: 'ShopeePay / SPayLater',
    type: 'ewallet',
    category: 'ewallet',
    gatewayProvider: 'midtrans',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg',
    fee: 0,
    instructions: [
      'Aplikasi Shopee akan terbuka secara otomatis.',
      'Periksa nominal donasi dan konfirmasi pembayaran dengan PIN ShopeePay.'
    ]
  },
  {
    id: 'cstore_indomaret',
    name: 'Indomaret / Ceriamart',
    type: 'cstore',
    category: 'cstore',
    gatewayProvider: 'midtrans',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.png',
    accountNumber: 'INDO-SJ-889123',
    fee: 0,
    instructions: [
      'Kunjungi gerai Indomaret terdekat.',
      'Sampaikan kepada kasir ingin melakukan Pembayaran Payment Gateway / Sahabat Jariyah.',
      'Tunjukkan kode pembayaran: INDO-SJ-889123.',
      'Simpan struk pembayaran Indomaret sebagai bukti sah.'
    ]
  },
  {
    id: 'cstore_alfamart',
    name: 'Alfamart / Alfamidi / Dan+Dan',
    type: 'cstore',
    category: 'cstore',
    gatewayProvider: 'midtrans',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg',
    accountNumber: 'ALFA-SJ-771920',
    fee: 0,
    instructions: [
      'Datangi kasir Alfamart terdekat.',
      'Berikan kode pembayaran: ALFA-SJ-771920 kepada kasir.',
      'Bayar sesuai nominal donasi dan terima struk resmi.'
    ]
  },
  {
    id: 'transfer_bsi',
    name: 'Transfer Manual BSI (Bank Syariah Indonesia)',
    type: 'transfer',
    category: 'transfer',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg',
    accountNumber: '711-2233-445',
    accountHolder: 'Yayasan Sahabat Jariyah Indonesia',
    fee: 0,
    instructions: [
      'Transfer persis hingga 3 digit kode unik terakhir untuk verifikasi otomatis.',
      'Nomor Rekening BSI: 711-2233-445 a/n Yayasan Sahabat Jariyah Indonesia.',
      'Setelah transfer, Anda dapat mengunggah bukti transfer atau klik tombol Konfirmasi Transfer.'
    ]
  },
  {
    id: 'transfer_bca',
    name: 'Transfer Manual BCA',
    type: 'transfer',
    category: 'transfer',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
    accountNumber: '883-0912-341',
    accountHolder: 'Yayasan Sahabat Jariyah',
    fee: 0,
    instructions: [
      'Transfer ke rekening BCA 883-0912-341 a/n Yayasan Sahabat Jariyah.',
      'Sertakan kode unik pada nominal transfer.',
      'Simpan bukti transfer dan unggah melalui form verifikasi donasi.'
    ]
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-01',
    title: 'Wakaf Sumur Bor & Akses Air Bersih Santri Pelosok NTT',
    slug: 'wakaf-sumur-bor-santri-ntt',
    category: 'wakaf',
    shortDesc: 'Bantu hadirkan sumur bor kedalaman 75 meter untuk 350 santri tahfidz dan 1.200 warga desa yang kesulitan air bersih bertahun-tahun.',
    storyHtml: `<p>Di pedalaman Nusa Tenggara Timur, ratusan santri Pondok Pesantren Tahfidz Al-Ikhlas harus berjalan kaki sejauh 2 kilometer menuruni perbukitan terjal hanya demi mendapatkan beberapa ember air keruh untuk berwudhu dan keperluan harian.</p>
    <p>Ketika musim kemarau tiba, debit air di sumber mata air desa surut drastis. Para santri dan warga sekitar seringkali terpaksa menampung air sisa hujan yang sudah tidak layak konsumsi.</p>
    <h3>Rencana Penggunaan Dana Wakaf</h3>
    <ul>
      <li>Pengeboran sumur artesis kedalaman 75-80 meter</li>
      <li>Mesin pompa submersible submersible solar cell tahan cuaca</li>
      <li>Pembangunan tandon air penampungan kapasitas 10.000 liter</li>
      <li>Pemasangan pipa distribusi air ke asrama santri, masjid, dan bak penampungan warga desa</li>
    </ul>
    <p>Mari alirkan pahala jariyah abadi yang tidak akan terputus meskipun raga telah tiada melalui sedekah wakaf air bersih.</p>`,
    targetAmount: 65000000,
    collectedAmount: 48750000,
    donorCount: 412,
    daysLeft: 18,
    endDate: '2026-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'
    ],
    organizer: {
      name: 'Tim Relawan Air Berkah Nusantara',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      badge: 'Lembaga Wakaf Terverifikasi'
    },
    isVerified: true,
    isFeatured: true,
    status: 'active',
    location: 'Kabupaten Timor Tengah Selatan, NTT',
    createdAt: '2026-07-01',
    updates: [
      {
        id: 'upd-01',
        campaignId: 'cmp-01',
        title: 'Pengeboran Tahap 1 Mencapai Kedalaman 45 Meter',
        date: '2026-08-18',
        content: 'Alhamdulillah, tim geolistrik dan teknisi sumur bor telah berhasil menembus lapisan bebatuan keras di kedalaman 45 meter. Tanda-tanda rembesan sumber air bersih mulai terlihat. Pengeboran dilanjutkan hingga kedalaman target 75 meter demi mendapatkan mata air yang stabil sepanjang tahun.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        disbursedAmount: 25000000,
        author: 'Ustadz Farid (Pengasuh Ponpes)'
      },
      {
        id: 'upd-02',
        campaignId: 'cmp-01',
        title: 'Pengiriman Material Pipa dan Tandon 5.000 Liter',
        date: '2026-08-10',
        content: 'Bahan material pipa PVC SNI dan tandon stainless steel telah tiba di lokasi pesantren dengan bantuan gotong royong para santri dan warga kampung sekitar.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        disbursedAmount: 12500000,
        author: 'Tim Logistik Sahabat Jariyah'
      }
    ]
  },
  {
    id: 'cmp-02',
    title: 'Sedekah Subuh Pangan & Beasiswa 100 Yatim Penghafal Quran',
    slug: 'sedekah-subuh-yatim-quran',
    category: 'sedekah-subuh',
    shortDesc: 'Rutinkan sedekah subuh terbaikmu untuk membiayai makan bergizi dan SPP pendidikan gratis bagi anak-anak yatim dhuafa.',
    storyHtml: `<p>Malaikat mendoakan orang yang bersedekah di waktu subuh: <em>"Ya Allah, berikanlah ganti bagi orang yang berinfak."</em> (HR. Bukhari & Muslim).</p>
    <p>Program Sedekah Subuh ini didedikasikan secara berkelanjutan untuk mencukupi kebutuhan pokok sehari-hari, konsumsi makanan bernutrisi 4 sehat 5 sempurna, serta uang saku pendidikan bagi 100 santri yatim dan dhuafa di Rumah Quran Sahabat Jariyah.</p>
    <p>Setiap butir beras dan teguk susu yang mereka santap menjadi energi kebaikan yang mengalir deras dalam lantunan ayat suci Al-Quran yang mereka hafalkan setiap ba'da subuh dan ashar.</p>`,
    targetAmount: 35000000,
    collectedAmount: 29800000,
    donorCount: 580,
    daysLeft: 12,
    endDate: '2026-09-05',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
    ],
    organizer: {
      name: 'Yayasan Sahabat Yatim Indonesia',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      badge: 'Mitra Pengasuhan Yatim Resmi'
    },
    isVerified: true,
    isFeatured: true,
    status: 'active',
    location: 'Kabupaten Sukabumi, Jawa Barat',
    createdAt: '2026-07-15',
    updates: [
      {
        id: 'upd-03',
        campaignId: 'cmp-02',
        title: 'Penyaluran Paket Nutrisi Susu & Buah Segar Bulan Agustus',
        date: '2026-08-19',
        content: 'Alhamdulillah telah disalurkan 100 paket pangan gizi seimbang berisi beras organik, telur, susu kurma madu, dan buah-buahan segar untuk santri binaan.',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        disbursedAmount: 8500000,
        author: 'Umi Kalsum (Koordinator Asrama)'
      }
    ]
  },
  {
    id: 'cmp-03',
    title: 'Wakaf 1.000 Mushaf Al-Quran Standar Braille & Hafalan Pelosok',
    slug: 'wakaf-mushaf-quran-pelosok',
    category: 'quran',
    shortDesc: 'Cetak dan tebar mushaf Al-Quran tahan lama serta Al-Quran Braille bagi saudara tunanetra dan mualaf di pedalaman pulau terluar.',
    storyHtml: `<p>Banyak Rumah Tahfidz dan Masjid di kepulauan terpencil yang masih menggunakan lembaran mushaf Al-Quran usang dengan lembaran kertas yang sobek dan menguning. Sebagian santri bahkan harus bergantian memakai satu mushaf secara bergiliran.</p>
    <p>Melalui program Wakaf Quran ini, kita akan mencetak mushaf Al-Quran dengan kertas luks QPP berstandar Kemenag RI, serta Al-Quran Braille khusus untuk para penghafal Al-Quran tunanetra.</p>`,
    targetAmount: 50000000,
    collectedAmount: 34200000,
    donorCount: 318,
    daysLeft: 25,
    endDate: '2026-09-30',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80'
    ],
    organizer: {
      name: 'Gerakan Sejuta Quran Nusantara',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
      badge: 'Lembaga Literasi Quran'
    },
    isVerified: true,
    isFeatured: false,
    status: 'active',
    location: 'Pulau Buru & Halmahera Selatan, Maluku',
    createdAt: '2026-07-20',
    updates: []
  },
  {
    id: 'cmp-04',
    title: 'Renovasi Masjid Tua Al-Barakah yang Nyaris Roboh Tergerus Erosi',
    slug: 'renovasi-masjid-al-barakah',
    category: 'masjid',
    shortDesc: 'Masjid satu-satunya tempat 400 jamaah beribadah kini dindingnya retak parah dan atap seng bocor saat hujan deras.',
    storyHtml: `<p>Masjid Al-Barakah dibangun secara swadaya sejak tahun 1983 oleh warga kampung. Usia bangunan yang sudah menginjak 40 tahun serta kontur tanah lereng yang labil membuat pondasi retak dan atap lapuk rapuh dimakan rayap.</p>
    <p>Jika tidak segera diperbaiki secara permanen, masjid terancam roboh dan warga tidak lagi memiliki tempat sholat berjamaah maupun sholat Jumat.</p>`,
    targetAmount: 85000000,
    collectedAmount: 52100000,
    donorCount: 389,
    daysLeft: 9,
    endDate: '2026-08-31',
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80'
    ],
    organizer: {
      name: 'Dewan Kemakmuran Masjid Al-Barakah',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      badge: 'DKM Terverifikasi'
    },
    isVerified: true,
    isFeatured: false,
    status: 'urgent',
    location: 'Kabupaten Tasikmalaya, Jawa Barat',
    createdAt: '2026-07-10',
    updates: [
      {
        id: 'upd-04',
        campaignId: 'cmp-04',
        title: 'Pemasangan Tiang Pancang dan Cakar Ayam Pondasi Baru',
        date: '2026-08-15',
        content: 'Tukang dan warga telah memulai penggalian tanah keras untuk mengecor 8 titik cakar ayam utama agar masjid kokoh tahan gempa.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        disbursedAmount: 20000000,
        author: 'Pak Haji Dedi (Ketua DKM)'
      }
    ]
  },
  {
    id: 'cmp-05',
    title: 'Bantuan Tanggap Darurat & Dapur Umum Korban Erupsi & Banjir',
    slug: 'tanggap-darurat-bencana',
    category: 'bencana-alam',
    shortDesc: 'Distribusi selimut hangat, makanan siap santap, obat-obatan, dan popok bayi bagi 600 kepala keluarga di posko pengungsian.',
    storyHtml: `<p>Bencana banjir bandang yang menerjang permukiman warga telah melumpuhkan aktivitas ekonomi. Ratusan rumah terendam lumpur dan ribuan saudara kita harus bermalam di tenda darurat dengan keterbatasan makanan dan air bersih.</p>
    <p>Tim Siaga Bencana Sahabat Jariyah telah mendirikan Dapur Umum untuk memproduksi 1.200 porsi makanan siap santap setiap hari.</p>`,
    targetAmount: 40000000,
    collectedAmount: 41500000,
    donorCount: 642,
    daysLeft: 5,
    endDate: '2026-08-28',
    imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80'
    ],
    organizer: {
      name: 'Tim Tanggap Respon Cepat Sahabat Jariyah',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      badge: 'Relawan Kemanusiaan'
    },
    isVerified: true,
    isFeatured: false,
    status: 'active',
    location: 'Kabupaten Luwu Utara, Sulawesi Selatan',
    createdAt: '2026-08-01',
    updates: []
  },
  {
    id: 'cmp-06',
    title: 'Bantuan Operasi Jantung & Biaya Pengobatan Balita Dhuafa',
    slug: 'bantuan-medis-balita-dhuafa',
    category: 'kesehatan',
    shortDesc: 'Bantu Adik Rayyan (2 tahun) yang berjuang melawan kelainan jantung bawaan agar dapat menjalani tindakan kateterisasi & bedah toraks.',
    storyHtml: `<p>Rayyan divonis mengalami Tetralogy of Fallot sejak berusia 3 bulan. Ayahnya yang bekerja sebagai buruh harian lepas kesulitan menutup biaya akomodasi, obat-obatan non-BPJS, serta susu medis khusus pra dan pasca operasi.</p>
    <p>Kondisi bibir dan jemari Rayyan kerap membiru saat menangis karena saturasi oksigen yang turun drastis. Bantuan Anda sangat berarti bagi kelangsungan hidup buah hati ini.</p>`,
    targetAmount: 30000000,
    collectedAmount: 22400000,
    donorCount: 295,
    daysLeft: 14,
    endDate: '2026-09-08',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    ],
    organizer: {
      name: 'Sahabat Medis Dhuafa',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      badge: 'Advokasi Medis Pasien'
    },
    isVerified: true,
    isFeatured: false,
    status: 'urgent',
    location: 'RS Jantung Harapan Kita, Jakarta',
    createdAt: '2026-08-05',
    updates: []
  }
];

export const INITIAL_DISBURSEMENTS: Disbursement[] = [
  {
    id: 'disb-001',
    receiptNumber: 'SJ-DISB/2026/08/001',
    campaignId: 'cmp-01',
    campaignTitle: 'Wakaf Sumur Bor & Akses Air Bersih Santri Pelosok NTT',
    category: 'wakaf',
    title: 'Pembayaran DP Pengeboran Sumur Artesis Kedalaman 75M',
    amount: 25000000,
    date: '2026-08-18',
    recipient: 'CV Sumber Rejeki Pengeboran NTT & Ustadz Farid (Ponpes Al-Ikhlas)',
    location: 'Desa Oebelo, Kab. TTS, NTT',
    description: 'Penyaluran termin I untuk biaya operasional armada rig bor sumur dalam, casing pipa besi galvanis 4 inch, dan honor teknisi geolistrik.',
    proofImages: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'verified',
    verifiedBy: 'Dewan Pengawas Syariah & Akuntan Sahabat Jariyah',
    auditNotes: 'Kwitansi bermeterai Rp 10.000 dan berita acara serah terima dana telah diverifikasi sesuai SOP keuangan.'
  },
  {
    id: 'disb-002',
    receiptNumber: 'SJ-DISB/2026/08/002',
    campaignId: 'cmp-04',
    campaignTitle: 'Renovasi Masjid Tua Al-Barakah yang Nyaris Roboh Tergerus Erosi',
    category: 'masjid',
    title: 'Pembelian Semen 200 Sak, Besi Ulir 12mm & Pasir Cor',
    amount: 20000000,
    date: '2026-08-15',
    recipient: 'Toko Bangunan Berkah Abadi & DKM Masjid Al-Barakah',
    location: 'Kp. Sukaresmi, Tasikmalaya',
    description: 'Penyaluran tahap 1 untuk pengadaan material struktural pondasi cakar ayam dan dinding penahan erosi tebing masjid.',
    proofImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'verified',
    verifiedBy: 'Tim Audit Lapangan Sahabat Jariyah',
    auditNotes: 'Faktur pembelian barang material toko bangunan terlampir resmi.'
  },
  {
    id: 'disb-003',
    receiptNumber: 'SJ-DISB/2026/08/003',
    campaignId: 'cmp-02',
    campaignTitle: 'Sedekah Subuh Pangan & Beasiswa 100 Yatim Penghafal Quran',
    category: 'sedekah-subuh',
    title: 'Belanja Paket Sembako & Nutrisi Segar Bulan Agustus 2026',
    amount: 8500000,
    date: '2026-08-19',
    recipient: 'Koperasi Tani Dhuafa & Asrama Yatim Sahabat Jariyah',
    location: 'Sukabumi, Jawa Barat',
    description: 'Penyediaan 500 kg beras premium, 120 liter minyak goreng, 20 krat telur ayam omega, susu, dan buah jeruk untuk 100 santri yatim penghafal Quran.',
    proofImages: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'verified',
    verifiedBy: 'Manajer Penyaluran Program Filantropi',
    auditNotes: 'Daftar tanda tangan penerima manfaat 100 santri yatim tercatat lengkap.'
  },
  {
    id: 'disb-004',
    receiptNumber: 'SJ-DISB/2026/08/004',
    campaignId: 'cmp-05',
    campaignTitle: 'Bantuan Tanggap Darurat & Dapur Umum Korban Erupsi & Banjir',
    category: 'bencana-alam',
    title: 'Operasional Dapur Umum Mandiri & 1.200 Porsi Makanan Siap Santap',
    amount: 15000000,
    date: '2026-08-12',
    recipient: 'Posko Relawan Dapur Umum Kemanusiaan',
    location: 'Kec. Masamba, Luwu Utara',
    description: 'Pembelian bahan makanan basah sayur mayur, daging ayam, bumbu masak, gas elpiji 3kg, dan kemasan food container ramah lingkungan selama 7 hari operasi darurat.',
    proofImages: [
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'verified',
    verifiedBy: 'Koordinator Tanggap Bencana',
    auditNotes: 'Dokumentasi serah terima makanan hangat kepada warga pengungsi terdokumentasi.'
  },
  {
    id: 'disb-005',
    receiptNumber: 'SJ-DISB/2026/08/005',
    campaignId: 'cmp-01',
    campaignTitle: 'Wakaf Sumur Bor & Akses Air Bersih Santri Pelosok NTT',
    category: 'wakaf',
    title: 'Pengadaan Pipa PVC SNI & Tandon Air Stainless Steel 5.000L',
    amount: 12500000,
    date: '2026-08-10',
    recipient: 'Distributor Pipa NTT & Panitia Air Bersih Desa',
    location: 'Timor Tengah Selatan, NTT',
    description: 'Penyaluran pengadaan sistem perpipaan dari sumur menuju bak penampung masjid dan perumahan warga desa.',
    proofImages: [
      'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'verified',
    verifiedBy: 'Tim Logistik Sahabat Jariyah',
    auditNotes: 'Surat jalan pengiriman barang dan tanda terima fisik terverifikasi.'
  }
];

export const INITIAL_PRAYERS: DonorPrayer[] = [
  {
    id: 'pry-01',
    donationId: 'don-01',
    donorName: 'Hamba Allah',
    campaignTitle: 'Wakaf Sumur Bor & Akses Air Bersih Santri Pelosok NTT',
    amount: 500000,
    doa: 'Bismillah, niat wakaf atas nama almarhum ayahanda H. Soekarno bin Kartodirjo. Semoga menjadi amal jariyah yang mengalirkan kesejukan di alam barzakh, dan menjadi pemberat amal kebaikan di yaumil hisab. Aamiin ya Rabbal Alamiin.',
    createdAt: '2026-08-21 09:12:00',
    likesCount: 24,
    isLiked: false
  },
  {
    id: 'pry-02',
    donationId: 'don-02',
    donorName: 'Keluarga Rizky Pratama',
    campaignTitle: 'Sedekah Subuh Pangan & Beasiswa 100 Yatim Penghafal Quran',
    amount: 250000,
    doa: 'Ya Allah, berkahilah rezeki keluarga kami di waktu subuh ini. Lancarkan ikhtiar kami, mudahkan proses kelahiran anak pertama kami yang insyaAllah bulan depan, dan jadikan anak-anak yatim ini generasi penerus bangsa yang sholeh/sholehah.',
    createdAt: '2026-08-21 06:45:00',
    likesCount: 19,
    isLiked: false
  },
  {
    id: 'pry-03',
    donationId: 'don-03',
    donorName: 'Siti Nurhaliza',
    campaignTitle: 'Renovasi Masjid Tua Al-Barakah yang Nyaris Roboh Tergerus Erosi',
    amount: 1000000,
    doa: 'Semoga renovasi rumah Allah ini lekas selesai dan jamaah bisa sholat berjamaah dengan nyaman dan aman tanpa rasa takut. Aamiin.',
    createdAt: '2026-08-20 21:10:00',
    likesCount: 38,
    isLiked: false
  },
  {
    id: 'pry-04',
    donationId: 'don-04',
    donorName: 'Ahmad Fauzi & Istri',
    campaignTitle: 'Wakaf 1.000 Mushaf Al-Quran Standar Braille & Hafalan Pelosok',
    amount: 300000,
    doa: 'Semoga setiap huruf Al-Quran yang dibaca dan dihafal oleh para santri tunanetra dan mualaf mengalirkan pahala tanpa henti untuk kedua orang tua kami tercinta.',
    createdAt: '2026-08-20 17:30:00',
    likesCount: 15,
    isLiked: false
  },
  {
    id: 'pry-05',
    donationId: 'don-05',
    donorName: 'Hamba Allah (Jakarta)',
    campaignTitle: 'Bantuan Operasi Jantung & Biaya Pengobatan Balita Dhuafa',
    amount: 2000000,
    doa: 'Syafakallah adik Rayyan, semoga Allah angkat seluruh penyakitnya, operasi berjalan lancar dan sukses tanpa komplikasi, serta lekas pulih bermain ceria bersama keluarga.',
    createdAt: '2026-08-20 14:05:00',
    likesCount: 42,
    isLiked: false
  }
];
