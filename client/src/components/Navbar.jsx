import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import { logout } from '../redux/authSlice';

const roleNav = {
  admin: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Tasks', to: '/admin' },
    { label: 'Attendance', to: '/admin' },
    { label: 'Leave', to: '/admin' },
    { label: 'Chat', to: '/chat' },
  ],
  manager: [
    { label: 'Dashboard', to: '/manager' },
    { label: 'Tasks', to: '/manager' },
    { label: 'Attendance', to: '/manager' },
    { label: 'Leave', to: '/manager' },
    { label: 'Chat', to: '/chat' },
  ],
  employee: [
    { label: 'Dashboard', to: '/employee' },
    { label: 'Tasks', to: '/employee' },
    { label: 'Attendance', to: '/employee' },
    { label: 'Leave', to: '/employee' },
    { label: 'Chat', to: '/chat' },
  ],
};

const publicLinks = [
  { label: 'About', to: '/about' },
  { label: 'Sign in', to: '/login' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const links = isAuthenticated ? roleNav[user?.role] || [] : publicLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur transition">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900">WorkTrack</Link>

        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`transition hover:text-brand-600 ${location.pathname === item.to ? 'text-brand-700 font-semibold' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:border-brand-300 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">{user?.name?.[0] || 'U'}</span>
              <span>{user?.name || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-4 text-sm text-slate-600">
              <Link to="/about" className="transition hover:text-brand-600">About</Link>
              <Link to="/login" className="font-semibold text-brand-600 transition hover:text-brand-700">Sign in</Link>
            </div>
          )}

          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-200 hover:border-brand-300 hover:text-brand-700 md:hidden" onClick={() => setOpen((prev) => !prev)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="border-t border-slate-200 bg-white px-6 py-4 md:hidden"
          >
            <div className="mb-4 grid gap-3">
              {links.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                  {item.label}
                </Link>
              ))}
            </div>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <div className="grid gap-3">
                <Link to="/about" className="rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">About</Link>
                <Link to="/login" className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">Sign in</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
