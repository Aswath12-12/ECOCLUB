import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';

export const ChangePasswordPage = () => {
  const { user, changePassword, mustChangePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setAlert({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      await changePassword(currentPassword, newPassword);
      setAlert({
        type: 'success',
        message: 'Password successfully updated! Redirecting to your dashboard...'
      });
      setTimeout(() => {
        if (user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1500);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-emerald-50/40 to-teal-50 flex items-center justify-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-eco-600 items-center justify-center text-white text-2xl shadow-lg shadow-eco-200">
            🔒
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {mustChangePassword ? 'Mandatory Password Setup' : 'Change Your Password'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Keep your EcoClub account safe and protected
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-5">
          {mustChangePassword && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                Your account is using the default password. Please create a new password before continuing.
              </p>
            </div>
          )}

          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current / Default Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={mustChangePassword ? 'Enter default password: eocsxcce' : 'Current password'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-eco-500 focus:bg-white rounded-xl text-sm font-medium outline-hidden transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password (minimum 6 chars)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create your new strong password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-eco-500 focus:bg-white rounded-xl text-sm font-medium outline-hidden transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-eco-500 focus:bg-white rounded-xl text-sm font-medium outline-hidden transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-sm font-bold shadow-md shadow-eco-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Save Password & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
