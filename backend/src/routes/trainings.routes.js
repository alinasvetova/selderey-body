const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/trainings — список направлений (+ имя основного тренера)
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const params = [];
    let where = '';
    if (category && category !== 'all') {
      params.push(category);
      where = 'WHERE t.category = $1';
    }
    const result = await db.query(
      `SELECT t.*, tr.name AS trainer_name
       FROM trainings t
       LEFT JOIN trainers tr ON tr.id = t.trainer_id
       ${where}
       ORDER BY t.id ASC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/trainings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT t.*, tr.name AS trainer_name
       FROM trainings t
       LEFT JOIN trainers tr ON tr.id = t.trainer_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Направление не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/trainings — создание (только admin)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Укажите название направления'),
    body('category').isIn(['health', 'strength', 'stretch', 'dance', 'moms']).withMessage('Недопустимая категория')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, category, description, trainer_id } = req.body;
      const result = await db.query(
        `INSERT INTO trainings (title, category, description, trainer_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, category, description || null, trainer_id || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/trainings/:id — обновление (только admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, category, description, trainer_id } = req.body;
    const result = await db.query(
      `UPDATE trainings SET
         title = COALESCE($1, title),
         category = COALESCE($2, category),
         description = COALESCE($3, description),
         trainer_id = COALESCE($4, trainer_id)
       WHERE id = $5 RETURNING *`,
      [title, category, description, trainer_id, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Направление не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trainings/:id — удаление (только admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM trainings WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Направление не найдено' });
    res.json({ message: 'Направление удалено', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
