import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { checkIn, checkOut, getAttendanceReport, getTodayAttendance } from '../redux/attendanceSlice';
import { getMyTasks, startTask, submitTask } from '../redux/taskSlice';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { today, report, loading, error } = useSelector((state) => state.attendance);
  const { myTasks, loading: tasksLoading, error: tasksError } = useSelector((state) => state.tasks);
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({ text: '', fileUrl: '' });

  const refreshAttendance = () => {
    dispatch(getTodayAttendance());
    dispatch(getAttendanceReport({ month: monthKey }));
  };

  useEffect(() => {
    refreshAttendance();
    dispatch(getMyTasks());
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Employee Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome, {user?.name || 'Employee'}</h1>
          <p className="mt-3 text-slate-600">Role: {user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}</p>
          <p className="mt-3 text-slate-600">Check in, check out, and track your assigned work.</p>
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
          <h2 className="text-xl font-semibold">My Tasks</h2>
          {tasksError && <p className="mt-3 text-sm text-rose-600">{tasksError}</p>}
          <div className="mt-6 space-y-3">
            {myTasks.map((task) => (
              <div key={task._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{task.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                  <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                  <span>Priority {task.priority}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {task.status === 'Assigned' && (
                    <button className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => dispatch(startTask(task._id))} disabled={tasksLoading}>
                      Start Task
                    </button>
                  )}
                  {(task.status === 'Assigned' || task.status === 'In Progress') && (
                    <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => openSubmissionModal(task)}>
                      Submit Result
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <AttendanceCalendar records={report} title="My Attendance" />
        </div>
      </div>

      {submissionOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold">Submit result</h3>
            <p className="mt-2 text-sm text-slate-600">{selectedTask.title}</p>
            <form className="mt-4 space-y-4" onSubmit={handleSubmitResult}>
              <textarea className="w-full rounded-2xl border border-slate-300 px-4 py-3" rows="4" placeholder="What did you complete?" value={submissionForm.text} onChange={(event) => setSubmissionForm({ ...submissionForm, text: event.target.value })} required />
              <input className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="File or link (optional)" value={submissionForm.fileUrl} onChange={(event) => setSubmissionForm({ ...submissionForm, fileUrl: event.target.value })} />
              <div className="flex justify-end gap-3">
                <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setSubmissionOpen(false)}>Cancel</button>
                <button className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
