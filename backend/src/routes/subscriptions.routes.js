const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/subscriptions — публичный список тарифов (frontend/prices.html)
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM subscriptions ORDER BY price ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions — создание тарифа (только admin)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Укажите название тарифа'),
    body('price').isFloat({ min: 0 }).withMessage('Укажите корректную цену')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, price, classes_count, duration_days, description, is_popular } = req.body;
      const result = await db.query(
        `INSERT INTO subscriptions (title, price, classes_count, duration_days, description, is_popular)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, price, classes_count ?? null, duration_days || 30, description || null, !!is_popular]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/subscriptions/:id — обновление тарифа (только admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, price, classes_count, duration_days, description, is_popular } = req.body;
    const result = await db.query(
      `UPDATE subscriptions SET
         title = COALESCE($1, title),
         price = COALESCE($2, price),
         classes_count = $3,
         duration_days = COALESCE($4, duration_days),
         description = COALESCE($5, description),
         is_popular = COALESCE($6, is_popular)
       WHERE id = $7 RETURNING *`,
      [title, price, classes_count, duration_days, description, is_popular, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Тариф не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subscriptions/:id — удаление тарифа (только admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM subscriptions WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Тариф не найден' });
    res.json({ message: 'Тариф удалён', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
