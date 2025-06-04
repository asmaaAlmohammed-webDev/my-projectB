const conactController = require('../controllers/conactController');
const { protect, restrictTo } = require('./../middlewares/authMiddlewers');
const { RoleCode } = require('./../utils/enum');
const { USER, ADMIN } = RoleCode;
const express = require('express');
const router = express.Router();
router
  .route('/')
  .get(protect, restrictTo(ADMIN), conactController.getAllConact)
  .post(conactController.createConact);
router
  .route('/:id')
  .get(protect, restrictTo(ADMIN), conactController.getConact)
  .delete(protect, restrictTo(ADMIN), conactController.deleteConact);
module.exports = router;
