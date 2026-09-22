const mongoose = require('mongoose');

const weeklyMarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: false
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: [true, 'House reference is required']
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: [true, 'Activity reference is required']
    },
    weekNumber: {
      type: Number,
      required: [true, 'Week number is required'],
      min: [1, 'Week number must be positive']
    },
    weekStartDate: {
      type: Date
    },
    weekEndDate: {
      type: Date
    },
    marks: {
      type: Number,
      required: [true, 'Marks value is required'],
      min: [0, 'Marks cannot be negative']
    },
    maxMarks: {
      type: Number,
      required: [true, 'Max marks is required'],
      default: 10
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate mark records for: student + activity + week
weeklyMarkSchema.index(
  { studentId: 1, activityId: 1, weekNumber: 1 },
  { unique: true, partialFilterExpression: { studentId: { $type: 'objectId' } } }
);
weeklyMarkSchema.index(
  { houseId: 1, activityId: 1, weekNumber: 1, studentId: 1 },
  { unique: true }
);
weeklyMarkSchema.index({ houseId: 1, weekNumber: 1 });

module.exports = mongoose.model('WeeklyMark', weeklyMarkSchema);
