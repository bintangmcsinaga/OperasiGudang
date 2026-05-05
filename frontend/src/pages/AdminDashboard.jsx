import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiEdit2, FiTrash2, FiLogOut, FiX,
  FiImage, FiPackage, FiDollarSign, FiCheckCircle,
  FiXCircle, FiSave, FiAlertTriangle,
} from 'react-icons/fi';
import api, { API_URL } from '../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', price: '', description: '', status: 'available', category: 'Lainnya', image: null,
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('bb_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchItems();
  }, [navigate]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/items');
      setItems(res.data);
    } catch (err) {
      showMessage('error', 'Gagal memuat data barang.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const openAddModal = () => {
    setEditItem(null);
    setForm({ name: '', price: '', description: '', status: 'available', category: 'Lainnya', image: null });
    setPreview(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      status: item.status,
      category: item.category || 'Lainnya',
      image: null,
    });
    setPreview(item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setPreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.description) {
      showMessage('error', 'Semua field harus diisi.');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('status', form.status);
      formData.append('category', form.category);
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editItem) {
        await api.put(`/items/${editItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showMessage('success', 'Barang berhasil diperbarui!');
      } else {
        await api.post('/items', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showMessage('success', 'Barang berhasil ditambahkan!');
      }

      closeModal();
      fetchItems();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Gagal menyimpan barang.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      showMessage('success', 'Barang berhasil dihapus!');
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      showMessage('error', 'Gagal menghapus barang.');
    }
  };

  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'available' ? 'sold' : 'available';
      await api.put(`/items/${item._id}`, { status: newStatus });
      showMessage('success', `Status diubah menjadi ${newStatus === 'sold' ? 'Sold Out' : 'Tersedia'}.`);
      fetchItems();
    } catch (err) {
      showMessage('error', 'Gagal mengubah status.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bb_token');
    navigate('/admin/login');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc]">
      {/* Toast notification */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-[slideIn_0.3s_ease] ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Dashboard Admin</h1>
              <p className="text-sm text-text-muted mt-1">
                Kelola katalog barang bekas Anda
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
              >
                <FiPlus size={18} />
                Tambah Barang
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border text-text-secondary rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiPackage className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{items.length}</p>
                <p className="text-xs text-text-muted">Total Barang</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-available" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {items.filter(i => i.status === 'available').length}
                </p>
                <p className="text-xs text-text-muted">Tersedia</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <FiXCircle className="text-sold" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {items.filter(i => i.status === 'sold').length}
                </p>
                <p className="text-xs text-text-muted">Terjual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-accent border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-text-muted">Memuat data...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <FiPackage className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Belum Ada Barang</h3>
            <p className="text-sm text-text-muted mb-4">
              Mulai tambahkan barang ke katalog Anda.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              <FiPlus size={16} />
              Tambah Barang Pertama
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-dark border-b border-border">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Barang</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Harga</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img
                              src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center">
                              <FiImage className="text-text-muted" size={18} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-text-primary text-sm">{item.name}</p>
                            <span className="inline-block px-2 py-0.5 mt-1 bg-surface-dark border border-border rounded text-[10px] text-text-secondary font-medium">
                              {item.category || 'Lainnya'}
                            </span>
                            <p className="text-xs text-text-muted line-clamp-1 max-w-[300px] mt-1">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-text-primary">{formatPrice(item.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            item.status === 'available'
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {item.status === 'available' ? 'Tersedia' : 'Sold Out'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg text-text-muted hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item)}
                            className="p-2 rounded-lg text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border-light">
              {items.map((item) => (
                <div key={item._id} className="p-4 flex items-start gap-3">
                  {item.image ? (
                    <img
                      src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-surface-dark flex items-center justify-center shrink-0">
                      <FiImage className="text-text-muted" size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-text-primary text-sm">{item.name}</p>
                        <span className="inline-block px-2 py-0.5 mt-0.5 bg-surface-dark border border-border rounded text-[10px] text-text-secondary font-medium">
                          {item.category || 'Lainnya'}
                        </span>
                        <p className="text-sm font-semibold text-accent mt-0.5">{formatPrice(item.price)}</p>
                      </div>
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                          item.status === 'available'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {item.status === 'available' ? 'Tersedia' : 'Sold'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => openEditModal(item)} className="text-xs text-blue-600 font-medium">Edit</button>
                      <span className="text-border">|</span>
                      <button onClick={() => setDeleteConfirm(item)} className="text-xs text-red-600 font-medium">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">
                {editItem ? 'Edit Barang' : 'Tambah Barang Baru'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-surface-dark transition-colors">
                <FiX size={20} className="text-text-muted" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Foto Barang</label>
                <div className="relative">
                  {preview ? (
                    <div className="relative group">
                      <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-border" />
                      <button
                        type="button"
                        onClick={() => { setPreview(null); setForm({ ...form, image: null }); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-surface-dark hover:border-accent transition-all">
                      <FiImage className="text-text-muted mb-2" size={32} />
                      <span className="text-sm text-text-muted">Klik untuk upload foto</span>
                      <span className="text-xs text-text-muted mt-1">JPG, PNG, WebP (max 5MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Nama Barang</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="contoh: iPhone 12 Pro Max"
                  className="w-full px-4 py-3 bg-surface-dark border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-dark border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
                >
                  <option value="Pakaian">Pakaian</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Peralatan Rumah Tangga">Peralatan Rumah Tangga</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Buku">Buku</option>
                  <option value="Kendaraan">Kendaraan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Harga (Rp)</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="contoh: 5000000"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 bg-surface-dark border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsikan kondisi barang..."
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-dark border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 'available' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      form.status === 'available'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-white text-text-secondary border-border hover:bg-surface-dark'
                    }`}
                  >
                    <FiCheckCircle size={16} />
                    Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 'sold' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      form.status === 'sold'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-white text-text-secondary border-border hover:bg-surface-dark'
                    }`}
                  >
                    <FiXCircle size={16} />
                    Sold Out
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    {editItem ? 'Simpan Perubahan' : 'Tambah Barang'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-2xl flex items-center justify-center">
              <FiAlertTriangle className="text-red-500" size={28} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Hapus Barang?</h3>
            <p className="text-sm text-text-muted mb-6">
              Anda yakin ingin menghapus <strong>{deleteConfirm.name}</strong>? Aksi ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-dark transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
