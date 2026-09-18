const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(authenticateJWT);

// Admin-only endpoints
router.get('/', authorizeRoles('ADMIN'), studentController.getStudents);
router.post('/', authorizeRoles('ADMIN'), studentController.createStudent);
router.put('/:id', authorizeRoles('ADMIN'), studentController.updateStudent);
router.delete('/:id', authorizeRoles('ADMIN'), studentController.deleteOrDeactivateStudent);
router.patch('/:id/house', authorizeRoles('ADMIN'), studentController.assignHouse);
router.post('/bulk-assign-house', authorizeRoles('ADMIN'), studentController.bulkAssignHouse);

// CSV & Excel bulk imports
router.post('/import/csv', authorizeRoles('ADMIN'), upload.single('file'), studentController.previewCSVImport);
router.post('/import/excel', authorizeRoles('ADMIN'), upload.single('file'), studentController.previewExcelImport);
router.post('/import/confirm', authorizeRoles('ADMIN'), studentController.confirmImport);

// Single student fetch (Admin or student themselves)
router.get('/:id', studentController.getStudentById);

module.exports = router;
