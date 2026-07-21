import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome, {user?.name || 'Admin'}</h1>
          <p className="mt-3 text-slate-600">Role: {user?.role ? user.role.toUpperCase() : 'ADMIN'}</p>
          <p className="mt-3 text-slate-600">This is the live admin workspace for WorkTrack.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
