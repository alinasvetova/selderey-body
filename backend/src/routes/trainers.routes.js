const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/trainers — публичный список
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM trainers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/trainers/:id — публичная карточка тренера
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM trainers WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Тренер не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/trainers — создание (только admin)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Укажите имя тренера'),
    body('role_title').trim().notEmpty().withMessage('Укажите специализацию')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, role_title, bio, photo_url, experience_years } = req.body;
      const result = await db.query(
        `INSERT INTO trainers (name, role_title, bio, photo_url, experience_years)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, role_title, bio || null, photo_url || null, experience_years || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/trainers/:id — обновление (только admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, role_title, bio, photo_url, experience_years } = req.body;
    const result = await db.query(
      `UPDATE trainers SET
         name = COALESCE($1, name),
         role_title = COALESCE($2, role_title),
         bio = COALESCE($3, bio),
         photo_url = COALESCE($4, photo_url),
         experience_years = COALESCE($5, experience_years)
       WHERE id = $6 RETURNING *`,
      [name, role_title, bio, photo_url, experience_years, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Тренер не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trainers/:id — удаление (только admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM trainers WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Тренер не найден' });
    res.json({ message: 'Тренер удалён', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
