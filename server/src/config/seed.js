require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const House = require('../models/House');
const Student = require('../models/Student');
const Activity = require('../models/Activity');
const WeeklyMark = require('../models/WeeklyMark');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { INITIAL_HOUSES, DEFAULT_STUDENT_PASSWORD, RESET_STATUS } = require('../utils/constants');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecoclub';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at', mongoUri);

    // Drop existing database to ensure all stale indexes are purged
    console.log('[Seed] Purging existing database and collections...');
    await mongoose.connection.dropDatabase();

    // 1. Seed 5 Houses
    console.log('[Seed] Seeding 5 Houses (GREEN, BLUE, RED, YELLOW, OFFICE_BEARERS)...');
    const houses = await House.insertMany(INITIAL_HOUSES);
    const houseMap = {};
    houses.forEach((h) => {
      houseMap[h.code] = h;
    });

    // 2. Seed Development Admin
    console.log('[Seed] Creating Development Admin...');
    const adminUser = await User.create({
      name: 'EcoClub Administrator',
      email: 'admin@ecoclub.org',
      password: 'admineco26',
      role: 'ADMIN',
      isActive: true
    });

    // 3. Seed Activities across Weeks
    console.log('[Seed] Creating Activities...');
    const activities = await Activity.insertMany([
      {
        name: 'Tree Plantation Drive',
        description: 'Planting native trees around campus perimeter.',
        maxMarks: 10,
        date: new Date('2026-08-10'),
        weekNumber: 1,
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Campus Plastic Cleaning',
        description: 'Single-use plastic clearance and segregation drive.',
        maxMarks: 10,
        date: new Date('2026-08-12'),
        weekNumber: 1,
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Eco Biodiversity Quiz',
        description: 'Competitive quiz testing knowledge on wildlife and wetlands.',
        maxMarks: 10,
        date: new Date('2026-08-18'),
        weekNumber: 2,
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Organic Compost Setup',
        description: 'Installing aerobic compost bins near college canteen.',
        maxMarks: 10,
        date: new Date('2026-08-20'),
        weekNumber: 2,
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'Climate Awareness Rally',
        description: 'Campus awareness walk promoting zero emission commutes.',
        maxMarks: 10,
        date: new Date('2026-08-26'),
        weekNumber: 3,
        active: true,
        createdBy: adminUser._id
      },
      {
        name: 'E-Waste Collection Drive',
        description: 'Collection and safe recycling of discarded electronics.',
        maxMarks: 10,
        date: new Date('2026-08-28'),
        weekNumber: 3,
        active: true,
        createdBy: adminUser._id
      }
    ]);

    // 4. Hash default password for students
    const salt = await bcrypt.genSalt(10);
    const hashedDefaultPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, salt);

    // 5. Seed Students (across departments and houses)
    console.log('[Seed] Creating Students...');
    const rawStudents = [
      // GREEN HOUSE
      {
        rollNo: '23IT001',
        name: 'Arun Kumar',
        email: 'arun.it@ecoclub.org',
        phone: '9876543210',
        department: 'IT',
        year: 'II',
        className: 'A',
        houseId: houseMap.GREEN._id
      },
      {
        rollNo: '23IT002',
        name: 'Bala Chandran',
        email: 'bala.it@ecoclub.org',
        phone: '9876543211',
        department: 'IT',
        year: 'II',
        className: 'A',
        houseId: houseMap.GREEN._id
      },
      {
        rollNo: '23CS010',
        name: 'Kavitha Ramesh',
        email: 'kavitha.cs@ecoclub.org',
        phone: '9876543212',
        department: 'CSE',
        year: 'III',
        className: 'B',
        houseId: houseMap.GREEN._id
      },
      {
        rollNo: '23EC015',
        name: 'Dinesh Selvan',
        email: 'dinesh.ec@ecoclub.org',
        phone: '9876543213',
        department: 'ECE',
        year: 'I',
        className: 'A',
        houseId: houseMap.GREEN._id
      },
      {
        rollNo: '23CY001',
        name: 'Vignesh Cyber',
        email: 'vignesh.cy@ecoclub.org',
        phone: '9876543214',
        department: 'CYBER SECURITY',
        year: 'II',
        className: 'A',
        houseId: houseMap.GREEN._id
      },

      // BLUE HOUSE
      {
        rollNo: '23CS001',
        name: 'Divya Priya',
        email: 'divya.cs@ecoclub.org',
        phone: '9876543220',
        department: 'CSE',
        year: 'II',
        className: 'A',
        houseId: houseMap.BLUE._id
      },
      {
        rollNo: '23EC002',
        name: 'Gopal Krishnan',
        email: 'gopal.ec@ecoclub.org',
        phone: '9876543221',
        department: 'ECE',
        year: 'III',
        className: 'B',
        houseId: houseMap.BLUE._id
      },
      {
        rollNo: '23ME005',
        name: 'Harish Varma',
        email: 'harish.me@ecoclub.org',
        phone: '9876543222',
        department: 'MECH',
        year: 'II',
        className: 'A',
        houseId: houseMap.BLUE._id
      },
      {
        rollNo: '23IT012',
        name: 'Ishwarya Lakshmi',
        email: 'ishwarya.it@ecoclub.org',
        phone: '9876543223',
        department: 'IT',
        year: 'I',
        className: 'B',
        houseId: houseMap.BLUE._id
      },

      // RED HOUSE
      {
        rollNo: '23ME001',
        name: 'Karthik Raja',
        email: 'karthik.me@ecoclub.org',
        phone: '9876543230',
        department: 'MECH',
        year: 'III',
        className: 'A',
        houseId: houseMap.RED._id
      },
      {
        rollNo: '23IT005',
        name: 'Lavanya Mohan',
        email: 'lavanya.it@ecoclub.org',
        phone: '9876543231',
        department: 'IT',
        year: 'II',
        className: 'B',
        houseId: houseMap.RED._id
      },
      {
        rollNo: '23CS008',
        name: 'Manoj Kumar',
        email: 'manoj.cs@ecoclub.org',
        phone: '9876543232',
        department: 'CSE',
        year: 'I',
        className: 'A',
        houseId: houseMap.RED._id
      },
      {
        rollNo: '23EC009',
        name: 'Nandhini Devi',
        email: 'nandhini.ec@ecoclub.org',
        phone: '9876543233',
        department: 'ECE',
        year: 'II',
        className: 'B',
        houseId: houseMap.RED._id
      },

      // YELLOW HOUSE
      {
        rollNo: '23CS003',
        name: 'Pradeep Sharma',
        email: 'pradeep.cs@ecoclub.org',
        phone: '9876543240',
        department: 'CSE',
        year: 'II',
        className: 'A',
        houseId: houseMap.YELLOW._id
      },
      {
        rollNo: '23EC004',
        name: 'Rithanya Shree',
        email: 'rithanya.ec@ecoclub.org',
        phone: '9876543241',
        department: 'ECE',
        year: 'III',
        className: 'A',
        houseId: houseMap.YELLOW._id
      },
      {
        rollNo: '23IT009',
        name: 'Suresh Babu',
        email: 'suresh.it@ecoclub.org',
        phone: '9876543242',
        department: 'IT',
        year: 'II',
        className: 'B',
        houseId: houseMap.YELLOW._id
      },
      {
        rollNo: '23ME011',
        name: 'Tharun Prasad',
        email: 'tharun.me@ecoclub.org',
        phone: '9876543243',
        department: 'MECH',
        year: 'I',
        className: 'A',
        houseId: houseMap.YELLOW._id
      },

      // OFFICE BEARERS HOUSE
      {
        rollNo: '23OB001',
        name: 'Sanjay Kumar (President)',
        email: 'sanjay.president@ecoclub.org',
        phone: '9876543250',
        department: 'IT',
        year: 'IV',
        className: 'A',
        houseId: houseMap.OFFICE_BEARERS._id
      },
      {
        rollNo: '23OB002',
        name: 'Ananya Sharma (Secretary)',
        email: 'ananya.secretary@ecoclub.org',
        phone: '9876543251',
        department: 'CSE',
        year: 'IV',
        className: 'B',
        houseId: houseMap.OFFICE_BEARERS._id
      },
      {
        rollNo: '23OB003',
        name: 'Vikas Reddy (Treasurer)',
        email: 'vikas.treasurer@ecoclub.org',
        phone: '9876543252',
        department: 'ECE',
        year: 'III',
        className: 'A',
        houseId: houseMap.OFFICE_BEARERS._id
      },
      {
        rollNo: '23OB004',
        name: 'Pooja Hegde (Vice President)',
        email: 'pooja.vp@ecoclub.org',
        phone: '9876543253',
        department: 'MECH',
        year: 'III',
        className: 'B',
        houseId: houseMap.OFFICE_BEARERS._id
      }
    ];

    const studentDocs = rawStudents.map((st, index) => ({
      ...st,
      password: hashedDefaultPassword,
      role: 'STUDENT',
      isActive: true,
      // For demonstration, keep student 0 with mustChangePassword = true to test forced change flow
      // And student 1 with mustChangePassword = false to test direct dashboard access
      mustChangePassword: index === 0 ? true : false,
      passwordResetRequested: false
    }));

    const insertedStudents = await Student.insertMany(studentDocs);
    console.log(`[Seed] Seeded ${insertedStudents.length} students.`);

    // 6. Seed Weekly Marks across weeks
    console.log('[Seed] Seeding Weekly Marks...');
    const markList = [];

    // Week 1 - Activity 0 (Tree Plantation) & Activity 1 (Plastic Cleaning)
    const actW1A = activities[0];
    const actW1B = activities[1];

    insertedStudents.forEach((student, idx) => {
      // Award realistic marks based on index for natural score distribution
      const score1 = 8 + (idx % 3); // 8, 9, 10
      const score2 = 7 + ((idx * 2) % 4); // 7, 9, 7, 9
      markList.push({
        studentId: student._id,
        houseId: student.houseId, // preserves house when mark earned
        activityId: actW1A._id,
        weekNumber: 1,
        weekStartDate: new Date('2026-08-10'),
        weekEndDate: new Date('2026-08-16'),
        marks: score1,
        maxMarks: actW1A.maxMarks,
        remarks: 'Active participant',
        awardedBy: adminUser._id
      });

      markList.push({
        studentId: student._id,
        houseId: student.houseId,
        activityId: actW1B._id,
        weekNumber: 1,
        weekStartDate: new Date('2026-08-10'),
        weekEndDate: new Date('2026-08-16'),
        marks: score2,
        maxMarks: actW1B.maxMarks,
        remarks: 'Great teamwork',
        awardedBy: adminUser._id
      });
    });

    // Week 2 - Activity 2 (Quiz) & Activity 3 (Compost)
    const actW2A = activities[2];
    const actW2B = activities[3];

    insertedStudents.forEach((student, idx) => {
      const score1 = 6 + (idx % 5);
      const score2 = 8 + (idx % 3);
      markList.push({
        studentId: student._id,
        houseId: student.houseId,
        activityId: actW2A._id,
        weekNumber: 2,
        weekStartDate: new Date('2026-08-17'),
        weekEndDate: new Date('2026-08-23'),
        marks: score1,
        maxMarks: actW2A.maxMarks,
        remarks: 'Scored well in biodiversity rounds',
        awardedBy: adminUser._id
      });

      markList.push({
        studentId: student._id,
        houseId: student.houseId,
        activityId: actW2B._id,
        weekNumber: 2,
        weekStartDate: new Date('2026-08-17'),
        weekEndDate: new Date('2026-08-23'),
        marks: score2,
        maxMarks: actW2B.maxMarks,
        remarks: 'Helpful in compost construction',
        awardedBy: adminUser._id
      });
    });

    // Week 3 - Activity 4 (Rally) & Activity 5 (E-Waste)
    const actW3A = activities[4];
    const actW3B = activities[5];

    insertedStudents.slice(0, 12).forEach((student, idx) => {
      markList.push({
        studentId: student._id,
        houseId: student.houseId,
        activityId: actW3A._id,
        weekNumber: 3,
        weekStartDate: new Date('2026-08-24'),
        weekEndDate: new Date('2026-08-30'),
        marks: 9 + (idx % 2),
        maxMarks: actW3A.maxMarks,
        remarks: 'Carried banners and spread awareness',
        awardedBy: adminUser._id
      });

      markList.push({
        studentId: student._id,
        houseId: student.houseId,
        activityId: actW3B._id,
        weekNumber: 3,
        weekStartDate: new Date('2026-08-24'),
        weekEndDate: new Date('2026-08-30'),
        marks: 8 + (idx % 3),
        maxMarks: actW3B.maxMarks,
        remarks: 'Collected batteries and cables',
        awardedBy: adminUser._id
      });
    });

    await WeeklyMark.insertMany(markList);
    console.log(`[Seed] Seeded ${markList.length} marks across weeks 1, 2, and 3.`);

    // 7. Seed one sample pending password reset request
    const studentWithReset = insertedStudents[2]; // Kavitha
    await PasswordResetRequest.create({
      studentId: studentWithReset._id,
      rollNo: studentWithReset.rollNo,
      status: RESET_STATUS.PENDING,
      requestedAt: new Date()
    });
    studentWithReset.passwordResetRequested = true;
    await studentWithReset.save();
    console.log('[Seed] Created sample pending password reset request.');

    console.log('==================================================');
    console.log('🌱 ECOCLUB SEED COMPLETE!');
    console.log('==================================================');
    console.log('DEVELOPMENT ONLY CREDENTIALS:');
    console.log('Admin Login:');
    console.log('  Email:    admin@ecoclub.org');
    console.log('  Password: admineco26');
    console.log('');
    console.log('Student Test 1 (First Login with Default Password):');
    console.log('  Roll No:  23IT001');
    console.log('  Password: eocsxcce  (mustChangePassword = true)');
    console.log('');
    console.log('Student Test 2 (Regular Dashboard Access):');
    console.log('  Roll No:  23IT002');
    console.log('  Password: eocsxcce');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
