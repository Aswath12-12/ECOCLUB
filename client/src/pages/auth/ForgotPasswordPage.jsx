import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/services';
import { Alert } from '../../components/common/Alert';

export const ForgotPasswordPage = () => {
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNo.trim()) {
      setAlert({ type: 'error', message: 'Please enter your student Roll Number.' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await authService.requestPasswordReset({
        rollNo: rollNo.trim().toUpperCase(),
        email: email.trim().toLowerCase() || undefined
      });
      if (res.success) {
        setSubmitted(true);
      } else {
        throw new Error(res.message || 'Failed to submit request');
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-emerald-50/40 to-teal-50 flex items-center justify-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-eco-600 items-center justify-center text-white text-2xl shadow-lg shadow-eco-200">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            EcoClub Secure Password Reset Request
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Reset Request Sent!</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your request for Roll Number <span className="font-mono font-bold text-slate-700">{rollNo.toUpperCase()}</span> has been placed in the Admin review queue.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Once approved, your password will reset to <code className="font-bold text-eco-700">eocsxcce</code> and you will be asked to choose a new password upon login.
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-eco-600 text-white rounded-xl text-xs font-bold hover:bg-eco-700 transition-colors shadow-xs"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your registered Roll Number. Your Eco Club Administrator will review and reset your account to the secure default password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 23IT001"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-eco-500 focus:bg-white rounded-xl text-sm font-medium outline-hidden transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="registered@ecoclub.org"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-eco-500 focus:bg-white rounded-xl text-sm font-medium outline-hidden transition-all text-slate-800"
                  />
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
                      <Send className="w-4 h-4" />
                      <span>Request Password Reset</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
