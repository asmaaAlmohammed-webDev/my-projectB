const productController = require('../controllers/productController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();

// CHANGED: Make product browsing public for e-commerce functionality
// Users should be able to view products without being logged in
router
  .route('/')
  .get(productController.getAllProduct) // CHANGED: Removed authentication requirement for browsing
  .post(protect, restrictTo(ADMIN), productController.createProduct); // Keep admin protection for creation

router
  .route('/:id')
  .get(productController.getProduct) // CHANGED: Removed authentication requirement for viewing single product
  .patch(protect, restrictTo(ADMIN), productController.updateProduct) // Keep admin protection
  .delete(protect, restrictTo(ADMIN), productController.deleteProduct); // Keep admin protection

module.exports = router;
