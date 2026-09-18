const bcrypt = require('bcryptjs');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const Student = require('../models/Student');
const { DEFAULT_STUDENT_PASSWORD, RESET_STATUS } = require('../utils/constants');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get all password reset requests (Admin only)
 */
const getResetRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status.toUpperCase();
    }

    const requests = await PasswordResetRequest.find(filter)
      .populate({
        path: 'studentId',
        select: 'rollNo name department year className houseId email phone',
        populate: { path: 'houseId', select: 'name code' }
      })
      .populate('processedBy', 'name email')
      .sort({ requestedAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Password reset requests retrieved', { requests });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset student password to default password (eocsxcce)
 * Admin action
 */
const resetStudentPassword = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const resetReq = await PasswordResetRequest.findById(requestId);
    if (!resetReq) {
      return sendError(res, 404, 'Password reset request not found.');
    }

    if (resetReq.status !== RESET_STATUS.PENDING) {
      return sendError(res, 400, `Request is already ${resetReq.status.toLowerCase()}.`);
    }

    const student = await Student.findById(resetReq.studentId);
    if (!student) {
      return sendError(res, 404, 'Associated student account not found.');
    }

    // Hash default password 'eocsxcce'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, salt);

    student.password = hashedPassword;
    student.mustChangePassword = true;
    student.passwordResetRequested = false;
    await student.save();

    resetReq.status = RESET_STATUS.COMPLETED;
    resetReq.processedBy = req.user.id;
    resetReq.processedAt = new Date();
    await resetReq.save();

    return sendSuccess(
      res,
      200,
      'Password reset successfully. Student must use the default password (eocsxcce) and change it after login.',
      {
        student: {
          id: student._id,
          rollNo: student.rollNo,
          name: student.name,
          mustChangePassword: student.mustChangePassword
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a reset request (Admin action)
 */
const rejectResetRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;

    const resetReq = await PasswordResetRequest.findById(requestId);
    if (!resetReq) {
      return sendError(res, 404, 'Password reset request not found.');
    }

    const student = await Student.findById(resetReq.studentId);
    if (student) {
      student.passwordResetRequested = false;
      await student.save();
    }

    resetReq.status = RESET_STATUS.REJECTED;
    resetReq.processedBy = req.user.id;
    resetReq.processedAt = new Date();
    resetReq.notes = notes || 'Rejected by administrator.';
    await resetReq.save();

    return sendSuccess(res, 200, 'Password reset request rejected.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResetRequests,
  resetStudentPassword,
  rejectResetRequest
};
