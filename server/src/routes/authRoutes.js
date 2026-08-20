const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

// Throttle auth endpoints to reduce brute-force / credential-stuffing risk (OWASP A07).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must include an uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must include a lowercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must include a number')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('Password must include a special character'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', requireAuth, me);

module.exports = router;
