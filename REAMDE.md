# Service Desk / Helpdesk — React + Vite + Tailwind + Express + PostgreSQL

Стартовый проект для ИТ-поддержки предприятия с русскоязычным интерфейсом.

## Стек
- Frontend: **React (JS) + Vite + Tailwind CSS**.
- Backend: **Node.js + Express**.
- База данных: **PostgreSQL**.
- Оркестрация: **Docker Compose**.

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
- `GET /api/health` — проверка API и подключения к БД.
- `GET /api/tickets` — получить список заявок.
- `POST /api/tickets` — создать заявку.

Пример POST тела:
```json
{
  "title": "Не работает принтер",
  "description": "Принтер в кабинете 214 не печатает",
  "priority": "Средний"
}
```

## Что уже готово
- Форма создания заявки на русском языке.
- Список заявок с датой и статусом.
- Сохранение заявок в PostgreSQL.

## Что можно добавить дальше
- Авторизация (JWT) и роли: сотрудник / инженер / админ.
- SLA и эскалации.
- Фильтры и поиск по заявкам.
- История комментариев и вложения.
