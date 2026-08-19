import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { checkIn, checkOut, getAttendanceReport, getTodayAttendance } from '../redux/attendanceSlice';
import { getMyTasks, startTask, submitTask } from '../redux/taskSlice';
import { applyLeave, getMyLeaves } from '../redux/leaveSlice';

const statusClasses = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
};

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { today, report, loading, error } = useSelector((state) => state.attendance);
  const { myTasks, loading: tasksLoading, error: tasksError } = useSelector((state) => state.tasks);
  const { myLeaves, leaveBalance, loading: leaveLoading, error: leaveError } = useSelector((state) => state.leave);
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({ text: '', fileUrl: '' });
  const [leaveForm, setLeaveForm] = useState({ type: 'Paid', fromDate: '', toDate: '', reason: '' });

  const refreshAttendance = () => {
    dispatch(getTodayAttendance());
    dispatch(getAttendanceReport({ month: monthKey }));
  };

  useEffect(() => {
    refreshAttendance();
    dispatch(getMyTasks());
    dispatch(getMyLeaves());
  }, [dispatch]);

  const handleCheckIn = async () => {
    await dispatch(checkIn());
    refreshAttendance();
  };

  const handleCheckOut = async () => {
    await dispatch(checkOut());
    refreshAttendance();
  };

  const openSubmissionModal = (task) => {
    setSelectedTask(task);
    setSubmissionForm({ text: '', fileUrl: '' });
    setSubmissionOpen(true);
  };

  const handleSubmitResult = async (event) => {
    event.preventDefault();
    if (!selectedTask) return;
    const result = await dispatch(submitTask({ taskId: selectedTask._id, text: submissionForm.text, fileUrl: submissionForm.fileUrl }));
    if (submitTask.fulfilled.match(result)) {
      setSubmissionOpen(false);
      setSelectedTask(null);
      dispatch(getMyTasks());
    }
  };

  const handleApplyLeave = async (event) => {
    event.preventDefault();
    const result = await dispatch(applyLeave(leaveForm));
    if (applyLeave.fulfilled.match(result)) {
      setLeaveForm({ type: 'Paid', fromDate: '', toDate: '', reason: '' });
      dispatch(getMyLeaves());
    }
  };

  const leaveBalanceLabel = leaveBalance ?? user?.leaveBalance ?? 18;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Employee Dashboard</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Welcome, {user?.name || 'Employee'}</h1>
              <p className="mt-3 text-slate-600">Role: {user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}</p>
              <p className="mt-3 text-slate-600">Check in, check out, and track your assigned work.</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-6 py-4 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Leave Balance</p>
              <p className="mt-2 text-4xl font-bold text-emerald-900">{leaveBalanceLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Today&apos;s Activity</p>
                <h2 className="mt-2 text-2xl font-semibold">{today?.status || 'No attendance recorded yet'}</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                {today?.checkIn ? 'Checked in' : 'Not checked in'}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Check-in</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{today?.checkIn ? new Date(today.checkIn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Check-out</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{today?.checkOut ? new Date(today.checkOut).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'}</p>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleCheckIn} disabled={loading || Boolean(today?.checkIn)} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                {loading ? 'Processing...' : 'Check In'}
              </button>
              <button onClick={handleCheckOut} disabled={loading || !today?.checkIn || Boolean(today?.checkOut)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400">
                {loading ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Monthly Overview</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Present</span>
                <span className="font-semibold text-slate-800">{report.filter((item) => item.status === 'Present').length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Late</span>
                <span className="font-semibold text-slate-800">{report.filter((item) => item.status === 'Late').length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span>Absent</span>
                <span className="font-semibold text-slate-800">{report.filter((item) => item.status === 'Absent').length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Leave History</h2>
            <p className="text-sm text-slate-500">Most recent first</p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {myLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-4 py-3 font-semibold">{leave.type}</td>
                    <td className="px-4 py-3">{new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{leave.days}</td>
                    <td className="px-4 py-3">{leave.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[leave.status]}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myLeaves.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-500">No leave requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <AttendanceCalendar records={report} title="My Attendance" />
        </div>
      </motion.div>

      <AnimatePresence>
        {submissionOpen && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold">Submit result</h3>
              <p className="mt-2 text-sm text-slate-600">{selectedTask.title}</p>
              <form className="mt-4 space-y-4" onSubmit={handleSubmitResult}>
                <textarea className="w-full rounded-2xl border border-slate-300 px-4 py-3" rows="4" placeholder="What did you complete?" value={submissionForm.text} onChange={(event) => setSubmissionForm({ ...submissionForm, text: event.target.value })} required />
                <input className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="File or link (optional)" value={submissionForm.fileUrl} onChange={(event) => setSubmissionForm({ ...submissionForm, fileUrl: event.target.value })} />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setSubmissionOpen(false)}>Cancel</button>
                  <button className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">Submit</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDashboard;
