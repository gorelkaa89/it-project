# Service Desk / Helpdesk — React + Vite + Tailwind + Express + PostgreSQL

Система ИТ-поддержки с JWT-авторизацией, регистрацией, ролями и отдельной страницей заявки.

## Основные возможности
- Главная страница с кнопками **Войти** и **Зарегистрироваться**.
- Страница регистрации пользователей с ФИО.
- JWT-авторизация (`register/login/me`).
- Роли:
  - **Сотрудник**: создание заявки + страница **Мои заявки** (созданные им обращения).
  - **ИТ-поддержка**: страницы **Общие заявки** и **Мои заявки**.
- Отдельная страница заявки:
  - просмотр деталей,
  - комментарии (можно добавлять много раз),
  - завершение и отмена заявки.
- В общем списке есть кнопка **Отменить**, статус `Отменена`.
- Визуал: светлая/тёмная тема, анимации hover и клик по всей строке заявки для перехода в детали.
- В кабинете сотрудника завершённые/отменённые заявки сохраняются в списке «Мои заявки» и не скрываются.

## Важные исправления
- Принудительно включена UTF-8 кодировка для БД: `POSTGRES_INITDB_ARGS="--encoding=UTF8 --locale=C.UTF-8"` и `SET client_encoding TO UTF8` на backend.
- После нажатия «Завершить» дата выполнения автоматически проставляется текущим временем.
- После «Завершить/Отменить» из карточки поддержка возвращается в раздел «Мои заявки».
- Исправлена работа переключателя тёмной/светлой темы через `darkMode: class` в Tailwind.
- Исправлена ошибка создания заявки: поле **Кто создал** теперь заполняется на backend из JWT-пользователя (не нужно передавать вручную).
- Логин/пароль пользователя PostgreSQL в `docker-compose.yml` изменены на `postgres/postgres`.
- Фронтенд-код разбит на отдельные файлы страниц/компонентов.

## Стек
- Frontend: **React (JS) + Vite + Tailwind CSS**.
- Backend: **Node.js + Express + JWT (`jsonwebtoken`) + `bcryptjs`**.
- База данных: **PostgreSQL**.
- Оркестрация: **Docker Compose**.

## Структура фронтенда
- `frontend/src/App.jsx` — маршрутизация экранов и auth-flow.
- `frontend/src/api.js` — API-клиент и хранение JWT.
- `frontend/src/pages/HomePage.jsx` — главная.
- `frontend/src/pages/LoginPage.jsx` — вход.
- `frontend/src/pages/RegisterPage.jsx` — регистрация.
- `frontend/src/pages/UserDashboardPage.jsx` — кабинет сотрудника.
- `frontend/src/pages/SupportDashboardPage.jsx` — все/мои заявки поддержки.
- `frontend/src/pages/TicketDetailsPage.jsx` — отдельная страница заявки.
- `frontend/src/components/TicketTable.jsx` — таблица заявок.

## Быстрый запуск
```bash
docker compose up --build
```

После запуска:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/health`
- PostgreSQL: `localhost:5432` (DB: `helpdesk1`)

## Инициализация БД
`db/init.sql` обновлён: создаёт таблицы `users`, `tickets`, `ticket_comments` и сидирует тестовую заявку с комментарием.

Тестовые пользователи (`user/user123`, `support/support123`) создаются при старте backend в `ensureSchema()`.

## API
- `POST /api/auth/register` — регистрация.
- `POST /api/auth/login` — вход.
- `GET /api/auth/me` — текущий пользователь по JWT.
- `GET /api/tickets` — общие заявки (только неназначенные).
- `GET /api/tickets/my` — мои заявки (для поддержки).
- `GET /api/tickets/created` — мои созданные заявки (для сотрудника).
- `GET /api/tickets/:id` — детали заявки + комментарии.
- `POST /api/tickets` — создать заявку.
- `PATCH /api/tickets/:id/assign` — забрать заявку себе.
- `PATCH /api/tickets/:id/status` — сменить статус (`Открыта`, `В работе`, `Завершена`, `Отменена`).
- `POST /api/tickets/:id/comments` — добавить комментарий.
