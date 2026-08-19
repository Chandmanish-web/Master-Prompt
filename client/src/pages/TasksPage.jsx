import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import { getTeamMembers, getTeamTasks, getMyTasks, createTask, startTask, submitTask, reviewTask } from '../redux/taskSlice';
import { useSocketEvent } from '../hooks/useSocket';

const columns = ['Assigned', 'In Progress', 'Submitted', 'Reviewed'];

const TasksPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myTasks, teamTasks, teamMembers, loading, error } = useSelector((state) => state.tasks);
  const isManager = ['admin', 'manager'].includes(user?.role);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
  const [submission, setSubmission] = useState({ task: null, text: '', fileUrl: '' });

  useEffect(() => {
    if (isManager) {
      dispatch(getTeamTasks());
      dispatch(getTeamMembers());
    } else {
      dispatch(getMyTasks());
    }
  }, [dispatch, isManager]);

  useSocketEvent('task:created', () => { if (isManager) dispatch(getTeamTasks()); else dispatch(getMyTasks()); }, [dispatch, isManager]);
  useSocketEvent('task:updated', () => { if (isManager) dispatch(getTeamTasks()); else dispatch(getMyTasks()); }, [dispatch, isManager]);
  useSocketEvent('task:statusChanged', () => { if (isManager) dispatch(getTeamTasks()); else dispatch(getMyTasks()); }, [dispatch, isManager]);

  const tasks = isManager ? teamTasks : myTasks;
  const groupedTasks = useMemo(() => columns.reduce((groups, status) => {
    groups[status] = tasks.filter((task) => task.status === status);
    return groups;
  }, {}), [tasks]);

  const handleCreate = async (event) => {
    event.preventDefault();
    const result = await dispatch(createTask(form));
    if (createTask.fulfilled.match(result)) {
      setForm({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
      dispatch(getTeamTasks());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(submitTask({ taskId: submission.task._id, text: submission.text, fileUrl: submission.fileUrl }));
    if (submitTask.fulfilled.match(result)) {
      setSubmission({ task: null, text: '', fileUrl: '' });
      dispatch(getMyTasks());
    }
  };

  const handleReview = async (task, decision) => {
    const feedback = decision === 'approve' ? 'Approved by reviewer.' : 'Please revise and resubmit this work.';
    const result = await dispatch(reviewTask({ taskId: task._id, decision, rating: decision === 'approve' ? 5 : undefined, feedback }));
    if (reviewTask.fulfilled.match(result)) dispatch(getTeamTasks());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Work management</p>
          <h1 className="mt-2 text-3xl font-semibold">{isManager ? 'Lead the work clearly.' : 'Know what moves next.'}</h1>
          <p className="mt-3 max-w-2xl text-slate-300">Tasks move from assignment to progress, submission, and review so every handoff has a visible owner.</p>
        </div>

        {isManager && (
          <form onSubmit={handleCreate} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-4">
            <input className="rounded-2xl border border-slate-300 px-4 py-3 lg:col-span-2" placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <select className="rounded-2xl border border-slate-300 px-4 py-3" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} required>
              <option value="">Assign to...</option>
              {teamMembers.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}
            </select>
            <input className="rounded-2xl border border-slate-300 px-4 py-3" type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} required />
            <textarea className="rounded-2xl border border-slate-300 px-4 py-3 lg:col-span-2" placeholder="What does done look like?" rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <select className="rounded-2xl border border-slate-300 px-4 py-3" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <button className="rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={loading}>Assign task</button>
          </form>
        )}

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {columns.map((status) => (
            <section key={status} className="min-h-[260px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{status}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{groupedTasks[status].length}</span></div>
              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <article key={task._id} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{task.description || 'No description provided.'}</p>
                    <p className="mt-3 text-xs text-slate-500">Due {new Date(task.deadline).toLocaleDateString()}{isManager && task.assignedTo?.name ? ` · ${task.assignedTo.name}` : ''}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!isManager && task.status === 'Assigned' && <button className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => dispatch(startTask(task._id))}>Start</button>}
                      {!isManager && task.status === 'In Progress' && <button className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => setSubmission({ task, text: '', fileUrl: '' })}>Submit</button>}
                      {isManager && task.status === 'Submitted' && <><button className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => handleReview(task, 'approve')}>Approve</button><button className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white" onClick={() => handleReview(task, 'rework')}>Rework</button></>}
                    </div>
                  </article>
                ))}
                {!groupedTasks[status].length && <p className="py-8 text-center text-sm text-slate-400">Nothing here yet.</p>}
              </div>
            </section>
          ))}
        </div>
      </main>

      {submission.task && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"><form onSubmit={handleSubmit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"><h2 className="text-xl font-semibold">Submit {submission.task.title}</h2><textarea className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3" rows="4" placeholder="Summarize the completed work" value={submission.text} onChange={(event) => setSubmission({ ...submission, text: event.target.value })} required /><input className="mt-3 w-full rounded-2xl border border-slate-300 px-4 py-3" placeholder="Evidence link (optional)" value={submission.fileUrl} onChange={(event) => setSubmission({ ...submission, fileUrl: event.target.value })} /><div className="mt-4 flex justify-end gap-3"><button type="button" className="rounded-xl border border-slate-300 px-4 py-2" onClick={() => setSubmission({ task: null, text: '', fileUrl: '' })}>Cancel</button><button className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Submit work</button></div></form></div>}
    </div>
  );
};

export default TasksPage;