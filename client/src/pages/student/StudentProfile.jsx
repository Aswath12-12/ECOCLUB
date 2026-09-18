import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, BookOpen, Calendar, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HouseBadge } from '../../components/common/Badge';

export const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Your personal details, assigned house, and EcoClub account status.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6">
        {/* User Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-eco-600 to-emerald-400 text-white font-black text-xl flex items-center justify-center shadow-md shadow-eco-200">
              {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-mono font-bold mt-0.5">
                Roll No: {user?.rollNo}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-auto">
            <HouseBadge house={user?.house} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              {user?.email || 'Not provided'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Phone</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              {user?.phone || 'Not provided'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Department & Class</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              {user?.department} &bull; Class {user?.className}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Academic Year</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              Year {user?.year}
            </p>
          </div>
        </div>

        {/* Security & Password Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-600">
              Password Status: <span className="font-bold text-slate-900">Customized</span>
            </span>
          </div>

          <Link
            to="/student/change-password"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
