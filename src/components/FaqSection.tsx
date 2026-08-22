import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Coins, 
  FileText, 
  HeartHandshake,
  MessageCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AppSettings } from '../types';

interface FaqItem {
  id: string;
  category: 'donasi' | 'zakat_wakaf' | 'transparansi' | 'umum';
  question: string;
  answer: string;
  highlight?: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'donasi',
    question: 'Bagaimana cara berdonasi di Sahabat Jariyah?',
    answer: 'Pilih program kebaikan yang ingin Anda bantu, klik tombol "Donasi Sekarang", pilih atau masukkan nominal donasi, tentukan metode pembayaran (QRIS instan, Virtual Account Bank BSI/Mandiri/BCA/BRI, atau Transfer Manual), lalu ikuti instruksi pembayaran. Setelah pembayaran berhasil, Anda akan langsung menerima bukti tanda terima digital.',
    highlight: 'Dukungan QRIS Instan & Virtual Account otomatis.'
  },
  {
    id: 'faq-2',
    category: 'transparansi',
    question: 'Bagaimana standar akuntabilitas pengelolaan dana di platform ini?',
    answer: 'Setiap donasi dan dana yang masuk tercatat dalam pembukuan terintegrasi dengan audit syariah dan pengawasan berkala. Pengelola menyajikan laporan penyaluran, dokumentasi kegiatan lapangan, dan nota verifikasi resmi yang dapat diakses oleh publik secara terbuka.',
    highlight: 'Pengawasan berkala dan pelaporan terstandarisasi.'
  },
  {
    id: 'faq-3',
    category: 'transparansi',
    question: 'Bagaimana saya bisa memantau penyaluran dana donasi saya?',
    answer: 'Anda dapat memantau secara terbuka di menu "Transparansi Penyaluran". Setiap pencairan dana dicatat secara kronologis lengkap dengan foto penyerahan bantuan di lapangan, nota kwitansi asli, serta berita acara pertanggungjawaban yang dapat dilihat oleh publik.',
    highlight: 'Laporan real-time dengan bukti foto & nota.'
  },
  {
    id: 'faq-4',
    category: 'zakat_wakaf',
    question: 'Apa perbedaan Zakat, Infaq, Sedekah, dan Wakaf di platform ini?',
    answer: 'Zakat adalah kewajiban maliyah dengan syarat nisab & haul yang disalurkan kepada 8 asnaf (terutama dhuafa). Infaq dan Sedekah bersifat sukarela untuk berbagai keperluan sosial. Sedangkan Wakaf adalah menahan pokok harta yang bermanfaat kekal (seperti sumur bor, Al-Quran, masjid, klinik produktif) yang pahalanya terus mengalir abadi meskipun wakif telah tiada.',
    highlight: 'Pilihan akad sesuai kaidah syariah.'
  },
  {
    id: 'faq-5',
    category: 'donasi',
    question: 'Berapa lama proses verifikasi pembayaran donasi?',
    answer: 'Pembayaran melalui QRIS dan Virtual Account otomatis terverifikasi seketika (real-time dalam 1–5 detik). Untuk metode Transfer Manual, sistem kami memverifikasi otomatis melalui kode unik nominal atau dapat dikonfirmasi cepat melalui WhatsApp Layanan Donatur.',
    highlight: 'Verifikasi instan otomatis 24 jam.'
  },
  {
    id: 'faq-6',
    category: 'donasi',
    question: 'Bisakah saya berdonasi atas nama orang tua yang sudah wafat?',
    answer: 'Sangat bisa dan dianjurkan. Dalam ajaran Islam, sedekah jariyah atas nama almarhum/almarhumah orang tua pahalanya akan sampai kepada beliau. Anda cukup mencantumkan nama orang tua pada formulir nama donatur dan menuliskan doa terbaik di kolom doa munajat.',
    highlight: 'Pahala jariyah yang dihadiahkan untuk almarhum.'
  },
  {
    id: 'faq-7',
    category: 'zakat_wakaf',
    question: 'Bagaimana cara menghitung kewajiban Zakat Maal atau Penghasilan saya?',
    answer: 'Anda dapat menggunakan fitur interaktif "Kalkulator Zakat & Wakaf" yang telah kami sediakan di menu atas website. Masukkan data penghasilan bulanan, tabungan, atau emas Anda, dan sistem akan menghitung secara presisi berdasarkan standar nisab harga emas terkini (85 gram).',
    highlight: 'Hitung zakat akurat dengan kalkulator terintegrasi.'
  },
  {
    id: 'faq-8',
    category: 'umum',
    question: 'Bagaimana jika saya salah transfer nominal atau lupa memasukkan kode unik?',
    answer: 'Jangan khawatir. Silakan hubungi Customer Service kami melalui tombol WhatsApp yang ada di pojok kanan bawah dengan melampirkan foto bukti transfer dan nama donatur. Admin kami akan segera memverifikasi dan mengalokasikan donasi Anda secara manual.',
    highlight: 'Bantuan tim CS cepat tanggap via WhatsApp.'
  }
];

interface FaqSectionProps {
  settings?: AppSettings;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings }) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const categories = [
    { id: 'all', label: 'Semua Pertanyaan' },
    { id: 'donasi', label: 'Donasi & Pembayaran' },
    { id: 'transparansi', label: 'Transparansi & Laporan' },
    { id: 'zakat_wakaf', label: 'Zakat & Wakaf' },
    { id: 'umum', label: 'Umum & Bantuan' }
  ];

  return (
    <section id="faq-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Pusat Bantuan & Edukasi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Pertanyaan yang Sering Diajukan (FAQ)
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          Jawaban lengkap seputar tata cara donasi, transparansi amanah penyaluran, hukum fikih zakat, dan kemudahan pembayaran.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pertanyaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6 space-y-2">
            <HelpCircle className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-700">Pertanyaan tidak ditemukan</p>
            <p className="text-xs text-stone-500">Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isOpen 
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' 
                    : 'border-stone-200 hover:border-stone-300 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}>
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-stone-900 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-emerald-50 text-emerald-800' : 'text-stone-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-stone-700 leading-relaxed border-t border-stone-100 space-y-2 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                    {faq.highlight && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{faq.highlight}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions CTA */}
      <div className="bg-stone-900 text-white p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-stone-800 shadow-sm">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 mx-auto sm:mx-0 shadow-inner">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">Masih punya pertanyaan lain seputar donasi?</h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Tim layanan donatur kami siap melayani dan memberikan konsultasi secara ramah.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const clean = (settings?.whatsappNumber || '6281234567890').replace(/\D/g, '');
            const phone = clean.startsWith('0') ? '62' + clean.slice(1) : (clean || '6281234567890');
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent('Assalamu’alaikum Admin Sahabat Jariyah, saya ingin bertanya seputar:')}`, '_blank');
          }}
          className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer transition-all shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Tanya via WhatsApp</span>
        </button>
      </div>

    </section>
  );
};
