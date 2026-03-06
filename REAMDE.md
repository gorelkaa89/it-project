# Service Desk / Helpdesk — React + Vite + Tailwind + Express + PostgreSQL

Стартовый проект для ИТ-поддержки предприятия с русскоязычным интерфейсом и ролевым доступом.

## Стек
- Frontend: **React (JS) + Vite + Tailwind CSS**.
- Backend: **Node.js + Express**.
- База данных: **PostgreSQL**.
- Оркестрация: **Docker Compose**.

## Реализовано
- Форма авторизации.
- Роли:
  - **Сотрудник** — видит только форму создания заявки с подсказками.
  - **ИТ-поддержка** — видит список заявок и может забрать заявку себе.
- В таблице заявок есть поля:
  - **Назначено** (`assigned_to`)
  - **Дата выполнения** (`due_date`)
- Создание заявок с желаемой датой выполнения.

## Тестовые аккаунты
- Сотрудник: `user / user123`
- ИТ-поддержка: `support / support123`

## Структура
- `frontend/` — клиентское приложение (React + Vite + Tailwind).
- `backend/` — API на Express.
- `db/init.sql` — начальная схема и тестовая заявка.
- `docker-compose.yml` — запуск фронта, бэка и БД.

## Быстрый запуск (Docker)
```bash
docker compose up --build
```

После запуска:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/health`
- PostgreSQL: `localhost:5432`

## Локальный запуск без Docker
### 1) База данных
Поднимите PostgreSQL и создайте БД/пользователя:
- DB: `helpdesk`
- User: `helpdesk_user`
- Password: `helpdesk_password`

Примените `db/init.sql`.

### 2) Backend
```bash
cd backend
npm install
npm start
```

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```

## API
- `POST /api/auth/login` — вход и получение роли.
- `GET /api/health` — проверка API и подключения к БД.
- `GET /api/tickets` — получить список заявок.
- `POST /api/tickets` — создать заявку.
- `PATCH /api/tickets/:id/assign` — назначить заявку на инженера.

Пример создания заявки:
```json
{
  "title": "Не работает принтер",
  "description": "Принтер в кабинете 214 не печатает",
  "priority": "Средний",
  "dueDate": "2026-03-07T10:30:00.000Z"
}
```
