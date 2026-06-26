/**
 * Утилита для применения .sql файлов (schema.sql / seed.sql) к базе данных.
 * Использование:
 *   node scripts/runSql.js sql/schema.sql
 *   node scripts/runSql.js sql/seed.sql
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const filePathArg = process.argv[2];
if (!filePathArg) {
  console.error('Укажите путь к .sql файлу: node scripts/runSql.js sql/schema.sql');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), filePathArg);
if (!fs.existsSync(fullPath)) {
  console.error(`Файл не найден: ${fullPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(fullPath, 'utf-8');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
});

(async () => {
  const client = await pool.connect();
  try {
    console.log(`Выполняю ${filePathArg}...`);
    await client.query(sql);
    console.log('Готово.');
  } catch (err) {
    console.error('Ошибка выполнения SQL:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
