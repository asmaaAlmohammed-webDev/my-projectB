const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const { protect } = require('../middlewares/authMiddlewers');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get personalized recommendations for logged-in user
router.get('/my-recommendations', recommendationController.getUserRecommendations);

// Mark recommendations as seen (when user dismisses popup)
router.post('/mark-seen', recommendationController.markRecommendationsSeen);

module.exports = router;
