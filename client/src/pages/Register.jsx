import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../redux/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(resultAction)) {
        const role = resultAction.payload.user?.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'manager') navigate('/manager');
        else navigate('/employee');
      } else {
        setFormError(resultAction.payload || 'Unable to register');
      }
    } catch (err) {
      setFormError(err.message || 'Unable to register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center lg:flex-row">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">WorkTrack</p>
            <h1 className="mt-2 text-3xl font-semibold">Create your account</h1>
            <p className="mt-2 text-sm text-slate-600">Join the team and start tracking work with confidence.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Alex Morgan"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="name@company.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              />
              {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                defaultValue="employee"
                {...register('role', { required: 'Role is required' })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {(formError || error) && <p className="text-sm text-rose-500">{formError || error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
