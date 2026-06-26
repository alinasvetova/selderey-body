/* =========================================================
   Selderey Body — интеграция фронтенда с REST API (недели 6-7)
   Запросы к backend (Express + PostgreSQL), запасные данные
   на случай, если API недоступен (офлайн-демо режим)
   ========================================================= */

(function () {

  // Базовый адрес backend. При локальной разработке — localhost,
  // при деплое подменяется на адрес backend на Render/Railway.
  const API_BASE = window.SB_API_BASE || 'http://localhost:4000/api';

  /* ---------------- Запасные данные (если API не отвечает) ---------------- */
  const FALLBACK_CLASSES = [
    'Хатха йога', 'Йога в Ботаническом саду', 'Шоковая трансформация',
    'Фитнес-мама', 'Йога для беременных', 'МФР и Здоровая спина',
    'Stretching', 'Hot Stretching', 'Pilates', 'Грейс Келли', 'High heels'
  ];

  const FALLBACK_SCHEDULE = [
    { day: 'Понедельник', time: '08:00', title: 'Хатха йога',            trainer: 'Лилия'  },
    { day: 'Понедельник', time: '10:00', title: 'Йога для беременных',   trainer: 'Нурия'  },
    { day: 'Понедельник', time: '18:00', title: 'Шоковая трансформация', trainer: 'Татьяна'},
    { day: 'Понедельник', time: '19:30', title: 'Pilates',               trainer: 'Сабина' },

    { day: 'Вторник',     time: '09:00', title: 'Stretching',            trainer: 'Лилия'  },
    { day: 'Вторник',     time: '11:00', title: 'Фитнес-мама',           trainer: 'Татьяна'},
    { day: 'Вторник',     time: '17:00', title: 'МФР и Здоровая спина',  trainer: 'Сабина' },
    { day: 'Вторник',     time: '19:00', title: 'Грейс Келли',           trainer: 'Милана' },

    { day: 'Среда',       time: '08:00', title: 'Йога в Ботаническом саду', trainer: 'Лилия' },
    { day: 'Среда',       time: '10:00', title: 'Йога для беременных',   trainer: 'Нурия'  },
    { day: 'Среда',       time: '18:00', title: 'Hot Stretching',        trainer: 'Амина'  },
    { day: 'Среда',       time: '19:30', title: 'High heels',            trainer: 'Аружан' },

    { day: 'Четверг',     time: '09:00', title: 'Хатха йога',            trainer: 'Лилия'  },
    { day: 'Четверг',     time: '11:00', title: 'Шоковая трансформация', trainer: 'Татьяна'},
    { day: 'Четверг',     time: '17:00', title: 'Pilates',               trainer: 'Сабина' },
    { day: 'Четверг',     time: '19:00', title: 'Грейс Келли',           trainer: 'Милана' },

    { day: 'Пятница',     time: '08:00', title: 'Stretching',            trainer: 'Лилия'  },
    { day: 'Пятница',     time: '10:00', title: 'Фитнес-мама',           trainer: 'Татьяна'},
    { day: 'Пятница',     time: '18:00', title: 'МФР и Здоровая спина',  trainer: 'Амина'  },
    { day: 'Пятница',     time: '19:30', title: 'High heels',            trainer: 'Аружан' },

    { day: 'Суббота',     time: '10:00', title: 'Хатха йога',            trainer: 'Лилия'  },
    { day: 'Суббота',     time: '11:30', title: 'Йога для беременных',   trainer: 'Нурия'  },
    { day: 'Суббота',     time: '13:00', title: 'Pilates',               trainer: 'Сабина' }
  ];

  /* ---------------- Расписание (Тренировки) ---------------- */
  const DAY_ORDER = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  async function loadSchedule() {
    const statusEl = document.getElementById('scheduleStatus');
    const bodyEl = document.getElementById('scheduleBody');
    if (!bodyEl) return;

    bodyEl.innerHTML = '<p class="muted">Загрузка…</p>';
    if (statusEl) statusEl.textContent = 'Обновление расписания…';

    try {
      const res = await fetch(`${API_BASE}/schedule`, { method: 'GET' });
      if (!res.ok) throw new Error('Bad response');
      const data = await res.json();
      renderSchedule(data.length ? data : FALLBACK_SCHEDULE);
    } catch (err) {
      renderSchedule(FALLBACK_SCHEDULE);
    }
  }

  function renderSchedule(items) {
    const statusEl = document.getElementById('scheduleStatus');
    const bodyEl = document.getElementById('scheduleBody');
    if (!bodyEl) return;

    const todayName = DAY_ORDER[(new Date().getDay() + 6) % 7];

    const grouped = {};
    items.forEach(row => {
      (grouped[row.day] = grouped[row.day] || []).push(row);
    });
    const days = DAY_ORDER.filter(d => grouped[d] && grouped[d].length);

    bodyEl.innerHTML = days.map(day => `
      <div class="schedule-day${day === todayName ? ' is-today' : ''}">
        <div class="schedule-day-title">
          <span>${escapeHtml(day)}</span>
          ${day === todayName ? '<span class="today-badge">Сегодня</span>' : ''}
        </div>
        <div class="schedule-day-rows">
          ${grouped[day].map(row => `
            <div class="schedule-row">
              <span class="schedule-time">${escapeHtml(row.time)}</span>
              <span class="schedule-meta">
                <span class="schedule-class-title">${escapeHtml(row.title)}</span>
                <span class="schedule-trainer">${escapeHtml(row.trainer)}</span>
              </span>
              <a href="contacts.html#booking" class="btn-ghost">Записаться →</a>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    if (statusEl) statusEl.textContent = 'Расписание на текущую неделю';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  const refreshBtn = document.getElementById('scheduleRefresh');
  refreshBtn?.addEventListener('click', loadSchedule);
  if (document.getElementById('scheduleBody')) {
    loadSchedule();
  }

  /* ---------------- Список направлений для select в форме записи ---------------- */
  async function loadClassOptions() {
    const select = document.getElementById('classSelect');
    if (!select) return;

    let classes = FALLBACK_CLASSES;
    try {
      const res = await fetch(`${API_BASE}/trainings`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          classes = data.map(c => c.title || c.name).filter(Boolean);
        }
      }
    } catch (err) {
      // используем FALLBACK_CLASSES при недоступном API
    }

    select.innerHTML = '<option value="">Выберите направление</option>' +
      classes.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }
  loadClassOptions();

  /* ---------------- Отправка формы онлайн-записи ---------------- */
  function buildWhatsAppMessage(payload) {
    const lines = ['Здравствуйте! Хочу записаться на занятие в Selderey Body.'];
    lines.push(`Имя: ${payload.name}`);
    lines.push(`Телефон: ${payload.phone}`);
    if (payload.email) lines.push(`Email: ${payload.email}`);
    if (payload.className) lines.push(`Занятие: ${payload.className}`);
    if (payload.date) lines.push(`Дата: ${payload.date}`);
    if (payload.comment) lines.push(`Комментарий: ${payload.comment}`);
    return lines.join('\n');
  }

  async function submitBooking(form) {
    const feedback = document.getElementById('bookingFeedback');
    const submitBtn = document.getElementById('bookingSubmit');
    const payload = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      className: form.elements.class.value.trim(),
      date: form.elements.date.value,
      comment: form.elements.comment ? form.elements.comment.value.trim() : ''
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Отправка…'; }
    if (feedback) { feedback.textContent = ''; feedback.className = 'form-feedback'; }

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Ошибка отправки заявки');
      }

      if (feedback) {
        feedback.textContent = 'Заявка отправлена! Мы свяжемся с вами для подтверждения записи.';
        feedback.className = 'form-feedback is-success';
      }
      form.reset();
    } catch (err) {
      if (feedback) {
        const waLink = `https://wa.me/77475884239?text=${encodeURIComponent(buildWhatsAppMessage(payload))}`;
        feedback.innerHTML = 'Чтобы завершить запись, отправьте данные нам в WhatsApp:<br>' +
          `<a href="${waLink}" target="_blank" rel="noopener" class="btn btn-primary mt-8">Отправить в WhatsApp →</a>`;
        feedback.className = 'form-feedback is-success';
      }
      form.reset();
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Отправить заявку'; }
    }
  }

  // публичный интерфейс для main.js
  window.SBApi = { submitBooking, loadSchedule, loadClassOptions };

})();
