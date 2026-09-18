const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

router.get('/', activityController.getActivities);
router.post('/', authorizeRoles('ADMIN'), activityController.createActivity);
router.put('/:id', authorizeRoles('ADMIN'), activityController.updateActivity);
router.delete('/:id', authorizeRoles('ADMIN'), activityController.deleteActivity);

module.exports = router;
