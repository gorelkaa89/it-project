const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'helpdesk',
  user: process.env.DB_USER || 'helpdesk_user',
  password: process.env.DB_PASSWORD || 'helpdesk_password'
});

app.use(cors());
app.use(express.json());

function mapTicket(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    dueDate: row.due_date,
    createdAt: row.created_at
  };
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'support')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Средний',
      status TEXT NOT NULL DEFAULT 'Новая',
      created_by TEXT NOT NULL,
      assigned_to TEXT,
      due_date TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ticket_comments (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author_full_name TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by TEXT;
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to TEXT;
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
  `);

  await pool.query(`
    INSERT INTO users (full_name, username, password, role)
    VALUES
      ('Сотрудник предприятия', 'user', 'user123', 'user'),
      ('Инженер ИТ-поддержки', 'support', 'support123', 'support')
    ON CONFLICT (username) DO NOTHING;
  `);
}

app.post('/api/auth/register', async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();
  const role = req.body.role === 'support' ? 'support' : 'user';

  if (!fullName || !username || !password) {
    return res.status(400).json({ message: 'ФИО, логин и пароль обязательны.' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO users (full_name, username, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, username, role
      `,
      [fullName, username, password, role]
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      fullName: row.full_name,
      username: row.username,
      role: row.role
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Пользователь с таким логином уже существует.' });
    }
    return res.status(500).json({ message: 'Не удалось зарегистрировать пользователя.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();

  try {
    const result = await pool.query(
      'SELECT id, full_name, username, role FROM users WHERE username = $1 AND password = $2 LIMIT 1',
      [username, password]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const row = result.rows[0];
    return res.json({
      id: row.id,
      fullName: row.full_name,
      username: row.username,
      role: row.role
    });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка авторизации' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', message: 'API и БД работают' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Ошибка подключения к БД' });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, title, description, priority, status, created_by, assigned_to, due_date, created_at
      FROM tickets
      ORDER BY created_at DESC
      `
    );
    return res.json(result.rows.map(mapTicket));
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось получить список заявок' });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  const ticketId = Number(req.params.id);

  try {
    const ticketResult = await pool.query(
      `
      SELECT id, title, description, priority, status, created_by, assigned_to, due_date, created_at
      FROM tickets
      WHERE id = $1
      `,
      [ticketId]
    );

    if (!ticketResult.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const commentsResult = await pool.query(
      `
      SELECT id, author_full_name, comment_text, created_at
      FROM ticket_comments
      WHERE ticket_id = $1
      ORDER BY created_at ASC
      `,
      [ticketId]
    );

    return res.json({
      ...mapTicket(ticketResult.rows[0]),
      comments: commentsResult.rows.map((row) => ({
        id: row.id,
        authorFullName: row.author_full_name,
        commentText: row.comment_text,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось получить заявку' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const title = String(req.body.title || '').trim();
  const description = String(req.body.description || '').trim();
  const createdBy = String(req.body.createdBy || '').trim();
  const priority = String(req.body.priority || 'Средний').trim();
  const dueDate = req.body.dueDate || null;

  if (!title || !description || !createdBy) {
    return res.status(400).json({ message: 'Поля "Тема", "Описание" и "Кто создал" обязательны.' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO tickets (title, description, priority, created_by, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, priority, status, created_by, assigned_to, due_date, created_at
      `,
      [title, description, priority || 'Средний', createdBy, dueDate]
    );

    return res.status(201).json(mapTicket(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось создать заявку' });
  }
});

app.patch('/api/tickets/:id/assign', async (req, res) => {
  const ticketId = Number(req.params.id);
  const assignee = String(req.body.assignee || '').trim();

  if (!ticketId || !assignee) {
    return res.status(400).json({ message: 'Не переданы ID заявки или исполнитель.' });
  }

  try {
    const result = await pool.query(
      `
      UPDATE tickets
      SET assigned_to = $1,
          status = CASE WHEN status IN ('Новая', 'Отменена') THEN 'В работе' ELSE status END
      WHERE id = $2
      RETURNING id, title, description, priority, status, created_by, assigned_to, due_date, created_at
      `,
      [assignee, ticketId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    return res.json(mapTicket(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось назначить заявку' });
  }
});

app.patch('/api/tickets/:id/status', async (req, res) => {
  const ticketId = Number(req.params.id);
  const nextStatus = String(req.body.status || '').trim();
  const allowedStatuses = ['Новая', 'В работе', 'Завершена', 'Отменена'];

  if (!ticketId || !allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: 'Передан некорректный статус.' });
  }

  try {
    const result = await pool.query(
      `
      UPDATE tickets
      SET status = $1
      WHERE id = $2
      RETURNING id, title, description, priority, status, created_by, assigned_to, due_date, created_at
      `,
      [nextStatus, ticketId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    return res.json(mapTicket(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось изменить статус заявки' });
  }
});

app.post('/api/tickets/:id/comments', async (req, res) => {
  const ticketId = Number(req.params.id);
  const authorFullName = String(req.body.authorFullName || '').trim();
  const commentText = String(req.body.commentText || '').trim();

  if (!ticketId || !authorFullName || !commentText) {
    return res.status(400).json({ message: 'Не переданы данные комментария.' });
  }

  try {
    const exists = await pool.query('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!exists.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const result = await pool.query(
      `
      INSERT INTO ticket_comments (ticket_id, author_full_name, comment_text)
      VALUES ($1, $2, $3)
      RETURNING id, ticket_id, author_full_name, comment_text, created_at
      `,
      [ticketId, authorFullName, commentText]
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      ticketId: row.ticket_id,
      authorFullName: row.author_full_name,
      commentText: row.comment_text,
      createdAt: row.created_at
    });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось добавить комментарий' });
  }
});

async function startServer() {
  try {
    await ensureSchema();
    app.listen(port, () => {
      console.log(`Backend запущен: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Ошибка запуска backend:', error.message);
    process.exit(1);
  }
}

startServer();
