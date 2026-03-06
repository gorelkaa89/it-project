import { useEffect, useMemo, useState } from 'react';

const PRIORITIES = ['Низкий', 'Средний', 'Высокий', 'Критический'];

const HINTS = [
  'Укажите подразделение и кабинет.',
  'Опишите шаги, после которых появляется проблема.',
  'При наличии добавьте текст ошибки.'
];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function AuthPage({ onLogin, onRegister, loading, error }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', username: '', password: '', role: 'user' });

  return (
    <div className="mx-auto mt-10 grid w-full max-w-4xl gap-5 px-4 md:grid-cols-2">
      <section className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Service Desk</h1>
        <p className="mt-2 text-sm text-slate-600">Авторизация и регистрация пользователей с ФИО.</p>

        <div className="mt-4 flex gap-2">
          <button
            className={`rounded px-3 py-2 text-sm ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
            onClick={() => setMode('login')}
          >
            Вход
          </button>
          <button
            className={`rounded px-3 py-2 text-sm ${mode === 'register' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
            onClick={() => setMode('register')}
          >
            Регистрация
          </button>
        </div>

        {mode === 'login' ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(loginForm);
            }}
          >
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Логин"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              required
            />
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Пароль"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white" disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onRegister(registerForm);
            }}
          >
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="ФИО"
              value={registerForm.fullName}
              onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Логин"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              required
            />
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Пароль"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={registerForm.role}
              onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
            >
              <option value="user">Сотрудник</option>
              <option value="support">ИТ-поддержка</option>
            </select>
            <button className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-white" disabled={loading}>
              {loading ? 'Создаём...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Демо аккаунты</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Сотрудник: user / user123</li>
          <li>ИТ-поддержка: support / support123</li>
        </ul>
      </section>
    </div>
  );
}

function UserPage({ user, onLogout, onOpenTicket }) {
  const hints = useMemo(() => HINTS, []);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Средний', dueDate: '' });
  const [resultMessage, setResultMessage] = useState('');
  const [error, setError] = useState('');

  const createTicket = async (e) => {
    e.preventDefault();
    setError('');
    setResultMessage('');

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        createdBy: user.fullName,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || 'Не удалось создать заявку');
      return;
    }

    setForm({ title: '', description: '', priority: 'Средний', dueDate: '' });
    setResultMessage(`Заявка #${payload.id} создана.`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
      <header className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Кабинет сотрудника</h1>
            <p className="mt-1 text-slate-600">{user.fullName}</p>
          </div>
          <button className="rounded border border-slate-300 px-3 py-2 text-sm" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Создать заявку</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>

        <form className="mt-4 space-y-3" onSubmit={createTicket}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Тема"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Описание"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {resultMessage ? <p className="text-sm text-green-600">{resultMessage}</p> : null}
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">Отправить заявку</button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Быстрый переход</h2>
        <button onClick={() => onOpenTicket(null)} className="mt-3 rounded bg-slate-800 px-3 py-2 text-sm text-white">
          Открыть общий список заявок
        </button>
      </section>
    </div>
  );
}

