const express = require('express');
const rateLimit = require('express-rate-limit');
const { login } = require('../controllers/authController');

const router = express.Router();

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: { message: 'Terlalu banyak percobaan login, coba lagi setelah 15 menit.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// POST /api/auth/login
router.post('/login', loginLimiter, login);

module.exports = router;
