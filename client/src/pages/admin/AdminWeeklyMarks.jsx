import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Award,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Sparkles,
  Info,
  Building2,
  UserCheck
} from 'lucide-react';
import { markService, houseService, activityService } from '../../services/services';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { HouseBadge } from '../../components/common/Badge';
import { getHouseTheme } from '../../utils/constants';

export const AdminWeeklyMarks = () => {
  const location = useLocation();

  // Mode: 'house' (Grade all houses together) vs 'student' (Grade individual students in a house)
  const [gradingMode, setGradingMode] = useState('house');

  // Common Controls
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  // House-Level Grading State
  const [houseSheetData, setHouseSheetData] = useState(null);
  const [houseMarksState, setHouseMarksState] = useState({}); // { [houseId]: { marks: '', remarks: '' } }
  const [loadingHouseSheet, setLoadingHouseSheet] = useState(false);
  const [savingHouse, setSavingHouse] = useState(false);

  // Student-Level Grading State
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState('');
  const [sheetData, setSheetData] = useState(null);
  const [marksState, setMarksState] = useState({}); // { [studentId]: { marks: '', remarks: '' } }
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);

  const [alert, setAlert] = useState(null);

  // Load houses and activities
  useEffect(() => {
    const initData = async () => {
      try {
        const [hRes, aRes] = await Promise.all([
          houseService.getHouses(),
          activityService.getActivities()
        ]);

        if (hRes.success && hRes.data.houses.length > 0) {
          setHouses(hRes.data.houses);
          setSelectedHouse(hRes.data.houses[0]._id);
        }

        if (aRes.success && aRes.data.activities.length > 0) {
          setActivities(aRes.data.activities);
          setSelectedActivity(aRes.data.activities[0]._id);
          if (aRes.data.activities[0].weekNumber) {
            setSelectedWeek(aRes.data.activities[0].weekNumber);
          }
        }
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Failed to initialize marking sheet.' });
      }
    };
    initData();
  }, []);

  // Update URL params if passed in link (e.g. from Dashboard or Activities)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const w = params.get('weekNumber');
    const a = params.get('activityId');
    if (w) setSelectedWeek(parseInt(w, 10));
    if (a) setSelectedActivity(a);
  }, [location.search]);

  // =========================================================================
  // 1. FETCH HOUSE GRADING SHEET (All Houses Together)
  // =========================================================================
  const fetchHouseGradingSheet = async () => {
    if (!selectedWeek || !selectedActivity) return;

    setLoadingHouseSheet(true);
    setAlert(null);

    try {
      const res = await markService.getHouseGradingSheet({
        weekNumber: selectedWeek,
        activityId: selectedActivity
      });

      if (res.success && res.data) {
        setHouseSheetData(res.data);
        const initial = {};
        res.data.houses.forEach((h) => {
          initial[h.houseId] = {
            marks: h.marks !== '' && h.marks !== null ? h.marks : '',
            remarks: h.remarks || ''
          };
        });
        setHouseMarksState(initial);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load house grading sheet.' });
    } finally {
      setLoadingHouseSheet(false);
    }
  };

  // =========================================================================
  // 2. FETCH STUDENT GRADING SHEET (Individual House Students)
  // =========================================================================
  const fetchStudentGradingSheet = async () => {
    if (!selectedWeek || !selectedHouse || !selectedActivity) return;

    setLoadingSheet(true);
    setAlert(null);

    try {
      const res = await markService.getGradingSheet({
        weekNumber: selectedWeek,
        houseId: selectedHouse,
        activityId: selectedActivity
      });

      if (res.success && res.data) {
        setSheetData(res.data);
        const initial = {};
        res.data.students.forEach((st) => {
          initial[st.studentId] = {
            marks: st.marks !== '' ? st.marks : '',
            remarks: st.remarks || ''
          };
        });
        setMarksState(initial);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load student grading sheet.' });
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    if (gradingMode === 'house') {
      fetchHouseGradingSheet();
    } else {
      fetchStudentGradingSheet();
    }
  }, [gradingMode, selectedWeek, selectedActivity, selectedHouse]);

  // =========================================================================
  // HOUSE MARKS HANDLERS
  // =========================================================================
  const handleHouseMarkChange = (houseId, value) => {
    setHouseMarksState((prev) => ({
      ...prev,
      [houseId]: {
        ...prev[houseId],
        marks: value
      }
    }));
  };

  const handleHouseRemarkChange = (houseId, value) => {
    setHouseMarksState((prev) => ({
      ...prev,
      [houseId]: {
        ...prev[houseId],
        remarks: value
      }
    }));
  };

  const handleSetAllHousesScore = (score, remarkText = 'Participated') => {
    if (!houseSheetData?.houses) return;
    const updated = { ...houseMarksState };
    houseSheetData.houses.forEach((h) => {
      updated[h.houseId] = {
        marks: score,
        remarks: updated[h.houseId]?.remarks || remarkText
      };
    });
    setHouseMarksState(updated);
  };

  const handleSaveHouseMarks = async () => {
    if (!houseSheetData?.houses || houseSheetData.houses.length === 0) return;

    setSavingHouse(true);
    setAlert(null);

    try {
      const maxPossible = houseSheetData.activity?.maxMarks || 10;
      const houseMarks = [];

      for (const h of houseSheetData.houses) {
        const item = houseMarksState[h.houseId];
        if (item && item.marks !== '' && item.marks !== null) {
          const num = Number(item.marks);
          if (isNaN(num) || num < 0 || num > maxPossible) {
            throw new Error(
              `Marks for ${h.name} must be between 0 and maximum ${maxPossible} points.`
            );
          }

          houseMarks.push({
            houseId: h.houseId,
            marks: num,
            remarks: item.remarks || ''
          });
        }
      }

      if (houseMarks.length === 0) {
        throw new Error('Please enter marks for at least one house before saving.');
      }

      const res = await markService.saveHouseMarks({
        weekNumber: selectedWeek,
        activityId: selectedActivity,
        weekStartDate: eventDate,
        houseMarks
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: `House marks successfully saved for ${houseMarks.length} houses! Student scores and leaderboards updated.`
        });
        fetchHouseGradingSheet();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setSavingHouse(false);
    }
  };

  // =========================================================================
  // STUDENT MARKS HANDLERS
  // =========================================================================
  const handleStudentMarkChange = (studentId, value) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: value
      }
    }));
  };

  const handleStudentRemarkChange = (studentId, value) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value
      }
    }));
  };

  const handleSetAllStudentsParticipated = (score) => {
    if (!sheetData?.students) return;
    const updated = { ...marksState };
    sheetData.students.forEach((st) => {
      updated[st.studentId] = {
        marks: score,
        remarks: updated[st.studentId]?.remarks || 'Participated'
      };
    });
    setMarksState(updated);
  };

  const handleSaveStudentMarks = async () => {
    if (!sheetData?.students || sheetData.students.length === 0) return;

    setSavingStudent(true);
    setAlert(null);

    try {
      const maxPossible = sheetData.activity?.maxMarks || 10;
      const marksData = [];

      for (const st of sheetData.students) {
        const item = marksState[st.studentId];
        if (item && item.marks !== '' && item.marks !== null) {
          const num = Number(item.marks);
          if (isNaN(num) || num < 0 || num > maxPossible) {
            throw new Error(
              `Marks for ${st.name} must be between 0 and maximum ${maxPossible} points.`
            );
          }

          marksData.push({
            studentId: st.studentId,
            marks: num,
            remarks: item.remarks || '',
            houseId: selectedHouse
          });
        }
      }

      if (marksData.length === 0) {
        throw new Error('Please enter marks for at least one student before saving.');
      }

      const res = await markService.saveMarks({
        weekNumber: selectedWeek,
        activityId: selectedActivity,
        houseId: selectedHouse,
        weekStartDate: eventDate,
        marksData
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: `Marks successfully updated for ${marksData.length} students! House rankings updated.`
        });
        fetchStudentGradingSheet();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setSavingStudent(false);
    }
  };

  const maxAllowedMarks =
    gradingMode === 'house'
      ? houseSheetData?.activity?.maxMarks || 10
      : sheetData?.activity?.maxMarks || 10;

  return (
    <div className="space-y-6">
      {/* Page Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Weekly Participation Marks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Award activity marks directly to entire Houses or individual students.
          </p>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="flex p-1 bg-slate-200/80 rounded-2xl self-start sm:self-auto border border-slate-300/60 shadow-xs">
          <button
            type="button"
            onClick={() => setGradingMode('house')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              gradingMode === 'house'
                ? 'bg-eco-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Grade Each House</span>
          </button>
          <button
            type="button"
            onClick={() => setGradingMode('student')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              gradingMode === 'student'
                ? 'bg-eco-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Single Student Grading</span>
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Control Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Week Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-hidden"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Activity
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-hidden"
            >
              {activities.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} (Max: {a.maxMarks})
                </option>
              ))}
            </select>
          </div>

          {/* House Selector (Only if Student Grading Mode is active) */}
          {gradingMode === 'student' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select House
              </label>
              <select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-hidden"
              >
                {houses.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Event Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-eco-500 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-hidden"
            />
          </div>
        </div>

        {/* Quick Batch Fill Buttons */}
        {gradingMode === 'house' && houseSheetData?.houses?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Quick Batch Fill:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetAllHousesScore(maxAllowedMarks, 'Full Participation')}
                className="px-3 py-1 bg-eco-50 text-eco-700 hover:bg-eco-100 border border-eco-200 rounded-lg font-bold transition-colors cursor-pointer"
              >
                All Full Marks ({maxAllowedMarks})
              </button>
              <button
                type="button"
                onClick={() => handleSetAllHousesScore(Math.round(maxAllowedMarks * 0.8), 'Active House Effort')}
                className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition-colors cursor-pointer"
              >
                All 80% ({Math.round(maxAllowedMarks * 0.8)})
              </button>
            </div>
          </div>
        )}

        {gradingMode === 'student' && sheetData?.students?.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Quick Fill:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetAllStudentsParticipated(maxAllowedMarks)}
                className="px-3 py-1 bg-eco-50 text-eco-700 hover:bg-eco-100 border border-eco-200 rounded-lg font-bold transition-colors cursor-pointer"
              >
                All Full Marks ({maxAllowedMarks})
              </button>
              <button
                type="button"
                onClick={() => handleSetAllStudentsParticipated(Math.round(maxAllowedMarks * 0.8))}
                className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition-colors cursor-pointer"
              >
                All 80% ({Math.round(maxAllowedMarks * 0.8)})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: HOUSE-LEVEL GRADING (ALL HOUSES SIDE-BY-SIDE / LIST)             */}
      {/* ========================================================================= */}
      {gradingMode === 'house' && (
        <>
          {loadingHouseSheet ? (
            <LoadingSpinner message="Loading house grading sheet..." />
          ) : !houseSheetData?.houses || houseSheetData.houses.length === 0 ? (
            <EmptyState
              title="No Houses Found"
              description="No active houses are configured in the system."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Header Bar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                    WEEK {selectedWeek} &bull; House Grading Sheet
                  </span>
                  <span className="text-xs text-slate-500">
                    ({houseSheetData.houses.length} Houses)
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                  Activity: <span className="text-eco-700">{houseSheetData.activity?.name}</span> &bull; Max: {maxAllowedMarks} pts
                </div>
              </div>

              {/* Houses Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {houseSheetData.houses.map((houseItem) => {
                  const theme = getHouseTheme(houseItem.code);
                  const hMark = houseMarksState[houseItem.houseId]?.marks ?? '';
                  const hRemark = houseMarksState[houseItem.houseId]?.remarks ?? '';

                  return (
                    <div
                      key={houseItem.houseId}
                      className={`p-4 sm:p-5 rounded-3xl border ${theme.border} ${theme.bgLight} space-y-3 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between`}
                    >
                      <div>
                        {/* Top Info */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <HouseBadge house={houseItem} />
                          {houseItem.hasRecord ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Recorded
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 font-medium mb-3">
                          👥 {houseItem.studentCount} Active Members
                        </div>

                        {/* Marks & Remarks Input */}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              House Score (0 - {maxAllowedMarks})
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={maxAllowedMarks}
                                value={hMark}
                                onChange={(e) => handleHouseMarkChange(houseItem.houseId, e.target.value)}
                                placeholder="0"
                                className="w-24 px-3.5 py-2 bg-white border border-slate-200 focus:border-eco-500 rounded-xl text-center font-extrabold text-slate-800 text-base shadow-xs outline-hidden"
                              />
                              <span className="text-sm font-bold text-slate-500">/ {maxAllowedMarks} pts</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              House Remarks / Notes
                            </label>
                            <input
                              type="text"
                              value={hRemark}
                              onChange={(e) => handleHouseRemarkChange(houseItem.houseId, e.target.value)}
                              placeholder="e.g. Winner of event, active participation"
                              className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-eco-500 rounded-xl text-xs font-medium text-slate-800 outline-hidden shadow-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  💡 Awarding marks to a house automatically updates all active student members in that house.
                </p>
                <button
                  type="button"
                  disabled={savingHouse}
                  onClick={handleSaveHouseMarks}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-eco-600 hover:bg-eco-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-eco-200 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingHouse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save All House Marks</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INDIVIDUAL STUDENT GRADING (DRILL-DOWN)                          */}
      {/* ========================================================================= */}
      {gradingMode === 'student' && (
        <>
          {loadingSheet ? (
            <LoadingSpinner message="Loading students and existing marks..." />
          ) : !sheetData?.students || sheetData.students.length === 0 ? (
            <EmptyState
              title="No students in this house"
              description="There are currently no active students assigned to this house."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Header Bar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                    WEEK {selectedWeek} &bull; {sheetData.house?.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({sheetData.students.length} students)
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                  Activity: <span className="text-eco-700">{sheetData.activity?.name}</span> &bull; Max: {maxAllowedMarks} pts
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4 w-36">Awarded Marks (0 - {maxAllowedMarks})</th>
                      <th className="py-3 px-4">Remarks</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sheetData.students.map((student) => {
                      const studentMark = marksState[student.studentId]?.marks ?? '';
                      const studentRemark = marksState[student.studentId]?.remarks ?? '';

                      return (
                        <tr key={student.studentId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {student.rollNo}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {student.name}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {student.department} &bull; {student.year}-{student.className}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max={maxAllowedMarks}
                                value={studentMark}
                                onChange={(e) => handleStudentMarkChange(student.studentId, e.target.value)}
                                placeholder="0"
                                className="w-20 px-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-eco-500 rounded-xl text-center font-bold text-slate-800 text-sm outline-hidden"
                              />
                              <span className="text-slate-400 font-semibold">/ {maxAllowedMarks}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={studentRemark}
                              onChange={(e) => handleStudentRemarkChange(student.studentId, e.target.value)}
                              placeholder="e.g. Active participant"
                              className="w-full px-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-eco-500 rounded-xl text-xs font-medium text-slate-700 outline-hidden"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            {student.hasRecord ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Recorded
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
                {sheetData.students.map((student) => {
                  const studentMark = marksState[student.studentId]?.marks ?? '';
                  const studentRemark = marksState[student.studentId]?.remarks ?? '';

                  return (
                    <div key={student.studentId} className="pt-3 first:pt-0 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-eco-700">
                            {student.rollNo}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            {student.department} - {student.year} {student.className}
                          </p>
                        </div>
                        {student.hasRecord && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Recorded
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={maxAllowedMarks}
                            value={studentMark}
                            onChange={(e) => handleStudentMarkChange(student.studentId, e.target.value)}
                            placeholder="0"
                            className="w-20 p-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-eco-500 rounded-xl text-center font-bold text-base text-slate-800 outline-hidden"
                          />
                          <span className="text-xs text-slate-400 font-bold">/ {maxAllowedMarks}</span>
                        </div>

                        <input
                          type="text"
                          value={studentRemark}
                          onChange={(e) => handleStudentRemarkChange(student.studentId, e.target.value)}
                          placeholder="Remarks..."
                          className="flex-1 p-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-eco-500 rounded-xl text-xs font-medium text-slate-700 outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  💡 Historical marks are locked to the student's house at the time awarded.
                </p>
                <button
                  type="button"
                  disabled={savingStudent}
                  onClick={handleSaveStudentMarks}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-eco-200 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Student Marks</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
