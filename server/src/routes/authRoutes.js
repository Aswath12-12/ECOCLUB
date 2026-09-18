const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', authenticateJWT, authController.getMe);
router.post('/change-password', authenticateJWT, authController.changePassword);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/create-admin', authController.createAdmin);

module.exports = router;
