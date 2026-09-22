const Activity = require('../models/Activity');
const WeeklyMark = require('../models/WeeklyMark');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get all activities (optional filter by weekNumber)
 */
const getActivities = async (req, res, next) => {
  try {
    const { weekNumber, active } = req.query;
    const filter = {};

    if (weekNumber) {
      filter.weekNumber = parseInt(weekNumber, 10);
    }
    if (typeof active !== 'undefined') {
      filter.active = active === 'true';
    }

    const activities = await Activity.find(filter)
      .sort({ weekNumber: 1, date: -1 })
      .lean();

    return sendSuccess(res, 200, 'Activities retrieved successfully', { activities });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new weekly activity
 */
const createActivity = async (req, res, next) => {
  try {
    const { name, description, maxMarks, date, weekNumber } = req.body;

    if (!name || !weekNumber) {
      return sendError(res, 400, 'Activity name and week number are required.');
    }

    const activity = await Activity.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      maxMarks: maxMarks ? Math.max(1, parseInt(maxMarks, 10)) : 10,
      date: date ? new Date(date) : new Date(),
      weekNumber: parseInt(weekNumber, 10),
      createdBy: req.user.id
    });

    return sendSuccess(res, 201, 'Activity created successfully', { activity });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing activity
 */
const updateActivity = async (req, res, next) => {
  try {
    const { name, description, maxMarks, date, weekNumber, active } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return sendError(res, 404, 'Activity not found.');
    }

    if (name) activity.name = name.trim();
    if (typeof description !== 'undefined') activity.description = description.trim();
    if (maxMarks) activity.maxMarks = Math.max(1, parseInt(maxMarks, 10));
    if (date) activity.date = new Date(date);
    if (weekNumber) activity.weekNumber = parseInt(weekNumber, 10);
    if (typeof active === 'boolean') activity.active = active;

    await activity.save();

    return sendSuccess(res, 200, 'Activity updated successfully', { activity });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete activity (and remove associated weekly marks)
 */
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return sendError(res, 404, 'Activity not found.');
    }

    await Promise.all([
      Activity.findByIdAndDelete(req.params.id),
      WeeklyMark.deleteMany({ activityId: req.params.id })
    ]);

    return sendSuccess(res, 200, 'Activity deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
};
