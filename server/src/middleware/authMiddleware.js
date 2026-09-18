const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User');
const Student = require('../models/Student');
const { sendError } = require('../utils/responseHandler');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No authentication token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId || !decoded.role) {
      return sendError(res, 401, 'Invalid or expired token.');
    }

    let account = null;
    if (decoded.role === 'ADMIN') {
      account = await User.findById(decoded.userId).select('-password');
    } else if (decoded.role === 'STUDENT') {
      account = await Student.findById(decoded.userId).select('-password');
    }

    if (!account) {
      return sendError(res, 401, 'Account associated with token no longer exists.');
    }

    if (!account.isActive) {
      return sendError(res, 403, 'Account has been deactivated. Please contact the administrator.');
    }

    req.user = {
      _id: account._id,
      id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      mustChangePassword: account.mustChangePassword || false,
      houseId: account.houseId || null,
      rollNo: account.rollNo || null,
      department: account.department || null,
      raw: account
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid token: ' + error.message);
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, `Access denied. Requires one of [${allowedRoles.join(', ')}] role.`);
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};
