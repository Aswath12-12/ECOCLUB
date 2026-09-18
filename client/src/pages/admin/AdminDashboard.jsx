import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Home,
  CalendarCheck,
  Award,
  TrendingUp,
  UserPlus,
  FileSpreadsheet,
  PlusCircle,
  Trophy,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { reportService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { HouseBadge, RankBadge } from '../../components/common/Badge';
import { HousePointsBarChart } from '../../components/charts/HousePointsBarChart';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportService.getDashboardStats();
      if (res.success) {
        setData(res.data);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading EcoClub Admin Dashboard..." />;
  if (error) {
    return (
      <div className="space-y-4">
        <Alert type="error" message={error} />
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-eco-600 text-white rounded-xl text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totalStudents = 0,
    totalHouses = 4,
    totalActivities = 0,
    thisWeekParticipation = {},
    housePerformance = [],
    currentRanking = [],
    recentActivities = [],
    pendingPasswordResets = 0
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-eco-700 via-eco-800 to-emerald-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-eco-200 border border-white/10 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>EcoClub Central Headquarters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">🌱 EcoClub Admin</h1>
          <p className="text-xs sm:text-sm text-eco-100/90 font-medium">
            Live overview of student houses, activities, participation marks, and championships.
          </p>
        </div>

        {pendingPasswordResets > 0 && (
          <Link
            to="/admin/password-requests"
            className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-2xl shadow-md transition-all shrink-0"
          >
            <span>🔔 {pendingPasswordResets} Password Reset Request{pendingPasswordResets > 1 ? 's' : ''}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/students?action=add"
          className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-eco-400 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-eco-50 text-eco-700 flex items-center justify-center group-hover:bg-eco-600 group-hover:text-white transition-colors">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-eco-700 block">+ Add Student</span>
            <span className="text-[10px] text-slate-400">Single entry</span>
          </div>
        </Link>

        <Link
          to="/admin/students?action=import"
          className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-eco-400 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block">+ Import Students</span>
            <span className="text-[10px] text-slate-400">CSV or Excel</span>
          </div>
        </Link>

        <Link
          to="/admin/activities"
          className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-eco-400 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 block">+ Add Activity</span>
            <span className="text-[10px] text-slate-400">Eco weekly task</span>
          </div>
        </Link>

        <Link
          to="/admin/weekly-marks"
          className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-eco-400 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">+ Enter Marks</span>
            <span className="text-[10px] text-slate-400">Weekly scoring</span>
          </div>
        </Link>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-8 h-8 rounded-xl bg-eco-50 text-eco-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</p>
          <p className="text-[11px] text-slate-400 font-medium">Enrolled across 4 houses</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Houses</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalHouses}</p>
          <p className="text-[11px] text-slate-400 font-medium">Green, Blue, Red, Yellow</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Week Marks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {thisWeekParticipation.uniqueStudents || 0}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {thisWeekParticipation.percentage || 0}% active participation
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Activities</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalActivities}</p>
          <p className="text-[11px] text-slate-400 font-medium">Events & environmental drives</p>
        </div>
      </div>

      {/* House Performance & Current Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* House Performance Points & Visual Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">HOUSE PERFORMANCE</h2>
              <p className="text-xs text-slate-400">Total accumulated points from verified student marks</p>
            </div>
            <Link to="/admin/houses" className="text-xs font-bold text-eco-700 hover:text-eco-800 flex items-center gap-1">
              <span>Manage Houses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* List of House Points */}
          <div className="space-y-2.5">
            {housePerformance.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: h.colorCode }} />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{h.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-black text-slate-900">{h.points} points</span>
                  <RankBadge rank={h.rank} rankText={h.rankText} />
                </div>
              </div>
            ))}
          </div>

          {/* Graphical Bar Preview */}
          <div className="pt-2">
            <HousePointsBarChart data={housePerformance} height={200} />
          </div>
        </div>

        {/* Current Ranking & Recent Activities (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current Ranking Leaderboard */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">CURRENT RANKING</h2>
              </div>
              <Link to="/admin/rankings" className="text-xs font-bold text-eco-700 hover:text-eco-800">
                Full Podium
              </Link>
            </div>

            <div className="space-y-2.5">
              {currentRanking.map((house) => (
                <div
                  key={house._id}
                  className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-100 rounded-2xl"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">
                      {house.rank === 1 ? '🥇' : house.rank === 2 ? '🥈' : house.rank === 3 ? '🥉' : '🏅'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{house.name}</p>
                      <p className="text-[10px] text-slate-400">{house.studentCount} active students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">{house.totalPoints} pts</span>
                    <p className="text-[10px] text-eco-700 font-semibold">{house.participationPercentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">RECENT ACTIVITIES</h2>
              <Link to="/admin/activities" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="flex items-center justify-between p-2.5 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{act.name}</p>
                    <p className="text-[10px] text-slate-400">Week {act.weekNumber} &bull; Max {act.maxMarks} marks</p>
                  </div>
                  <Link
                    to={`/admin/weekly-marks?weekNumber=${act.weekNumber}&activityId=${act._id}`}
                    className="text-[11px] font-bold text-eco-700 hover:text-eco-900"
                  >
                    Grade &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
