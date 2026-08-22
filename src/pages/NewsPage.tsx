import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Calendar, 
  User, 
  Plus, 
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { Announcement } from '../types';
import { storageService } from '../services/storageService';

interface NewsPageProps {
  onBack: () => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    setAnnouncements(storageService.getAnnouncements());
  }, []);

  const handleAdd = () => {
    if (!title.trim() || !content.trim() || !author.trim()) return;
    
    const newAnnouncement: Announcement = {
      id: 'ann-' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      imageUrl: imageUrl.trim() || undefined,
      date: new Date().toISOString()
    };
    
    storageService.addAnnouncement(newAnnouncement);
    setAnnouncements(storageService.getAnnouncements());
    setTitle('');
    setContent('');
    setAuthor('');
    setImageUrl('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus pengumuman ini?')) {
      storageService.deleteAnnouncement(id);
      setAnnouncements(storageService.getAnnouncements());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-8 sm:px-10 sm:py-10 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Newspaper className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">Berita & Pengumuman</h1>
                <p className="text-emerald-200 text-sm mt-0.5">Informasi terbaru dari kami</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Mobile Add Button */}
        <div className="sm:hidden p-4 border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengumuman</span>
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="p-6 sm:p-10 border-b border-stone-200 bg-stone-50">
            <h3 className="font-bold text-stone-900 text-sm mb-4">Tambah Pengumuman Baru</h3>
            <div className="space-y-3 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul pengumuman"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Penulis</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Nama penulis"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">URL Gambar (Opsional)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Isi</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Isi pengumuman..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  disabled={!title.trim() || !content.trim() || !author.trim()}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announcements List */}
        <div className="p-6 sm:p-10">
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {announcement.imageUrl && (
                    <img
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      className="w-full h-48 sm:h-56 object-cover"
                    />
                  )}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-900 text-base sm:text-lg mb-2">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {announcement.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(announcement.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                          {announcement.content}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Newspaper className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="font-bold text-stone-900 text-lg mb-1">Belum Ada Pengumuman</h3>
              <p className="text-sm text-stone-500">
                Tambahkan pengumuman untuk disampaikan kepada donatur.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
