/* =========================================================
   Selderey Body — основная интерактивность (неделя 4 практики)
   Бургер-меню, слайдер отзывов, модальные окна тренеров,
   валидация форм, DOM-события, scroll-анимации, localStorage
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Бургер-меню (мобильная навигация) ---------------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      burgerBtn.classList.toggle('is-active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // закрытие меню по клику на пункт навигации
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        burgerBtn.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- Промо-баннер: localStorage ---------------- */
  const promoBanner = document.getElementById('promoBanner');
  const promoClose = document.getElementById('promoClose');
  const PROMO_KEY = 'sb_promo_dismissed';

  if (promoBanner) {
    if (localStorage.getItem(PROMO_KEY) === '1') {
      promoBanner.style.display = 'none';
    }
    promoClose?.addEventListener('click', () => {
      promoBanner.style.display = 'none';
      localStorage.setItem(PROMO_KEY, '1');
    });
  }

  /* ---------------- Слайдер отзывов ---------------- */
  const testiSlides = document.getElementById('testiSlides');
  if (testiSlides) {
    const slides = testiSlides.querySelectorAll('.testi-slide');
    const dots = document.querySelectorAll('.testi-dot');
    const prevBtn = document.getElementById('testiPrev');
    const nextBtn = document.getElementById('testiNext');
    let current = 0;
    let autoTimer;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      testiSlides.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }
    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 6000);
    }

    prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

    goTo(0);
    startAuto();
  }

  /* ---------------- Модальные окна тренеров ---------------- */
  const trainerData = {
    lilia:   { name: 'Лилия',   role: 'Йога и растяжка',                  bio: 'Сертифицированный преподаватель хатха-йоги, ведёт утренние практики и stretching-классы более 6 лет.', classes: 'Хатха йога, Йога в Ботаническом саду, Stretching', exp: '6+ лет', photo: 'https://lh3.googleusercontent.com/pw/AP1GczPRGTNvCJ4-Y5Kpn8_NSndA4EKkZrg7Sesn81mrRPZP_8og-raidVu2e-HxNiVYkFF7Iyg7TOstZduVP_PwUc1vXkM8TUTPnatSdLomTjpF_zzbGu4=w300-h300-c' },
    tatiana: { name: 'Татьяна', role: 'Силовые и программы для мам',      bio: 'Тренер по функциональному тренингу, специализируется на бережном восстановлении после родов и интервальных тренировках.', classes: 'Шоковая трансформация, Фитнес-мама', exp: '5 лет', photo: 'https://lh3.googleusercontent.com/pw/AP1GczNZs15lrt43JvqaZUerAHqX8w0v6U_tjxKbyjHY4u22gkTy3kxEqfhDE7fJQ2I3x2swlLI3e20jt-wAwPvR1K0qWTyRfwQRy6VqjzU4yzz5PI9FAwY=w300-h300-c' },
    nuria:   { name: 'Нурия',   role: 'Йога для беременных',              bio: 'Инструктор перинатальной йоги, помогает будущим мамам безопасно двигаться на любом сроке беременности.', classes: 'Йога для беременных', exp: '4 года', photo: 'https://lh3.googleusercontent.com/pw/AP1GczOk-LVecYfXPk15zN36gFASF3ieQzjiRa_opsW9gbVCFmrPocsSfQEdK0w_0QPlvVIzis2AwvIcSDSM3Ru3IElKp_3Cbof1Fzy-ic855Cdao7kI6yw=w300-h300-c' },
    amina:   { name: 'Амина',   role: 'Растяжка и МФР',                   bio: 'Тренер по стретчингу и миофасциальному релизу, работает с осанкой и развитием гибкости.', classes: 'Hot Stretching, МФР и Здоровая спина, Pilates', exp: '3 года', photo: 'https://lh3.googleusercontent.com/pw/AP1GczOsf9Kjv_SGQysUJtqXV4TWqcJaSC7jn2XerhFw7-CcMnOgK0vqKBUZ1um2_GoRHKW-qRRjMLRUh8bGL5Qw2JY1jV4RAAB8XVbsTBkyi7ZQ2KmWUh8=w300-h300-c' },
    sabina:  { name: 'Сабина',  role: 'Пилатес и здоровая спина',         bio: 'Специалист по пилатесу и оздоровительным практикам для спины, выстраивает программы под индивидуальные запросы.', classes: 'Pilates, МФР и Здоровая спина', exp: '4 года', photo: 'https://lh3.googleusercontent.com/pw/AP1GczOZh8zHDXsnZwD8JtkbtLMqMdU7xTfEHw8K-myMtDBMl23tOnZROliA2c2ExEX_oWhIvruH0JCTjbufQGR8JF3eTY4CGocXL8ZAY4O2XPzCKRC5pmo=w300-h300-c' },
    milana:  { name: 'Милана',  role: 'Гамаки и растяжка',                bio: 'Инструктор направления «Грейс Келли» — тренировки на гамаках с силовыми элементами и глубокой растяжкой для пластики и осанки.', classes: 'Грейс Келли, МФР и Здоровая спина', exp: '5 лет', photo: 'https://lh3.googleusercontent.com/pw/AP1GczO0Fy2b1irIcRKqtYGkmEUi38UDQiEV9w5OoakKnyifwIBWRjvgDK0XkPwHY2lwkzBGyEU2JV1rfUKyyS67hU-cSL7efwznOqdM_xDctqoCQ2P45xk=w300-h300-c' },
    aruzhan: { name: 'Аружан',  role: 'Танцевальная пластика',           bio: 'Хореограф каблучных направлений, помогает раскрыть женственность через танец и уверенную пластику.', classes: 'High heels', exp: '3 года', photo: 'https://lh3.googleusercontent.com/pw/AP1GczNoF_EPdpiOKqbgIDtU-riOwpZYSBhelZkPKY0Nv0VtL9sQrW4MGVrLzDVyLtuEQuVZlhpFDOupgtLmyJr9xPTrsHLtXvxbdtcOmfti5CXLdLCDp1I=w300-h300-c' }
  };

  const trainerModal = document.getElementById('trainerModal');
  if (trainerModal) {
    const closeBtn = document.getElementById('trainerModalClose');

    function openTrainerModal(id) {
      const t = trainerData[id];
      if (!t) return;
      document.getElementById('modalTrainerPhoto').src = t.photo;
      document.getElementById('modalTrainerPhoto').alt = t.name;
      document.getElementById('modalTrainerName').textContent = t.name;
      document.getElementById('modalTrainerRole').textContent = t.role;
      document.getElementById('modalTrainerBio').textContent = t.bio;
      document.getElementById('modalTrainerClasses').textContent = t.classes;
      document.getElementById('modalTrainerExp').textContent = t.exp;
      trainerModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeTrainerModal() {
      trainerModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.js-trainer-more').forEach(btn => {
      btn.addEventListener('click', () => openTrainerModal(btn.dataset.trainer));
    });
    closeBtn?.addEventListener('click', closeTrainerModal);
    trainerModal.addEventListener('click', (e) => { if (e.target === trainerModal) closeTrainerModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTrainerModal(); });
  }

  /* ---------------- Фильтр направлений (Тренировки) + localStorage ---------------- */
  const filterWrap = document.getElementById('categoryFilters');
  const trainingsGrid = document.getElementById('trainingsGrid');
  const FILTER_KEY = 'sb_last_category';

  if (filterWrap && trainingsGrid) {
    const cards = trainingsGrid.querySelectorAll('[data-cat]');

    function applyFilter(cat) {
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
      });
      filterWrap.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('is-active', b.dataset.cat === cat);
      });
      localStorage.setItem(FILTER_KEY, cat);
    }

    filterWrap.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.cat));
    });

    // восстановление последнего выбранного фильтра пользователя
    const savedCat = localStorage.getItem(FILTER_KEY);
    if (savedCat) applyFilter(savedCat);
  }

  /* ---------------- Scroll-анимации (Intersection Observer) ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------- Валидация формы онлайн-записи ---------------- */
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    const validators = {
      name:  v => v.trim().length >= 2,
      phone: v => /^\+?\d{10,15}$/.test(v.replace(/[\s()-]/g, '')),
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      class: v => v.trim().length > 0,
      date:  v => v.trim().length > 0
    };

    function validateField(name) {
      const input = bookingForm.elements[name];
      const row = bookingForm.querySelector(`[data-field="${name}"]`);
      if (!input || !row) return true;
      const ok = validators[name] ? validators[name](input.value) : true;
      row.classList.toggle('has-error', !ok);
      return ok;
    }

    ['name', 'phone', 'email', 'class', 'date'].forEach(name => {
      const input = bookingForm.elements[name];
      input?.addEventListener('blur', () => validateField(name));
      input?.addEventListener('input', () => {
        if (bookingForm.querySelector(`[data-field="${name}"]`)?.classList.contains('has-error')) {
          validateField(name);
        }
      });
    });

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = ['name', 'phone', 'email', 'class', 'date'];
      const allValid = fields.map(validateField).every(Boolean);
      if (!allValid) return;

      // отправка делегируется в api.js (window.SBApi.submitBooking)
      if (window.SBApi && typeof window.SBApi.submitBooking === 'function') {
        window.SBApi.submitBooking(bookingForm);
      }
    });
  }

});
