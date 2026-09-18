import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, XCircle, Loader2, Calendar, User, ShieldAlert } from 'lucide-react';
import { passwordResetService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { HouseBadge } from '../../components/common/Badge';

export const AdminPasswordRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [alert, setAlert] = useState(null);

  // Confirm Reset Modal State
  const [confirmModal, setConfirmModal] = useState({ open: false, request: null });
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await passwordResetService.getResetRequests({
        status: filterStatus || undefined
      });
      if (res.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load password requests' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleResetConfirm = async () => {
    if (!confirmModal.request) return;

    setProcessing(true);
    setAlert(null);

    try {
      const res = await passwordResetService.resetPassword(confirmModal.request._id);
      if (res.success) {
        setAlert({
          type: 'success',
          message: res.message || 'Password reset successfully. Student must use the default password and change it after login.'
        });
        setConfirmModal({ open: false, request: null });
        fetchRequests();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Password Reset Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review student password reset submissions. Approving resets the account back to default password (eocsxcce).
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-eco-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === ''
                ? 'bg-eco-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Info Card */}
      <div className="p-4 bg-eco-50/70 border border-eco-200/80 rounded-2xl text-xs text-eco-900 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-eco-700" />
          <span>Security Protocol:</span>
        </p>
        <p className="text-eco-800">
          When you click <strong>Reset Password</strong>, the student's password is reset to <code className="bg-white px-1.5 py-0.5 rounded font-bold text-eco-700">eocsxcce</code> and the student will be prompted to create their own new password upon next login.
        </p>
      </div>

      {/* Requests List */}
      {loading ? (
        <LoadingSpinner message="Loading password reset requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No reset requests"
          description={
            filterStatus === 'PENDING'
              ? 'There are currently no pending student password reset requests.'
              : 'No password reset history recorded.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => {
            const student = req.studentId || {};
            const isPending = req.status === 'PENDING';

            return (
              <div
                key={req._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-eco-700 bg-eco-50 px-2.5 py-1 rounded-lg border border-eco-200">
                      {req.rollNo || student.rollNo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : req.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Status: {req.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {student.name || 'Unknown Student'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {student.department} &bull; Year {student.year} - Class {student.className}
                    </p>
                  </div>

                  <div className="pt-1">
                    <HouseBadge house={student.houseId} />
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Requested: {new Date(req.requestedAt || req.createdAt).toLocaleString()}
                      </span>
                    </p>
                    {req.processedAt && (
                      <p className="text-emerald-700 font-medium">
                        Processed: {new Date(req.processedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ open: true, request: req })}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset Password</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Request Resolved</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, request: null })}
        onConfirm={handleResetConfirm}
        isLoading={processing}
        title="Reset Student Password"
        message={`Are you sure you want to reset password for ${
          confirmModal.request?.studentId?.name || confirmModal.request?.rollNo
        }? The password will revert to "eocsxcce" and the student will be required to change it on login.`}
        confirmText="Reset Password"
        isDestructive={false}
      />
    </div>
  );
};
