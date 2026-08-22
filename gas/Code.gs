/**
 * =========================================================================
 * SAHABAT JARIYAH - GOOGLE APPS SCRIPT BACKEND & DATABASE CONTROLLER
 * =========================================================================
 * 
 * Script ini berfungsi sebagai REST API / Webhook backend untuk aplikasi
 * Sahabat Jariyah. Menggunakan Google Spreadsheet sebagai database live:
 * - Sheet 'Settings'     : Menyimpan konfigurasi nama, logo, rekening, dll.
 * - Sheet 'Campaigns'    : Data program donasi/wakaf dan kabar terbaru.
 * - Sheet 'Donations'    : Catatan transaksi donasi, invoice, dan status.
 * - Sheet 'Disbursements': Catatan transparansi penyaluran dana dan bukti nota.
 * - Sheet 'Prayers'      : Dinding doa donatur.
 * 
 * PETUNJUK DEPLOYMENT (3 LANGKAH MUDAH):
 * 1. Buat Google Spreadsheet baru di https://sheets.new
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'
 * 3. Hapus kode bawaan, Paste seluruh kode ini, lalu klik 'Deploy' > 'New Deployment'
 *    - Select type: Web App
 *    - Description: Sahabat Jariyah API v1.0
 *    - Execute as: Me (email akun Anda)
 *    - Who has access: Anyone (Siapa saja, termasuk anonim)
 * 4. Salin URL Web App yang dihasilkan, lalu masukkan ke menu:
 *    Portal Pengelola Sahabat Jariyah > Pengaturan Website > Google Apps Script Webhook URL.
 */

// Inisialisasi Nama Sheet
const SHEETS = {
  SETTINGS: 'Settings',
  CAMPAIGNS: 'Campaigns',
  DONATIONS: 'Donations',
  DISBURSEMENTS: 'Disbursements',
  PRAYERS: 'Prayers'
};

/**
 * Handle HTTP GET Request (Mengambil Data dari Spreadsheet)
 */
