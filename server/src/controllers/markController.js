const WeeklyMark = require('../models/WeeklyMark');
const Student = require('../models/Student');
const Activity = require('../models/Activity');
const House = require('../models/House');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get students of a specific house alongside existing marks for an activity + week
 * Powers the Admin Weekly Mark entry screen
 */
const getMarksForGrading = async (req, res, next) => {
  try {
    const { weekNumber, houseId, activityId } = req.query;

    if (!weekNumber || !houseId || !activityId) {
      return sendError(res, 400, 'weekNumber, houseId, and activityId are required query parameters.');
    }

    const [activity, house, students, existingMarks] = await Promise.all([
      Activity.findById(activityId).lean(),
      House.findById(houseId).lean(),
      Student.find({ houseId, isActive: true }).sort({ rollNo: 1 }).lean(),
      WeeklyMark.find({
        activityId,
        weekNumber: parseInt(weekNumber, 10)
      }).lean()
    ]);

    if (!activity) return sendError(res, 404, 'Activity not found.');
    if (!house) return sendError(res, 404, 'House not found.');

    const marksMap = new Map();
    existingMarks.forEach((m) => {
      marksMap.set(m.studentId.toString(), m);
    });

    const studentsWithMarks = students.map((st) => {
      const markRecord = marksMap.get(st._id.toString());
      return {
        studentId: st._id,
        rollNo: st.rollNo,
        name: st.name,
        department: st.department,
        year: st.year,
        className: st.className,
        marks: markRecord ? markRecord.marks : '',
        maxMarks: activity.maxMarks,
        remarks: markRecord ? markRecord.remarks : '',
        hasRecord: !!markRecord,
        markId: markRecord ? markRecord._id : null
      };
    });

    return sendSuccess(res, 200, 'Marking sheet retrieved successfully', {
      activity,
      house,
      weekNumber: parseInt(weekNumber, 10),
      students: studentsWithMarks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upsert weekly marks for multiple students (or single)
 * Prevents duplicate student + activity + week records
 * Retains student's current houseId in mark record for historical accuracy
 */
const saveOrUpdateMarks = async (req, res, next) => {
  try {
    const { weekNumber, activityId, houseId, weekStartDate, weekEndDate, marksData } = req.body;

    if (!weekNumber || !activityId || !marksData || !Array.isArray(marksData)) {
      return sendError(res, 400, 'weekNumber, activityId, and marksData array are required.');
    }

    const activity = await Activity.findById(activityId);
    if (!activity) return sendError(res, 404, 'Activity not found.');

    const parsedWeek = parseInt(weekNumber, 10);
    const maxMarks = activity.maxMarks;

    const studentIds = marksData.map((m) => m.studentId);
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    const studentHouseMap = new Map();
    students.forEach((s) => studentHouseMap.set(s._id.toString(), s.houseId));

    const bulkOperations = [];
    const validationErrors = [];

    for (const item of marksData) {
      if (item.marks === '' || item.marks === null || typeof item.marks === 'undefined') {
        continue; // Skip unmarked students
      }

      const numMarks = Number(item.marks);
      if (isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) {
        validationErrors.push(
          `Invalid marks for student (${item.marks}). Must be between 0 and ${maxMarks}.`
        );
        continue;
      }

      const assignedHouseId = item.houseId || houseId || studentHouseMap.get(item.studentId.toString());
      if (!assignedHouseId) {
        validationErrors.push(`Could not determine house for student ID ${item.studentId}`);
        continue;
      }

      bulkOperations.push({
        updateOne: {
          filter: {
            studentId: item.studentId,
            activityId,
            weekNumber: parsedWeek
          },
          update: {
            $set: {
              studentId: item.studentId,
              houseId: assignedHouseId, // captures house at the time mark was awarded
              activityId,
              weekNumber: parsedWeek,
              weekStartDate: weekStartDate ? new Date(weekStartDate) : undefined,
              weekEndDate: weekEndDate ? new Date(weekEndDate) : undefined,
              marks: numMarks,
              maxMarks,
              remarks: item.remarks ? String(item.remarks).trim() : '',
              awardedBy: req.user.id
            }
          },
          upsert: true
        }
      });
    }

    if (validationErrors.length > 0) {
      return sendError(res, 400, 'Validation errors in submitted marks', validationErrors);
    }

    if (bulkOperations.length === 0) {
      return sendError(res, 400, 'No marks were provided to save.');
    }

    const bulkResult = await WeeklyMark.bulkWrite(bulkOperations);

    return sendSuccess(res, 200, 'Weekly marks saved successfully', {
      upsertedCount: bulkResult.upsertedCount,
      modifiedCount: bulkResult.modifiedCount,
      matchedCount: bulkResult.matchedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated student's own marks across all activities and weeks
 */
const getMyMarks = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { weekNumber } = req.query;

    const filter = { studentId };
    if (weekNumber) {
      filter.weekNumber = parseInt(weekNumber, 10);
    }

    const marks = await WeeklyMark.find(filter)
      .populate('activityId', 'name description maxMarks date')
      .populate('houseId', 'name code colorCode')
      .sort({ weekNumber: 1, createdAt: 1 })
      .lean();

    // Group marks by week for clean mobile and desktop cards
    const weekMap = {};
    let totalScore = 0;
    let totalMaxScore = 0;

    marks.forEach((m) => {
      const wk = m.weekNumber;
      if (!weekMap[wk]) {
        weekMap[wk] = {
          weekNumber: wk,
          weekTotalMarks: 0,
          weekMaxMarks: 0,
          activities: []
        };
      }

      weekMap[wk].activities.push({
        markId: m._id,
        activityName: m.activityId?.name || 'Activity',
        activityDate: m.activityId?.date,
        marks: m.marks,
        maxMarks: m.maxMarks,
        remarks: m.remarks,
        houseName: m.houseId?.name
      });

      weekMap[wk].weekTotalMarks += m.marks;
      weekMap[wk].weekMaxMarks += m.maxMarks;
      totalScore += m.marks;
      totalMaxScore += m.maxMarks;
    });

    const weeklyBreakdown = Object.values(weekMap).map((w) => ({
      ...w,
      percentage: w.weekMaxMarks > 0 ? parseFloat(((w.weekTotalMarks / w.weekMaxMarks) * 100).toFixed(1)) : 0
    }));

    const overallPercentage =
      totalMaxScore > 0 ? parseFloat(((totalScore / totalMaxScore) * 100).toFixed(1)) : 0;

    return sendSuccess(res, 200, 'Student marks retrieved', {
      totalScore,
      totalMaxScore,
      overallPercentage,
      totalActivitiesRecorded: marks.length,
      weeklyBreakdown,
      allMarks: marks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get marks for a specific student (Admin or the student themselves)
 */
const getStudentMarks = async (req, res, next) => {
  try {
    const requestedStudentId = req.params.studentId;

    // Security check: If student role, must match authenticated student ID
    if (req.user.role === 'STUDENT' && req.user.id !== requestedStudentId) {
      return sendError(res, 403, 'Access denied. You can only view your own marks.');
    }

    const student = await Student.findById(requestedStudentId).populate('houseId');
    if (!student) return sendError(res, 404, 'Student not found.');

    const marks = await WeeklyMark.find({ studentId: requestedStudentId })
      .populate('activityId', 'name description maxMarks date')
      .populate('houseId', 'name code colorCode')
      .sort({ weekNumber: 1 })
      .lean();

    let totalMarks = 0;
    let totalMaxMarks = 0;
    marks.forEach((m) => {
      totalMarks += m.marks;
      totalMaxMarks += m.maxMarks;
    });

    const percentage =
      totalMaxMarks > 0 ? parseFloat(((totalMarks / totalMaxMarks) * 100).toFixed(1)) : 0;

    return sendSuccess(res, 200, 'Student performance retrieved', {
      student,
      totalMarks,
      totalMaxMarks,
      percentage,
      marks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarksForGrading,
  saveOrUpdateMarks,
  getMyMarks,
  getStudentMarks
};