function TicketDetailPage({ ticketId, user, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');

  const loadTicket = async () => {
    const response = await fetch(`/api/tickets/${ticketId}`);
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || 'Не удалось получить заявку');
      return;
    }
    setTicket(payload);
  };

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const updateStatus = async (status) => {
    const response = await fetch(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || 'Не удалось обновить статус');
      return;
    }

    setTicket({ ...ticket, status: payload.status });
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const response = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorFullName: user.fullName,
        commentText: comment.trim()
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || 'Не удалось добавить комментарий');
      return;
    }

    setComment('');
    setTicket({ ...ticket, comments: [...ticket.comments, payload] });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
      <button className="rounded border border-slate-300 px-3 py-2 text-sm" onClick={onBack}>
        ← Назад к списку
      </button>

      {error ? <p className="text-red-600">{error}</p> : null}
      {!ticket ? <p>Загрузка...</p> : null}

      {ticket ? (
        <>
          <section className="rounded-xl bg-white p-6 shadow">
            <h1 className="text-2xl font-bold">Заявка #{ticket.id}</h1>
            <p className="mt-2 font-medium">{ticket.title}</p>
            <p className="mt-1 text-slate-700">{ticket.description}</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <p>Кто создал: {ticket.createdBy}</p>
              <p>Кто выполняет: {ticket.assignedTo || '—'}</p>
              <p>Статус: {ticket.status}</p>
              <p>Дата выполнения: {formatDate(ticket.dueDate)}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="rounded bg-emerald-600 px-3 py-2 text-sm text-white" onClick={() => updateStatus('Завершена')}>
                Завершить
              </button>
              <button className="rounded bg-rose-600 px-3 py-2 text-sm text-white" onClick={() => updateStatus('Отменена')}>
                Отменить
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Комментарии</h2>
            <form className="mt-3 flex gap-2" onSubmit={addComment}>
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Добавить комментарий"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="rounded bg-blue-600 px-3 py-2 text-white">Добавить</button>
            </form>

            <div className="mt-4 space-y-2">
              {ticket.comments.length === 0 ? <p className="text-sm text-slate-500">Комментариев пока нет.</p> : null}
              {ticket.comments.map((item) => (
                <article key={item.id} className="rounded border border-slate-200 p-3">
                  <p className="text-sm font-medium">{item.authorFullName}</p>
                  <p className="text-sm text-slate-600">{formatDate(item.createdAt)}</p>
                  <p className="mt-1">{item.commentText}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function SupportPage({ user, onLogout, onOpenTicket }) {
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('all');
  const [error, setError] = useState('');

  const loadTickets = async () => {
    const response = await fetch('/api/tickets');
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || 'Не удалось загрузить заявки');
      return;
    }
    setTickets(payload);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const assignToMe = async (id) => {
    const response = await fetch(`/api/tickets/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee: user.fullName })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || 'Не удалось назначить заявку');
      return;
    }
    await loadTickets();
  };

  const cancelTicket = async (id) => {
    const response = await fetch(`/api/tickets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Отменена' })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || 'Не удалось отменить заявку');
      return;
    }
    await loadTickets();
  };

  const visibleTickets = tab === 'my' ? tickets.filter((t) => t.assignedTo === user.fullName) : tickets;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8">
      <header className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Панель ИТ-поддержки</h1>
            <p className="mt-1 text-slate-600">{user.fullName}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded border border-slate-300 px-3 py-2 text-sm" onClick={loadTickets}>
              Обновить
            </button>
            <button className="rounded border border-slate-300 px-3 py-2 text-sm" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex gap-2">
          <button
            className={`rounded px-3 py-2 text-sm ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
            onClick={() => setTab('all')}
          >
            Все заявки
          </button>
          <button
            className={`rounded px-3 py-2 text-sm ${tab === 'my' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
            onClick={() => setTab('my')}
          >
            Мои заявки
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Тема</th>
                <th className="border px-3 py-2">Кто создал</th>
                <th className="border px-3 py-2">Кто выполняет</th>
                <th className="border px-3 py-2">Статус</th>
                <th className="border px-3 py-2">Дата выполнения</th>
                <th className="border px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {visibleTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="border px-3 py-2">{ticket.id}</td>
                  <td className="border px-3 py-2">{ticket.title}</td>
                  <td className="border px-3 py-2">{ticket.createdBy}</td>
                  <td className="border px-3 py-2">{ticket.assignedTo || '—'}</td>
                  <td className="border px-3 py-2">{ticket.status}</td>
                  <td className="border px-3 py-2">{formatDate(ticket.dueDate)}</td>
                  <td className="border px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {!ticket.assignedTo ? (
                        <button onClick={() => assignToMe(ticket.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">
                          Забрать
                        </button>
                      ) : null}
                      <button onClick={() => onOpenTicket(ticket.id)} className="rounded bg-slate-700 px-2 py-1 text-xs text-white">
                        Открыть
                      </button>
                      {ticket.status !== 'Отменена' ? (
                        <button onClick={() => cancelTicket(ticket.id)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">
                          Отменить
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {visibleTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border px-3 py-3 text-center text-slate-500">
                    Нет заявок.
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
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openedTicketId, setOpenedTicketId] = useState(null);

  const login = async (credentials) => {
    setAuthError('');
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const payload = await response.json();
    if (!response.ok) {
      setAuthError(payload.message || 'Ошибка входа');
      setLoading(false);
      return;
    }

    setUser(payload);
    setLoading(false);
  };

  const register = async (data) => {
    setAuthError('');
    setLoading(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const payload = await response.json();
    if (!response.ok) {
      setAuthError(payload.message || 'Ошибка регистрации');
      setLoading(false);
      return;
    }

    setUser(payload);
    setLoading(false);
  };

  const logout = () => {
    setOpenedTicketId(null);
    setUser(null);
    setAuthError('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 py-8">
        <AuthPage onLogin={login} onRegister={register} loading={loading} error={authError} />
      </div>
    );
  }

  if (openedTicketId) {
    return <TicketDetailPage ticketId={openedTicketId} user={user} onBack={() => setOpenedTicketId(null)} />;
  }

  if (user.role === 'support') {
    return <SupportPage user={user} onLogout={logout} onOpenTicket={setOpenedTicketId} />;
  }

  return <UserPage user={user} onLogout={logout} onOpenTicket={setOpenedTicketId} />;
}
