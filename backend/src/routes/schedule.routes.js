const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

// GET /api/schedule — публичное расписание (день, время, направление, тренер)
// Формат ответа соответствует тому, что ожидает frontend/js/api.js
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.id, s.day_of_week AS day, s.start_time AS time,
              t.title, tr.name AS trainer
       FROM schedule_slots s
       JOIN trainings t ON t.id = s.training_id
       JOIN trainers tr ON tr.id = s.trainer_id
       ORDER BY array_position($1::text[], s.day_of_week), s.start_time`,
      [DAYS]
    );
    // time приходит как HH:MM:SS — обрежем до HH:MM для удобства фронтенда
    const rows = result.rows.map(r => ({ ...r, time: String(r.time).slice(0, 5) }));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/schedule — добавить слот (только admin)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('training_id').isInt().withMessage('Укажите ID направления'),
    body('trainer_id').isInt().withMessage('Укажите ID тренера'),
    body('day_of_week').isIn(DAYS).withMessage('Недопустимый день недели'),
    body('start_time').notEmpty().withMessage('Укажите время начала')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { training_id, trainer_id, day_of_week, start_time, end_time } = req.body;
      const result = await db.query(
        `INSERT INTO schedule_slots (training_id, trainer_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [training_id, trainer_id, day_of_week, start_time, end_time || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/schedule/:id — обновить слот (только admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { training_id, trainer_id, day_of_week, start_time, end_time } = req.body;
    const result = await db.query(
      `UPDATE schedule_slots SET
         training_id = COALESCE($1, training_id),
         trainer_id = COALESCE($2, trainer_id),
         day_of_week = COALESCE($3, day_of_week),
         start_time = COALESCE($4, start_time),
         end_time = COALESCE($5, end_time)
       WHERE id = $6 RETURNING *`,
      [training_id, trainer_id, day_of_week, start_time, end_time, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Слот расписания не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/schedule/:id — удалить слот (только admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM schedule_slots WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Слот расписания не найден' });
    res.json({ message: 'Слот удалён', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
