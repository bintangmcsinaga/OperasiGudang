const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama barang harus diisi'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Harga barang harus diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    description: {
      type: String,
      required: [true, 'Deskripsi barang harus diisi'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Pakaian',
        'Elektronik',
        'Peralatan Rumah Tangga',
        'Furniture',
        'Olahraga',
        'Buku',
        'Kendaraan',
        'Lainnya',
      ],
      required: [true, 'Kategori barang harus diisi'],
      default: 'Lainnya',
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

module.exports = mongoose.model('Item', itemSchema);
