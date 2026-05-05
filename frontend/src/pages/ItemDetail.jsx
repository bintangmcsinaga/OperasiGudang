import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiTag, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import api from '../utils/api';
import ImageSlider from '../components/ImageSlider';

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        setError('Gagal memuat detail barang.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 mt-16 animate-pulse">
        <div className="h-8 bg-surface-dark w-1/4 rounded mb-6"></div>
        <div className="bg-white rounded-3xl shadow-sm border border-border p-6 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-96 bg-surface-dark rounded-2xl"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-surface-dark w-3/4 rounded"></div>
            <div className="h-10 bg-surface-dark w-1/2 rounded"></div>
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-surface-dark w-full rounded"></div>
              <div className="h-4 bg-surface-dark w-full rounded"></div>
              <div className="h-4 bg-surface-dark w-2/3 rounded"></div>
            </div>
            <div className="h-12 bg-surface-dark w-full rounded-xl mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">{error || 'Barang tidak ditemukan'}</h2>
        <Link to="/" className="text-primary hover:underline font-medium inline-flex items-center gap-2">
          <FiArrowLeft /> Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const isSold = item.status === 'sold';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';
  const whatsappMessage = encodeURIComponent(`Halo, saya tertarik dengan barang ${item.name}, apakah masih tersedia?`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 font-medium">
        <FiArrowLeft /> Kembali
      </Link>

      <div className="bg-white rounded-3xl shadow-lg border border-border overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Image Slider */}
        <div className="w-full lg:w-1/2 relative bg-surface-dark min-h-[300px] lg:min-h-[500px]">
          <ImageSlider images={item.images} alt={item.name} className="absolute inset-0 w-full h-full" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            {isSold ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-sold text-white text-sm font-bold rounded-full shadow-lg uppercase tracking-wide">
                Sold Out
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-available text-white text-sm font-bold rounded-full shadow-lg uppercase tracking-wide">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Tersedia
              </span>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-lg text-xs font-semibold text-text-secondary">
                <FiTag size={14} />
                {item.category || 'Lainnya'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                <FiClock size={14} />
                Ditambahkan {formatDate(item.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 leading-tight">
              {item.name}
            </h1>

            <p className="text-3xl sm:text-4xl font-bold text-accent mb-8">
              {formatPrice(item.price)}
            </p>

            <div className="prose prose-sm sm:prose-base prose-slate max-w-none mb-8 text-text-secondary whitespace-pre-line">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Deskripsi Barang</h3>
              {DOMPurify.sanitize(item.description)}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
              <FiCheckCircle className="text-blue-500 mt-0.5 shrink-0" size={20} />
              <p className="text-sm text-blue-800">
                Hubungi penjual untuk memastikan ketersediaan barang.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-border mt-auto">
            {isSold ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gray-200 text-gray-500 rounded-2xl text-lg font-bold cursor-not-allowed"
              >
                <FaWhatsapp size={24} />
                Barang Sudah Terjual
              </button>
            ) : (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
              >
                <FaWhatsapp size={24} />
                Chat Penjual via WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
