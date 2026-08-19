import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import { applyLeave, getMyLeaves, getPendingLeaves, updateLeaveStatus } from '../redux/leaveSlice';
import { useSocketEvent } from '../hooks/useSocket';

const statusStyles = { Pending: 'bg-amber-100 text-amber-800', Approved: 'bg-emerald-100 text-emerald-800', Rejected: 'bg-rose-100 text-rose-800' };

const LeavePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myLeaves, pendingLeaves, leaveBalance, loading, error } = useSelector((state) => state.leave);
  const canApprove = ['admin', 'manager'].includes(user?.role);
  const [form, setForm] = useState({ type: 'Paid', fromDate: '', toDate: '', reason: '' });

  useEffect(() => {
    dispatch(getMyLeaves());
    if (canApprove) dispatch(getPendingLeaves());
  }, [dispatch, canApprove]);

  useSocketEvent('leave:requested', () => { if (canApprove) dispatch(getPendingLeaves()); }, [dispatch, canApprove]);
  useSocketEvent('leave:approved', () => dispatch(getMyLeaves()), [dispatch]);
  useSocketEvent('leave:rejected', () => dispatch(getMyLeaves()), [dispatch]);

  const handleApply = async (event) => {
    event.preventDefault();
    const result = await dispatch(applyLeave(form));
    if (applyLeave.fulfilled.match(result)) {
      setForm({ type: 'Paid', fromDate: '', toDate: '', reason: '' });
      dispatch(getMyLeaves());
    }
  };

  const handleStatus = async (leaveId, status) => {
    const result = await dispatch(updateLeaveStatus({ leaveId, status }));
    if (updateLeaveStatus.fulfilled.match(result)) dispatch(getPendingLeaves());
  };

  const rows = canApprove ? pendingLeaves : myLeaves;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-amber-950 p-8 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Leave management</p>
          <h1 className="mt-2 text-3xl font-semibold">Time away, handled transparently.</h1>
          <p className="mt-3 max-w-2xl text-amber-100">Employees submit requests, managers review their direct team, and every decision remains visible in the request history.</p>
        </div>

        {!canApprove && <form onSubmit={handleApply} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-4"><select className="rounded-2xl border border-slate-300 px-4 py-3" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Paid</option><option>Casual</option><option>Sick</option></select><input className="rounded-2xl border border-slate-300 px-4 py-3" type="date" value={form.fromDate} onChange={(event) => setForm({ ...form, fromDate: event.target.value })} required /><input className="rounded-2xl border border-slate-300 px-4 py-3" type="date" value={form.toDate} onChange={(event) => setForm({ ...form, toDate: event.target.value })} required /><button className="rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={loading}>Request leave</button><textarea className="rounded-2xl border border-slate-300 px-4 py-3 md:col-span-4" rows="2" placeholder="Reason or handover note" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></form>}
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">{canApprove ? 'Approval queue' : 'My requests'}</p><h2 className="mt-2 text-2xl font-semibold">{canApprove ? 'Requests awaiting your decision' : 'Your leave history'}</h2></div>{!canApprove && <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center"><p className="text-xs font-semibold uppercase text-emerald-700">Remaining balance</p><p className="text-2xl font-bold text-emerald-900">{leaveBalance ?? user?.leaveBalance ?? 18}</p></div>}</div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr>{canApprove && <th className="px-4 py-3">Employee</th>}<th className="px-4 py-3">Type</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Days</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th>{canApprove && <th className="px-4 py-3">Decision</th>}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((leave) => <tr key={leave._id}>{canApprove && <td className="px-4 py-3 font-semibold">{leave.userId?.name || 'Employee'}</td>}<td className="px-4 py-3">{leave.type}</td><td className="px-4 py-3">{new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}</td><td className="px-4 py-3">{leave.days}</td><td className="max-w-xs px-4 py-3">{leave.reason || '—'}</td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[leave.status] || 'bg-slate-100 text-slate-700'}`}>{leave.status}</span></td>{canApprove && <td className="px-4 py-3"><div className="flex gap-2"><button className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => handleStatus(leave._id, 'Approved')} disabled={loading}>Approve</button><button className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => handleStatus(leave._id, 'Rejected')} disabled={loading}>Reject</button></div></td>}</tr>)}{!rows.length && <tr><td colSpan={canApprove ? 7 : 6} className="px-4 py-10 text-center text-slate-500">No leave requests to display.</td></tr>}</tbody></table></div></section>
      </main>
    </div>
  );
};

export default LeavePage;