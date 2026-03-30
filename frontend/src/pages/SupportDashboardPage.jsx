import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import TicketTable from '../components/TicketTable';

export default function SupportDashboardPage({ user, onLogout, onOpenTicket, forcedMode }) {
  const [mode, setMode] = useState(forcedMode || 'all');
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
    if (forcedMode) {
      setMode(forcedMode);
      load(forcedMode);
      return;
    }
    load('all');
  }, [forcedMode]);

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

  const returnTicket = async (id) => {
    try {
      await api(`/api/tickets/${id}/return`, { method: 'PATCH' });
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

  const openTickets = useMemo(() => tickets.filter((t) => !['Завершена', 'Отменена'].includes(t.status)), [tickets]);
  const closedTickets = useMemo(() => tickets.filter((t) => ['Завершена', 'Отменена'].includes(t.status)), [tickets]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 text-slate-900 dark:text-slate-100">
      <header className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900 flex justify-between">
        <div><h1 className="text-2xl font-bold">Панель ИТ-поддержки</h1><p className="text-slate-600 dark:text-slate-300">{user.fullName}</p></div>
        <div className="flex gap-2">
          <button onClick={() => load()} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700">Обновить</button>
          <button onClick={onLogout} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700">Выйти</button>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex gap-2">
          <button onClick={() => switchMode('all')} className={`rounded-lg px-3 py-2 text-sm ${mode === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Общие заявки</button>
          <button onClick={() => switchMode('my')} className={`rounded-lg px-3 py-2 text-sm ${mode === 'my' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Мои заявки</button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        {mode === 'all' ? (
          <TicketTable
            tickets={tickets}
            onOpen={onOpenTicket}
            onAssign={assign}
            onReturn={returnTicket}
            onCancel={cancel}
            showAssign
            currentSupportName={user.fullName}
            compact={false}
          />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <h3 className="text-lg font-semibold">Открытые</h3>
              <TicketTable tickets={openTickets} onOpen={onOpenTicket} onAssign={() => {}} onCancel={cancel} showAssign={false} compact />
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <h3 className="text-lg font-semibold">Завершённые и отменённые</h3>
              <TicketTable tickets={closedTickets} onOpen={onOpenTicket} onAssign={() => {}} onCancel={() => {}} showAssign={false} compact />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
