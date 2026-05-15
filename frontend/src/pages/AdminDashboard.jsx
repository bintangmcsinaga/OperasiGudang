import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiPlus, FiEdit2, FiTrash2, FiLogOut,
  FiImage, FiPackage, FiCheckCircle,
  FiXCircle, FiAlertTriangle,
} from 'react-icons/fi';
import DOMPurify from 'dompurify';
import api, { API_URL } from '../utils/api';

const S = {
  page: { backgroundColor: 'var(--color-canvas-soft)', minHeight: 'calc(100vh - 64px)' },
  header: { backgroundColor: 'var(--color-canvas)', borderBottom: '1px solid var(--color-border-light)' },
  card: { backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch {
      showMessage('error', 'Gagal memuat data barang.');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    const token = localStorage.getItem('bb_token');
    if (!token) { navigate('/admin/login'); return; }
    const t = window.setTimeout(fetchItems, 0);
    return () => window.clearTimeout(t);
  }, [navigate, fetchItems]);

  useEffect(() => {
    if (location.state?.toast) {
      const { type, text } = location.state.toast;
      showMessage(type, text);
      window.history.replaceState({}, '');
    }
  }, [location.state, showMessage]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      showMessage('success', 'Barang berhasil dihapus!');
      setDeleteConfirm(null);
      fetchItems();
    } catch {
      showMessage('error', 'Gagal menghapus barang.');
    }
  };

  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'available' ? 'sold' : 'available';
      await api.put(`/items/${item._id}`, { status: newStatus });
      showMessage('success', `Status diubah menjadi ${newStatus === 'sold' ? 'Sold Out' : 'Tersedia'}.`);
      fetchItems();
    } catch {
      showMessage('error', 'Gagal mengubah status.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bb_token');
    navigate('/admin/login');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(price);

  const statCards = [
    {
      label: 'Total Barang', value: items.length,
      icon: <FiPackage size={20} style={{ color: 'var(--color-primary)' }} />,
      bg: '#fff0eb',
    },
    {
      label: 'Tersedia', value: items.filter(i => i.status === 'available').length,
      icon: <FiCheckCircle size={20} style={{ color: '#2a7a2a' }} />,
      bg: '#f0fff4',
    },
    {
      label: 'Terjual', value: items.filter(i => i.status === 'sold').length,
      icon: <FiXCircle size={20} style={{ color: 'var(--color-ink)' }} />,
      bg: 'var(--color-canvas-soft)',
    },
  ];

  return (
    <div style={S.page}>

      {/* Toast */}
      {message.text && (
        <div style={{
          position: 'fixed', left: '16px', right: '16px', top: '76px', zIndex: 50,
          backgroundColor: message.type === 'success' ? '#f0fff4' : '#fff5f5',
          color: message.type === 'success' ? '#276749' : '#9b2c2c',
          border: `1px solid ${message.type === 'success' ? '#c6f6d5' : '#fed7d7'}`,
          borderRadius: 'var(--radius-md)', padding: '12px 20px',
          fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 24px rgba(32,21,21,0.12)', animation: 'slideIn 0.3s ease',
          maxWidth: '400px',
        }} className="sm:left-auto sm:right-4">
          {message.type === 'success' ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Header */}
      <div style={S.header}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-ink)' }}>Dashboard Admin</h1>
              <p style={{ fontSize: '14px', color: 'var(--color-body-mid)', marginTop: '2px' }}>Kelola katalog barang bekas Anda</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/items/new')}
                style={{
                  backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-md)', padding: '10px 20px',
                  fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 2px 8px rgba(255,79,0,0.28)', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <FiPlus size={18} /> Tambah Barang
              </button>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'var(--color-canvas)', color: 'var(--color-body)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  padding: '10px 16px', fontSize: '14px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff5f5'; e.currentTarget.style.color = '#9b2c2c'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-canvas)'; e.currentTarget.style.color = 'var(--color-body)'; }}
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} style={{ ...S.card, padding: '20px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-body-mid)', marginTop: '2px' }}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Items List */}
        {loading ? (
          <div style={{ ...S.card, padding: '32px', textAlign: 'center' }}>
            <div style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
              className="animate-spin w-8 h-8 border-[3px] rounded-full mx-auto mb-3" />
            <p style={{ fontSize: '14px', color: 'var(--color-body-mid)' }}>Memuat data...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ ...S.card, padding: '48px', textAlign: 'center' }}>
            <FiPackage style={{ color: 'var(--color-mute)', margin: '0 auto 16px' }} size={48} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px' }}>Belum Ada Barang</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-body-mid)', marginBottom: '16px' }}>Mulai tambahkan barang ke katalog Anda.</p>
            <button onClick={() => navigate('/admin/items/new')}
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)', padding: '10px 20px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FiPlus size={16} /> Tambah Barang Pertama
            </button>
          </div>
        ) : (
          <div style={S.card}>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-canvas-soft)', borderBottom: '1px solid var(--color-border-light)' }}>
                    {['Barang', 'Harga', 'Status', 'Aksi'].map((h, i) => (
                      <th key={h} style={{
                        padding: '12px 20px', fontSize: '11px', fontWeight: 700,
                        color: 'var(--color-body-mid)', textTransform: 'uppercase', letterSpacing: '0.08em',
                        textAlign: i === 3 ? 'right' : 'left',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item._id}
                      style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-canvas-soft)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div className="flex items-center gap-4">
                          {item.images?.length > 0 ? (
                            <img src={item.images[0].startsWith('http') ? item.images[0] : `${API_URL}${item.images[0]}`}
                              alt={item.name}
                              style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border-light)' }} />
                          ) : (
                            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-canvas-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiImage style={{ color: 'var(--color-mute)' }} size={18} />
                            </div>
                          )}
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: '14px' }}>{item.name}</p>
                            <span style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1px 8px', fontSize: '10px', color: 'var(--color-body)', fontWeight: 600 }}>
                              {item.category || 'Lainnya'}
                            </span>
                            <p style={{ fontSize: '12px', color: 'var(--color-body-mid)', marginTop: '2px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {DOMPurify.sanitize(item.description)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>{formatPrice(item.price)}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button onClick={() => toggleStatus(item)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
                            backgroundColor: item.status === 'available' ? '#f0fff4' : '#fff0eb',
                            color: item.status === 'available' ? '#276749' : 'var(--color-primary)',
                            transition: 'opacity 0.2s',
                          }}
                          title="Klik untuk ubah status"
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.status === 'available' ? '#2a7a2a' : 'var(--color-primary)' }} />
                          {item.status === 'available' ? 'Tersedia' : 'Sold Out'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/admin/items/${item._id}/edit`)}
                            style={{ padding: '7px', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-body-mid)', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ebf4ff'; e.currentTarget.style.color = '#2563eb'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-body-mid)'; }}
                            title="Edit">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => setDeleteConfirm(item)}
                            style={{ padding: '7px', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-body-mid)', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff5f5'; e.currentTarget.style.color = '#c53030'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-body-mid)'; }}
                            title="Hapus">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
              {items.map((item) => (
                <div key={item._id} style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {item.images?.length > 0 ? (
                    <img src={item.images[0].startsWith('http') ? item.images[0] : `${API_URL}${item.images[0]}`}
                      alt={item.name}
                      style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border-light)', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-canvas-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiImage style={{ color: 'var(--color-mute)' }} size={20} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: '14px' }}>{item.name}</p>
                        <span style={{ backgroundColor: 'var(--color-canvas-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1px 6px', fontSize: '10px', color: 'var(--color-body)', fontWeight: 600, display: 'inline-block', marginTop: '2px' }}>
                          {item.category || 'Lainnya'}
                        </span>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>{formatPrice(item.price)}</p>
                      </div>
                      <button onClick={() => toggleStatus(item)}
                        style={{
                          padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: 700,
                          border: 'none', cursor: 'pointer', flexShrink: 0,
                          backgroundColor: item.status === 'available' ? '#f0fff4' : '#fff0eb',
                          color: item.status === 'available' ? '#276749' : 'var(--color-primary)',
                        }}>
                        {item.status === 'available' ? 'Tersedia' : 'Sold'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <button onClick={() => navigate(`/admin/items/${item._id}/edit`)}
                        style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Edit
                      </button>
                      <span style={{ color: 'var(--color-border)' }}>|</span>
                      <button onClick={() => setDeleteConfirm(item)}
                        style={{ fontSize: '12px', fontWeight: 600, color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(32,21,21,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '360px', padding: '32px', textAlign: 'center', boxShadow: '0 24px 48px rgba(32,21,21,0.2)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', backgroundColor: '#fff0eb', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiAlertTriangle style={{ color: 'var(--color-primary)' }} size={26} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px' }}>Hapus Barang?</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-body)', marginBottom: '24px' }}>
              Anda yakin ingin menghapus <strong>{deleteConfirm.name}</strong>? Aksi ini tidak bisa dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: '10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 500, color: 'var(--color-body)', backgroundColor: 'var(--color-canvas)', cursor: 'pointer' }}>
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm._id)}
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--color-ink)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
