import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Chat from './pages/Chat';
import PrivateRoute from './routes/PrivateRoute';
import { getCurrentUser } from './redux/authSlice';

function App() {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token || localStorage.getItem('worktrack-auth-token')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  if (loading && (token || localStorage.getItem('worktrack-auth-token'))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 shadow-soft">Loading your workspace...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['manager']} />}>
        <Route path="/manager" element={<ManagerDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['employee']} />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['admin', 'manager', 'employee']} />}>
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Routes>
  );
}

export default App;
