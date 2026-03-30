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

export default function TicketTable({ tickets, onOpen, onAssign, onCancel, showAssign, compact = false }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 text-left dark:bg-slate-800 dark:text-slate-100">
            <th className="border px-3 py-2 dark:border-slate-700">ID</th>
            <th className="border px-3 py-2 dark:border-slate-700">Тема</th>
            <th className="border px-3 py-2 dark:border-slate-700">Кто создал</th>
            <th className="border px-3 py-2 dark:border-slate-700">Кто выполняет</th>
            <th className="border px-3 py-2 dark:border-slate-700">Статус</th>
            <th className="border px-3 py-2 dark:border-slate-700">Дата выполнения</th>
            {!compact ? <th className="border px-3 py-2 dark:border-slate-700">Действия</th> : null}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onOpen(ticket.id)}
              className="cursor-pointer bg-white transition-all duration-200 hover:scale-[1.01] hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <td className="border px-3 py-2 dark:border-slate-700">{ticket.id}</td>
              <td className="border px-3 py-2 dark:border-slate-700">{ticket.title}</td>
              <td className="border px-3 py-2 dark:border-slate-700">{ticket.createdBy}</td>
              <td className="border px-3 py-2 dark:border-slate-700">{ticket.assignedTo || '—'}</td>
              <td className="border px-3 py-2 dark:border-slate-700">{ticket.status}</td>
              <td className="border px-3 py-2 dark:border-slate-700">{formatDate(ticket.dueDate)}</td>
              {!compact ? (
                <td className="border px-3 py-2 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-1">
                    {showAssign && !ticket.assignedTo ? (
                      <button onClick={() => onAssign(ticket.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">
                        Забрать
                      </button>
                    ) : null}
                    {ticket.status !== 'Отменена' ? (
                      <button onClick={() => onCancel(ticket.id)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">
                        Отменить
                      </button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={compact ? 6 : 7} className="border px-3 py-3 text-center text-slate-500 dark:border-slate-700">
                Нет заявок.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
