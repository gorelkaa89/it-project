import { useEffect, useState } from 'react';

const PRIORITIES = ['Низкий', 'Средний', 'Высокий', 'Критический'];

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Средний' });
  const [loading, setLoading] = useState(false);
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
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Не удалось создать заявку');
      }

      setForm({ title: '', description: '', priority: 'Средний' });
      await loadTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-5 px-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-900">Service Desk предприятия</h1>
          <p className="mt-2 text-slate-600">Стек: React + Vite + Tailwind, backend на Express, БД PostgreSQL.</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Создать заявку</h2>
          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="text-sm text-slate-700">Тема</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Например: Не работает корпоративная почта"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-700">Описание</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Опишите проблему"
                rows={4}
                required
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Список заявок</h2>

          {error ? <p className="mt-3 text-red-600">{error}</p> : null}

          <div className="mt-4 space-y-3">
            {tickets.length === 0 ? (
              <p className="text-slate-500">Заявок пока нет.</p>
            ) : (
              tickets.map((ticket) => (
                <article key={ticket.id} className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                  <p className="mt-1 text-slate-700">{ticket.description}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Статус: {ticket.status} · Приоритет: {ticket.priority}
                  </p>
                  <p className="text-sm text-slate-500">
                    Создана:{' '}
                    {new Date(ticket.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
