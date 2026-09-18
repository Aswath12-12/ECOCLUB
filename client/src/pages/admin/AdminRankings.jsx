import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Sparkles, HelpCircle, Award, Users, Info } from 'lucide-react';
import { houseService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { RankBadge } from '../../components/common/Badge';
import { getHouseTheme } from '../../utils/constants';

export const AdminRankings = () => {
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' | 'weekly'
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setAlert(null);
      let res;
      if (activeTab === 'overall') {
        res = await houseService.getOverallRanking();
      } else {
        res = await houseService.getWeeklyRanking(selectedWeek);
      }

      if (res.success) {
        setRankings(res.data.rankings);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load house rankings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [activeTab, selectedWeek]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-100 border border-white/20 mb-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-200" />
            <span>Eco Championship Leaderboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            🏆 HOUSE CHAMPIONSHIP
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 font-medium">
            Dynamic rankings calculated from verified student marks with deterministic tie-breakers.
          </p>
        </div>

        {/* Tab Toggle: Overall vs Weekly */}
        <div className="flex bg-amber-900/30 backdrop-blur-md p-1 rounded-2xl border border-white/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overall')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overall' ? 'bg-white text-amber-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            Overall Leaderboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'weekly' ? 'bg-white text-amber-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            Weekly Ranking
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* If Weekly tab active: Week Selector */}
      {activeTab === 'weekly' && (
        <div className="flex items-center gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Select Competition Week:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((wk) => (
              <button
                key={wk}
                type="button"
                onClick={() => setSelectedWeek(wk)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedWeek === wk
                    ? 'bg-eco-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Week {wk}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Calculating dynamic house rankings..." />
      ) : (
        <>
          {/* Top 4 Podium / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rankings.map((house) => {
              const theme = getHouseTheme(house.code);
              const isFirst = house.rank === 1;

              return (
                <div
                  key={house._id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                    isFirst
                      ? 'border-amber-400 ring-2 ring-amber-300/40 shadow-amber-100/50'
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">
                      {house.rank === 1 ? '🥇' : house.rank === 2 ? '🥈' : house.rank === 3 ? '🥉' : '🏅'}
                    </span>
                    <RankBadge rank={house.rank} rankText={house.rankText} />
                  </div>

                  {/* House Title & Points */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: house.colorCode }} />
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        {house.name}
                      </h3>
                    </div>
                    <div className="pt-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {house.totalPoints}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1">points</span>
                    </div>
                  </div>

                  {/* Details stats */}
                  <div className="pt-4 border-t border-slate-100 mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Participation Rate:</span>
                      <span className="font-bold text-slate-800">{house.participationPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Unique Participants:</span>
                      <span className="font-bold text-slate-800">{house.uniqueParticipants || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Total House Members:</span>
                      <span className="font-bold text-slate-800">{house.studentCount} students</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Leaderboard Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Championship Standings ({activeTab === 'overall' ? 'Overall' : `Week ${selectedWeek}`})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-20">Rank</th>
                    <th className="py-3 px-4">House</th>
                    <th className="py-3 px-4">Total Points</th>
                    <th className="py-3 px-4">Max Possible Points</th>
                    <th className="py-3 px-4">Participation %</th>
                    <th className="py-3 px-4 text-right">Active Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankings.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-black text-sm">
                        <RankBadge rank={h.rank} rankText={h.rankText} />
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: h.colorCode }} />
                          <span>{h.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-base text-slate-900">
                        {h.totalPoints} pts
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {h.totalMaxPossible || 0} pts
                      </td>
                      <td className="py-3.5 px-4 font-bold text-eco-700">
                        {h.participationPercentage}%
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 font-bold">
                        {h.studentCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tie-breaker Rule Callout */}
          <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Deterministic Ranking Engine:</span>
              <p className="mt-0.5 text-slate-500">
                1. Highest total points earned by students &bull; 2. Higher overall participation percentage &bull; 3. Total active student membership &bull; 4. Alphabetical house code.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
