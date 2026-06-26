-- =========================================================
-- Selderey Body — тестовые данные (неделя 5)
-- Реальные тренеры и направления студии, расписание основано
-- на публичном виджете Fitbase. Цены в subscriptions — учебный пример.
-- Запуск: npm run db:seed (после npm run db:schema)
-- =========================================================

-- ---------------------------------------------------------
-- Тренеры (только имена, без фамилий)
-- ---------------------------------------------------------
INSERT INTO trainers (name, role_title, bio, photo_url, experience_years) VALUES
('Лилия',   'Йога и растяжка',
 'Сертифицированный преподаватель хатха-йоги, ведёт утренние практики и stretching-классы более 6 лет.',
 'https://lh3.googleusercontent.com/pw/AP1GczPRGTNvCJ4-Y5Kpn8_NSndA4EKkZrg7Sesn81mrRPZP_8og-raidVu2e-HxNiVYkFF7Iyg7TOstZduVP_PwUc1vXkM8TUTPnatSdLomTjpF_zzbGu4=w300-h300-c',
 '6+ лет'),
('Татьяна', 'Силовые и программы для мам',
 'Тренер по функциональному тренингу, специализируется на бережном восстановлении после родов и интервальных тренировках.',
 'https://lh3.googleusercontent.com/pw/AP1GczNZs15lrt43JvqaZUerAHqX8w0v6U_tjxKbyjHY4u22gkTy3kxEqfhDE7fJQ2I3x2swlLI3e20jt-wAwPvR1K0qWTyRfwQRy6VqjzU4yzz5PI9FAwY=w300-h300-c',
 '5 лет'),
('Нурия',   'Йога для беременных',
 'Инструктор перинатальной йоги, помогает будущим мамам безопасно двигаться на любом сроке беременности.',
 'https://lh3.googleusercontent.com/pw/AP1GczOk-LVecYfXPk15zN36gFASF3ieQzjiRa_opsW9gbVCFmrPocsSfQEdK0w_0QPlvVIzis2AwvIcSDSM3Ru3IElKp_3Cbof1Fzy-ic855Cdao7kI6yw=w300-h300-c',
 '4 года'),
('Амина',   'Растяжка и МФР',
 'Тренер по стретчингу и миофасциальному релизу, работает с осанкой и развитием гибкости.',
 'https://lh3.googleusercontent.com/pw/AP1GczOsf9Kjv_SGQysUJtqXV4TWqcJaSC7jn2XerhFw7-CcMnOgK0vqKBUZ1um2_GoRHKW-qRRjMLRUh8bGL5Qw2JY1jV4RAAB8XVbsTBkyi7ZQ2KmWUh8=w300-h300-c',
 '3 года'),
('Сабина',  'Пилатес и здоровая спина',
 'Специалист по пилатесу и оздоровительным практикам для спины, выстраивает программы под индивидуальные запросы.',
 'https://lh3.googleusercontent.com/pw/AP1GczOZh8zHDXsnZwD8JtkbtLMqMdU7xTfEHw8K-myMtDBMl23tOnZROliA2c2ExEX_oWhIvruH0JCTjbufQGR8JF3eTY4CGocXL8ZAY4O2XPzCKRC5pmo=w300-h300-c',
 '4 года'),
('Милана',  'Гамаки и растяжка',
 'Инструктор направления «Грейс Келли» — тренировки на гамаках с силовыми элементами и глубокой растяжкой для пластики и осанки.',
 'https://lh3.googleusercontent.com/pw/AP1GczO0Fy2b1irIcRKqtYGkmEUi38UDQiEV9w5OoakKnyifwIBWRjvgDK0XkPwHY2lwkzBGyEU2JV1rfUKyyS67hU-cSL7efwznOqdM_xDctqoCQ2P45xk=w300-h300-c',
 '5 лет'),
('Аружан',  'Танцевальная пластика',
 'Хореограф каблучных направлений, помогает раскрыть женственность через танец и уверенную пластику.',
 'https://lh3.googleusercontent.com/pw/AP1GczNoF_EPdpiOKqbgIDtU-riOwpZYSBhelZkPKY0Nv0VtL9sQrW4MGVrLzDVyLtuEQuVZlhpFDOupgtLmyJr9xPTrsHLtXvxbdtcOmfti5CXLdLCDp1I=w300-h300-c',
 '3 года');

-- ---------------------------------------------------------
-- Направления (trainings)
-- ---------------------------------------------------------
INSERT INTO trainings (title, category, description, trainer_id) VALUES
('Хатха йога',              'health',   'Классическая практика для гибкости и баланса нервной системы.',
   (SELECT id FROM trainers WHERE name='Лилия')),
('Йога в Ботаническом саду','health',   'Сезонные занятия на открытом воздухе в Ботаническом саду.',
   (SELECT id FROM trainers WHERE name='Лилия')),
('Шоковая трансформация',   'strength', 'Высокоинтенсивный интервальный тренинг для всего тела.',
   (SELECT id FROM trainers WHERE name='Татьяна')),
('Фитнес-мама',             'moms',     'Восстановительные тренировки для мам после родов.',
   (SELECT id FROM trainers WHERE name='Татьяна')),
('Йога для беременных',     'moms',     'Бережная практика для будущих мам на любом триместре.',
   (SELECT id FROM trainers WHERE name='Нурия')),
('МФР и Здоровая спина',    'health',   'Миофасциальный релиз и упражнения для профилактики боли в спине.',
   (SELECT id FROM trainers WHERE name='Сабина')),
('Stretching',              'stretch',  'Базовая растяжка для развития гибкости тела.',
   (SELECT id FROM trainers WHERE name='Лилия')),
