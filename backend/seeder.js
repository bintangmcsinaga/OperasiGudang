const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('./models/Item');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const dummyItems = [
  {
    name: 'iPhone 11 Pro 256GB',
    price: 6500000,
    description: 'Kondisi mulus 95%, baterai health 88%. Lengkap dengan box dan charger original. Pemakaian pribadi.',
    category: 'Elektronik',
    status: 'available',
  },
  {
    name: 'Kemeja Flannel Uniqlo Original',
    price: 150000,
    description: 'Ukuran L, warna merah kotak-kotak. Baru dipakai 3 kali, kondisi seperti baru tidak ada cacat.',
    category: 'Pakaian',
    status: 'available',
  },
  {
    name: 'Sofa Minimalis 2 Seater',
    price: 1200000,
    description: 'Warna abu-abu, bahan fabric tebal. Busa masih sangat empuk. Dijual karena pindah rumah.',
    category: 'Furniture',
    status: 'available',
  },
  {
    name: 'Blender Philips HR2115',
    price: 350000,
    description: 'Fungsi normal 100%, pisau masih tajam. Minus dus sudah hilang.',
    category: 'Peralatan Rumah Tangga',
    status: 'sold',
  },
  {
    name: 'Sepeda Gunung Polygon Cascade 3',
    price: 2100000,
    description: 'Sepeda gunung polygon kondisi 90%, jarang dipakai. Rantai sudah dilumasi, rem pakem.',
    category: 'Olahraga',
    status: 'available',
  },
  {
    name: "Novel Harry Potter and the Sorcerer's Stone",
    price: 85000,
    description: 'Buku original bahasa Indonesia. Kertas agak menguning wajar karena usia, halaman lengkap.',
    category: 'Buku',
    status: 'available',
  },
  {
    name: 'Helm Bogo Retro',
    price: 120000,
    description: 'Warna hitam doff, kaca datar pelangi. Busa tebal, ada lecet sedikit di bagian atas.',
    category: 'Kendaraan',
    status: 'available',
  },
  {
    name: 'MacBook Air M1 2020',
    price: 11500000,
    description: 'RAM 8GB, SSD 256GB. Cycle count masih rendah 150. Mulus tanpa dent.',
    category: 'Elektronik',
    status: 'available',
  },
  {
    name: 'Setrika Maspion HA-110',
    price: 75000,
    description: 'Pemanas masih sangat cepat, kabel aman tidak ada yang mengelupas.',
    category: 'Peralatan Rumah Tangga',
    status: 'available',
  },
  {
    name: "Jaket Denim Levi's",
    price: 450000,
    description: 'Ukuran M, warna biru pudar alami. Tidak ada robek, kancing lengkap.',
    category: 'Pakaian',
    status: 'available',
  }
];

const importData = async () => {
  try {
    await Item.deleteMany(); // Hapus data lama
    await Item.insertMany(dummyItems); // Masukkan data dummy

    console.log('✅ Data Dummy Berhasil Ditambahkan!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
