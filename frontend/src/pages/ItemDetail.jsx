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
      } catch {
        setError('Gagal memuat detail barang.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-canvas-soft)', minHeight: '100vh' }}
        className="max-w-5xl mx-auto px-4 py-8 pt-24 animate-pulse">
        <div style={{ height: '28px', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-sm)', width: '120px', marginBottom: '24px' }} />
        <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}
          className="md:flex-row">
          <div style={{ flex: 1, height: '360px', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--radius-md)' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[200, 120, 300, 300, 200].map((w, i) => (
              <div key={i} style={{ height: i === 1 ? '40px' : '16px', width: `${w}px`, maxWidth: '100%', backgroundColor: 'var(--color-canvas-soft)', borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ backgroundColor: 'var(--color-canvas-soft)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '16px' }}>
            {error || 'Barang tidak ditemukan'}
          </h2>
          <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <FiArrowLeft /> Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const isSold = item.status === 'sold';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';
  const whatsappMessage = encodeURIComponent(`Halo, saya tertarik dengan barang ${item.name}, apakah masih tersedia?`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ backgroundColor: 'var(--color-canvas-soft)', minHeight: '100vh', paddingBottom: '48px' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '32px' }}>

        {/* Back link */}
        <Link to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-body)', fontWeight: 500, fontSize: '14px', textDecoration: 'none', marginBottom: '20px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-body)'}
        >
          <FiArrowLeft size={16} /> Kembali ke Katalog
        </Link>

        <div style={{
          backgroundColor: 'var(--color-canvas)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-light)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(32,21,21,0.08)',
          display: 'flex', flexDirection: 'column',
        }} className="lg:flex-row">

          {/* Image Slider */}
          <div style={{ position: 'relative', backgroundColor: 'var(--color-canvas-soft)', minHeight: '300px' }}
            className="w-full lg:w-1/2 lg:min-h-[480px]">
            <ImageSlider images={item.images} alt={item.name} className="absolute inset-0 w-full h-full" />

            {/* Status badge */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
              {isSold ? (
                <span style={{
                  backgroundColor: 'var(--color-ink)', color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-pill)', padding: '6px 14px',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 12px rgba(32,21,21,0.3)',
                }}>
                  Sold Out
                </span>
              ) : (
                <span style={{
                  backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-pill)', padding: '6px 14px',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 12px rgba(255,79,0,0.35)',
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff' }} className="animate-pulse" />
                  Tersedia
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column' }}
            className="w-full lg:w-1/2">
            <div style={{ flex: 1 }}>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                  fontSize: '12px', fontWeight: 600, color: 'var(--color-body)',
                }}>
                  <FiTag size={13} />
                  {item.category || 'Lainnya'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-body-mid)' }}>
                  <FiClock size={13} />
                  Ditambahkan {formatDate(item.createdAt)}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px', lineHeight: 1.2 }}>
                {item.name}
              </h1>

              <p style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '24px' }}>
                {formatPrice(item.price)}
              </p>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Deskripsi Barang
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--color-body)', lineHeight: '24px', whiteSpace: 'pre-line' }}>
                  {DOMPurify.sanitize(item.description)}
                </p>
              </div>

              {/* Info box */}
              <div style={{
                backgroundColor: 'rgba(255,79,0,0.06)', border: '1px solid rgba(255,79,0,0.2)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '24px',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
              }}>
                <FiCheckCircle style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '1px' }} size={18} />
                <p style={{ fontSize: '13px', color: 'var(--color-ink-mid)' }}>
                  Hubungi penjual untuk memastikan ketersediaan barang sebelum melakukan transaksi.
                </p>
              </div>
            </div>

            {/* Action */}
            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '20px', marginTop: 'auto' }}>
              {isSold ? (
                <button disabled
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '14px 24px', backgroundColor: 'var(--color-canvas-soft)',
                    color: 'var(--color-mute)', borderRadius: 'var(--radius-md)',
                    fontSize: '16px', fontWeight: 700, border: '1px solid var(--color-border)', cursor: 'not-allowed',
                  }}>
                  <FaWhatsapp size={22} />
                  Barang Sudah Terjual
                </button>
              ) : (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '14px 24px', backgroundColor: 'var(--color-whatsapp)',
                    color: '#fff', borderRadius: 'var(--radius-md)',
                    fontSize: '16px', fontWeight: 700, textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(37,211,102,0.3)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-whatsapp-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-whatsapp)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <FaWhatsapp size={22} />
                  Chat Penjual via WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
