import { useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const About = lazy(() => import('./pages/About'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const Chat = lazy(() => import('./pages/Chat'));
import PrivateRoute from './routes/PrivateRoute';
import { getCurrentUser } from './redux/authSlice';

function App() {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token || localStorage.getItem('worktrack-auth')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  if (loading && (token || localStorage.getItem('worktrack-auth'))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 shadow-soft">Loading your workspace...</div>
      </div>
    );
  }

  const location = useLocation();

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const PageWrapper = ({ children }) => (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['manager']} />}>
          <Route path="/manager" element={<PageWrapper><ManagerDashboard /></PageWrapper>} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['employee']} />}>
          <Route path="/employee" element={<PageWrapper><EmployeeDashboard /></PageWrapper>} />
        </Route>

          <Route element={<PrivateRoute allowedRoles={["admin", "manager", "employee"]} />}>
            <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
          </Route>

          <Route path="*" element={<PageWrapper><LandingPage /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
