const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/house-performance', reportController.getHousePerformance);
router.get('/student-performance', reportController.getStudentPerformance);

module.exports = router;
