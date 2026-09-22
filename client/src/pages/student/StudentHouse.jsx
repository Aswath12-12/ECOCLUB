import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trophy, Users, Award, Sparkles, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { houseService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RankBadge } from '../../components/common/Badge';
import { getHouseTheme } from '../../utils/constants';

export const StudentHouse = () => {
  const { user } = useAuth();
  const [houseInfo, setHouseInfo] = useState(null);
  const [allHouses, setAllHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouseDetails = async () => {
      try {
        setLoading(true);
        const res = await houseService.getHouses();
        if (res.success && res.data.houses) {
          const studentHouses = res.data.houses
            .filter((h) => h.code !== 'OFFICE_BEARERS')
            .map((h, idx) => ({
              ...h,
              rank: idx + 1,
              rankText: ['1st', '2nd', '3rd', '4th'][idx] || `${idx + 1}th`
            }));
          setAllHouses(studentHouses);
          const myHouseId = user?.house?._id || user?.house;
          const match = studentHouses.find(
            (h) => h._id.toString() === (myHouseId?.toString() || '')
          );
          setHouseInfo(match);
        }
      } catch (err) {
        console.error('Failed to load house data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseDetails();
  }, [user]);

  if (loading) return <LoadingSpinner message="Loading your house details..." />;

  const theme = getHouseTheme(houseInfo?.code);

  return (
    <div className="space-y-6">
      {/* House Hero Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-4"
        style={{
          background: `linear-gradient(135deg, ${houseInfo?.colorCode || '#10B981'}, #0f172a)`
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">
            House Code: {houseInfo?.code}
          </span>
          <RankBadge rank={houseInfo?.rank} rankText={houseInfo?.rankText} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {houseInfo?.name || 'Assigned House'}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mt-2 leading-relaxed">
            {houseInfo?.description ||
              'Proud house members working together on climate action and eco preservation.'}
          </p>
        </div>

        {/* Quick Numbers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/20 text-xs">
          <div>
            <span className="text-white/70 block uppercase font-bold text-[10px]">House Standing</span>
            <span className="text-xl font-black">{houseInfo?.rankText} Place</span>
          </div>
          <div>
            <span className="text-white/70 block uppercase font-bold text-[10px]">Total Points</span>
            <span className="text-xl font-black">{houseInfo?.totalPoints} pts</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-white/70 block uppercase font-bold text-[10px]">Active Members</span>
            <span className="text-xl font-black">{houseInfo?.studentCount} Students</span>
          </div>
        </div>
      </div>

      {/* House Values Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-eco-600" />
          <span>House Membership & Pride</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Every point you earn in weekly activities contributes directly to your house championship score. Continue participating in tree plantations, campus cleanups, quizzes, and recycling campaigns to propel <strong className="text-slate-900">{houseInfo?.name}</strong> to 1st place!
        </p>
      </div>

      {/* Other Competitor Houses Snapshot */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          All 4 EcoClub Houses in Championship
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allHouses.map((h) => {
            const isMine = h._id === houseInfo?._id;
            return (
              <div
                key={h._id}
                className={`bg-white p-4 rounded-3xl border shadow-xs flex items-center justify-between ${
                  isMine ? 'border-eco-500 ring-2 ring-eco-300/40' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: h.colorCode }} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                    <p className="text-[11px] text-slate-400">{h.studentCount} students</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{h.totalPoints} pts</span>
                  <RankBadge rank={h.rank} rankText={h.rankText} className="ml-2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
