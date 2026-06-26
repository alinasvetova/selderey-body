const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — публичная отправка формы записи (frontend/contacts.html)
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Введите имя'),
    body('phone').trim().matches(/^\+?\d{10,15}$/).withMessage('Введите телефон в формате +7XXXXXXXXXX'),
    body('email').isEmail().withMessage('Введите корректный email'),
    body('className').trim().notEmpty().withMessage('Выберите направление'),
    body('date').isISO8601().withMessage('Укажите корректную дату')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, phone, email, className, date, comment } = req.body;

      // пытаемся найти направление по названию, чтобы связать FK
      const training = await db.query('SELECT id FROM trainings WHERE title = $1', [className]);
      const trainingId = training.rows[0]?.id || null;

      const result = await db.query(
        `INSERT INTO bookings (name, phone, email, training_id, class_name, class_date, comment)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, phone, email, trainingId, className, date, comment || null]
      );

      res.status(201).json({ message: 'Заявка принята', booking: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/bookings — список заявок (только admin)
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE status = $1';
    }
    const result = await db.query(
      `SELECT * FROM bookings ${where} ORDER BY created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id/status — изменить статус заявки (только admin)
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  [body('status').isIn(['new', 'confirmed', 'cancelled']).withMessage('Недопустимый статус')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await db.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        [req.body.status, req.params.id]
      );
      if (!result.rows[0]) return res.status(404).json({ message: 'Заявка не найдена' });
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/bookings/:id — удалить заявку (только admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Заявка не найдена' });
    res.json({ message: 'Заявка удалена', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
