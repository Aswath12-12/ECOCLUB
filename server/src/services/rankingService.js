const mongoose = require('mongoose');
const House = require('../models/House');
const WeeklyMark = require('../models/WeeklyMark');
const Student = require('../models/Student');

/**
 * Deterministic ranking calculation:
 * 1. Total Points (Highest to Lowest)
 * 2. Higher Participation Percentage (Total Marks / Total Max Marks * 100)
 * 3. Total Active Student Members
 * 4. Alphabetical House Code
 */
const rankHouses = (housesData) => {
  const sorted = [...housesData].sort((a, b) => {
    // 1. Total points descending
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    // 2. Higher participation percentage descending
    if (b.participationPercentage !== a.participationPercentage) {
      return b.participationPercentage - a.participationPercentage;
    }
    // 3. Member count descending
    if (b.studentCount !== a.studentCount) {
      return b.studentCount - a.studentCount;
    }
    // 4. Deterministic code alphabetical
    return a.code.localeCompare(b.code);
  });

  const rankSuffixes = ['1st', '2nd', '3rd', '4th'];
  return sorted.map((house, idx) => ({
    ...house,
    rank: idx + 1,
    rankText: rankSuffixes[idx] || `${idx + 1}th`
  }));
};

/**
 * Calculates overall ranking across all weeks
 */
const getOverallRanking = async () => {
  const houses = await House.find({ active: true }).lean();

  // Aggregate marks by houseId
  const markAggregations = await WeeklyMark.aggregate([
    {
      $group: {
        _id: '$houseId',
        totalPoints: { $sum: '$marks' },
        totalMaxPossible: { $sum: '$maxMarks' },
        entriesCount: { $sum: 1 },
        participatingStudents: { $addToSet: '$studentId' }
      }
    }
  ]);

  // Aggregate active student counts by houseId
  const studentCountAggregations = await Student.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$houseId',
        studentCount: { $sum: 1 }
      }
    }
  ]);

  const markMap = new Map();
  markAggregations.forEach((item) => {
    markMap.set(item._id.toString(), item);
  });

  const studentCountMap = new Map();
  studentCountAggregations.forEach((item) => {
    studentCountMap.set(item._id.toString(), item.studentCount);
  });

  const houseStats = houses.map((house) => {
    const stats = markMap.get(house._id.toString()) || {
      totalPoints: 0,
      totalMaxPossible: 0,
      entriesCount: 0,
      participatingStudents: []
    };

    const studentCount = studentCountMap.get(house._id.toString()) || 0;
    const totalPoints = stats.totalPoints || 0;
    const totalMaxPossible = stats.totalMaxPossible || 0;
    const participationPercentage =
      totalMaxPossible > 0 ? parseFloat(((totalPoints / totalMaxPossible) * 100).toFixed(2)) : 0;

    return {
      _id: house._id,
      name: house.name,
      code: house.code,
      colorCode: house.colorCode,
      description: house.description,
      totalPoints,
      totalMaxPossible,
      entriesCount: stats.entriesCount,
      uniqueParticipants: stats.participatingStudents.length,
      studentCount,
      participationPercentage
    };
  });

  return rankHouses(houseStats);
};

/**
 * Calculates weekly ranking for a given weekNumber
 */
const getWeeklyRanking = async (weekNumber) => {
  const parsedWeek = parseInt(weekNumber, 10);
  const houses = await House.find({ active: true }).lean();

  const markAggregations = await WeeklyMark.aggregate([
    { $match: { weekNumber: parsedWeek } },
    {
      $group: {
        _id: '$houseId',
        totalPoints: { $sum: '$marks' },
        totalMaxPossible: { $sum: '$maxMarks' },
        entriesCount: { $sum: 1 },
        participatingStudents: { $addToSet: '$studentId' }
      }
    }
  ]);

  const studentCountAggregations = await Student.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$houseId',
        studentCount: { $sum: 1 }
      }
    }
  ]);

  const markMap = new Map();
  markAggregations.forEach((item) => {
    markMap.set(item._id.toString(), item);
  });

  const studentCountMap = new Map();
  studentCountAggregations.forEach((item) => {
    studentCountMap.set(item._id.toString(), item.studentCount);
  });

  const houseStats = houses.map((house) => {
    const stats = markMap.get(house._id.toString()) || {
      totalPoints: 0,
      totalMaxPossible: 0,
      entriesCount: 0,
      participatingStudents: []
    };

    const studentCount = studentCountMap.get(house._id.toString()) || 0;
    const totalPoints = stats.totalPoints || 0;
    const totalMaxPossible = stats.totalMaxPossible || 0;
    const participationPercentage =
      totalMaxPossible > 0 ? parseFloat(((totalPoints / totalMaxPossible) * 100).toFixed(2)) : 0;

    return {
      _id: house._id,
      name: house.name,
      code: house.code,
      colorCode: house.colorCode,
      description: house.description,
      weekNumber: parsedWeek,
      totalPoints,
      totalMaxPossible,
      entriesCount: stats.entriesCount,
      uniqueParticipants: stats.participatingStudents.length,
      studentCount,
      participationPercentage
    };
  });

  return rankHouses(houseStats);
};

module.exports = {
  getOverallRanking,
  getWeeklyRanking,
  rankHouses
};
