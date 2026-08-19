import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, LogIn, LogOut } from 'lucide-react';
import Modal from './ui/Modal';

const statusStyles = {
  Present: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Late: 'bg-amber-100 text-amber-700 border-amber-300',
  Absent: 'bg-rose-100 text-rose-700 border-rose-300',
  'Half-day': 'bg-sky-100 text-sky-700 border-sky-300',
  'On Leave': 'bg-violet-100 text-violet-700 border-violet-300',
};

const statusBgHover = {
  Present: 'hover:bg-emerald-50',
  Late: 'hover:bg-amber-50',
  Absent: 'hover:bg-rose-50',
  'Half-day': 'hover:bg-sky-50',
  'On Leave': 'hover:bg-violet-50',
};

const formatKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const AttendanceCalendar = ({ 
  records = [], 
  title = 'Attendance Calendar',
  onMonthChange = null,
  currentMonth = null,
  onCheckIn = null,
  onCheckOut = null,
  isToday = null,
  todayRecord = null,
  loading = false,
}) => {
  const today = new Date();
  const displayMonth = currentMonth || new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabel = displayMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
  
  const recordMap = new Map(records.map((record) => [formatKey(record.date), record]));
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    const record = recordMap.get(formatKey(date));
    cells.push({ date, record });
  }

  const [selectedDay, setSelectedDay] = useState(null);

  const handlePrevMonth = () => {
    if (onMonthChange) {
      const prev = new Date(displayMonth);
      prev.setMonth(prev.getMonth() - 1);
      onMonthChange(prev);
    }
  };

  const handleNextMonth = () => {
    if (onMonthChange) {
      const next = new Date(displayMonth);
      next.setMonth(next.getMonth() + 1);
      onMonthChange(next);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{monthLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              disabled={!onMonthChange}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextMonth}
              disabled={!onMonthChange}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="mb-4 grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, index) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50"
                />
              );
            }

            const status = cell.record?.status || '—';
            const isCurrentDay = formatKey(cell.date) === formatKey(today);
            const isClickable = !!cell.record;

            return (
              <button
                key={cell.date.toISOString()}
                onClick={() => isClickable && setSelectedDay(cell)}
                disabled={!isClickable}
                className={`relative flex h-24 flex-col rounded-2xl border-2 bg-white p-2 text-left transition ${
                  statusStyles[status] || 'border-slate-200'
                } ${isClickable ? `cursor-pointer ${statusBgHover[status] || 'hover:bg-slate-50'}` : ''} ${
                  isCurrentDay ? 'ring-2 ring-brand-400 ring-offset-2' : 'shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold text-slate-800">{cell.date.getDate()}</span>
                  {isCurrentDay && <span className="text-xs font-medium text-brand-600">Today</span>}
                </div>
                <div
                  className={`mt-auto rounded-full px-2 py-1 text-[11px] font-medium ${
                    statusStyles[status] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {status}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
      >
        {selectedDay && selectedDay.record && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    statusStyles[selectedDay.record.status] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedDay.record.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <LogIn className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Check In</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {formatTime(selectedDay.record.checkIn)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Check Out</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {formatTime(selectedDay.record.checkOut)}
                    </p>
                  </div>
                </div>

                {selectedDay.record.checkIn && selectedDay.record.checkOut && (
                  <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Duration</p>
                      <p className="text-lg font-semibold text-slate-800">
                        {Math.round(
                          (new Date(selectedDay.record.checkOut) - new Date(selectedDay.record.checkIn)) /
                            (1000 * 60)
                        )}{' '}
                        mins
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Check In/Out for Today */}
      {isToday && onCheckIn && onCheckOut && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-sm font-semibold text-slate-800">Today's Actions</h4>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onCheckIn}
              disabled={loading || (todayRecord?.checkIn && !todayRecord?.checkOut)}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Checking In...' : 'Check In'}
            </button>
            <button
              onClick={onCheckOut}
              disabled={loading || !todayRecord?.checkIn || todayRecord?.checkOut}
              className="flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:bg-slate-300"
            >
              <LogOut className="h-4 w-4" />
              {loading ? 'Checking Out...' : 'Check Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
