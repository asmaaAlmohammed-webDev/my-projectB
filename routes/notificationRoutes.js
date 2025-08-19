const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddlewers');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

// Routes for regular users
router.get('/my-notifications', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/login-notifications', notificationController.getLoginNotifications);
router.patch('/mark-read/:id', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Admin only routes
router.use(authMiddleware.restrictTo('ADMIN'));

router
  .route('/')
  .get(notificationController.getAllNotifications)
  .post(notificationController.createNotification);

router.post('/bulk-create', notificationController.bulkCreateNotifications);
router.get('/stats', notificationController.getNotificationStats);

router
  .route('/:id')
  .get(notificationController.getNotification)
  .patch(notificationController.updateNotification)
  .delete(notificationController.deleteNotification);

router.patch('/:id/toggle-status', notificationController.toggleNotificationStatus);

module.exports = router;
