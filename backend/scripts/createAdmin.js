/**
 * Создаёт администратора студии (role = 'admin') с безопасным bcrypt-хешем пароля.
 * Пароль не хранится в репозитории — задаётся через переменные окружения
 * или аргументы командной строки при запуске.
 *
 * Использование:
 *   ADMIN_NAME="Админ" ADMIN_EMAIL="admin@seldereybody.kz" ADMIN_PASSWORD="StrongPass123" npm run create:admin
 * или:
 *   node scripts/createAdmin.js "Админ" admin@seldereybody.kz StrongPass123
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const [, , argName, argEmail, argPassword] = process.argv;

const name = process.env.ADMIN_NAME || argName;
const email = process.env.ADMIN_EMAIL || argEmail;
const password = process.env.ADMIN_PASSWORD || argPassword;

if (!name || !email || !password) {
  console.error('Нужно указать имя, email и пароль (через env ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD или аргументы).');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Пароль должен быть не короче 8 символов.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
});

(async () => {
  const client = await pool.connect();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
       RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );
    console.log('Администратор создан/обновлён:', result.rows[0]);
  } catch (err) {
    console.error('Ошибка создания администратора:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
