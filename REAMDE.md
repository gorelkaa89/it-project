# Service Desk / Helpdesk — React + Vite + Tailwind + Express + PostgreSQL

Система ИТ-поддержки с ролями, регистрацией, назначением заявок и комментариями.

## Что реализовано
- Регистрация и вход пользователей с ФИО.
- Роли:
  - **Сотрудник**: создание заявки с подсказками.
  - **ИТ-поддержка**: общий список заявок + страница «Мои заявки».
- В заявке хранятся:
  - кто создал (`created_by`),
  - кто выполняет (`assigned_to`),
  - дата выполнения (`due_date`).
- Отдельная страница заявки:
  - просмотр деталей,
  - добавление нескольких комментариев,
  - завершение и отмена заявки.
- В общем списке у поддержки есть кнопка отмены (статус `Отменена`).

## Стек
- Frontend: **React (JS) + Vite + Tailwind CSS**.
- Backend: **Node.js + Express**.
- База данных: **PostgreSQL**.
- Оркестрация: **Docker Compose**.

## Быстрый запуск
```bash
docker compose up --build
```

После запуска:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/health`
- PostgreSQL: `localhost:5432`

## Инициализация БД
`db/init.sql` обновлён и создаёт таблицы:
- `users`
- `tickets`
- `ticket_comments`

Также добавляет тестовых пользователей и стартовую заявку с комментарием.

## Тестовые аккаунты
- Сотрудник: `user / user123`
- ИТ-поддержка: `support / support123`

## API
- `POST /api/auth/register` — регистрация (ФИО, логин, пароль, роль).
- `POST /api/auth/login` — вход.
- `GET /api/health` — проверка API и БД.
- `GET /api/tickets` — общий список заявок.
- `GET /api/tickets/:id` — детали заявки + комментарии.
- `POST /api/tickets` — создать заявку.
- `PATCH /api/tickets/:id/assign` — назначить исполнителя.
- `PATCH /api/tickets/:id/status` — сменить статус (`Завершена`, `Отменена` и т.д.).
- `POST /api/tickets/:id/comments` — добавить комментарий.
