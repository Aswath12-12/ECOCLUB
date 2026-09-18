const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

router.get('/', passwordResetController.getResetRequests);
router.post('/:requestId/reset', passwordResetController.resetStudentPassword);
router.post('/:requestId/reject', passwordResetController.rejectResetRequest);

module.exports = router;
