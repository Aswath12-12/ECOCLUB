const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateJWT);

router.get('/', houseController.getHouses);
router.put('/:id', authorizeRoles('ADMIN'), houseController.updateHouse);
router.get('/ranking', houseController.getHouseRankings);
router.get('/ranking/weekly/:weekNumber', houseController.getWeeklyHouseRankings);

module.exports = router;
