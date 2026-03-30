const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'helpdesk1',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});


pool.on('connect', async (client) => {
  await client.query("SET client_encoding TO 'UTF8'");
});

app.use(cors());
app.use(express.json());

const mapTicket = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  priority: row.priority,
  status: row.status,
  createdBy: row.created_by,
  assignedTo: row.assigned_to,
  dueDate: row.due_date,
  createdAt: row.created_at
});

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, fullName: user.full_name, role: user.role },
    jwtSecret,
    { expiresIn: '24h' }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
}

function supportOnly(req, res, next) {
  if (req.user.role !== 'support') {
    return res.status(403).json({ message: 'Доступ только для ИТ-поддержки' });
  }
  return next();
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'support')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Средний',
      status TEXT NOT NULL DEFAULT 'Открыта',
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

    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by TEXT;
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to TEXT;
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
  `);



  await pool.query(`
    UPDATE tickets
    SET status = 'Открыта'
    WHERE status IS NULL OR status NOT IN ('Открыта', 'В работе', 'Завершена', 'Отменена') OR status IN ('Ќ®ў п', 'Новая');

    UPDATE tickets
    SET assigned_to = NULL
    WHERE assigned_to = '';
  `);
  const seedUsers = [
    { fullName: 'Сотрудник предприятия', username: 'user', password: 'user123', role: 'user' },
    { fullName: 'Инженер ИТ-поддержки', username: 'support', password: 'support123', role: 'support' }
  ];

  for (const user of seedUsers) {
    const hash = bcrypt.hashSync(user.password, 10);
    await pool.query(
      `
      INSERT INTO users (full_name, username, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
      `,
      [user.fullName, user.username, hash, user.role]
    );
  }
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
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
      INSERT INTO users (full_name, username, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, username, role
      `,
      [fullName, username, passwordHash, role]
    );

    const user = result.rows[0];
    const token = createToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, fullName: user.full_name, username: user.username, role: user.role }
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
      'SELECT id, full_name, username, role, password_hash FROM users WHERE username = $1 LIMIT 1',
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const matched = await bcrypt.compare(password, user.password_hash || '');
    if (!matched) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: { id: user.id, fullName: user.full_name, username: user.username, role: user.role }
    });
  } catch {
    return res.status(500).json({ message: 'Ошибка авторизации' });
  }
});

app.get('/api/auth/me', authRequired, (req, res) => {
  return res.json({
    id: req.user.id,
    fullName: req.user.fullName,
    username: req.user.username,
    role: req.user.role
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', message: 'API и БД работают' });
  } catch {
    return res.status(500).json({ status: 'error', message: 'Ошибка подключения к БД' });
  }
});

app.get('/api/tickets', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, priority, status, created_by, assigned_to, due_date, created_at
       FROM tickets
       WHERE assigned_to IS NULL OR assigned_to = ''
       ORDER BY created_at DESC`
    );
    return res.json(result.rows.map(mapTicket));
  } catch {
    return res.status(500).json({ message: 'Не удалось получить список заявок' });
  }
});


app.get('/api/tickets/created', authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, priority, status, created_by, assigned_to, due_date, created_at
       FROM tickets
       WHERE created_by = $1
       ORDER BY created_at DESC`,
      [req.user.fullName]
    );
    return res.json(result.rows.map(mapTicket));
  } catch {
    return res.status(500).json({ message: 'Не удалось получить мои созданные заявки' });
  }
});

app.get('/api/tickets/my', authRequired, supportOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, priority, status, created_by, assigned_to, due_date, created_at FROM tickets WHERE assigned_to = $1 ORDER BY created_at DESC',
      [req.user.fullName]
    );
    return res.json(result.rows.map(mapTicket));
  } catch {
    return res.status(500).json({ message: 'Не удалось получить мои заявки' });
  }
});

