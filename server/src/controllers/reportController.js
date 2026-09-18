const Student = require('../models/Student');
const House = require('../models/House');
const Activity = require('../models/Activity');
const WeeklyMark = require('../models/WeeklyMark');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { getOverallRanking, getWeeklyRanking } = require('../services/rankingService');
const { sendSuccess } = require('../utils/responseHandler');

/**
 * Overview statistics for the Admin Dashboard
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const [totalStudents, totalHouses, totalActivities, recentActivities, pendingResets, overallRankings] =
      await Promise.all([
        Student.countDocuments({ isActive: true }),
        House.countDocuments({ active: true }),
        Activity.countDocuments({ active: true }),
        Activity.find({ active: true }).sort({ weekNumber: -1, date: -1 }).limit(4).lean(),
        PasswordResetRequest.countDocuments({ status: 'PENDING' }),
        getOverallRanking()
      ]);

    // Find the latest week number
    const latestActivity = await Activity.findOne({ active: true }).sort({ weekNumber: -1 }).lean();
    const currentWeekNumber = latestActivity ? latestActivity.weekNumber : 1;

    // Calculate this week's participation
    const thisWeekMarksCount = await WeeklyMark.countDocuments({ weekNumber: currentWeekNumber });
    const thisWeekUniqueParticipants = await WeeklyMark.distinct('studentId', { weekNumber: currentWeekNumber });

    return sendSuccess(res, 200, 'Dashboard summary retrieved', {
      totalStudents,
      totalHouses,
      totalActivities,
      pendingPasswordResets: pendingResets,
      currentWeek: currentWeekNumber,
      thisWeekParticipation: {
        totalMarksGiven: thisWeekMarksCount,
        uniqueStudents: thisWeekUniqueParticipants.length,
        percentage:
          totalStudents > 0 ? parseFloat(((thisWeekUniqueParticipants.length / totalStudents) * 100).toFixed(1)) : 0
      },
      housePerformance: overallRankings.map((h) => ({
        id: h._id,
        name: h.name,
        code: h.code,
        colorCode: h.colorCode,
        points: h.totalPoints,
        rank: h.rank,
        rankText: h.rankText,
        participationPercentage: h.participationPercentage
      })),
      currentRanking: overallRankings,
      recentActivities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * House performance reports with breakdown
 */
const getHousePerformance = async (req, res, next) => {
  try {
    const overall = await getOverallRanking();

    // Get weekly trends for all houses
    const allMarks = await WeeklyMark.find()
      .populate('houseId', 'name code colorCode')
      .lean();

    const weekHouseMap = {};
    allMarks.forEach((m) => {
      const wk = `Week ${m.weekNumber}`;
      if (!weekHouseMap[wk]) {
        weekHouseMap[wk] = { week: wk, weekNumber: m.weekNumber };
      }
      const houseName = m.houseId?.name || 'Unknown';
      weekHouseMap[wk][houseName] = (weekHouseMap[wk][houseName] || 0) + m.marks;
    });

    const weeklyTrend = Object.values(weekHouseMap).sort((a, b) => a.weekNumber - b.weekNumber);

    return sendSuccess(res, 200, 'House performance report', {
      overall,
      weeklyTrend
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Student performance reports
 */
const getStudentPerformance = async (req, res, next) => {
  try {
    // Top 10 students overall
    const topStudentsAgg = await WeeklyMark.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalMarks: { $sum: '$marks' },
          totalPossible: { $sum: '$maxMarks' },
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { totalMarks: -1 } },
      { $limit: 10 }
    ]);

    const populatedTopStudents = await Student.populate(topStudentsAgg, [
      { path: '_id', select: 'rollNo name department year className houseId' },
      { path: '_id.houseId', model: 'House', select: 'name code colorCode' }
    ]);

    const formattedTop = populatedTopStudents
      .filter((item) => item._id)
      .map((item) => ({
        student: item._id,
        totalMarks: item.totalMarks,
        totalPossible: item.totalPossible,
        percentage:
          item.totalPossible > 0 ? parseFloat(((item.totalMarks / item.totalPossible) * 100).toFixed(1)) : 0,
        activityCount: item.activityCount
      }));

    // Department-wise student distribution
    const deptDistribution = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Year-wise distribution
    const yearDistribution = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$year', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, 200, 'Student performance report', {
      topStudents: formattedTop,
      deptDistribution,
      yearDistribution
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getHousePerformance,
  getStudentPerformance
};
