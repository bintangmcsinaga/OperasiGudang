import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPackage, FiChevronDown } from 'react-icons/fi';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | available | sold
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/items');
      setItems(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data barang. Pastikan server berjalan.');
      console.error('Fetch items error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(fetchItems, 0);
    return () => window.clearTimeout(loadTimer);
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesCategory = categoryFilter === 'Semua Kategori' || item.category === categoryFilter;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const categories = [
    'Semua Kategori',
    'Pakaian',
    'Elektronik',
    'Peralatan Rumah Tangga',
    'Furniture',
    'Olahraga',
    'Buku',
    'Kendaraan',
    'Lainnya',
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ backgroundColor: 'var(--color-ink)' }} className="relative overflow-hidden">
        {/* Decorative warm circle */}
        <div style={{ background: 'var(--color-primary)', opacity: 0.08 }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" />
        <div style={{ background: 'var(--color-primary)', opacity: 0.05 }}
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6"
            style={{
              backgroundColor: 'rgba(255,79,0,0.15)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 16px',
            }}>
            <FiPackage size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
              KATALOG BARANG BERKUALITAS
            </span>
          </div>

          <h1 style={{
            color: 'var(--color-on-primary)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 500,
            lineHeight: 1.05,
            marginBottom: '16px',
          }}>
            Temukan barang bagus<br />
            <span style={{ color: 'var(--color-primary)' }}>berkualitas & terjangkau.</span>
          </h1>

          <p style={{ color: 'var(--color-mute)', fontSize: '18px', lineHeight: '27px', maxWidth: '540px', margin: '0 auto 40px' }}>
            Jelajahi koleksi pilihan kami. Hubungi langsung via WhatsApp untuk info lebih lanjut.
          </p>

          {/* Search bar */}
          <div className="w-full relative">
            <FiSearch
              style={{
                color: 'var(--color-body-mid)',
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
              }}
              size={20}
            />

            <input
              type="text"
              placeholder="Cari barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',

                paddingLeft: '52px',
                paddingRight: '20px',
                paddingTop: '14px',
                paddingBottom: '14px',

                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-ink)',

                border: 'none',
                borderRadius: 'var(--radius-md)',

                fontSize: '16px',

                boxShadow: '0 8px 32px rgba(32,21,21,0.18)',
                outline: 'none',

                transition: '0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow =
                  '0 8px 32px rgba(255,79,0,0.25)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow =
                  '0 8px 32px rgba(32,21,21,0.18)';
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ backgroundColor: 'var(--color-canvas-soft)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Filters row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'available', label: 'Tersedia' },
                { key: 'sold', label: 'Terjual' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={filter === f.key
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)', border: 'none' }
                    : { backgroundColor: 'var(--color-canvas)', color: 'var(--color-body)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                  className="px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer"
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    paddingLeft: '14px',
                    paddingRight: '36px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    backgroundColor: 'var(--color-canvas)',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <FiChevronDown
                  size={16}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-body-mid)' }}
                />
              </div>

              <p style={{ color: 'var(--color-body-mid)', fontSize: '14px' }}>
                {filteredItems.length} barang
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && <LoadingSpinner />}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-16">
              <div style={{ backgroundColor: '#fff0eb', borderRadius: 'var(--radius-md)' }}
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ color: 'var(--color-ink)', fontSize: '20px', fontWeight: 700 }} className="mb-2">Gagal Memuat Data</h3>
              <p style={{ color: 'var(--color-body)' }} className="mb-4">{error}</p>
              <button
                onClick={fetchItems}
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)' }}
                className="px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FiPackage style={{ color: 'var(--color-mute)' }} size={32} />
              </div>
              <h3 style={{ color: 'var(--color-ink)', fontSize: '20px', fontWeight: 700 }} className="mb-2">Belum Ada Barang</h3>
              <p style={{ color: 'var(--color-body)' }}>
                {search ? 'Tidak ada barang yang cocok dengan pencarian Anda.' : 'Belum ada barang yang ditambahkan.'}
              </p>
            </div>
          )}

          {/* Items grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-canvas-soft)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '14px', color: 'var(--color-mute)' }}>
                &copy; {new Date().getFullYear()} Operasi Gudang By Bintang Ganteng.
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-body-mid)' }}>
              Katalog Barang Berkualitas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
