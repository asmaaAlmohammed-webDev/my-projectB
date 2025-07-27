const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();

// CHANGED: Make category browsing public for e-commerce functionality
// Users should be able to view categories without being logged in
router
  .route('/')
  .get(categoryController.getAllCategory) // CHANGED: Removed authentication requirement for browsing
  .post(protect, restrictTo(ADMIN), categoryController.createCategory); // Keep admin protection for creation

router
  .route('/:id')
  .get(categoryController.getCategory) // CHANGED: Removed authentication requirement for viewing single category
  .patch(protect, restrictTo(ADMIN), categoryController.updateCategory) // Keep admin protection
  .delete(protect, restrictTo(ADMIN), categoryController.deleteCategory); // Keep admin protection

module.exports = router;
