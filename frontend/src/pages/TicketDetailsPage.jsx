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

export default function TicketDetailsPage({ ticketId, user, onBack }) {
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
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
      <button className="rounded border px-3 py-2 text-sm" onClick={onBack}>← Назад</button>
      {error ? <p className="text-red-600">{error}</p> : null}
      {!ticket ? <p>Загрузка...</p> : null}
      {ticket ? (
        <>
          <section className="rounded-xl bg-white p-6 shadow">
            <h1 className="text-2xl font-bold">Заявка #{ticket.id}</h1>
            <p className="mt-1 font-medium">{ticket.title}</p>
            <p className="mt-1 text-slate-700">{ticket.description}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-slate-600">
              <p>Кто создал: {ticket.createdBy}</p>
              <p>Кто выполняет: {ticket.assignedTo || '—'}</p>
              <p>Статус: {ticket.status}</p>
              <p>Дата выполнения: {formatDate(ticket.dueDate)}</p>
            </div>
            {user.role === 'support' ? (
              <div className="mt-4 flex gap-2">
                <button className="rounded bg-emerald-600 px-3 py-2 text-white" onClick={() => updateStatus('Завершена')}>Завершить</button>
                <button className="rounded bg-rose-600 px-3 py-2 text-white" onClick={() => updateStatus('Отменена')}>Отменить</button>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Комментарии</h2>
            <form className="mt-3 flex gap-2" onSubmit={addComment}>
              <input className="flex-1 rounded border px-3 py-2" placeholder="Добавить комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className="rounded bg-blue-600 px-3 py-2 text-white">Добавить</button>
            </form>
            <div className="mt-4 space-y-2">
              {ticket.comments?.map((c) => (
                <article key={c.id} className="rounded border p-3">
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
