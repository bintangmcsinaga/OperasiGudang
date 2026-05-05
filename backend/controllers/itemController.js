const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/items
 * Public — get all items, sorted by newest first
 */
const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Gagal mengambil data barang.' });
  }
};

/**
 * GET /api/items/:id
 * Public — get single item
 */
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }
    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Gagal mengambil data barang.' });
  }
};

/**
 * POST /api/items
 * Protected — create new item with image upload
 */
const createItem = async (req, res) => {
  try {
    const { name, price, description, status } = req.body;

    const item = new Item({
      name,
      price: Number(price),
      description,
      status: status || 'available',
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Create item error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Gagal menambahkan barang.' });
  }
};

/**
 * PUT /api/items/:id
 * Protected — update existing item
 */
const updateItem = async (req, res) => {
  try {
    const { name, price, description, status } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    // Update fields
    if (name !== undefined) item.name = name;
    if (price !== undefined) item.price = Number(price);
    if (description !== undefined) item.description = description;
    if (status !== undefined) item.status = status;

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (item.image) {
        const oldImagePath = path.join(__dirname, '..', item.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      item.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error('Update item error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Gagal mengupdate barang.' });
  }
};

/**
 * DELETE /api/items/:id
 * Protected — delete item and its image
 */
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    // Delete image file if exists
    if (item.image) {
      const imagePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Barang berhasil dihapus.' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Gagal menghapus barang.' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
