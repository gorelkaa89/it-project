CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Средний',
  status TEXT NOT NULL DEFAULT 'Новая',
  assigned_to TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO tickets (title, description, priority, status, assigned_to, due_date)
SELECT
  'Не работает VPN',
  'Не могу подключиться к корпоративной сети из дома.',
  'Высокий',
  'Новая',
  NULL,
  NOW() + INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM tickets);
