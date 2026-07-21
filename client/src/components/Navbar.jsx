import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-lg font-semibold text-slate-800">WorkTrack</Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Link to="/admin" className="transition hover:text-brand-600">Admin</Link>
            <Link to="/manager" className="transition hover:text-brand-600">Manager</Link>
            <Link to="/employee" className="transition hover:text-brand-600">Employee</Link>
            <Link to="/chat" className="flex items-center gap-1 transition hover:text-brand-600">
              <span>💬</span>
              <span>Chat</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">{user?.name || 'User'}</span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-600 hover:text-brand-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
