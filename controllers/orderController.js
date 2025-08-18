const Order = require('../models/orderModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const invoiceService = require('../services/invoiceService');

exports.getOrder = handlerFactory.getOne(Order);
exports.createOrder = handlerFactory.createOne(Order);
exports.updateOrder = handlerFactory.updateOne(Order);
exports.deleteOrder = handlerFactory.deleteOne(Order);
exports.getAllOrder = handlerFactory.getAll(Order);

// Get invoice HTML for order
exports.getOrderInvoiceHTML = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user.id || req.user._id;

  console.log('Debug - Invoice Request:');
  console.log('Order ID:', orderId);
  console.log('Request User:', req.user);
  console.log('User ID:', userId);

  // Find the order
  const order = await Order.findById(orderId).populate({
    path: 'cart.productId',
    model: 'Product'
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  console.log('Order found:', {
    orderId: order._id,
    orderUserId: order.userId,
    orderUserIdString: order.userId.toString()
  });

  // Check if user owns this order or is admin
  // Handle both populated and non-populated userId fields
  const orderUserIdString = order.userId._id ? order.userId._id.toString() : order.userId.toString();
  const requestUserIdString = userId.toString();
  
  console.log('Authorization check:');
  console.log('Order userId:', orderUserIdString);
  console.log('Request userId:', requestUserIdString);
  console.log('User role:', req.user.role);
  console.log('IDs match:', orderUserIdString === requestUserIdString);
  console.log('Is admin:', req.user.role === 'admin' || req.user.role === 'ADMIN');

  if (orderUserIdString !== requestUserIdString && req.user.role !== 'admin' && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized to access this order', 403));
  }

  // Get user data
  const user = await User.findById(order.userId);

  // Generate HTML invoice with i18n support
  const language = req.query.lang || 'en'; // Get language from query parameter
  const htmlContent = invoiceService.generateInvoiceHTML(order, user, language);

  res.status(200).json({
    status: 'success',
    data: {
      html: htmlContent,
      order: order
    }
  });
});