function doGet(e) {
  try {
    ensureDatabaseStructure();
    const action = e?.parameter?.action || 'getAll';
    
    if (action === 'ping') {
      return jsonResponse({
        status: 'success',
        message: 'Koneksi Google Apps Script Sahabat Jariyah Aktif!',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getSettings') {
      const settings = getSettingsData();
      return jsonResponse({ status: 'success', data: settings });
    }

    if (action === 'getCampaigns') {
      const campaigns = getTableData(SHEETS.CAMPAIGNS);
      return jsonResponse({ status: 'success', data: campaigns });
    }

    if (action === 'getDonations') {
      const donations = getTableData(SHEETS.DONATIONS);
      return jsonResponse({ status: 'success', data: donations });
    }

    if (action === 'getDisbursements') {
      const disbursements = getTableData(SHEETS.DISBURSEMENTS);
      return jsonResponse({ status: 'success', data: disbursements });
    }

    // Default: Ambil seluruh snapshot data untuk sinkronisasi aplikasi
    const fullData = {
      settings: getSettingsData(),
      campaigns: getTableData(SHEETS.CAMPAIGNS),
      donations: getTableData(SHEETS.DONATIONS),
      disbursements: getTableData(SHEETS.DISBURSEMENTS),
      prayers: getTableData(SHEETS.PRAYERS)
    };

    return jsonResponse({
      status: 'success',
      data: fullData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Handle HTTP POST Request (Menyimpan & Memperbarui Data ke Spreadsheet)
 */
function doPost(e) {
  try {
    ensureDatabaseStructure();
    
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;

    // 1. Simpan Transaksi Donasi Baru
    if (action === 'createDonation') {
      const donation = payload.data;
      insertRow(SHEETS.DONATIONS, [
        donation.id,
        donation.invoiceCode,
        donation.campaignId,
        donation.campaignTitle,
        donation.donorName,
        donation.donorEmail,
        donation.donorPhone,
        donation.isAnonymous ? 'YA' : 'TIDAK',
        donation.amount,
        donation.uniqueCode,
        donation.totalAmount,
        donation.paymentMethod,
        donation.paymentChannelName,
        donation.paymentStatus,
        donation.doa || '',
        donation.createdAt,
        donation.paidAt || '',
        JSON.stringify(donation.paymentDetails || {})
      ]);

      // Jika ada doa, masukkan ke dinding doa
      if (donation.doa && donation.doa.trim().length > 0) {
        insertRow(SHEETS.PRAYERS, [
          'pry-' + new Date().getTime(),
          donation.id,
          donation.isAnonymous ? 'Hamba Allah' : donation.donorName,
          donation.campaignTitle,
          donation.amount,
          donation.doa,
          donation.createdAt,
          0
        ]);
      }

      return jsonResponse({ status: 'success', message: 'Donasi berhasil dicatat ke Google Sheets' });
    }

    // 2. Perbarui Status Donasi (Verifikasi Pembayaran)
    if (action === 'updateDonationStatus') {
      const { donationId, newStatus, paidAt } = payload.data;
      updateDonationStatus(donationId, newStatus, paidAt);
      return jsonResponse({ status: 'success', message: 'Status donasi diperbarui' });
    }

    // 3. Catat Penyaluran Dana Baru (Transparansi)
    if (action === 'createDisbursement') {
      const disb = payload.data;
      insertRow(SHEETS.DISBURSEMENTS, [
        disb.id,
        disb.receiptNumber,
        disb.campaignId,
        disb.campaignTitle,
        disb.category,
        disb.title,
        disb.amount,
        disb.date,
        disb.recipient,
        disb.location,
        disb.description,
        JSON.stringify(disb.proofImages || []),
        disb.status,
        disb.verifiedBy,
        disb.auditNotes || ''
      ]);

      return jsonResponse({ status: 'success', message: 'Penyaluran dana berhasil dicatat' });
    }

    // 4. Simpan / Perbarui Program Campaign
    if (action === 'saveCampaign') {
      const campaign = payload.data;
      upsertCampaign(campaign);
      return jsonResponse({ status: 'success', message: 'Program donasi berhasil disimpan' });
    }

    // 5. Simpan Pengaturan Website & Branding
    if (action === 'saveSettings') {
      saveSettingsData(payload.data);
      return jsonResponse({ status: 'success', message: 'Pengaturan website berhasil disimpan' });
    }

    // 6. Sinkronisasi Data Penuh (Full Backup/Restore)
    if (action === 'syncFullData') {
      const { campaigns, donations, disbursements, settings, prayers } = payload.data;
      if (settings) saveSettingsData(settings);
      if (campaigns && Array.isArray(campaigns)) syncTable(SHEETS.CAMPAIGNS, campaigns, mapCampaignToRow);
      if (donations && Array.isArray(donations)) syncTable(SHEETS.DONATIONS, donations, mapDonationToRow);
      if (disbursements && Array.isArray(disbursements)) syncTable(SHEETS.DISBURSEMENTS, disbursements, mapDisbursementToRow);
      if (prayers && Array.isArray(prayers)) syncTable(SHEETS.PRAYERS, prayers, mapPrayerToRow);
      
      return jsonResponse({ status: 'success', message: 'Sinkronisasi menyeluruh ke Google Sheets selesai' });
    }

    return jsonResponse({ status: 'error', message: 'Aksi tidak dikenali: ' + action });

  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Utilitas Response JSON dengan Header CORS Terbuka
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Memastikan Struktur Sheet dan Header Tersedia Otomatis
 */
function ensureDatabaseStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Settings Sheet
  let sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.SETTINGS);
    sheet.appendRow(['Key', 'Value']);
    sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
  }

  // 2. Campaigns Sheet
  sheet = ss.getSheetByName(SHEETS.CAMPAIGNS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.CAMPAIGNS);
    sheet.appendRow([
      'ID', 'Title', 'Slug', 'Category', 'ShortDesc', 'StoryHtml', 
      'TargetAmount', 'CollectedAmount', 'DonorCount', 'DaysLeft', 
      'EndDate', 'ImageUrl', 'GalleryJson', 'OrganizerJson', 'IsVerified', 
      'IsFeatured', 'Status', 'Location', 'CreatedAt', 'UpdatesJson'
    ]);
    sheet.getRange(1, 1, 1, 20).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
  }

  // 3. Donations Sheet
  sheet = ss.getSheetByName(SHEETS.DONATIONS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.DONATIONS);
    sheet.appendRow([
      'ID', 'InvoiceCode', 'CampaignID', 'CampaignTitle', 'DonorName', 
      'DonorEmail', 'DonorPhone', 'IsAnonymous', 'Amount', 'UniqueCode', 
      'TotalAmount', 'PaymentMethod', 'PaymentChannel', 'PaymentStatus', 
      'Doa', 'CreatedAt', 'PaidAt', 'PaymentDetailsJson'
    ]);
    sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
  }

  // 4. Disbursements Sheet
  sheet = ss.getSheetByName(SHEETS.DISBURSEMENTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.DISBURSEMENTS);
    sheet.appendRow([
      'ID', 'ReceiptNumber', 'CampaignID', 'CampaignTitle', 'Category', 
      'Title', 'Amount', 'Date', 'Recipient', 'Location', 'Description', 
      'ProofImagesJson', 'Status', 'VerifiedBy', 'AuditNotes'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
  }

  // 5. Prayers Sheet
  sheet = ss.getSheetByName(SHEETS.PRAYERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.PRAYERS);
    sheet.appendRow([
      'ID', 'DonationID', 'DonorName', 'CampaignTitle', 'Amount', 'Doa', 'CreatedAt', 'LikesCount'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
  }
}

/**
 * Membaca data Settings dari Sheet
 */
function getSettingsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) return {};

  const rows = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    const val = rows[i][1];
    if (key) {
      try {
        settings[key] = JSON.parse(val);
      } catch (e) {
        settings[key] = val;
      }
    }
  }
  return settings;
}

/**
 * Menyimpan data Settings ke Sheet
 */
function saveSettingsData(settingsObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) {
    ensureDatabaseStructure();
    sheet = ss.getSheetByName(SHEETS.SETTINGS);
  }

  sheet.clearContents();
  sheet.appendRow(['Key', 'Value']);
  sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');

  for (const [k, v] of Object.entries(settingsObj)) {
    const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
    sheet.appendRow([k, valStr]);
  }
}

/**
 * Helper Membaca Baris Data Sheet sebagai Array of Objects
 */
function getTableData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const results = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let value = row[j];
      
      // Auto parse JSON columns
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          value = JSON.parse(value);
        } catch (e) {}
      }
      item[header] = value;
      if (value !== '') hasData = true;
    }
    if (hasData) results.push(item);
  }
  return results;
}

