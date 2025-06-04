const productController = require('../controllers/productController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();
router.use(protect);
router
  .route('/')
  .get(restrictTo(USER, ADMIN), productController.getAllProduct)
  .post(restrictTo(ADMIN), productController.createProduct);
router
  .route('/:id')
  .get(restrictTo(USER, ADMIN), productController.getProduct)
  .patch(restrictTo(ADMIN), productController.updateProduct)
  .delete(restrictTo(ADMIN), productController.deleteProduct);
module.exports = router;
