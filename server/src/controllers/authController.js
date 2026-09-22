const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const House = require('../models/House');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { generateToken } = require('../utils/jwtHelper');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { DEFAULT_STUDENT_PASSWORD, RESET_STATUS } = require('../utils/constants');

/**
 * Login handler for both Admin and Student
 * Admin logs in using Email + Password
 * Student logs in using Roll Number or Email + Password
 */
const login = async (req, res, next) => {
  try {
    const { identifier, email, rollNo, password } = req.body;
    const loginKey = identifier || email || rollNo;

    if (!loginKey || !password) {
      return sendError(res, 400, 'Please provide roll number / email and password.');
    }

    const cleanKey = String(loginKey).trim();

    // 1. Try finding an Admin User first (by email)
    const adminUser = await User.findOne({
      email: cleanKey.toLowerCase(),
      isActive: true
    });

    if (adminUser) {
      const isMatch = await adminUser.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 401, 'Invalid credentials.');
      }

      const token = generateToken({
        userId: adminUser._id,
        role: adminUser.role,
        name: adminUser.name,
        email: adminUser.email
      });

      return sendSuccess(res, 200, 'Admin login successful', {
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          mustChangePassword: false
        }
      });
    }

    // 2. Try finding a Student (by rollNo uppercase or email lowercase)
    const student = await Student.findOne({
      $or: [
        { rollNo: cleanKey.toUpperCase() },
        { email: cleanKey.toLowerCase() }
      ],
      isActive: true
    }).populate('houseId');

    if (student) {
      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 401, 'Invalid credentials.');
      }

      const token = generateToken({
        userId: student._id,
        role: 'STUDENT',
        rollNo: student.rollNo,
        name: student.name
      });

      return sendSuccess(res, 200, 'Student login successful', {
        token,
        user: {
          id: student._id,
          rollNo: student.rollNo,
          name: student.name,
          email: student.email,
          phone: student.phone,
          department: student.department,
          year: student.year,
          className: student.className,
          house: student.houseId,
          role: 'STUDENT',
          mustChangePassword: student.mustChangePassword
        }
      });
    }

    return sendError(res, 401, 'No active account found with the provided credentials.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      const user = await User.findById(req.user.id).select('-password');
      return sendSuccess(res, 200, 'Admin profile retrieved', { user });
    }

    const student = await Student.findById(req.user.id)
      .select('-password')
      .populate('houseId');

    return sendSuccess(res, 200, 'Student profile retrieved', {
      user: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (required on first login or voluntarily thereafter)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long.');
    }

    if (req.user.role === 'ADMIN') {
      const admin = await User.findById(req.user.id);
      if (!admin) return sendError(res, 404, 'Admin not found.');

      if (currentPassword) {
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) return sendError(res, 400, 'Current password is incorrect.');
      }

      admin.password = newPassword;
      await admin.save();

      return sendSuccess(res, 200, 'Password updated successfully.');
    }

    // Student password change
    const student = await Student.findById(req.user.id);
    if (!student) return sendError(res, 404, 'Student account not found.');

    student.password = newPassword.trim();
    student.mustChangePassword = false;
    await student.save();

    return sendSuccess(res, 200, 'Password updated successfully. You can now access your dashboard.', {
      mustChangePassword: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset (Student initiates)
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { rollNo, email } = req.body;

    if (!rollNo) {
      return sendError(res, 400, 'Roll number is required to request a password reset.');
    }

    const query = { rollNo: rollNo.toUpperCase().trim() };
    if (email) {
      query.email = email.toLowerCase().trim();
    }

    const student = await Student.findOne(query);
    if (!student) {
      return sendError(res, 404, 'No student found matching the provided roll number and details.');
    }

    // Check if an existing pending request is already waiting
    const existingPending = await PasswordResetRequest.findOne({
      studentId: student._id,
      status: RESET_STATUS.PENDING
    });

    if (existingPending) {
      return sendSuccess(
        res,
        200,
        'A password reset request is already pending for this student. The admin will process it shortly.'
      );
    }

    await PasswordResetRequest.create({
      studentId: student._id,
      rollNo: student.rollNo,
      status: RESET_STATUS.PENDING,
      requestedAt: new Date()
    });

    student.passwordResetRequested = true;
    await student.save();

    return sendSuccess(
      res,
      201,
      'Password reset request submitted successfully. Please contact your Eco Club Admin.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint to create initial admin if none exists or setup is enabled
 */
const createAdmin = async (req, res, next) => {
  try {
    if (process.env.ALLOW_ADMIN_SETUP !== 'true') {
      return sendError(res, 403, 'Admin setup endpoint is disabled.');
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.');
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 400, 'An admin account with this email already exists.');
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'ADMIN'
    });

    return sendSuccess(res, 201, 'Admin user created successfully.', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  requestPasswordReset,
  createAdmin
};
