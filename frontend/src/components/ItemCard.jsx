import { FaWhatsapp } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';
import ImageSlider from './ImageSlider';

export default function ItemCard({ item }) {
  const isSold = item.status === 'sold';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';

  const whatsappMessage = encodeURIComponent(
    `Halo, saya tertarik dengan barang ${item.name}, apakah masih tersedia?`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);

  return (
    <Link
      to={`/item/${item._id}`}
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-light)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.25s, transform 0.25s',
        opacity: isSold ? 0.8 : 1,
        textDecoration: 'none',
      }}
      className="group hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <ImageSlider
          images={item.images}
          alt={item.name}
          className="w-full h-32 sm:h-52 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          {isSold ? (
            <span style={{
              backgroundColor: 'var(--color-ink)',
              color: 'var(--color-on-primary)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
              className="inline-flex items-center gap-1 shadow-md">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd" />
              </svg>
              Sold Out
            </span>
          ) : (
            <span style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
              className="inline-flex items-center gap-1.5 shadow-md">
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-on-primary)', borderRadius: '50%' }}
                className="animate-pulse" />
              Tersedia
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}
        className="sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
          <h3 style={{ color: 'var(--color-ink)', fontWeight: 600, lineHeight: 1.3 }}
            className="text-sm sm:text-base line-clamp-2">
            {item.name}
          </h3>
          <span style={{
            backgroundColor: 'var(--color-canvas-soft)',
            color: 'var(--color-body)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
            className="self-start shrink-0">
            {item.category || 'Lainnya'}
          </span>
        </div>

        <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
          {formatPrice(item.price)}
        </p>

        <p style={{ color: 'var(--color-body)', fontSize: '13px', lineHeight: '20px', flex: 1, marginBottom: '12px' }}
          className="line-clamp-2">
          {DOMPurify.sanitize(item.description)}
        </p>

        {/* Action */}
        {isSold ? (
          <button
            disabled
            style={{
              backgroundColor: 'var(--color-canvas-soft)',
              color: 'var(--color-mute)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onClick={(e) => e.preventDefault()}
          >
            <FaWhatsapp size={16} />
            Terjual
          </button>
        ) : (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-whatsapp)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background-color 0.2s, box-shadow 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-whatsapp-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-whatsapp)'; }}
          >
            <FaWhatsapp size={16} />
            <span className="hidden sm:inline">Chat via WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        )}
      </div>
    </Link>
  );
}