/**
 * Menambahkan 1 baris ke Sheet
 */
function insertRow(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  sheet.appendRow(rowData);
}

/**
 * Update Status Donasi
 */
function updateDonationStatus(donationId, newStatus, paidAt) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.DONATIONS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(donationId)) {
      sheet.getRange(i + 1, 14).setValue(newStatus); // Kolom PaymentStatus
      if (paidAt) {
        sheet.getRange(i + 1, 17).setValue(paidAt); // Kolom PaidAt
      }
      break;
    }
  }
}

/**
 * Upsert Data Program Donasi
 */
function upsertCampaign(campaign) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CAMPAIGNS);
  const rows = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(campaign.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = mapCampaignToRow(campaign);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function mapCampaignToRow(c) {
  return [
    c.id,
    c.title,
    c.slug,
    c.category,
    c.shortDesc,
    c.storyHtml,
    c.targetAmount,
    c.collectedAmount,
    c.donorCount,
    c.daysLeft,
    c.endDate,
    c.imageUrl,
    JSON.stringify(c.galleryImages || []),
    JSON.stringify(c.organizer || {}),
    c.isVerified ? 'YA' : 'TIDAK',
    c.isFeatured ? 'YA' : 'TIDAK',
    c.status,
    c.location,
    c.createdAt,
    JSON.stringify(c.updates || [])
  ];
}

function mapDonationToRow(d) {
  return [
    d.id,
    d.invoiceCode,
    d.campaignId,
    d.campaignTitle,
    d.donorName,
    d.donorEmail,
    d.donorPhone,
    d.isAnonymous ? 'YA' : 'TIDAK',
    d.amount,
    d.uniqueCode,
    d.totalAmount,
    d.paymentMethod,
    d.paymentChannelName,
    d.paymentStatus,
    d.doa || '',
    d.createdAt,
    d.paidAt || '',
    JSON.stringify(d.paymentDetails || {})
  ];
}

function mapDisbursementToRow(disb) {
  return [
    disb.id,
    disb.receiptNumber,
    disb.campaignId,
    disb.campaignTitle,
    disb.category,
    disb.title,
    disb.amount,
    disb.date,
    disb.recipient,
    disb.location,
    disb.description,
    JSON.stringify(disb.proofImages || []),
    disb.status,
    disb.verifiedBy,
    disb.auditNotes || ''
  ];
}

function mapPrayerToRow(p) {
  return [
    p.id,
    p.donationId,
    p.donorName,
    p.campaignTitle,
    p.amount,
    p.doa,
    p.createdAt,
    p.likesCount || 0
  ];
}

function syncTable(sheetName, items, mapperFn) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  // Pertahankan Header baris 1
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  const rows = items.map(mapperFn);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}
