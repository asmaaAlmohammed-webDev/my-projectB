const orderController = require('../controllers/orderController');
const { addVarBody, addQuery } = require('../middlewares/dynamicMiddleware');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();
router.use(protect);
router
  .route('/')
  .get(restrictTo(USER, ADMIN), orderController.getAllOrder)
  .post(restrictTo(USER, ADMIN), addVarBody("userId","userId"), orderController.createOrderWithInventory); // UPDATED: Use inventory-aware creation

// Legacy route for backward compatibility
router
  .route('/legacy')
  .post(restrictTo(USER, ADMIN), addVarBody("userId","userId"), orderController.createOrder);
router
 .route('/mien')
  .get(
    restrictTo(USER, ADMIN), // FIXED: Allow both USER and ADMIN to access their orders
    addQuery('userId', 'userId'),
    orderController.getAllOrder,
  );
router
  .route('/:id')
  .get(restrictTo(USER, ADMIN), orderController.getOrder)
  .patch(restrictTo(ADMIN), orderController.updateOrder)
  .delete(restrictTo(ADMIN), orderController.deleteOrder);

// Invoice routes
router
  .route('/:id/invoice')
  .get(restrictTo(USER, ADMIN), orderController.getOrderInvoiceHTML);

module.exports = router;
