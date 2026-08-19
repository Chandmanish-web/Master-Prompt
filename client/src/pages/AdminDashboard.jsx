import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { getAttendanceReport } from '../redux/attendanceSlice';
import { getPendingLeaves, updateLeaveStatus } from '../redux/leaveSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { report } = useSelector((state) => state.attendance);
  const { pendingLeaves, loading: leaveLoading, error: leaveError } = useSelector((state) => state.leave);
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    dispatch(getAttendanceReport({ month: monthKey }));
    dispatch(getPendingLeaves());
  }, [dispatch]);

  const handleLeaveAction = async (leaveId, status) => {
    await dispatch(updateLeaveStatus({ leaveId, status }));
    dispatch(getPendingLeaves());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-6xl px-6 py-12">
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

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Pending Leave Requests</h2>
          {leaveError && <p className="mt-3 text-sm text-rose-600">{leaveError}</p>}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {pendingLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-4 py-3 font-semibold">{leave.userId?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{leave.type}</td>
                    <td className="px-4 py-3">{new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{leave.days}</td>
                    <td className="px-4 py-3">{leave.reason}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => handleLeaveAction(leave._id, 'Approved')} disabled={leaveLoading}>
                          Approve
                        </button>
                        <button className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => handleLeaveAction(leave._id, 'Rejected')} disabled={leaveLoading}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingLeaves.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-slate-500">No pending leaves.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <AttendanceCalendar records={report} title="Company Attendance" />
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
