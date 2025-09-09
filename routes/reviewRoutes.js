const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const { addVarBody } = require('./../middlewares/dynamicMiddleware');
const express = require('express');
const router = express.Router();

// Public routes (no authentication required)
router
  .route('/product/:productId')
  .get(reviewController.getProductReviews); // Public access to read reviews

// Protected routes (authentication required)
router.use(protect);

// Generic review routes
router
  .route('/')
  .get(restrictTo(USER, ADMIN), reviewController.getAllReview)
  .post(
    restrictTo(USER),
    addVarBody('userId', 'userId'),
    reviewController.createReview,
  );

// Protected product-specific review routes
router
  .route('/product/:productId')
  .post(restrictTo(USER), reviewController.createProductReview);

router
  .route('/product/:productId/check')
  .get(restrictTo(USER, ADMIN), reviewController.checkUserProductReview);

// Generic review management routes
router
  .route('/:id')
  .get(restrictTo(USER, ADMIN), reviewController.getReview)
  .patch(restrictTo(ADMIN), reviewController.updateReview)
  .delete(restrictTo(ADMIN), reviewController.deleteReview);

module.exports = router;
