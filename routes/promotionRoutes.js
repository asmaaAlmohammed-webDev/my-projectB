const express = require('express');
const promotionController = require('../controllers/promotionController');
const { protect, restrictTo } = require('../middlewares/authMiddlewers');
const { RoleCode } = require('../utils/enum');

const router = express.Router();

// Public routes (for checking promotions during checkout and guest users)
router.post('/validate', protect, promotionController.validatePromotion);
router.get('/first-time-buyer', promotionController.getFirstTimeBuyerPromotions);

// Protected user routes
router.use(protect);

router.get('/user/:userId', promotionController.getUserPromotions);
router.get('/user', promotionController.getUserPromotions); // Uses req.user.id
router.get('/auto', promotionController.getAutoPromotions); // Get auto-applicable promotions
router.post('/apply', promotionController.applyPromotion);
router.get('/loyalty', promotionController.getLoyaltyPromotions);

// Admin routes
router.use(restrictTo(RoleCode.ADMIN));

router
  .route('/')
  .get(promotionController.getAllPromotions)
  .post(promotionController.createPromotion);

router.get('/analytics', promotionController.getPromotionAnalytics);

router
  .route('/:id')
  .get(promotionController.getPromotion)
  .patch(promotionController.updatePromotion)
  .delete(promotionController.deletePromotion);

module.exports = router;
