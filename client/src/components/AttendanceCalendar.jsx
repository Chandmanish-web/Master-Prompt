const statusStyles = {
  Present: 'bg-emerald-100 text-emerald-700',
  Late: 'bg-amber-100 text-amber-700',
  Absent: 'bg-rose-100 text-rose-700',
  'Half-day': 'bg-sky-100 text-sky-700',
  'On Leave': 'bg-violet-100 text-violet-700',
};

const formatKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const AttendanceCalendar = ({ records = [], title = 'Attendance Calendar' }) => {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const recordMap = new Map(records.map((record) => [formatKey(record.date), record]));
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const record = recordMap.get(formatKey(date));
    cells.push({ date, record });
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{monthLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-100/70" />;
          }

          const status = cell.record?.status || '—';
          return (
            <div key={cell.date.toISOString()} className="flex h-20 flex-col rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">{cell.date.getDate()}</div>
              <div className={`mt-auto rounded-full px-2 py-1 text-[11px] font-medium ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
