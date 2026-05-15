import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiImage, FiX, FiSave,
  FiDollarSign, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';
import api, { API_URL } from '../utils/api';

/* ── Image helpers ── */
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

const isSelectableImage = (f) =>
  SELECTABLE_IMAGE_TYPES.includes(f.type) || IMAGE_FILE_PATTERN.test(f.name);

const toJpegFileName = (n) => `${n.replace(/\.[^/.]+$/, '') || 'foto-barang'}.jpg`;

const loadImage = (file) =>
  new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Gagal memuat foto.')); };
    img.src = url;
  });

const canvasToBlob = (canvas, quality) =>
  new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Timeout.')), 15000);
    try {
      canvas.toBlob((blob) => {
        clearTimeout(t);
        blob ? res(blob) : rej(new Error('Gagal kompres.'));
      }, 'image/jpeg', quality);
    } catch (e) { clearTimeout(t); rej(e); }
  });

const compressImageFile = async (file) => {
  const img = await loadImage(file);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) throw new Error('Ukuran foto tidak valid.');
  for (const { maxDimension, quality } of COMPRESSION_ATTEMPTS) {
    const s = Math.min(1, maxDimension / Math.max(iw, ih));
    const w = Math.max(1, Math.round(iw * s));
    const h = Math.max(1, Math.round(ih * s));
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Gagal kanvas.');
    c.width = w; c.height = h;
    ctx.fillStyle = '#fffefb';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await canvasToBlob(c, quality);
    if (blob.size <= MAX_IMAGE_SIZE)
      return new File([blob], toJpegFileName(file.name), { type: 'image/jpeg', lastModified: Date.now() });
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

/* ─────────────────────────────────────────────── */
export default function AdminItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loadingItem, setLoadingItem] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    name: '', price: '', description: '', category: 'Lainnya',
  });
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );
  useEffect(() => () => imagePreviews.forEach(({ url }) => URL.revokeObjectURL(url)), [imagePreviews]);

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  }, []);

  /* Auth guard */
  useEffect(() => {
    if (!localStorage.getItem('bb_token')) navigate('/admin/login');
  }, [navigate]);

  /* Load item when editing */
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
        setIsSoldOut(item.status === 'sold');
        setExistingImages(item.images || []);
      } catch {
        showToast('error', 'Gagal memuat data barang.');
        navigate('/admin/dashboard');
      } finally {
        setLoadingItem(false);
      }
    })();
  }, [id, isEdit, navigate, showToast]);

  /* Image upload handler */
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (images.length + existingImages.length + files.length > MAX_IMAGES) {
      showToast('error', `Maksimal ${MAX_IMAGES} gambar per barang.`); return;
    }
    if (files.some((f) => !isSelectableImage(f))) {
      showToast('error', 'Format foto harus JPG, PNG, WebP, atau HEIC.'); return;
    }
    try {
      setProcessingImages(true);
      let compressedCount = 0;
      const prepared = [];
      for (const file of files) {
        const p = await prepareImageFile(file);
        if (p !== file) compressedCount++;
        prepared.push(p);
      }
      setImages((prev) => [...prev, ...prepared]);
      if (compressedCount > 0) showToast('success', 'Foto besar otomatis dikompres.');
    } catch {
      showToast('error', 'Gagal memproses foto.');
    } finally {
      setProcessingImages(false);
    }
  };

  const removeNew = (idx) => setImages((p) => p.filter((_, i) => i !== idx));
  const removeExisting = (idx) => setExistingImages((p) => p.filter((_, i) => i !== idx));

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const price = form.price.toString().trim();
    const description = form.description.trim();
    if (!name || !price || !description) {
      showToast('error', 'Nama, harga, dan deskripsi harus diisi.'); return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', name);
      fd.append('price', price);
      fd.append('description', description);
      fd.append('status', isEdit ? (isSoldOut ? 'sold' : 'available') : 'available');
      fd.append('category', form.category);
      images.forEach((f) => fd.append('images', f));
      existingImages.forEach((img) => fd.append('existingImages', img));
      if (isEdit) await api.put(`/items/${id}`, fd);
      else await api.post('/items', fd);
      navigate('/admin/dashboard', {
        state: {
          toast: {
            type: 'success',
            text: isEdit ? 'Barang berhasil diperbarui!' : 'Barang berhasil ditambahkan!',
          },
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.response?.status === 413 ? 'File terlalu besar.' : err.message || 'Gagal menyimpan.');
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loadingItem) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-canvas-soft)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--color-body-mid)' }}>Memuat data barang...</p>
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + images.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-canvas-soft)' }}>

      {/* ── Toast ── */}
      {toast.text && (
        <div
          className="fixed top-20 right-4 z-50 max-w-sm w-[calc(100%-32px)] sm:w-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideIn_0.3s_ease]"
          style={{
            backgroundColor: toast.type === 'success' ? '#f0fff4' : '#fff5f5',
            color: toast.type === 'success' ? '#276749' : '#9b2c2c',
            border: `1px solid ${toast.type === 'success' ? '#9ae6b4' : '#feb2b2'}`,
          }}
        >
          {toast.text}
        </div>
      )}

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-10 w-full"
        style={{ backgroundColor: 'var(--color-canvas)', borderBottom: '1px solid var(--color-border-light)' }}
      >
        <div
          className="flex items-center gap-3 h-14 px-4 sm:px-6"
          style={{ maxWidth: '672px', margin: '0 auto' }}
        >
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 rounded-lg transition-opacity hover:opacity-60 flex-shrink-0"
            style={{ color: 'var(--color-body)' }}
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold leading-tight" style={{ fontSize: '16px', color: 'var(--color-ink)' }}>
              {isEdit ? 'Edit Barang' : 'Tambah Barang Baru'}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-body-mid)' }}>
              {isEdit ? 'Perbarui informasi barang' : 'Isi detail barang yang ingin dijual'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Form body ── */}
      <div
        className="w-full px-4 sm:px-6 py-6 pb-16"
        style={{ maxWidth: '672px', margin: '0 auto' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ═══ SECTION: Foto ═══ */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border-light)' }}
          >
            {/* Section heading */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiImage size={15} style={{ color: 'var(--color-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink)' }}>
                  Foto Barang
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--color-body-mid)' }}>
                {totalImages}/{MAX_IMAGES}
              </span>
            </div>

            {/* Previews */}
            {totalImages > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {existingImages.map((imgUrl, idx) => (
                  <div key={`e-${idx}`} className="relative aspect-square">
                    <img
                      src={imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                      style={{ border: '1px solid var(--color-border-light)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExisting(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-on-primary)' }}
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
                {imagePreviews.map(({ file, url }, idx) => (
                  <div key={`${file.name}-${idx}`} className="relative aspect-square">
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                      style={{ border: '2px solid var(--color-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNew(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            {totalImages < MAX_IMAGES && (
              <label
                className="flex flex-col items-center justify-center w-full rounded-xl cursor-pointer transition-colors"
                style={{
                  height: totalImages > 0 ? '64px' : '120px',
                  border: `2px dashed ${processingImages ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: processingImages ? 'rgba(255,79,0,0.04)' : 'transparent',
                }}
              >
                {processingImages ? (
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses foto...
                  </div>
                ) : (
                  <>
                    <FiImage size={totalImages > 0 ? 18 : 26} style={{ color: 'var(--color-mute)' }} />
                    <span className="text-sm mt-1" style={{ color: 'var(--color-body-mid)' }}>
                      {totalImages > 0 ? 'Tambah foto lagi' : 'Ketuk untuk pilih foto'}
                    </span>
                    {totalImages === 0 && (
                      <span className="text-xs mt-0.5" style={{ color: 'var(--color-mute)' }}>
                        JPG · PNG · WebP · HEIC — maks {MAX_IMAGES} foto
                      </span>
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
          </div>

          {/* ═══ SECTION: Info Barang ═══ */}
          <div
            className="rounded-xl p-5 flex flex-col gap-5"
            style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border-light)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink)' }}>
              Informasi Barang
            </span>

            {/* Nama */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                Nama Barang <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="contoh: iPhone 12 Pro Max"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow"
                style={{
                  backgroundColor: 'var(--color-canvas-soft)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-border)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,79,0,0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={
                      form.category === cat
                        ? {
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-on-primary)',
                          border: '1.5px solid var(--color-primary)',
                        }
                        : {
                          backgroundColor: 'var(--color-canvas-soft)',
                          color: 'var(--color-body)',
                          border: '1.5px solid var(--color-border)',
                        }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Harga */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                Harga (Rp) <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <div className="relative">
                <FiDollarSign
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-mute)' }}
                />
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="contoh: 5000000"
                  min="0"
                  inputMode="numeric"
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-shadow"
                  style={{
                    backgroundColor: 'var(--color-canvas-soft)',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-border)',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,79,0,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                Deskripsi <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsikan kondisi barang, kekurangan, kelengkapan, dll..."
                rows={5}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none transition-shadow"
                style={{
                  backgroundColor: 'var(--color-canvas-soft)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-border)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,79,0,0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* ═══ SECTION: Status (Edit only) ═══ */}
          {isEdit && (
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border-light)' }}
            >
              <span className="text-xs font-bold uppercase tracking-widest block mb-4" style={{ color: 'var(--color-ink)' }}>
                Status Barang
              </span>

              <button
                type="button"
                onClick={() => setIsSoldOut((v) => !v)}
                className="w-full flex items-center justify-between rounded-lg px-4 py-4 transition-all"
                style={{
                  backgroundColor: isSoldOut ? 'rgba(255,79,0,0.06)' : 'var(--color-canvas-soft)',
                  border: `1.5px solid ${isSoldOut ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                }}
              >
                {/* Left: text */}
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
                    {isSoldOut ? '🔴  Sold Out' : '🟢  Tersedia'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-body-mid)' }}>
                    {isSoldOut
                      ? 'Barang ditandai terjual — tombol WA dinonaktifkan'
                      : 'Klik untuk tandai sebagai Sold Out'}
                  </p>
                </div>

                {/* Right: toggle pill */}
                <div
                  className="relative flex-shrink-0 ml-4"
                  style={{
                    width: '44px', height: '24px',
                    borderRadius: '9999px',
                    backgroundColor: isSoldOut ? 'var(--color-primary)' : 'var(--color-border)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: isSoldOut ? '23px' : '3px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s',
                    }}
                  />
                </div>
              </button>
            </div>
          )}

          {/* ═══ Submit button ═══ */}
          <button
            type="submit"
            disabled={saving || processingImages}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-4 text-base font-bold transition-opacity"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              opacity: saving || processingImages ? 0.55 : 1,
              boxShadow: '0 4px 16px rgba(255,79,0,0.28)',
              cursor: saving || processingImages ? 'not-allowed' : 'pointer',
            }}
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
