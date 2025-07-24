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
  .post(restrictTo(USER),addVarBody("userId","userId"), orderController.createOrder);
router
 .route('/mien')
  .get(
    restrictTo(USER),
    addQuery('userId', 'userId'),
    orderController.getAllOrder,
  );
router
  .route('/:id')
  .get(restrictTo(USER, ADMIN), orderController.getOrder)
  .patch(restrictTo(ADMIN), orderController.updateOrder)
  .delete(restrictTo(ADMIN), orderController.deleteOrder);
module.exports = router;
