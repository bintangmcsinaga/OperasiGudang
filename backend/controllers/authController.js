const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Hardcoded admin password hash (generated at startup)
let adminPasswordHash = null;

const initAdminPassword = async () => {
  adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
};

// Initialize on module load
initAdminPassword();

/**
 * POST /api/auth/login
 * Admin login with hardcoded credentials
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi.' });
    }

    // Check against hardcoded credentials
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, adminPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil.',
      token,
      user: { username, role: 'admin' },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = { login };
