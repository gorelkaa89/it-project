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

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Средний',
      status TEXT NOT NULL DEFAULT 'Новая',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'API и БД работают' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Ошибка подключения к БД' });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, priority, status, created_at FROM tickets ORDER BY created_at DESC'
    );

    const tickets = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      createdAt: row.created_at
    }));

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Не удалось получить список заявок' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Поля "Тема" и "Описание" обязательны.' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO tickets (title, description, priority)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, priority, status, created_at
      `,
      [title.trim(), description.trim(), priority || 'Средний']
    );

    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось создать заявку' });
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
