const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Max marks must be at least 1'],
      default: 10
    },
    date: {
      type: Date,
      default: Date.now
    },
    weekNumber: {
      type: Number,
      required: [true, 'Week number is required'],
      min: [1, 'Week number must be at least 1']
    },
    active: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Activity', activitySchema);
