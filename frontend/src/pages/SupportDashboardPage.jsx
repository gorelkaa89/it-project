import { useEffect, useState } from 'react';
import { api } from '../api';
import TicketTable from '../components/TicketTable';

export default function SupportDashboardPage({ user, onLogout, onOpenTicket }) {
  const [mode, setMode] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  const load = async (selectedMode = mode) => {
    try {
      setError('');
      const data = await api(selectedMode === 'my' ? '/api/tickets/my' : '/api/tickets');
      setTickets(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load('all');
  }, []);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    load(nextMode);
  };

  const assign = async (id) => {
    try {
      await api(`/api/tickets/${id}/assign`, { method: 'PATCH' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (id) => {
    try {
      await api(`/api/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Отменена' }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8">
      <header className="rounded-xl bg-white p-6 shadow flex justify-between">
        <div><h1 className="text-2xl font-bold">Панель ИТ-поддержки</h1><p>{user.fullName}</p></div>
        <div className="flex gap-2">
          <button onClick={() => load()} className="rounded border px-3 py-2 text-sm">Обновить</button>
          <button onClick={onLogout} className="rounded border px-3 py-2 text-sm">Выйти</button>
        </div>
      </header>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex gap-2">
          <button onClick={() => switchMode('all')} className={`rounded px-3 py-2 text-sm ${mode === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>Все заявки</button>
          <button onClick={() => switchMode('my')} className={`rounded px-3 py-2 text-sm ${mode === 'my' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>Мои заявки</button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <TicketTable tickets={tickets} onOpen={onOpenTicket} onAssign={assign} onCancel={cancel} showAssign={mode === 'all'} />
      </section>
    </div>
  );
}
