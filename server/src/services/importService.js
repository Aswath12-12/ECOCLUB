const xlsx = require('xlsx');
const csv = require('csv-parser');
const { Readable } = require('stream');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const House = require('../models/House');
const { DEFAULT_STUDENT_PASSWORD } = require('../utils/constants');

/**
 * Parses CSV buffer into array of raw row objects
 */
const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);
    stream
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

/**
 * Parses Excel buffer into array of raw row objects
 */
const parseExcelBuffer = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Excel workbook contains no sheets.');
  }
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
};

/**
 * Normalizes keys to standard naming regardless of minor header variation
 */
const normalizeRow = (rawRow) => {
  const normalized = {};
  for (const key of Object.keys(rawRow)) {
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const val = String(rawRow[key]).trim();

    if (cleanKey === 'rollno' || cleanKey === 'rollnumber' || cleanKey === 'roll') {
      normalized.rollNo = val.toUpperCase();
    } else if (cleanKey === 'name' || cleanKey === 'studentname') {
      normalized.name = val;
    } else if (cleanKey === 'email' || cleanKey === 'emailaddress') {
      normalized.email = val.toLowerCase();
    } else if (cleanKey === 'phone' || cleanKey === 'phonenumber' || cleanKey === 'mobile') {
      normalized.phone = val;
    } else if (cleanKey === 'department' || cleanKey === 'dept') {
      normalized.department = val.toUpperCase();
    } else if (cleanKey === 'year') {
      normalized.year = val.toUpperCase();
    } else if (cleanKey === 'class' || cleanKey === 'classname' || cleanKey === 'section') {
      normalized.className = val.toUpperCase();
    } else if (cleanKey === 'house' || cleanKey === 'housename' || cleanKey === 'housecode') {
      normalized.house = val;
    }
  }
  return normalized;
};

/**
 * Validates parsed rows against database and business rules and produces preview
 */
const validateRowsForPreview = async (rawRows) => {
  const houses = await House.find().lean();
  const houseMap = new Map();

  // Map codes and names (case-insensitive) to House document
  houses.forEach((h) => {
    houseMap.set(h.code.toUpperCase(), h);
    houseMap.set(h.name.toUpperCase(), h);
    // Also match "GREEN", "GREEN HOUSE", etc.
    const shortName = h.name.replace(/house/i, '').trim().toUpperCase();
    if (shortName) {
      houseMap.set(shortName, h);
    }
  });

  // Extract roll numbers to check for existing duplicates in MongoDB
  const nonBlankRows = rawRows.filter((r) => Object.values(r).some((v) => String(v).trim().length > 0));
  const candidateRollNos = [];

  nonBlankRows.forEach((r) => {
    const norm = normalizeRow(r);
    if (norm.rollNo) candidateRollNos.push(norm.rollNo);
  });

  const existingStudents = await Student.find({ rollNo: { $in: candidateRollNos } }).select('rollNo').lean();
  const existingRollSet = new Set(existingStudents.map((s) => s.rollNo.toUpperCase()));
  const seenInFileRollSet = new Set();

  const preview = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < nonBlankRows.length; i++) {
    const raw = nonBlankRows[i];
    const norm = normalizeRow(raw);
    const rowNum = i + 1;
    const errors = [];

    // Validation 1: Roll number
    if (!norm.rollNo) {
      errors.push('Missing Roll Number');
    } else {
      if (seenInFileRollSet.has(norm.rollNo)) {
        errors.push(`Duplicate Roll Number '${norm.rollNo}' in file`);
      } else {
        seenInFileRollSet.add(norm.rollNo);
      }

      if (existingRollSet.has(norm.rollNo)) {
        errors.push(`Roll Number '${norm.rollNo}' already exists in database`);
      }
    }

    // Validation 2: Name
    if (!norm.name) {
      errors.push('Missing Student Name');
    }

    // Validation 3: Department, Year, Class
    if (!norm.department) errors.push('Missing Department');
    if (!norm.year) errors.push('Missing Year');
    if (!norm.className) errors.push('Missing Class');

    // Validation 4: House
    let matchedHouse = null;
    if (!norm.house) {
      errors.push('Missing House assignment');
    } else {
      const searchKey = norm.house.toUpperCase();
      matchedHouse = houseMap.get(searchKey);
      if (!matchedHouse) {
        errors.push(`Invalid house '${norm.house}'. Available: Green, Blue, Red, Yellow`);
      }
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }

    preview.push({
      rowNumber: rowNum,
      rollNo: norm.rollNo || '',
      name: norm.name || '',
      email: norm.email || '',
      phone: norm.phone || '',
      department: norm.department || '',
      year: norm.year || '',
      className: norm.className || '',
      houseInput: norm.house || '',
      houseId: matchedHouse ? matchedHouse._id : null,
      houseName: matchedHouse ? matchedHouse.name : '',
      isValid,
      errors
    });
  }

  return {
    totalRows: nonBlankRows.length,
    validCount,
    invalidCount,
    preview
  };
};

/**
 * Confirms and executes bulk insertion of validated students
 */
const confirmAndImportStudents = async (studentList) => {
  if (!studentList || studentList.length === 0) {
    throw new Error('No valid students provided for import.');
  }

  // Generate bcrypt hash for default password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, salt);

  const docsToInsert = studentList.map((st) => ({
    rollNo: st.rollNo.toUpperCase().trim(),
    name: st.name.trim(),
    email: st.email ? st.email.toLowerCase().trim() : '',
    phone: st.phone ? st.phone.trim() : '',
    department: st.department.toUpperCase().trim(),
    year: st.year.toUpperCase().trim(),
    className: st.className.toUpperCase().trim(),
    houseId: st.houseId,
    password: hashedPassword,
    role: 'STUDENT',
    isActive: true,
    mustChangePassword: true,
    passwordResetRequested: false
  }));

  const inserted = await Student.insertMany(docsToInsert, { ordered: false });
  return {
    importedCount: inserted.length
  };
};

module.exports = {
  parseCSVBuffer,
  parseExcelBuffer,
  validateRowsForPreview,
  confirmAndImportStudents
};
