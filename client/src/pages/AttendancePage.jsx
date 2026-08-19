import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { checkIn, checkOut, getAttendanceReport, getTodayAttendance } from '../redux/attendanceSlice';
import { useNavigate } from 'react-router-dom';

const AttendancePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { today, report, loading, error } = useSelector((state) => state.attendance);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  const refreshAttendance = () => {
    dispatch(getTodayAttendance());
    const params = { month: monthKey };
    if (selectedEmployee) {
      params.userId = selectedEmployee.id;
    }
    dispatch(getAttendanceReport(params));
  };

  useEffect(() => {
    refreshAttendance();
  }, [dispatch, currentMonth, selectedEmployee]);

  const handleCheckIn = async () => {
    const result = await dispatch(checkIn());
    if (checkIn.fulfilled.match(result)) {
      setTimeout(() => refreshAttendance(), 500);
    }
  };

  const handleCheckOut = async () => {
    const result = await dispatch(checkOut());
    if (checkOut.fulfilled.match(result)) {
      setTimeout(() => refreshAttendance(), 500);
    }
  };

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  const isToday =
    currentMonth.getFullYear() === new Date().getFullYear() &&
    currentMonth.getMonth() === new Date().getMonth();

  // Check if user is manager or admin for team view
  const canViewTeam = user?.role === 'manager' || user?.role === 'admin';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Attendance Tracking</h1>
            <p className="mt-2 text-slate-600">View and manage your attendance records</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Team View Toggle (Managers/Admins Only) */}
          {canViewTeam && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.checked ? { id: 'team' } : null)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">
                  {selectedEmployee ? 'Viewing Team Attendance' : 'View Team Attendance'}
                </span>
              </label>
            </div>
          )}

          {/* Calendar */}
          <AttendanceCalendar
            records={report}
            title={selectedEmployee ? 'Team Attendance' : `${user?.name}'s Attendance`}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isToday={isToday && !selectedEmployee}
            todayRecord={today}
            loading={loading}
          />

          {/* Summary Stats */}
          {!loading && report.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { label: 'Present', value: report.filter((r) => r.status === 'Present').length, color: 'emerald' },
                { label: 'Late', value: report.filter((r) => r.status === 'Late').length, color: 'amber' },
                { label: 'Absent', value: report.filter((r) => r.status === 'Absent').length, color: 'rose' },
                { label: 'Half-day', value: report.filter((r) => r.status === 'Half-day').length, color: 'sky' },
                { label: 'On Leave', value: report.filter((r) => r.status === 'On Leave').length, color: 'violet' },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-lg bg-${stat.color}-50 p-4 text-center`}>
                  <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                  <p className={`text-xs font-medium text-${stat.color}-600`}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendancePage;
