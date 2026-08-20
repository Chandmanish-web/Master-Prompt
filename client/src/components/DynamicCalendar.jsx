import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useDispatch, useSelector } from 'react-redux';
import { getCalendarEvents } from '../redux/calendarSlice';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-US': enUS } });
const colors = { Present: '#059669', Late: '#d97706', Absent: '#e11d48', 'Half-day': '#0284c7', 'Half-Day': '#0284c7', Leave: '#7c3aed', Holiday: '#475569', 'Task Due': '#0891b2' };

const DynamicCalendar = ({ title = 'Work calendar' }) => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.calendar);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  const fetchRange = (range) => {
    const dates = Array.isArray(range) ? range : [range.start, range.end];
    const start = new Date(Math.min(...dates.map((item) => new Date(item).getTime())));
    const end = new Date(Math.max(...dates.map((item) => new Date(item).getTime())));
    dispatch(getCalendarEvents({ start, end: addHours(end, 24) }));
  };

  useEffect(() => {
    const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 2, 1);
    fetchRange({ start, end });
  }, [date]);

  const normalizedEvents = events.map((event) => ({ ...event, start: new Date(event.start), end: new Date(event.end) > new Date(event.start) ? new Date(event.end) : addHours(new Date(event.start), 1) }));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{title}</h2>{loading && <span className="text-sm text-slate-500">Loading events...</span>}</div>
      {error && <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {!loading && !error && normalizedEvents.length === 0 && <p className="mb-3 text-sm text-slate-500">No events in the loaded range.</p>}
      <div className="h-[min(42rem,70vh)] min-h-[32rem]">
        <Calendar
          localizer={localizer}
          events={normalizedEvents}
          startAccessor="start"
          endAccessor="end"
          date={date}
          view={view}
          onNavigate={setDate}
          onView={setView}
          views={['month', 'week', 'day']}
          onRangeChange={fetchRange}
          eventPropGetter={(event) => ({ style: { backgroundColor: colors[event.type] || '#334155', borderColor: colors[event.type] || '#334155' } })}
        />
      </div>
    </section>
  );
};

export default DynamicCalendar;
