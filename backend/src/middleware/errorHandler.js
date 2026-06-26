function notFound(req, res, next) {
  res.status(404).json({ message: `Маршрут не найден: ${req.method} ${req.originalUrl}` });
}

// Централизованный обработчик ошибок (4 аргумента — обязательно для Express)
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === '23505') { // unique_violation в PostgreSQL
    return res.status(409).json({ message: 'Запись с такими данными уже существует' });
  }
  if (err.code === '23503') { // foreign_key_violation
    return res.status(400).json({ message: 'Указана несуществующая связанная запись' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Внутренняя ошибка сервера'
  });
}

module.exports = { notFound, errorHandler };
