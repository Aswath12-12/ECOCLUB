import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Trophy,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { markService, houseService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { HouseBadge, RankBadge } from '../../components/common/Badge';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [marksData, setMarksData] = useState(null);
  const [houseRankings, setHouseRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [mRes, rRes] = await Promise.all([
          markService.getMyMarks(),
          houseService.getOverallRanking()
        ]);

        if (mRes.success) setMarksData(mRes.data);
        if (rRes.success) setHouseRankings(rRes.data.rankings);
      } catch (err) {
        setError(err.message || 'Failed to load your student dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your student dashboard..." />;

  const {
    totalScore = 0,
    totalMaxScore = 0,
    overallPercentage = 0,
    weeklyBreakdown = []
  } = marksData || {};

  // Find user's house rank
  const userHouseId = user?.house?._id || user?.house;
  const currentHouseRank = houseRankings.find(
    (h) => h._id.toString() === (userHouseId?.toString() || '')
  );

  // Latest week marks
  const latestWeek = weeklyBreakdown[weeklyBreakdown.length - 1];

  return (
    <div className="space-y-6">
      {/* Mobile-first Personalized Greeting Banner */}
      <div className="bg-gradient-to-br from-eco-700 via-eco-800 to-emerald-900 text-white p-5 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl">🌱</span>
          {user?.house && <HouseBadge house={user.house} className="bg-white/20 text-white border-white/20" />}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Hello, {user?.name || 'Eco Member'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-eco-100/90 font-medium mt-1">
            Roll No: <span className="font-mono font-bold text-white">{user?.rollNo}</span> &bull; {user?.department} (Year {user?.year} - {user?.className})
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* 4 Core Student Metrics (Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: This Week Marks */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            This Week Marks
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {latestWeek ? `${latestWeek.weekTotalMarks} / ${latestWeek.weekMaxMarks}` : '—'}
          </p>
          <span className="text-[11px] text-eco-700 font-semibold block">
            {latestWeek ? `Week ${latestWeek.weekNumber}` : 'No marks this week'}
          </span>
        </div>

        {/* Metric 2: Total Marks */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Marks
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalScore} <span className="text-xs text-slate-400 font-bold">/ {totalMaxScore}</span>
          </p>
          <span className="text-[11px] text-slate-400 font-medium block">
            Accumulated score
          </span>
        </div>

        {/* Metric 3: House Rank */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            House Rank
          </span>
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="text-xl">
              {currentHouseRank?.rank === 1
                ? '🥇'
                : currentHouseRank?.rank === 2
                ? '🥈'
                : currentHouseRank?.rank === 3
                ? '🥉'
                : '🏅'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentHouseRank?.rankText || '1st'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium truncate block">
            {currentHouseRank?.name || 'House'} ({currentHouseRank?.totalPoints || 0} pts)
          </span>
        </div>

        {/* Metric 4: Participation % */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Participation
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {overallPercentage}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Performance Breakdown (Weekly View) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              WEEKLY PERFORMANCE
            </h2>
            <p className="text-xs text-slate-400">Activity-wise marks awarded to you</p>
          </div>
          <Link
            to="/student/marks"
            className="text-xs font-bold text-eco-700 hover:text-eco-900 inline-flex items-center gap-1"
          >
            <span>All Weeks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {weeklyBreakdown.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No weekly participation marks recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {weeklyBreakdown.slice(-2).map((week) => (
              <div
                key={week.weekNumber}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Week {week.weekNumber}
                  </span>
                  <span className="text-xs font-black text-eco-700">
                    Total: {week.weekTotalMarks} / {week.weekMaxMarks} ({week.percentage}%)
                  </span>
                </div>

                <div className="space-y-2">
                  {week.activities.map((act, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-semibold">{act.activityName}</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {act.marks} / {act.maxMarks}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* House Standings Quick Snapshot */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              HOUSE CHAMPIONSHIP
            </h2>
          </div>
          <Link
            to="/student/ranking"
            className="text-xs font-bold text-eco-700 hover:text-eco-900"
          >
            View Leaderboard
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {houseRankings.map((h) => {
            const isMyHouse = h._id.toString() === (userHouseId?.toString() || '');
            return (
              <div
                key={h._id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isMyHouse
                    ? 'bg-eco-50 border-eco-400 ring-2 ring-eco-300/40'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <span className="text-lg">
                  {h.rank === 1 ? '🥇' : h.rank === 2 ? '🥈' : h.rank === 3 ? '🥉' : '🏅'}
                </span>
                <p className="text-xs font-bold text-slate-800 truncate mt-1">{h.name}</p>
                <p className="text-sm font-black text-slate-900">{h.totalPoints} pts</p>
                {isMyHouse && (
                  <span className="text-[10px] font-extrabold text-eco-700 uppercase tracking-wider block mt-1">
                    Your House
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
