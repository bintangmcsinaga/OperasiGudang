import { useState, useEffect } from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';
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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/items');
      setItems(res.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data barang. Pastikan server berjalan.');
      console.error('Fetch items error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FiPackage size={16} />
              <span className="text-sm font-medium">Katalog Barang Bekas Berkualitas</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Temukan Barang Bekas
              <span className="block text-highlight mt-1">Berkualitas & Terjangkau</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Jelajahi koleksi barang bekas pilihan kami. Hubungi langsung via WhatsApp untuk informasi lebih lanjut.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                placeholder="Cari barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white text-text-primary rounded-2xl shadow-xl border-0 outline-none focus:ring-2 focus:ring-highlight/50 transition-shadow text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter tabs */}
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
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === f.key
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-text-secondary hover:bg-surface-dark border border-border'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-text-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-text-muted">
            {filteredItems.length} barang ditemukan
          </p>
        </div>

        {/* Loading state */}
        {loading && <LoadingSpinner />}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-sold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Gagal Memuat Data</h3>
            <p className="text-text-secondary mb-4">{error}</p>
            <button
              onClick={fetchItems}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface-dark rounded-2xl flex items-center justify-center">
              <FiPackage className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Belum Ada Barang</h3>
            <p className="text-text-secondary">
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

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">BB</span>
              </div>
              <span className="text-sm text-text-secondary">
                &copy; {new Date().getFullYear()} operasigudang By Bintang Ganteng. All rights reserved.
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Katalog Barang Bekas Berkualitas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