('Hot Stretching',          'stretch',  'Растяжка в студии с подогревом для глубокой работы с мышцами.',
   (SELECT id FROM trainers WHERE name='Амина')),
('Pilates',                 'strength', 'Укрепление глубоких мышц кора без ударной нагрузки на суставы.',
   (SELECT id FROM trainers WHERE name='Сабина')),
('Грейс Келли',             'hammock',  'Тренировка на гамаках: силовые элементы и глубокая растяжка для осанки и грации.',
   (SELECT id FROM trainers WHERE name='Милана')),
('High heels',              'dance',    'Танец на каблуках для уверенности и женственной пластики.',
   (SELECT id FROM trainers WHERE name='Аружан'));

-- ---------------------------------------------------------
-- Расписание (schedule_slots) — на основе виджета Fitbase
-- ---------------------------------------------------------
INSERT INTO schedule_slots (training_id, trainer_id, day_of_week, start_time, end_time) VALUES
((SELECT id FROM trainings WHERE title='Хатха йога'),              (SELECT id FROM trainers WHERE name='Лилия'),   'Понедельник', '08:00', '09:00'),
((SELECT id FROM trainings WHERE title='Йога для беременных'),     (SELECT id FROM trainers WHERE name='Нурия'),   'Понедельник', '10:00', '11:00'),
((SELECT id FROM trainings WHERE title='Шоковая трансформация'),   (SELECT id FROM trainers WHERE name='Татьяна'), 'Понедельник', '18:00', '19:00'),
((SELECT id FROM trainings WHERE title='Pilates'),                 (SELECT id FROM trainers WHERE name='Сабина'),  'Понедельник', '19:30', '20:30'),

((SELECT id FROM trainings WHERE title='Stretching'),              (SELECT id FROM trainers WHERE name='Лилия'),   'Вторник', '09:00', '10:00'),
((SELECT id FROM trainings WHERE title='Фитнес-мама'),             (SELECT id FROM trainers WHERE name='Татьяна'), 'Вторник', '11:00', '12:00'),
((SELECT id FROM trainings WHERE title='МФР и Здоровая спина'),    (SELECT id FROM trainers WHERE name='Сабина'),  'Вторник', '17:00', '18:00'),
((SELECT id FROM trainings WHERE title='Грейс Келли'),             (SELECT id FROM trainers WHERE name='Милана'),  'Вторник', '19:00', '20:00'),

((SELECT id FROM trainings WHERE title='Йога в Ботаническом саду'),(SELECT id FROM trainers WHERE name='Лилия'),   'Среда', '08:00', '09:00'),
((SELECT id FROM trainings WHERE title='Йога для беременных'),     (SELECT id FROM trainers WHERE name='Нурия'),   'Среда', '10:00', '11:00'),
((SELECT id FROM trainings WHERE title='Hot Stretching'),          (SELECT id FROM trainers WHERE name='Амина'),   'Среда', '18:00', '19:00'),
((SELECT id FROM trainings WHERE title='High heels'),              (SELECT id FROM trainers WHERE name='Аружан'),  'Среда', '19:30', '20:30'),

((SELECT id FROM trainings WHERE title='Хатха йога'),              (SELECT id FROM trainers WHERE name='Лилия'),   'Четверг', '09:00', '10:00'),
((SELECT id FROM trainings WHERE title='Шоковая трансформация'),   (SELECT id FROM trainers WHERE name='Татьяна'), 'Четверг', '11:00', '12:00'),
((SELECT id FROM trainings WHERE title='Pilates'),                 (SELECT id FROM trainers WHERE name='Сабина'),  'Четверг', '17:00', '18:00'),
((SELECT id FROM trainings WHERE title='Грейс Келли'),             (SELECT id FROM trainers WHERE name='Милана'),  'Четверг', '19:00', '20:00'),

((SELECT id FROM trainings WHERE title='Stretching'),              (SELECT id FROM trainers WHERE name='Лилия'),   'Пятница', '08:00', '09:00'),
((SELECT id FROM trainings WHERE title='Фитнес-мама'),             (SELECT id FROM trainers WHERE name='Татьяна'), 'Пятница', '10:00', '11:00'),
((SELECT id FROM trainings WHERE title='МФР и Здоровая спина'),    (SELECT id FROM trainers WHERE name='Амина'),   'Пятница', '18:00', '19:00'),
((SELECT id FROM trainings WHERE title='High heels'),              (SELECT id FROM trainers WHERE name='Аружан'),  'Пятница', '19:30', '20:30'),

((SELECT id FROM trainings WHERE title='Хатха йога'),              (SELECT id FROM trainers WHERE name='Лилия'),   'Суббота', '10:00', '11:00'),
((SELECT id FROM trainings WHERE title='Йога для беременных'),     (SELECT id FROM trainers WHERE name='Нурия'),   'Суббота', '11:30', '12:30'),
((SELECT id FROM trainings WHERE title='Pilates'),                 (SELECT id FROM trainers WHERE name='Сабина'),  'Суббота', '13:00', '14:00');

-- ---------------------------------------------------------
-- Абонементы (subscriptions) — демонстрационные цены
-- ---------------------------------------------------------
INSERT INTO subscriptions (title, price, classes_count, duration_days, description, is_popular) VALUES
('Разовое занятие',         5000,  1,  1,  'Любое направление, без обязательств', FALSE),
('8 занятий / месяц',       28000, 8,  30, 'Оптимально для 2 занятий в неделю', TRUE),
('Безлимит / месяц',        39000, NULL, 30, 'Неограниченное количество занятий', FALSE),
('Йога для беременных (8)', 25000, 8,  30, '8 занятий помесячно с Нурией', FALSE);