app.get('/api/tickets/:id', authRequired, async (req, res) => {
  const ticketId = Number(req.params.id);
  try {
    const ticketResult = await pool.query(
      'SELECT id, title, description, priority, status, created_by, assigned_to, due_date, created_at FROM tickets WHERE id = $1',
      [ticketId]
    );
    if (!ticketResult.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const comments = await pool.query(
      'SELECT id, author_full_name, comment_text, created_at FROM ticket_comments WHERE ticket_id = $1 ORDER BY created_at ASC',
      [ticketId]
    );

    return res.json({
      ...mapTicket(ticketResult.rows[0]),
      comments: comments.rows.map((c) => ({
        id: c.id,
        authorFullName: c.author_full_name,
        commentText: c.comment_text,
        createdAt: c.created_at
      }))
    });
  } catch {
    return res.status(500).json({ message: 'Не удалось получить заявку' });
  }
});

app.post('/api/tickets', authRequired, async (req, res) => {
  const title = String(req.body.title || '').trim();
  const description = String(req.body.description || '').trim();
  const priority = String(req.body.priority || 'Средний').trim();
  const dueDate = req.body.dueDate || null;

  if (!title || !description) {
    return res.status(400).json({ message: 'Поля "Тема" и "Описание" обязательны.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tickets (title, description, priority, status, created_by, assigned_to, due_date)
       VALUES ($1, $2, $3, 'Открыта', $4, NULL, $5)
       RETURNING id, title, description, priority, status, created_by, assigned_to, due_date, created_at`,
      [title, description, priority, req.user.fullName, dueDate]
    );
    return res.status(201).json(mapTicket(result.rows[0]));
  } catch {
    return res.status(500).json({ message: 'Не удалось создать заявку' });
  }
});

app.patch('/api/tickets/:id/assign', authRequired, supportOnly, async (req, res) => {
  const ticketId = Number(req.params.id);
  try {
    const result = await pool.query(
      `UPDATE tickets
       SET assigned_to = $1,
           status = CASE WHEN status IN ('Открыта', 'Отменена') THEN 'В работе' ELSE status END
       WHERE id = $2
       RETURNING id, title, description, priority, status, created_by, assigned_to, due_date, created_at`,
      [req.user.fullName, ticketId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    return res.json(mapTicket(result.rows[0]));
  } catch {
    return res.status(500).json({ message: 'Не удалось назначить заявку' });
  }
});

app.patch('/api/tickets/:id/status', authRequired, supportOnly, async (req, res) => {
  const ticketId = Number(req.params.id);
  const nextStatus = String(req.body.status || '').trim();
  const allowedStatuses = ['Открыта', 'В работе', 'Завершена', 'Отменена'];

  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: 'Передан некорректный статус.' });
  }

  try {
    const result = await pool.query(
      `UPDATE tickets
       SET status = $1,
           due_date = CASE WHEN $1 = 'Завершена' THEN NOW() ELSE due_date END
       WHERE id = $2
       RETURNING id, title, description, priority, status, created_by, assigned_to, due_date, created_at`,
      [nextStatus, ticketId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    return res.json(mapTicket(result.rows[0]));
  } catch {
    return res.status(500).json({ message: 'Не удалось изменить статус заявки' });
  }
});

app.post('/api/tickets/:id/comments', authRequired, async (req, res) => {
  const ticketId = Number(req.params.id);
  const commentText = String(req.body.commentText || '').trim();

  if (!ticketId || !commentText) {
    return res.status(400).json({ message: 'Комментарий обязателен.' });
  }

  try {
    const exists = await pool.query('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!exists.rows.length) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const result = await pool.query(
      `INSERT INTO ticket_comments (ticket_id, author_full_name, comment_text)
       VALUES ($1, $2, $3)
       RETURNING id, author_full_name, comment_text, created_at`,
      [ticketId, req.user.fullName, commentText]
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      authorFullName: row.author_full_name,
      commentText: row.comment_text,
      createdAt: row.created_at
    });
  } catch {
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
