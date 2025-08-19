const express = require('express');
const publisherController = require('../controllers/publisherController');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/authMiddlewers');
const { RoleCode } = require('../utils/enum');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Restrict all routes to admin only
router.use(restrictTo(RoleCode.ADMIN));

router
  .route('/')
  .get(publisherController.getAllPublisher)
  .post(publisherController.createPublisher);

router
  .route('/active')
  .get(publisherController.getActivePublishers);

router
  .route('/:id')
  .get(publisherController.getPublisher)
  .patch(publisherController.updatePublisher)
  .delete(publisherController.deletePublisher);

router
  .route('/:id/deactivate')
  .patch(publisherController.deactivatePublisher);

router
  .route('/:id/reactivate')
  .patch(publisherController.reactivatePublisher);

module.exports = router;
