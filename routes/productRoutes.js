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
  .get(productController.getAllProductsLocalized) // CHANGED: Use localized controller for i18n support
  .post(protect, restrictTo(ADMIN), productController.createProduct); // Keep admin protection for creation

// Add legacy route for backward compatibility
router
  .route('/all')
  .get(productController.getAllProduct); // Original non-localized endpoint

// Inventory management routes
router
  .route('/inventory/stats')
  .get(protect, restrictTo(ADMIN), productController.getInventoryStats);

router
  .route('/inventory/low-stock')
  .get(protect, restrictTo(ADMIN), productController.getLowStockProducts);

router
  .route('/inventory/out-of-stock')
  .get(protect, restrictTo(ADMIN), productController.getOutOfStockProducts);

router
  .route('/:id/stock')
  .patch(protect, restrictTo(ADMIN), productController.updateStock);

router
  .route('/:id')
  .get(productController.getProduct) // CHANGED: Removed authentication requirement for viewing single product
  .patch(protect, restrictTo(ADMIN), productController.updateProduct) // Keep admin protection
  .delete(protect, restrictTo(ADMIN), productController.deleteProduct); // Keep admin protection

module.exports = router;
