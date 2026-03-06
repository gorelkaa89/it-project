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

INSERT INTO users (full_name, username, password, role)
VALUES
  ('Сотрудник предприятия', 'user', 'user123', 'user'),
  ('Инженер ИТ-поддержки', 'support', 'support123', 'support')
ON CONFLICT (username) DO NOTHING;

INSERT INTO tickets (title, description, priority, status, created_by, assigned_to, due_date)
SELECT
  'Не работает VPN',
  'Не могу подключиться к корпоративной сети из дома.',
  'Высокий',
  'Новая',
  'Сотрудник предприятия',
  NULL,
  NOW() + INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM tickets);

INSERT INTO ticket_comments (ticket_id, author_full_name, comment_text)
SELECT 1, 'Инженер ИТ-поддержки', 'Проверяю доступы VPN на шлюзе.'
WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 1)
  AND NOT EXISTS (SELECT 1 FROM ticket_comments WHERE ticket_id = 1);
