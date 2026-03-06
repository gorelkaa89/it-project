import { useEffect, useMemo, useState } from 'react';

const PRIORITIES = ['Низкий', 'Средний', 'Высокий', 'Критический'];

const DEFAULT_HINTS = [
  'Укажите, где возникла проблема: отдел, кабинет, рабочее место.',
  'Опишите шаги, после которых появляется ошибка.',
  'Добавьте текст ошибки или код, если он отображается.'
];

function formatDate(dateValue) {
  if (!dateValue) {
    return '—';
  }

  return new Date(dateValue).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function LoginForm({ onLogin, loading, error }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const submit = (event) => {
    event.preventDefault();
    onLogin(credentials);
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold text-slate-900">Вход в Service Desk</h1>
      <p className="mt-2 text-sm text-slate-600">
        Тестовые аккаунты: <b>user/user123</b> (сотрудник), <b>support/support123</b> (ИТ-поддержка).
      </p>

      <form className="mt-5 space-y-3" onSubmit={submit}>
        <div>
          <label className="text-sm text-slate-700">Логин</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm text-slate-700">Пароль</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

function UserPage({ user, onLogout }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Средний',
    dueDate: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(() => DEFAULT_HINTS, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Не удалось создать заявку');
      }

      setSuccessMessage(`Заявка №${payload.id} успешно создана.`);
      setForm({ title: '', description: '', priority: 'Средний', dueDate: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
      <header className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Кабинет сотрудника</h1>
            <p className="mt-1 text-slate-600">
              Вы вошли как: <b>{user.fullName}</b>
            </p>
          </div>
          <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Создать заявку</h2>

        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {suggestions.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-700">Тема</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Например: Не работает Outlook"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Описание</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              required
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-700">Приоритет</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-700">Желаемая дата выполнения</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </section>
    </div>
  );
}

function SupportPage({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    setError('');
    try {
      const response = await fetch('/api/tickets');
      if (!response.ok) {
        throw new Error('Не удалось загрузить заявки');
      }
      const data = await response.json();
      setTickets(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const assignToMe = async (ticketId) => {
    setError('');
    try {
      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee: user.fullName })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Не удалось назначить заявку');
      }

      await loadTickets();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8">
      <header className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Панель ИТ-поддержки</h1>
            <p className="mt-1 text-slate-600">
              Вы вошли как: <b>{user.fullName}</b>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={loadTickets}>
              Обновить
            </button>
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Список заявок</h2>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-700">
                <th className="border border-slate-200 px-3 py-2">ID</th>
                <th className="border border-slate-200 px-3 py-2">Тема</th>
                <th className="border border-slate-200 px-3 py-2">Приоритет</th>
                <th className="border border-slate-200 px-3 py-2">Статус</th>
                <th className="border border-slate-200 px-3 py-2">Назначено</th>
                <th className="border border-slate-200 px-3 py-2">Дата выполнения</th>
                <th className="border border-slate-200 px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="border border-slate-200 px-3 py-2">{ticket.id}</td>
                  <td className="border border-slate-200 px-3 py-2">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-xs text-slate-500">{ticket.description}</p>
                  </td>
                  <td className="border border-slate-200 px-3 py-2">{ticket.priority}</td>
                  <td className="border border-slate-200 px-3 py-2">{ticket.status}</td>
                  <td className="border border-slate-200 px-3 py-2">{ticket.assignedTo || '—'}</td>
                  <td className="border border-slate-200 px-3 py-2">{formatDate(ticket.dueDate)}</td>
                  <td className="border border-slate-200 px-3 py-2">
                    {ticket.assignedTo ? (
                      <span className="text-xs text-slate-500">Уже назначена</span>
                    ) : (
                      <button
                        onClick={() => assignToMe(ticket.id)}
                        className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
                      >
                        Забрать себе
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-200 px-3 py-3 text-center text-slate-500">
                    Заявок пока нет.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const login = async ({ username, password }) => {
    setAuthError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Ошибка авторизации');
      }

      setUser(payload);
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthError('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <LoginForm onLogin={login} loading={loading} error={authError} />
      </div>
    );
  }

  if (user.role === 'support') {
    return <SupportPage user={user} onLogout={logout} />;
  }

  return <UserPage user={user} onLogout={logout} />;
}
