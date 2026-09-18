import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('student'); // 'student' | 'admin'
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setAlert({ type: 'error', message: 'Please enter both your credentials.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const user = await login(identifier.trim(), password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STUDENT') {
        if (user.mustChangePassword) {
          navigate('/student/change-password');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const fillDevAdmin = () => {
    setLoginType('admin');
    setIdentifier('admin@ecoclub.org');
    setPassword('Admin@123');
  };

  const fillDevStudentNew = () => {
    setLoginType('student');
    setIdentifier('23IT001');
    setPassword('eocsxcce');
  };

  const fillDevStudentActive = () => {
    setLoginType('student');
    setIdentifier('23IT002');
    setPassword('eocsxcce');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-emerald-50/40 to-teal-50 flex items-center justify-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-gradient-to-tr from-eco-600 to-emerald-400 items-center justify-center text-white text-2xl shadow-lg shadow-eco-200">
            🌱
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            EcoClub Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Student House Championship & Participation Portal
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 space-y-6">
          {/* Role Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setLoginType('student');
                setIdentifier('');
                setPassword('');
                setAlert(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                loginType === 'student'
                  ? 'bg-white text-eco-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                setIdentifier('');
                setPassword('');
                setAlert(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                loginType === 'admin'
                  ? 'bg-white text-eco-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Admin Portal
            </button>
          </div>

          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {loginType === 'admin' ? 'Admin Email' : 'Roll Number / Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type={loginType === 'admin' ? 'email' : 'text'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={loginType === 'admin' ? 'admin@ecoclub.org' : 'e.g. 23IT001'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-eco-500 focus:bg-white rounded-xl text-sm font-medium outline-hidden transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {loginType === 'student' && (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-eco-700 hover:text-eco-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-eco-500 focus:bg-white rounded-xl text-sm font-medium outline-hidden transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-sm font-bold shadow-md shadow-eco-200 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Development Demo Logins Bar */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 text-center mb-2 uppercase tracking-wider">
              Quick Dev Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={fillDevAdmin}
                className="p-1.5 text-[10px] font-semibold bg-slate-100 hover:bg-eco-100/60 hover:text-eco-800 rounded-lg text-slate-600 transition-colors"
              >
                Admin (Demo)
              </button>
              <button
                type="button"
                onClick={fillDevStudentNew}
                className="p-1.5 text-[10px] font-semibold bg-slate-100 hover:bg-eco-100/60 hover:text-eco-800 rounded-lg text-slate-600 transition-colors"
              >
                New Student
              </button>
              <button
                type="button"
                onClick={fillDevStudentActive}
                className="p-1.5 text-[10px] font-semibold bg-slate-100 hover:bg-eco-100/60 hover:text-eco-800 rounded-lg text-slate-600 transition-colors"
              >
                Active Student
              </button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-slate-400">
          🌱 EcoClub House Championship System &bull; Secure JWT Protected
        </p>
      </div>
    </div>
  );
};
