import { FaWhatsapp } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { API_URL } from '../utils/api';

export default function ItemCard({ item }) {
  const isSold = item.status === 'sold';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';

  const whatsappMessage = encodeURIComponent(
    `Halo, saya tertarik dengan barang ${item.name}, apakah masih tersedia?`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${API_URL}${item.image}`
    : null;

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col ${
        isSold ? 'opacity-75' : ''
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-32 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-32 sm:h-52 bg-gradient-to-br from-surface-dark to-border flex items-center justify-center">
            <svg
              className="w-16 h-16 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          {isSold ? (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-sold text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg uppercase tracking-wide">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
              Sold
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-available text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg uppercase tracking-wide">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Tersedia
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
          <h3 className="text-sm sm:text-lg font-semibold text-text-primary line-clamp-2 sm:line-clamp-1 leading-tight sm:leading-normal">
            {item.name}
          </h3>
          <span className="self-start sm:self-auto inline-block px-1.5 sm:px-2 py-0.5 bg-surface-dark border border-border rounded text-[8px] sm:text-[10px] text-text-secondary font-medium shrink-0">
            {item.category || 'Lainnya'}
          </span>
        </div>

        <p className="text-base sm:text-xl font-bold text-accent mb-2">
          {formatPrice(item.price)}
        </p>

        <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 mb-3 sm:mb-4 flex-1">
          {DOMPurify.sanitize(item.description)}
        </p>

        {/* WhatsApp Button */}
        {isSold ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-4 bg-gray-200 text-gray-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold cursor-not-allowed"
          >
            <FaWhatsapp className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            Terjual
          </button>
        ) : (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-4 bg-whatsapp hover:bg-whatsapp-dark text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <FaWhatsapp className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Chat via WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
