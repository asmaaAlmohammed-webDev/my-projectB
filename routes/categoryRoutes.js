const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();
router.use(protect);
router
  .route('/')
  .get(restrictTo(USER, ADMIN), categoryController.getAllCategory)
  .post(restrictTo(ADMIN), categoryController.createCategory);
router
  .route('/:id')
  .get(restrictTo(USER, ADMIN), categoryController.getCategory)
  .patch(restrictTo(ADMIN), categoryController.updateCategory)
  .delete(restrictTo(ADMIN), categoryController.deleteCategory);
module.exports = router;
