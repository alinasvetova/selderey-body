const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register — регистрация клиента
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Имя должно быть не короче 2 символов'),
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 8 }).withMessage('Пароль должен быть не короче 8 символов')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, phone } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);

      const result = await db.query(
        `INSERT INTO users (name, email, password_hash, phone, role)
         VALUES ($1, $2, $3, $4, 'client')
         RETURNING id, name, email, phone, role, created_at`,
        [name, email, passwordHash, phone || null]
      );

      const user = result.rows[0];
      const token = signToken(user);
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login — вход
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Введите пароль')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

      const passwordOk = await bcrypt.compare(password, user.password_hash);
      if (!passwordOk) return res.status(401).json({ message: 'Неверный email или пароль' });

      const token = signToken(user);
      delete user.password_hash;
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me — текущий пользователь по токену
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
