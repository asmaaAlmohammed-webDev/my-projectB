const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../utils/handlerFactory');

// Get all notifications for the logged-in user
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  const notifications = await Notification.getActiveForUser(userId, userRole);
  
  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications
    }
  });
});

// Get unread notifications count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  const unreadNotifications = await Notification.getUnreadForUser(userId, userRole);
  
  res.status(200).json({
    status: 'success',
    data: {
      unreadCount: unreadNotifications.length
    }
  });
});

// Mark notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notificationId = req.params.id;
  const userId = req.user.id;
  
  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  await notification.markAsReadByUser(userId);
  
  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read'
  });
});

// Mark all notifications as read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  const notifications = await Notification.getActiveForUser(userId, userRole);
  
  const promises = notifications.map(notification => {
    if (!notification.isReadByUser(userId)) {
      return notification.markAsReadByUser(userId);
    }
    return Promise.resolve();
  });
  
  await Promise.all(promises);
  
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

// Get login notifications (promotions and important alerts)
exports.getLoginNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  // Get unread notifications with high priority or promotions
  const notifications = await Notification.getUnreadForUser(userId, userRole);
  
  // Filter for login-relevant notifications
  const loginNotifications = notifications.filter(notification => 
    notification.priority === 'high' || 
    notification.priority === 'urgent' ||
    notification.type === 'promotion' ||
    notification.type === 'discount'
  );
  
  res.status(200).json({
    status: 'success',
    results: loginNotifications.length,
    data: {
      notifications: loginNotifications
    }
  });
});

// ADMIN ONLY - Create notification
exports.createNotification = catchAsync(async (req, res, next) => {
  const notificationData = {
    ...req.body,
    createdBy: req.user.id
  };
  
  const notification = await Notification.create(notificationData);
  
  res.status(201).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// ADMIN ONLY - Get all notifications
exports.getAllNotifications = factory.getAll(Notification);

// ADMIN ONLY - Get notification by ID
exports.getNotification = factory.getOne(Notification, { path: 'createdBy readBy.user' });

// ADMIN ONLY - Update notification
exports.updateNotification = factory.updateOne(Notification);

// ADMIN ONLY - Delete notification
exports.deleteNotification = factory.deleteOne(Notification);

// ADMIN ONLY - Get notification statistics
exports.getNotificationStats = catchAsync(async (req, res, next) => {
  const stats = await Notification.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        totalReads: { $sum: { $size: '$readBy' } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  const totalNotifications = await Notification.countDocuments();
  const activeNotifications = await Notification.countDocuments({ isActive: true });
  const expiredNotifications = await Notification.countDocuments({
    endDate: { $lt: new Date() }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      stats,
      summary: {
        total: totalNotifications,
        active: activeNotifications,
        expired: expiredNotifications
      }
    }
  });
});

// ADMIN ONLY - Bulk create notifications
exports.bulkCreateNotifications = catchAsync(async (req, res, next) => {
  const { notifications } = req.body;
  
  if (!notifications || !Array.isArray(notifications)) {
    return next(new AppError('Please provide an array of notifications', 400));
  }
  
  const notificationsWithCreator = notifications.map(notification => ({
    ...notification,
    createdBy: req.user.id
  }));
  
  const createdNotifications = await Notification.insertMany(notificationsWithCreator);
  
  res.status(201).json({
    status: 'success',
    results: createdNotifications.length,
    data: {
      notifications: createdNotifications
    }
  });
});

// ADMIN ONLY - Toggle notification status
exports.toggleNotificationStatus = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  notification.isActive = !notification.isActive;
  await notification.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});
