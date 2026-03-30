import { useEffect, useState } from 'react';
import { api } from '../api';

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

export default function TicketDetailsPage({ ticketId, user, onBack, onStatusApplied }) {
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api(`/api/tickets/${ticketId}`);
      setTicket(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [ticketId]);

  const updateStatus = async (status) => {
    try {
      await api(`/api/tickets/${ticketId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      if (onStatusApplied) {
        onStatusApplied();
        return;
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const returnTicket = async () => {
    try {
      await api(`/api/tickets/${ticketId}/return`, { method: 'PATCH' });
      if (onStatusApplied) {
        onStatusApplied();
        return;
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ commentText: comment.trim() })
      });
      setComment('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8 text-slate-900 dark:text-slate-100">
      <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700" onClick={onBack}>← Назад</button>
      {error ? <p className="text-red-600">{error}</p> : null}
      {!ticket ? <p>Загрузка...</p> : null}
      {ticket ? (
        <>
          <section className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900">
            <h1 className="text-2xl font-bold">Заявка #{ticket.id}</h1>
            <p className="mt-1 text-lg font-semibold">{ticket.title}</p>
            <p className="mt-2 text-slate-700 dark:text-slate-300">{ticket.description}</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Кто создал: {ticket.createdBy}</p>
              <p>Кто выполняет: {ticket.assignedTo || '—'}</p>
              <p>Статус: {ticket.status}</p>
              <p>Дата выполнения: {formatDate(ticket.dueDate)}</p>
            </div>
            {user.role === 'support' ? (
              <div className="mt-5 flex gap-2">
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:scale-105" onClick={() => updateStatus('Завершена')}>Завершить</button>
                {ticket.assignedTo === user.fullName ? (
                  <button className="rounded-lg bg-amber-600 px-4 py-2 text-white transition hover:scale-105" onClick={returnTicket}>Вернуть тикет</button>
                ) : null}
                <button className="rounded-lg bg-rose-600 px-4 py-2 text-white transition hover:scale-105" onClick={() => updateStatus('Отменена')}>Отменить</button>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900">
            <h2 className="text-xl font-semibold">Комментарии</h2>
            <form className="mt-3 flex gap-2" onSubmit={addComment}>
              <input className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Добавить комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className="rounded-lg bg-blue-600 px-3 py-2 text-white">Добавить</button>
            </form>
            <div className="mt-4 space-y-2">
              {ticket.comments?.map((c) => (
                <article key={c.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-sm font-medium">{c.authorFullName}</p>
                  <p className="text-xs text-slate-500">{formatDate(c.createdAt)}</p>
                  <p className="mt-1">{c.commentText}</p>
                </article>
              ))}
              {ticket.comments?.length === 0 ? <p className="text-sm text-slate-500">Комментариев пока нет.</p> : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
