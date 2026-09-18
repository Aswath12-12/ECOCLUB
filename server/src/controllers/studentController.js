const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const House = require('../models/House');
const { DEFAULT_STUDENT_PASSWORD } = require('../utils/constants');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const {
  parseCSVBuffer,
  parseExcelBuffer,
  validateRowsForPreview,
  confirmAndImportStudents
} = require('../services/importService');

/**
 * Get paginated students with search and filters
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department,
      year,
      className,
      houseId,
      isActive
    } = req.query;

    const query = {};

    // Search by rollNo, name, or email
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { rollNo: searchRegex },
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // Exact filters
    if (department) query.department = department.toUpperCase();
    if (year) query.year = year.toUpperCase();
    if (className) query.className = className.toUpperCase();
    if (houseId) query.houseId = houseId;
    if (typeof isActive !== 'undefined' && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('houseId', 'name code colorCode')
        .sort({ rollNo: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Student.countDocuments(query)
    ]);

    return sendSuccess(res, 200, 'Students fetched successfully', {
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by ID
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('houseId');
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }
    return sendSuccess(res, 200, 'Student details retrieved', { student });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new student (Admin only)
 * Sets default password to eocsxcce and mustChangePassword = true
 */
const createStudent = async (req, res, next) => {
  try {
    const { rollNo, name, email, phone, department, year, className, houseId } = req.body;

    if (!rollNo || !name || !department || !year || !className || !houseId) {
      return sendError(res, 400, 'Roll number, name, department, year, class, and house are required.');
    }

    // Check unique rollNo
    const existing = await Student.findOne({ rollNo: rollNo.toUpperCase().trim() });
    if (existing) {
      return sendError(res, 400, `Student with Roll Number '${rollNo}' already exists.`);
    }

    // Verify House exists
    const house = await House.findById(houseId);
    if (!house) {
      return sendError(res, 400, 'Selected house does not exist.');
    }

    // Hash default password eocsxcce
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, salt);

    const student = await Student.create({
      rollNo: rollNo.toUpperCase().trim(),
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : '',
      phone: phone ? phone.trim() : '',
      department: department.toUpperCase().trim(),
      year: year.toUpperCase().trim(),
      className: className.toUpperCase().trim(),
      houseId,
      password: hashedPassword,
      role: 'STUDENT',
      isActive: true,
      mustChangePassword: true,
      passwordResetRequested: false
    });

    const populatedStudent = await Student.findById(student._id).populate('houseId');

    return sendSuccess(res, 201, 'Student created successfully with default password.', {
      student: populatedStudent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student information
 */
const updateStudent = async (req, res, next) => {
  try {
    const { name, email, phone, department, year, className, houseId, isActive } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }

    if (houseId) {
      const house = await House.findById(houseId);
      if (!house) return sendError(res, 400, 'Invalid house ID.');
      student.houseId = houseId;
    }

    if (name) student.name = name.trim();
    if (typeof email !== 'undefined') student.email = email.toLowerCase().trim();
    if (typeof phone !== 'undefined') student.phone = phone.trim();
    if (department) student.department = department.toUpperCase().trim();
    if (year) student.year = year.toUpperCase().trim();
    if (className) student.className = className.toUpperCase().trim();
    if (typeof isActive === 'boolean') student.isActive = isActive;

    await student.save();
    const updated = await Student.findById(student._id).populate('houseId');

    return sendSuccess(res, 200, 'Student updated successfully', { student: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate or soft delete student
 */
const deleteOrDeactivateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }

    student.isActive = !student.isActive;
    await student.save();

    return sendSuccess(
      res,
      200,
      `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`,
      { student }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Assign single student to a house
 */
const assignHouse = async (req, res, next) => {
  try {
    const { houseId } = req.body;
    if (!houseId) return sendError(res, 400, 'House ID is required.');

    const house = await House.findById(houseId);
    if (!house) return sendError(res, 404, 'Target house not found.');

    const student = await Student.findById(req.params.id);
    if (!student) return sendError(res, 404, 'Student not found.');

    student.houseId = houseId;
    await student.save();

    const populated = await Student.findById(student._id).populate('houseId');
    return sendSuccess(res, 200, `Student assigned to ${house.name} successfully`, {
      student: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assign multiple students to a house
 */
const bulkAssignHouse = async (req, res, next) => {
  try {
    const { studentIds, houseId } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return sendError(res, 400, 'Please provide a non-empty array of student IDs.');
    }
    if (!houseId) {
      return sendError(res, 400, 'House ID is required.');
    }

    const house = await House.findById(houseId);
    if (!house) {
      return sendError(res, 404, 'Target house not found.');
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { houseId } }
    );

    return sendSuccess(
      res,
      200,
      `Successfully assigned ${result.modifiedCount} students to ${house.name}.`,
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Preview CSV file upload before inserting
 */
const previewCSVImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload a CSV file.');
    }

    const rawRows = await parseCSVBuffer(req.file.buffer);
    if (!rawRows || rawRows.length === 0) {
      return sendError(res, 400, 'Uploaded CSV file contains no records.');
    }

    const previewData = await validateRowsForPreview(rawRows);
    return sendSuccess(res, 200, 'CSV preview generated successfully', previewData);
  } catch (error) {
    next(error);
  }
};

/**
 * Preview Excel file upload before inserting
 */
const previewExcelImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload an Excel file (.xlsx, .xls).');
    }

    const rawRows = parseExcelBuffer(req.file.buffer);
    if (!rawRows || rawRows.length === 0) {
      return sendError(res, 400, 'Uploaded Excel file contains no records.');
    }

    const previewData = await validateRowsForPreview(rawRows);
    return sendSuccess(res, 200, 'Excel preview generated successfully', previewData);
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm and commit validated student import
 */
const confirmImport = async (req, res, next) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      return sendError(res, 400, 'No valid student records provided to import.');
    }

    const result = await confirmAndImportStudents(students);
    return sendSuccess(res, 201, `Successfully imported ${result.importedCount} students.`, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteOrDeactivateStudent,
  assignHouse,
  bulkAssignHouse,
  previewCSVImport,
  previewExcelImport,
  confirmImport
};
