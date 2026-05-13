import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiImage, FiX, FiSave, FiDollarSign,
} from 'react-icons/fi';
import api, { API_URL } from '../utils/api';

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SELECTABLE_IMAGE_TYPES = [...ALLOWED_IMAGE_TYPES, 'image/heic', 'image/heif'];
const IMAGE_FILE_PATTERN = /\.(jpe?g|png|webp|heic|heif)$/i;
const COMPRESSION_ATTEMPTS = [
  { maxDimension: 1800, quality: 0.82 },
  { maxDimension: 1400, quality: 0.74 },
  { maxDimension: 1100, quality: 0.68 },
];

const isSelectableImage = (file) =>
  SELECTABLE_IMAGE_TYPES.includes(file.type) || IMAGE_FILE_PATTERN.test(file.name);

const toJpegFileName = (fileName) => {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return `${baseName || 'foto-barang'}.jpg`;
};

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(objectUrl); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Gagal memuat foto.')); };
    image.src = objectUrl;
  });

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) { resolve(blob); return; }
      reject(new Error('Gagal mengompres foto.'));
    }, 'image/jpeg', quality);
  });

const compressImageFile = async (file) => {
  const image = await loadImage(file);
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (!imageWidth || !imageHeight) throw new Error('Ukuran foto tidak valid.');

  for (const { maxDimension, quality } of COMPRESSION_ATTEMPTS) {
    const scale = Math.min(1, maxDimension / Math.max(imageWidth, imageHeight));
    const width = Math.max(1, Math.round(imageWidth * scale));
    const height = Math.max(1, Math.round(imageHeight * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Gagal menyiapkan kanvas foto.');
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_IMAGE_SIZE) {
      return new File([blob], toJpegFileName(file.name), { type: 'image/jpeg', lastModified: Date.now() });
    }
  }
  throw new Error('Foto terlalu besar.');
};

const prepareImageFile = async (file) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE) return file;
  return compressImageFile(file);
};

const CATEGORIES = [
  'Pakaian', 'Elektronik', 'Peralatan Rumah Tangga',
  'Furniture', 'Olahraga', 'Buku', 'Kendaraan', 'Lainnya',
];

