import React, { useState, useEffect } from 'react';
import { Award, Calendar, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { markService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';

export const StudentWeeklyMarks = () => {
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('all');
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        setAlert(null);
        const res = await markService.getMyMarks({
          weekNumber: selectedWeekFilter !== 'all' ? selectedWeekFilter : undefined
        });

        if (res.success) {
          setMarksData(res.data);
        }
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Failed to load your marks' });
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [selectedWeekFilter]);

  if (loading) return <LoadingSpinner message="Retrieving your weekly performance marks..." />;

  const {
    totalScore = 0,
    totalMaxScore = 0,
    overallPercentage = 0,
    weeklyBreakdown = []
  } = marksData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Weekly Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Your individual participation points and activity breakdowns across all weeks.
          </p>
        </div>

        {/* Overall Score Chip */}
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 self-start sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Cumulative Total
            </span>
            <span className="text-base font-black text-slate-900">
              {totalScore} <span className="text-xs text-slate-400 font-medium">/ {totalMaxScore}</span>
            </span>
          </div>
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            {overallPercentage}%
          </span>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Week Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedWeekFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedWeekFilter === 'all'
              ? 'bg-eco-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Weeks
        </button>
        {[1, 2, 3, 4, 5, 6].map((wk) => (
          <button
            key={wk}
            type="button"
            onClick={() => setSelectedWeekFilter(wk)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedWeekFilter === wk
                ? 'bg-eco-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Week {wk}
          </button>
        ))}
      </div>

      {/* Weekly Cards Breakdown */}
      {weeklyBreakdown.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No marks recorded"
          description="There are no marks awarded to your account for the selected period."
        />
      ) : (
        <div className="space-y-4">
          {weeklyBreakdown.map((week) => (
            <div
              key={week.weekNumber}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Week {week.weekNumber}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {week.activities.length} activit{week.activities.length === 1 ? 'y' : 'ies'} evaluated
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-eco-800">
                    {week.weekTotalMarks} / {week.weekMaxMarks}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1.5">
                    ({week.percentage}%)
                  </span>
                </div>
              </div>

              {/* Activity Rows */}
              <div className="divide-y divide-slate-100 p-2 sm:p-4">
                {week.activities.map((act, idx) => (
                  <div
                    key={act.markId || idx}
                    className="p-3 hover:bg-slate-50/50 rounded-2xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {act.activityName}
                      </h4>
                      {act.remarks && (
                        <p className="text-[11px] text-slate-500 italic">
                          "{act.remarks}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                      <span className="text-[10px] text-slate-400">
                        {act.activityDate ? new Date(act.activityDate).toLocaleDateString() : ''}
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                        {act.marks} / {act.maxMarks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer Summary */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
                <span className="font-semibold">Week {week.weekNumber} Total:</span>
                <span className="font-black text-slate-900">
                  {week.weekTotalMarks} Points
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
