/* =========================================================
   Selderey Body — панель администратора (просмотр заявок)
   Логин через /api/auth/login, список через /api/bookings
   ========================================================= */

(function () {
  const API_BASE = window.SB_API_BASE || 'http://localhost:4000/api';
  const TOKEN_KEY = 'sb_admin_token';

  const loginView = document.getElementById('loginView');
  const bookingsView = document.getElementById('bookingsView');
  const loginForm = document.getElementById('loginForm');
  const loginFeedback = document.getElementById('loginFeedback');
  const loginSubmit = document.getElementById('loginSubmit');
  const bookingsBody = document.getElementById('bookingsBody');
  const bookingsStatus = document.getElementById('bookingsStatus');
  const refreshBtn = document.getElementById('refreshBookings');
  const logoutBtn = document.getElementById('logoutBtn');

  const STATUS_LABELS = { new: 'Новая', confirmed: 'Подтверждена', cancelled: 'Отменена' };

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  function showLogin() {
    loginView.hidden = false;
    bookingsView.hidden = true;
    if (logoutBtn) logoutBtn.hidden = true;
  }

  function showBookings() {
    loginView.hidden = true;
    bookingsView.hidden = false;
    if (logoutBtn) logoutBtn.hidden = false;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return escapeHtml(value);
    return d.toLocaleDateString('ru-RU');
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return escapeHtml(value);
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  async function loadBookings() {
    const token = getToken();
    if (!token) { showLogin(); return; }

    bookingsStatus.textContent = 'Загрузка…';
    bookingsBody.innerHTML = '';

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        clearToken();
        showLogin();
        if (loginFeedback) {
          loginFeedback.textContent = 'Сессия истекла, войдите снова';
          loginFeedback.className = 'form-feedback is-error';
        }
        return;
      }

      if (!res.ok) throw new Error('Bad response');
      const data = await res.json();

      if (!Array.isArray(data) || !data.length) {
        bookingsStatus.textContent = 'Заявок пока нет';
        return;
      }

      bookingsStatus.textContent = `Всего заявок: ${data.length}`;
      bookingsBody.innerHTML = data.map(b => `
        <tr>
          <td>${escapeHtml(b.name)}</td>
          <td>${escapeHtml(b.phone)}</td>
          <td>${escapeHtml(b.email)}</td>
          <td>${escapeHtml(b.class_name)}</td>
          <td>${formatDate(b.class_date)}</td>
          <td><span class="admin-badge admin-badge--${escapeHtml(b.status)}">${escapeHtml(STATUS_LABELS[b.status] || b.status)}</span></td>
          <td>${formatDateTime(b.created_at)}</td>
        </tr>
      `).join('');
    } catch (err) {
      bookingsStatus.textContent = 'Не удалось загрузить заявки. Попробуйте обновить страницу.';
    }
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;

    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Вход…';
    loginFeedback.textContent = '';
    loginFeedback.className = 'form-feedback';

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(body.message || 'Неверный email или пароль');
      if (body.user?.role !== 'admin') throw new Error('Доступ только для администратора');

      setToken(body.token);
      showBookings();
      loadBookings();
    } catch (err) {
      loginFeedback.textContent = err.message;
      loginFeedback.className = 'form-feedback is-error';
    } finally {
      loginSubmit.disabled = false;
      loginSubmit.textContent = 'Войти';
    }
  });

  logoutBtn?.addEventListener('click', () => {
    clearToken();
    showLogin();
  });

  refreshBtn?.addEventListener('click', loadBookings);

  if (getToken()) {
    showBookings();
    loadBookings();
  } else {
    showLogin();
  }
})();
