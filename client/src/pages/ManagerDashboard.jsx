import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { getAttendanceReport } from '../redux/attendanceSlice';
import { createTask, getTeamMembers, getTeamTasks, reviewTask } from '../redux/taskSlice';
import { getPendingLeaves, getMyLeaves, updateLeaveStatus } from '../redux/leaveSlice';

const statusColumns = ['Assigned', 'In Progress', 'Submitted', 'Reviewed'];

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { report } = useSelector((state) => state.attendance);
  const { teamTasks, teamMembers, loading, error } = useSelector((state) => state.tasks);
  const { pendingLeaves, loading: leaveLoading, error: leaveError } = useSelector((state) => state.leave);
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reviewForm, setReviewForm] = useState({ decision: 'approve', rating: '5', feedback: '' });

  useEffect(() => {
    dispatch(getAttendanceReport({ month: monthKey }));
    dispatch(getTeamTasks());
    dispatch(getTeamMembers());
    dispatch(getPendingLeaves());
  }, [dispatch]);

  const groupedTasks = useMemo(() => {
    return statusColumns.reduce((acc, status) => {
      acc[status] = teamTasks.filter((task) => task.status === status);
      return acc;
    }, {});
  }, [teamTasks]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      deadline: form.deadline,
    };
    const result = await dispatch(createTask(payload));
    if (createTask.fulfilled.match(result)) {
      setForm({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
      dispatch(getTeamTasks());
    }
  };

  const openReviewModal = (task) => {
    setSelectedTask(task);
    setReviewForm({ decision: 'approve', rating: '5', feedback: '' });
    setReviewModalOpen(true);
  };

  const handleReview = async (event) => {
    event.preventDefault();
    if (!selectedTask) return;
    const result = await dispatch(reviewTask({ taskId: selectedTask._id, decision: reviewForm.decision, rating: reviewForm.rating, feedback: reviewForm.feedback }));
    if (reviewTask.fulfilled.match(result)) {
      setReviewModalOpen(false);
      setSelectedTask(null);
      dispatch(getTeamTasks());
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    const result = await dispatch(updateLeaveStatus({ leaveId, status }));
    if (updateLeaveStatus.fulfilled.match(result)) {
      dispatch(getPendingLeaves());
      dispatch(getMyLeaves());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Manager Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome, {user?.name || 'Manager'}</h1>
          <p className="mt-3 text-slate-600">Role: {user?.role ? user.role.toUpperCase() : 'MANAGER'}</p>
          <p className="mt-3 text-slate-600">Create and review work for your team.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold">Create Task</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateTask}>
              <input className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
              <textarea className="w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" />
              <select className="w-full rounded-2xl border border-slate-300 px-4 py-3" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} required>
                <option value="">Select assignee</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>{member.name} ({member.role})</option>
                ))}
              </select>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="w-full rounded-2xl border border-slate-300 px-4 py-3" type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} required />
                <select className="w-full rounded-2xl border border-slate-300 px-4 py-3" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <button className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Assign Task'}</button>
              {error && <p className="text-sm text-rose-600">{error}</p>}
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
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
            <div className="mt-6">
              <AttendanceCalendar records={report} title="Team Attendance" />
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

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Task Board</h2>
          <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
            {statusColumns.map((status, statusIndex) => (
              <motion.div key={status} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: statusIndex * 0.05 }} className="min-h-[220px] rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{status}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{groupedTasks[status].length}</span>
                </div>
                <div className="space-y-3">
                  {groupedTasks[status].map((task) => (
                    <div key={task._id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.assignedTo?.name || 'Unassigned'}</p>
                      <p className="mt-2 text-xs text-slate-500">Due {new Date(task.deadline).toLocaleDateString()}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{task.priority}</span>
                        {task.status === 'Submitted' && (
                          <button className="rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white" onClick={() => openReviewModal(task)}>
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {reviewModalOpen && selectedTask && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
              <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
                <h3 className="text-xl font-semibold">Review task</h3>
                <p className="mt-2 text-sm text-slate-600">{selectedTask.title}</p>
                <form className="mt-4 space-y-4" onSubmit={handleReview}>
                  <select className="w-full rounded-2xl border border-slate-300 px-4 py-3" value={reviewForm.decision} onChange={(event) => setReviewForm({ ...reviewForm, decision: event.target.value })}>
                    <option value="approve">Approve</option>
                    <option value="rework">Send back for rework</option>
                  </select>
                  {reviewForm.decision === 'approve' && (
                    <select className="w-full rounded-2xl border border-slate-300 px-4 py-3" value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })}>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>{rating} star{rating > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  )}
                  <textarea className="w-full rounded-2xl border border-slate-300 px-4 py-3" rows="3" placeholder="Feedback" value={reviewForm.feedback} onChange={(event) => setReviewForm({ ...reviewForm, feedback: event.target.value })} required={reviewForm.decision === 'rework'} />
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={() => setReviewModalOpen(false)}>Cancel</button>
                    <button className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">Save Review</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;
