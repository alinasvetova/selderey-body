require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth.routes');
const trainersRoutes = require('./src/routes/trainers.routes');
const trainingsRoutes = require('./src/routes/trainings.routes');
const scheduleRoutes = require('./src/routes/schedule.routes');
const bookingsRoutes = require('./src/routes/bookings.routes');
const subscriptionsRoutes = require('./src/routes/subscriptions.routes');

const app = express();

// --- middleware ---
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5500').split(',');
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: false
}));

// --- health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'selderey-body-backend', time: new Date().toISOString() });
});

// --- routes ---
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// --- 404 + централизованная обработка ошибок ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Selderey Body API запущен на порту ${PORT}`);
});

module.exports = app;
