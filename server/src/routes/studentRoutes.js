const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public sample template downloads (native browser downloads with Content-Disposition)
router.get('/import/template/csv', studentController.downloadCSVTemplateFile);
router.get('/import/template/excel', studentController.downloadExcelTemplateFile);

// All subsequent routes require authentication
router.use(authenticateJWT);

// Admin-only endpoints
router.get('/', authorizeRoles('ADMIN'), studentController.getStudents);
router.post('/', authorizeRoles('ADMIN'), studentController.createStudent);
router.put('/:id', authorizeRoles('ADMIN'), studentController.updateStudent);
router.patch('/:id/status', authorizeRoles('ADMIN'), studentController.toggleStudentStatus);
router.delete('/:id', authorizeRoles('ADMIN'), studentController.deleteStudent);
router.patch('/:id/house', authorizeRoles('ADMIN'), studentController.assignHouse);
router.post('/bulk-assign-house', authorizeRoles('ADMIN'), studentController.bulkAssignHouse);
router.post('/bulk-delete', authorizeRoles('ADMIN'), studentController.bulkDeleteStudents);

// CSV & Excel bulk imports
router.post('/import/csv', authorizeRoles('ADMIN'), upload.single('file'), studentController.previewCSVImport);
router.post('/import/excel', authorizeRoles('ADMIN'), upload.single('file'), studentController.previewExcelImport);
router.post('/import/confirm', authorizeRoles('ADMIN'), studentController.confirmImport);

// Single student fetch (Admin or student themselves)
router.get('/:id', studentController.getStudentById);

module.exports = router;
