const mongoose = require('mongoose');
const { RESET_STATUS } = require('../utils/constants');

const passwordResetRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    rollNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(RESET_STATUS),
      default: RESET_STATUS.PENDING
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

passwordResetRequestSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
