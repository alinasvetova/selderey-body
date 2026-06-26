-- =========================================================
-- Selderey Body — схема базы данных PostgreSQL (неделя 5)
--
-- ER-диаграмма (текстовое представление):
--
--   users 1───∞ bookings ∞───1 trainings ∞───1 trainers
--   users 1───∞ user_subscriptions ∞───1 subscriptions
--   trainers 1───∞ trainings
--   trainings 1───∞ schedule_slots
--
-- =========================================================

-- Расширение для генерации UUID (опционально, используем SERIAL для простоты)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS schedule_slots CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS trainings CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------
-- users: клиенты сайта и администратор(ы) студии
-- ---------------------------------------------------------
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(32),
  role          VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- trainers: тренеры студии (только имя, без фамилии — по требованию заказчика)
-- ---------------------------------------------------------
CREATE TABLE trainers (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(80) NOT NULL,
  role_title       VARCHAR(160) NOT NULL,
  bio              TEXT,
  photo_url        TEXT,
  experience_years VARCHAR(40),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- trainings: виды занятий (направления). trainer_id — основной/
-- рекомендуемый тренер для карточки направления на сайте;
-- фактический тренер конкретного занятия указывается в schedule_slots,
-- так как одно направление могут вести разные тренеры в разное время.
-- ---------------------------------------------------------
CREATE TABLE trainings (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(120) NOT NULL,
  category    VARCHAR(40) NOT NULL CHECK (category IN ('health','strength','stretch','hammock','dance','moms')),
  description TEXT,
  trainer_id  INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- schedule_slots: расписание занятий по дням недели.
-- Каждый слот = конкретное направление + конкретный тренер + время.
-- ---------------------------------------------------------
CREATE TABLE schedule_slots (
  id          SERIAL PRIMARY KEY,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  trainer_id  INTEGER NOT NULL REFERENCES trainers(id) ON DELETE RESTRICT,
  day_of_week VARCHAR(20) NOT NULL CHECK (
    day_of_week IN ('Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье')
  ),
  start_time  TIME NOT NULL,
  end_time    TIME,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedule_trainer ON schedule_slots(trainer_id);

CREATE INDEX idx_schedule_day ON schedule_slots(day_of_week);

-- ---------------------------------------------------------
-- subscriptions: тарифные планы / абонементы
-- ---------------------------------------------------------
CREATE TABLE subscriptions (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(120) NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  classes_count INTEGER,              -- NULL = безлимит
  duration_days INTEGER NOT NULL DEFAULT 30,
  description   TEXT,
  is_popular    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- user_subscriptions: купленные абонементы клиентов
-- ---------------------------------------------------------
CREATE TABLE user_subscriptions (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
  classes_left    INTEGER,
  purchased_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL
);

-- ---------------------------------------------------------
-- bookings: заявки на запись (форма на сайте), гостевые или от users
-- ---------------------------------------------------------
CREATE TABLE bookings (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name        VARCHAR(120) NOT NULL,
  phone       VARCHAR(32) NOT NULL,
  email       VARCHAR(160) NOT NULL,
  training_id INTEGER REFERENCES trainings(id) ON DELETE SET NULL,
  class_name  VARCHAR(120),  -- денормализованное название на случай удаления training
  class_date  DATE NOT NULL,
  comment     TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(email);
