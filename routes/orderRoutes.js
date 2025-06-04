const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();
router.use(protect);
router
  .route('/')
  .get(restrictTo(USER, ADMIN), orderController.getAllOrder)
  .post(restrictTo(USER), orderController.createOrder);
router
  .route('/:id')
  .get(restrictTo(USER, ADMIN), orderController.getOrder)
  .patch(restrictTo(ADMIN), orderController.updateOrder)
  .delete(restrictTo(ADMIN), orderController.deleteOrder);
module.exports = router;
