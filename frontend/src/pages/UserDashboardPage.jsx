import { useMemo, useState } from 'react';
import { api } from '../api';
import TicketTable from '../components/TicketTable';

const PRIORITIES = ['Низкий', 'Средний', 'Высокий', 'Критический'];

export default function UserDashboardPage({ user, onLogout, onOpenTicket }) {
  const hints = useMemo(() => ['Укажите подразделение и кабинет.', 'Опишите шаги до ошибки.', 'Уточните срочность.'], []);
  const [tab, setTab] = useState('create');
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Средний', dueDate: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadMyTickets = async () => {
    try {
      setError('');
      const data = await api('/api/tickets/created');
      setTickets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const ticket = await api('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
        })
      });
      setMessage(`Заявка #${ticket.id} создана`);
      setForm({ title: '', description: '', priority: 'Средний', dueDate: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const openMyTab = () => {
    setTab('my');
    loadMyTickets();
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8 text-slate-900 dark:text-slate-100">
      <header className="rounded-xl bg-white p-6 shadow dark:bg-slate-900">
        <div className="flex justify-between">
          <div><h1 className="text-2xl font-bold">Кабинет сотрудника</h1><p className="text-slate-600 dark:text-slate-300">{user.fullName}</p></div>
          <button onClick={onLogout} className="rounded border px-3 py-2 dark:border-slate-700">Выйти</button>
        </div>
      </header>

      <section className="rounded-xl bg-white p-6 shadow dark:bg-slate-900">
        <div className="flex gap-2">
          <button onClick={() => setTab('create')} className={`rounded px-3 py-2 text-sm ${tab === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Создать заявку</button>
          <button onClick={openMyTab} className={`rounded px-3 py-2 text-sm ${tab === 'my' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Мои заявки</button>
        </div>

        {tab === 'create' ? (
          <>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">{hints.map((h) => <li key={h}>{h}</li>)}</ul>
            <form className="mt-3 space-y-3" onSubmit={submit}>
              <input className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Тема" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Описание" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <div className="grid md:grid-cols-2 gap-3">
                <select className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
                <input type="datetime-local" className="rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-800" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {message ? <p className="text-sm text-green-600">{message}</p> : null}
              <button className="rounded bg-blue-600 px-4 py-2 text-white">Отправить заявку</button>
            </form>
          </>
        ) : (
          <>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <TicketTable tickets={tickets} onOpen={onOpenTicket} onAssign={() => {}} onCancel={() => {}} showAssign={false} compact />
          </>
        )}
      </section>
    </div>
  );
}
