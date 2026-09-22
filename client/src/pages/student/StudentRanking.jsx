import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { houseService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RankBadge } from '../../components/common/Badge';

export const StudentRanking = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await houseService.getOverallRanking();
        if (res.success && res.data.rankings) {
          const studentHouses = res.data.rankings
            .filter((h) => h.code !== 'OFFICE_BEARERS')
            .map((h, idx) => ({
              ...h,
              rank: idx + 1,
              rankText: ['1st', '2nd', '3rd', '4th'][idx] || `${idx + 1}th`
            }));
          setRankings(studentHouses);
        }
      } catch (err) {
        console.error('Failed to load championship ranking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading championship standings..." />;

  const myHouseId = user?.house?._id || user?.house;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-100 border border-white/20">
          <Trophy className="w-3.5 h-3.5 text-yellow-200" />
          <span>Annual Eco Leaderboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          🏆 HOUSE CHAMPIONSHIP
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 font-medium">
          Live championship standings updated with every student participation mark.
        </p>
      </div>

      {/* 4 Houses Leaderboard Stack */}
      <div className="space-y-3">
        {rankings.map((h) => {
          const isMyHouse = h._id.toString() === (myHouseId?.toString() || '');
          const isFirst = h.rank === 1;

          return (
            <div
              key={h._id}
              className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isMyHouse
                  ? 'border-eco-500 ring-2 ring-eco-300/40 bg-eco-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl w-10 text-center">
                  {h.rank === 1 ? '🥇' : h.rank === 2 ? '🥈' : h.rank === 3 ? '🥉' : '🏅'}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.colorCode }} />
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {h.name}
                    </h3>
                    {isMyHouse && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-eco-100 text-eco-800 border border-eco-200">
                        Your House
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {h.studentCount} students &bull; {h.participationPercentage}% participation rate
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <RankBadge rank={h.rank} rankText={h.rankText} />
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{h.totalPoints}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
