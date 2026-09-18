const House = require('../models/House');
const Student = require('../models/Student');
const WeeklyMark = require('../models/WeeklyMark');
const { getOverallRanking, getWeeklyRanking } = require('../services/rankingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get all 4 houses with stats
 */
const getHouses = async (req, res, next) => {
  try {
    const houses = await House.find().sort({ createdAt: 1 }).lean();

    // Attach student count and total marks to each house
    const houseIds = houses.map((h) => h._id);

    const [studentCounts, markTotals] = await Promise.all([
      Student.aggregate([
        { $match: { houseId: { $in: houseIds }, isActive: true } },
        { $group: { _id: '$houseId', count: { $sum: 1 } } }
      ]),
      WeeklyMark.aggregate([
        { $match: { houseId: { $in: houseIds } } },
        { $group: { _id: '$houseId', totalMarks: { $sum: '$marks' } } }
      ])
    ]);

    const countMap = new Map();
    studentCounts.forEach((c) => countMap.set(c._id.toString(), c.count));

    const marksMap = new Map();
    markTotals.forEach((m) => marksMap.set(m._id.toString(), m.totalMarks));

    const overallRanks = await getOverallRanking();
    const rankMap = new Map();
    overallRanks.forEach((r) => rankMap.set(r._id.toString(), { rank: r.rank, rankText: r.rankText }));

    const enhancedHouses = houses.map((h) => ({
      ...h,
      studentCount: countMap.get(h._id.toString()) || 0,
      totalPoints: marksMap.get(h._id.toString()) || 0,
      rank: rankMap.get(h._id.toString())?.rank || 4,
      rankText: rankMap.get(h._id.toString())?.rankText || '4th'
    }));

    return sendSuccess(res, 200, 'Houses retrieved successfully', { houses: enhancedHouses });
  } catch (error) {
    next(error);
  }
};

/**
 * Update house details (name, description, color)
 * Automatically cascades as all views reference House document dynamically
 */
const updateHouse = async (req, res, next) => {
  try {
    const { name, description, colorCode } = req.body;
    const house = await House.findById(req.params.id);

    if (!house) {
      return sendError(res, 404, 'House not found.');
    }

    if (name && name.trim()) {
      house.name = name.trim();
    }
    if (typeof description !== 'undefined') {
      house.description = description.trim();
    }
    if (colorCode) {
      house.colorCode = colorCode;
    }

    await house.save();

    return sendSuccess(res, 200, `House updated successfully. New name: ${house.name}`, { house });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dynamic overall house ranking
 */
const getHouseRankings = async (req, res, next) => {
  try {
    const rankings = await getOverallRanking();
    return sendSuccess(res, 200, 'Overall house rankings retrieved', { rankings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dynamic weekly house ranking for given weekNumber
 */
const getWeeklyHouseRankings = async (req, res, next) => {
  try {
    const { weekNumber } = req.params;
    if (!weekNumber) {
      return sendError(res, 400, 'Week number parameter is required.');
    }

    const rankings = await getWeeklyRanking(weekNumber);
    return sendSuccess(res, 200, `House rankings for Week ${weekNumber} retrieved`, {
      weekNumber: parseInt(weekNumber, 10),
      rankings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHouses,
  updateHouse,
  getHouseRankings,
  getWeeklyHouseRankings
};
