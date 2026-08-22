import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  MessageSquareHeart, 
  Receipt,
  Sparkles,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';
import { Campaign, Donation, DonorPrayer, Comment } from '../types';
import { SocialShareModal } from '../components/SocialShareModal';
import { storageService } from '../services/storageService';

interface CampaignDetailPageProps {
  campaign: Campaign;
  donations: Donation[];
  prayers: DonorPrayer[];
  onBack: () => void;
  onDonate: (campaign: Campaign) => void;
  onToggleLikePrayer: (prayerId: string) => void;
}

export const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({
  campaign,
  donations,
  prayers,
  onBack,
  onDonate,
  onToggleLikePrayer
}) => {
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'donors' | 'comments'>('story');
  const [copied, setCopied] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentPhone, setCommentPhone] = useState('');
  const [commentMessage, setCommentMessage] = useState('');

  const percentage = Math.min(100, Math.round((campaign.collectedAmount / campaign.targetAmount) * 100));

  // Trigger smooth progress bar and percentage number transition on mount/campaign change
  useEffect(() => {
    setIsAnimated(false);
    setDisplayPercentage(0);

    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 50);

    // Smooth count-up animation for percentage
    const duration = 1000;
    const startTime = performance.now();
    let frameId: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPercentage(Math.round(eased * percentage));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [campaign.id, campaign.collectedAmount, campaign.targetAmount, percentage]);

  // Filter donations and prayers for this campaign
  const campaignDonations = donations.filter(d => d.campaignId === campaign.id && d.paymentStatus === 'success');
  const campaignPrayers = prayers.filter(p => p.campaignTitle === campaign.title);
  const campaignComments = comments.filter(c => c.campaignId === campaign.id);

  useEffect(() => {
    setComments(storageService.getComments());
  }, [campaign.id]);

  const handleCommentSubmit = () => {
    if (!commentName.trim() || !commentPhone.trim() || !commentMessage.trim()) return;
    
    const newComment: Comment = {
      id: 'cmt-' + Date.now(),
      campaignId: campaign.id,
      donorName: commentName.trim(),
      donorPhone: commentPhone.trim(),
      message: commentMessage.trim(),
      createdAt: new Date().toISOString()
    };
    
    storageService.addComment(newComment);
    setComments(storageService.getComments());
    setCommentMessage('');
  };

  const shareableUrl = `${window.location.origin}${window.location.pathname}?campaign=${encodeURIComponent(campaign.id)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWA = () => {
    const text = `Mari ikut bantu program "${campaign.title}" di Sahabat Jariyah. Salurkan sedekah/wakaf Anda melalui: ${shareableUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Semua Program</span>
      </button>

      {/* Main Grid: Left Story & Tabs, Right Sticky Donate Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Media, Organizer & Story Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Hero Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200 bg-stone-100 h-72 sm:h-96 w-full">
            <img 
              src={campaign.imageUrl} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-emerald-950/80 backdrop-blur-sm text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
              {campaign.category.toUpperCase()}
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>{campaign.location}</span>
            </div>
          </div>

          {/* Title and Short Description */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug">
              {campaign.title}
            </h1>

            {/* Organizer Card */}
            <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <img 
                src={campaign.organizer.avatarUrl} 
                alt={campaign.organizer.name} 
                className="w-10 h-10 rounded-full object-cover border border-emerald-600"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                    {campaign.organizer.name}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <span className="text-[11px] text-stone-500 block truncate">
                  {campaign.organizer.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-stone-200 flex gap-6 text-sm font-semibold text-stone-500">
            <button
              onClick={() => setActiveTab('story')}
              className={`pb-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'story'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent hover:text-stone-800'
              }`}
            >
              Kisah & Kebutuhan
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'updates'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent hover:text-stone-800'
              }`}
            >
              <span>Kabar Penyaluran</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {campaign.updates?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'donors'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent hover:text-stone-800'
              }`}
            >
              <span>Doa & Donatur</span>
              <span className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {campaign.donorCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent hover:text-stone-800'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Komentar</span>
              <span className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {campaignComments.length}
              </span>
            </button>
          </div>

          {/* TAB 1: STORY */}
          {activeTab === 'story' && (
            <div className="space-y-6">
              <div 
                className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: campaign.storyHtml }}
              />

              {/* Gallery Photos */}
              {campaign.galleryImages && campaign.galleryImages.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h3 className="font-bold text-stone-900 text-sm">Foto Dokumentasi Program</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {campaign.galleryImages.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt={`Galeri ${i + 1}`}
                        className="rounded-xl h-28 sm:h-36 w-full object-cover border border-stone-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPDATES / KABAR TERBARU */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              {campaign.updates && campaign.updates.length > 0 ? (
                <div className="relative border-l-2 border-emerald-200 ml-3 space-y-6 pl-6">
                  {campaign.updates.map((upd) => (
                    <div key={upd.id} className="relative space-y-2">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white" />
                      
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(upd.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-800">{upd.author}</span>
                      </div>

                      <h4 className="font-bold text-stone-900 text-base">{upd.title}</h4>

                      {upd.disbursedAmount && (
                        <div className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                          Dana Disalurkan: Rp {upd.disbursedAmount.toLocaleString('id-ID')}
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {upd.content}
                      </p>

                      {upd.imageUrl && (
                        <img
                          src={upd.imageUrl}
                          alt={upd.title}
                          className="rounded-2xl h-48 sm:h-64 w-full object-cover border border-stone-200 mt-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-stone-50 text-center rounded-2xl text-stone-500 text-xs">
                  Belum ada laporan penyaluran terbaru untuk program ini.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DONORS & PRAYERS */}
          {activeTab === 'donors' && (
            <div className="space-y-4">
              {campaignPrayers.length > 0 ? (
                <div className="space-y-3">
                  {campaignPrayers.map((prayer) => (
                    <div key={prayer.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-900">{prayer.donorName}</span>
                        <span className="font-mono text-emerald-700 font-bold">
                          Rp {prayer.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 italic">"{prayer.doa}"</p>
                      <div className="flex justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                        <span>{new Date(prayer.createdAt).toLocaleDateString('id-ID')}</span>
                        <button
                          onClick={() => onToggleLikePrayer(prayer.id)}
                          className="text-emerald-700 font-semibold hover:underline"
                        >
                          Aamiin ({prayer.likesCount})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-stone-50 text-center rounded-2xl text-stone-500 text-xs">
                  Jadilah donatur pertama yang menyalurkan kebaikan dan menuliskan doa untuk program ini!
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {campaignComments.length > 0 ? (
                <div className="space-y-3">
                  {campaignComments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">
                          {comment.donorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-sm block">{comment.donorName}</span>
                          <span className="text-[11px] text-stone-400">{comment.donorPhone}</span>
                        </div>
                      </div>
                      <p className="text-sm text-stone-700 leading-relaxed pl-10">{comment.message}</p>
                      <div className="text-[11px] text-stone-400 pl-10">
                        {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-stone-50 text-center rounded-2xl text-stone-500 text-xs">
                  Belum ada komentar untuk program ini. Jadilah yang pertama!
                </div>
              )}

              {/* Add Comment Form */}
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 sm:p-6">
                <h4 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  Tulis Komentar
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Nama Anda"
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    />
                    <input
                      type="text"
                      value={commentPhone}
                      onChange={(e) => setCommentPhone(e.target.value)}
                      placeholder="Nomor Telepon"
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <textarea
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    placeholder="Tulis komentar Anda..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white resize-none"
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!commentName.trim() || !commentPhone.trim() || !commentMessage.trim()}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Kirim Komentar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Donation Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-5">
            
            {/* Target & Collected Amount */}
            <div className="space-y-2">
              <span className="text-xs text-stone-500 font-medium block">Dana Terkumpul</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                  Rp {campaign.collectedAmount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-stone-600 font-mono transition-all">
                  {displayPercentage}%
                </span>
              </div>

              {/* Progress Bar with Smooth Transition Animation */}
              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden relative shadow-inner">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-sm"
                  style={{ width: `${isAnimated ? percentage : 0}%` }}
                >
                  {/* Animated Shimmer Light Wave */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
                </div>
              </div>

              <div className="flex justify-between text-xs text-stone-500 pt-1">
                <span>Target: <strong>Rp {campaign.targetAmount.toLocaleString('id-ID')}</strong></span>
                <span>Sisa: <strong>{campaign.daysLeft} hari</strong></span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <div>
                <span className="text-stone-400 block text-[11px]">Jumlah Donatur</span>
                <span className="font-bold text-stone-800 text-sm">{campaign.donorCount} Sahabat</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Sistem Audit</span>
                <span className="font-bold text-emerald-700 text-sm">100% Terbuka</span>
              </div>
            </div>

            {/* Big Donate Button */}
            <button
              onClick={() => onDonate(campaign)}
              className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-2xl text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Heart className="w-5 h-5 fill-emerald-950" />
              <span>Donasi Sekarang</span>
            </button>

            {/* Share Controls */}
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Program</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>

            <div className="text-center">
              <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi Syariah & Akuntabel</span>
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Social Sharing Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        campaign={campaign}
      />

    </div>
  );
};
