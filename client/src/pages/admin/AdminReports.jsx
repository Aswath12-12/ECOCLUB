import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, PieChart as PieIcon, Award } from 'lucide-react';
import { reportService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { HousePointsBarChart } from '../../components/charts/HousePointsBarChart';
import { WeeklyTrendChart } from '../../components/charts/WeeklyTrendChart';
import { ParticipationChart } from '../../components/charts/ParticipationChart';
import { HouseBadge } from '../../components/common/Badge';

export const AdminReports = () => {
  const [houseReport, setHouseReport] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [hRes, sRes] = await Promise.all([
          reportService.getHousePerformance(),
          reportService.getStudentPerformance()
        ]);

        if (hRes.success) setHouseReport(hRes.data);
        if (sRes.success) setStudentReport(sRes.data);
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Failed to load reports' });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Generating EcoClub analytical reports..." />;

  const { overall = [], weeklyTrend = [] } = houseReport || {};
  const { topStudents = [], deptDistribution = [], yearDistribution = [] } = studentReport || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Performance & Analytics Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Comprehensive visual analytics covering houses, weekly points trends, and student participation.
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Charts Grid: House Comparison & Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* House Points Comparison */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                House Points Comparison
              </h3>
              <p className="text-xs text-slate-400">Total marks accumulated per house</p>
            </div>
            <BarChart3 className="w-5 h-5 text-eco-600" />
          </div>

          <div className="pt-2">
            <HousePointsBarChart data={overall} height={260} />
          </div>
        </div>

        {/* Weekly Points Trend */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                Weekly Points Trend
              </h3>
              <p className="text-xs text-slate-400">Week-over-week points trajectory across houses</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>

          <div className="pt-2">
            <WeeklyTrendChart data={weeklyTrend} height={260} />
          </div>
        </div>
      </div>

      {/* Second Row: Top Performing Students & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Performing Students (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                Top Student Performers
              </h3>
              <p className="text-xs text-slate-400">Highest individual scorers across all activities</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="divide-y divide-slate-100">
            {topStudents.map((item, idx) => (
              <div key={item.student?._id || idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-xs text-slate-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.student?.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {item.student?.rollNo} &bull; {item.student?.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HouseBadge house={item.student?.houseId} />
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{item.totalMarks} pts</p>
                    <p className="text-[10px] text-eco-700 font-bold">{item.percentage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                Participation Distribution
              </h3>
              <p className="text-xs text-slate-400">Student enrollment by department</p>
            </div>
            <PieIcon className="w-5 h-5 text-purple-600" />
          </div>

          <ParticipationChart data={deptDistribution} height={220} />
        </div>
      </div>
    </div>
  );
};