export default function AdminItemForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);

  const [loadingItem, setLoadingItem] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    name: '', price: '', description: '', category: 'Lainnya',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images]
  );

  useEffect(() => {
    return () => imagePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  }, []);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('bb_token');
    if (!token) { navigate('/admin/login'); }
  }, [navigate]);

  // Load item data when editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await api.get(`/items/${id}`);
        const item = res.data;
        setForm({
          name: item.name,
          price: item.price.toString(),
          description: item.description,
          category: item.category || 'Lainnya',
        });
        setExistingImages(item.images || []);
      } catch {
        showToast('error', 'Gagal memuat data barang.');
        navigate('/admin/dashboard');
      } finally {
        setLoadingItem(false);
      }
    })();
  }, [id, isEdit, navigate, showToast]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    if (images.length + existingImages.length + files.length > MAX_IMAGES) {
      showToast('error', `Maksimal ${MAX_IMAGES} gambar per barang.`);
      return;
    }
    if (files.some((f) => !isSelectableImage(f))) {
      showToast('error', 'Format foto harus JPG, PNG, WebP, atau HEIC.');
      return;
    }

    try {
      setProcessingImages(true);
      let compressedCount = 0;
      const preparedFiles = [];
      for (const file of files) {
        const prepared = await prepareImageFile(file);
        if (prepared !== file) compressedCount++;
        preparedFiles.push(prepared);
      }
      setImages((prev) => [...prev, ...preparedFiles]);
      if (compressedCount > 0) showToast('success', 'Foto besar otomatis dikompres.');
    } catch {
      showToast('error', 'Gagal memproses foto. Gunakan JPG, PNG, WebP, atau HEIC yang lebih kecil.');
    } finally {
      setProcessingImages(false);
    }
  };

  const removeNewImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx) => setExistingImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {
      name: form.name.trim(),
      price: form.price.toString().trim(),
      description: form.description.trim(),
    };
    if (!next.name || !next.price || !next.description) {
      showToast('error', 'Nama, harga, dan deskripsi harus diisi.');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', next.name);
      formData.append('price', next.price);
      formData.append('description', next.description);
      formData.append('status', 'available');
      formData.append('category', form.category);
      images.forEach((file) => formData.append('images', file));
      existingImages.forEach((img) => formData.append('existingImages', img));

      if (isEdit) {
        await api.put(`/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      navigate('/admin/dashboard', {
        state: { toast: { type: 'success', text: isEdit ? 'Barang berhasil diperbarui!' : 'Barang berhasil ditambahkan!' } },
      });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menyimpan barang.');
      setSaving(false);
    }
  };

  if (loadingItem) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">Memuat data barang...</p>
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + images.length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc]">

      {/* Toast */}
      {toast.text && (
        <div className={`fixed left-4 right-4 top-20 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium shadow-xl animate-[slideIn_0.3s_ease] sm:left-auto sm:right-6 sm:max-w-sm ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 rounded-xl hover:bg-surface-dark transition-colors text-text-secondary"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary leading-tight">
              {isEdit ? 'Edit Barang' : 'Tambah Barang Baru'}
            </h1>
            <p className="text-xs text-text-muted">
              {isEdit ? 'Perbarui informasi barang' : 'Isi detail barang yang ingin dijual'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Foto Barang ── */}
          <section className="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FiImage size={16} className="text-accent" />
              Foto Barang
              <span className="ml-auto text-xs font-normal text-text-muted">{totalImages}/{MAX_IMAGES}</span>
            </h2>

            {/* Previews */}
            {totalImages > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {existingImages.map((imgUrl, idx) => (
                  <div key={`exist-${idx}`} className="relative group aspect-square">
                    <img
                      src={imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg shadow-md"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                {imagePreviews.map(({ file, url }, idx) => (
                  <div key={`${file.name}-${file.lastModified}-${idx}`} className="relative group aspect-square">
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl border-2 border-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg shadow-md"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            {totalImages < MAX_IMAGES && (
              <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                processingImages
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent hover:bg-accent/5'
              } ${totalImages > 0 ? 'h-20' : 'h-36'}`}>
                {processingImages ? (
                  <div className="flex items-center gap-2 text-accent text-sm font-medium">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses foto...
                  </div>
                ) : (
                  <>
                    <FiImage className="text-text-muted mb-1" size={totalImages > 0 ? 20 : 28} />
                    <span className="text-sm text-text-muted font-medium">
                      {totalImages > 0 ? 'Tambah foto lagi' : 'Ketuk untuk pilih foto'}
                    </span>
                    {totalImages === 0 && (
                      <span className="text-xs text-text-muted mt-0.5">JPG, PNG, WebP, HEIC · Maks {MAX_IMAGES} foto</span>
                    )}
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  disabled={processingImages}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </section>

          {/* ── Informasi Barang ── */}
          <section className="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">i</span>
              Informasi Barang
            </h2>

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="contoh: iPhone 12 Pro Max"
                className="w-full rounded-xl border border-border bg-surface-dark px-4 py-3 text-base transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-sm"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.category === cat
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'bg-white text-text-secondary border-border hover:border-accent hover:text-accent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Harga */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="contoh: 5000000"
                  min="0"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-border bg-surface-dark py-3 pl-10 pr-4 text-base transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-sm"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsikan kondisi barang, kekurangan, kelengkapan, dll..."
                rows={5}
                className="w-full resize-none rounded-xl border border-border bg-surface-dark px-4 py-3 text-base transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-sm"
              />
            </div>
          </section>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={saving || processingImages}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-accent py-4 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <FiSave size={18} />
                {isEdit ? 'Simpan Perubahan' : 'Tambah Barang'}
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
