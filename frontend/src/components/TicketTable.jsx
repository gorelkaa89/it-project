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

export default function TicketTable({ tickets, onOpen, onAssign, onCancel, showAssign }) {
  return (
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
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="border px-3 py-2">{ticket.id}</td>
              <td className="border px-3 py-2">{ticket.title}</td>
              <td className="border px-3 py-2">{ticket.createdBy}</td>
              <td className="border px-3 py-2">{ticket.assignedTo || '—'}</td>
              <td className="border px-3 py-2">{ticket.status}</td>
              <td className="border px-3 py-2">{formatDate(ticket.dueDate)}</td>
              <td className="border px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {showAssign && !ticket.assignedTo ? (
                    <button onClick={() => onAssign(ticket.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">
                      Забрать
                    </button>
                  ) : null}
                  <button onClick={() => onOpen(ticket.id)} className="rounded bg-slate-700 px-2 py-1 text-xs text-white">
                    Открыть
                  </button>
                  {ticket.status !== 'Отменена' ? (
                    <button onClick={() => onCancel(ticket.id)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">
                      Отменить
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={7} className="border px-3 py-3 text-center text-slate-500">
                Нет заявок.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
