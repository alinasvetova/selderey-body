const jwt = require('jsonwebtoken');

/**
 * Проверяет JWT из заголовка Authorization: Bearer <token>.
 * При успехе кладёт payload токена в req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Требуется авторизация (Bearer token)' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Недействительный или истёкший токен' });
  }
}

/**
 * Должен использоваться после requireAuth.
 * Пропускает только пользователей с ролью admin.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ только для администратора' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
