const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

// Admin enters or edits weekly marks
router.get('/grading-sheet', authorizeRoles('ADMIN'), markController.getMarksForGrading);
router.post('/', authorizeRoles('ADMIN'), markController.saveOrUpdateMarks);

// Student views own marks
router.get('/my-marks', authorizeRoles('STUDENT'), markController.getMyMarks);

// Admin or authorized student views performance
router.get('/student/:studentId', markController.getStudentMarks);

module.exports = router;
