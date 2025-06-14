const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();
router.use(protect);
router
  .route('/')
  .get(restrictTo(USER, ADMIN), reviewController.getAllReview)
  .post(restrictTo(USER), reviewController.createReview);
router
  .route('/:id')
  .get(restrictTo(USER, ADMIN), reviewController.getReview)
  .patch(restrictTo(ADMIN), reviewController.updateReview)
  .delete(restrictTo(ADMIN), reviewController.deleteReview);
module.exports = router;
