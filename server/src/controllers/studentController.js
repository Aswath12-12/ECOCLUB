const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const House = require('../models/House');
const WeeklyMark = require('../models/WeeklyMark');
const PasswordResetRequest = require('../models/PasswordResetRequest');
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
 * Toggle student active status (Activate / Deactivate)
 */
const toggleStudentStatus = async (req, res, next) => {
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

const deleteOrDeactivateStudent = toggleStudentStatus;

/**
 * Permanently delete a student by ID and remove associated marks/requests
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }

    await Promise.all([
      WeeklyMark.deleteMany({ studentId: student._id }),
      PasswordResetRequest.deleteMany({ studentId: student._id }),
      Student.findByIdAndDelete(student._id)
    ]);

    return sendSuccess(res, 200, `Student '${student.name}' (${student.rollNo}) deleted successfully.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk delete multiple students by IDs
 */
const bulkDeleteStudents = async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return sendError(res, 400, 'Please provide a non-empty array of student IDs to delete.');
    }

    await Promise.all([
      WeeklyMark.deleteMany({ studentId: { $in: studentIds } }),
      PasswordResetRequest.deleteMany({ studentId: { $in: studentIds } }),
      Student.deleteMany({ _id: { $in: studentIds } })
    ]);

    return sendSuccess(res, 200, `Successfully deleted ${studentIds.length} student(s).`);
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

/**
 * Download sample CSV template file
 */
const downloadCSVTemplateFile = (req, res, next) => {
  try {
    const headers = 'RollNo,Name,Email,Phone,Department,Year,Class,House\n';
    const sampleData = [
      '23IT001,Arun Kumar,arun@email.com,9876543210,IT,II,A,Green House',
      '23IT002,Bala Kumar,bala@email.com,9876543211,IT,II,A,Blue House',
      '23CS003,Priya Sharma,priya@email.com,9876543212,CSE,III,B,Red House',
      '23EC004,David Wilson,david@email.com,9876543213,ECE,I,A,Yellow House',
      '23OB005,Sanjay Kumar,sanjay@email.com,9876543214,IT,IV,A,Office Bearers'
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ecoclub_students_template.csv"');
    return res.status(200).send(headers + sampleData);
  } catch (error) {
    next(error);
  }
};

/**
 * Download sample Excel (.xlsx) template file
 */
const downloadExcelTemplateFile = (req, res, next) => {
  try {
    const xlsx = require('xlsx');
    const sampleRows = [
      { RollNo: '23IT001', Name: 'Arun Kumar', Email: 'arun@email.com', Phone: '9876543210', Department: 'IT', Year: 'II', Class: 'A', House: 'Green House' },
      { RollNo: '23IT002', Name: 'Bala Kumar', Email: 'bala@email.com', Phone: '9876543211', Department: 'IT', Year: 'II', Class: 'A', House: 'Blue House' },
      { RollNo: '23CS003', Name: 'Priya Sharma', Email: 'priya@email.com', Phone: '9876543212', Department: 'CSE', Year: 'III', Class: 'B', House: 'Red House' },
      { RollNo: '23EC004', Name: 'David Wilson', Email: 'david@email.com', Phone: '9876543213', Department: 'ECE', Year: 'I', Class: 'A', House: 'Yellow House' },
      { RollNo: '23OB005', Name: 'Sanjay Kumar', Email: 'sanjay@email.com', Phone: '9876543214', Department: 'IT', Year: 'IV', Class: 'A', House: 'Office Bearers' }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleRows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

    worksheet['!cols'] = [
      { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 14 },
      { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 18 }
    ];

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ecoclub_students_template.xlsx"');
    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  toggleStudentStatus,
  deleteOrDeactivateStudent,
  deleteStudent,
  bulkDeleteStudents,
  assignHouse,
  bulkAssignHouse,
  previewCSVImport,
  previewExcelImport,
  confirmImport,
  downloadCSVTemplateFile,
  downloadExcelTemplateFile
};
