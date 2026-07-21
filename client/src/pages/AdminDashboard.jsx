import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { getAttendanceReport } from '../redux/attendanceSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { report } = useSelector((state) => state.attendance);
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    dispatch(getAttendanceReport({ month: monthKey }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome, {user?.name || 'Admin'}</h1>
          <p className="mt-3 text-slate-600">Role: {user?.role ? user.role.toUpperCase() : 'ADMIN'}</p>
          <p className="mt-3 text-slate-600">View organization-wide attendance insights and status updates.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Present</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{report.filter((item) => item.status === 'Present').length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Late</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{report.filter((item) => item.status === 'Late').length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Absent</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{report.filter((item) => item.status === 'Absent').length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AttendanceCalendar records={report} title="Company Attendance" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
