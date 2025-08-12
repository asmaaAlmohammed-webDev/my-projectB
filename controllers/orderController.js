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

// Generate and download invoice for an order
exports.downloadInvoice = catchAsync(async (req, res, next) => {
  console.log('Invoice download requested for order ID:', req.params.id);
  
  // 1) Get the order from the database
  const order = await Order.findById(req.params.id);
  
  console.log('Order found:', order ? 'Yes' : 'No');
  if (order) {
    console.log('Order ID:', order._id);
    console.log('User ID:', order.userId?._id);
    console.log('User data:', order.userId);
    console.log('Cart items count:', order.cart?.length || 0);
    console.log('Raw userId field:', order.userId);
  }
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // If userId is populated correctly, extract the _id
  let downloadOrderUserId = null;
  if (order.userId) {
    if (order.userId._id) {
      downloadOrderUserId = order.userId._id.toString();
    } else {
      // Fallback for unpopulated userId (raw ObjectId)
      downloadOrderUserId = order.userId.toString();
    }
  }
  
  console.log('Extracted order user ID for download:', downloadOrderUserId);

  // 2) Check if user owns this order or is admin
  // Use the downloadOrderUserId we extracted above
  const requestUserId = req.user._id?.toString() || req.user.id?.toString();
  
  console.log('Permission check:');
  console.log('- User role:', req.user.role);
  console.log('- Order user ID:', downloadOrderUserId);
  console.log('- Request user ID:', requestUserId);
  console.log('- req.user._id:', req.user._id);
  console.log('- req.user.id:', req.user.id);
  
  if (req.user.role !== 'ADMIN' && downloadOrderUserId !== requestUserId) {
    return next(new AppError('You do not have permission to access this invoice', 403));
  }

  // 3) Generate the invoice PDF
  try {
    console.log('Generating invoice PDF...');
    const pdfBuffer = await invoiceService.generateInvoice(order, order.userId);
    
    // 4) Set response headers for PDF download
    const orderId = order._id || order.id;
    const filename = `invoice-${orderId ? orderId.toString().slice(-8).toUpperCase() : 'UNKNOWN'}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // 5) Send the PDF buffer - use res.end() for binary data
    res.end(pdfBuffer, 'binary');
    
    console.log('Invoice PDF sent successfully');
  } catch (error) {
    console.error('Invoice generation error:', error);
    return next(new AppError('Failed to generate invoice: ' + error.message, 500));
  }
});

// Preview invoice in browser (optional)
exports.previewInvoice = catchAsync(async (req, res, next) => {
  console.log('Invoice preview requested for order ID:', req.params.id);
  
  // 1) Get the order from the database
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'cart.productId',
      select: 'name description price'
    })
    .populate({
      path: 'userId',
      select: 'name email phone _id'
    });
  
  console.log('Order found for preview:', order ? 'Yes' : 'No');
  if (order) {
    console.log('Order details for preview - ID:', order._id, 'User:', order.userId?._id);
    console.log('Full user data:', order.userId);
    console.log('Raw userId field:', order.userId);
  }
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // If userId is populated correctly, extract the _id
  let previewOrderUserId = null;
  if (order.userId) {
    if (order.userId._id) {
      previewOrderUserId = order.userId._id.toString();
    } else {
      // Fallback for unpopulated userId (raw ObjectId)
      previewOrderUserId = order.userId.toString();
    }
  }
  
  console.log('Extracted order user ID:', previewOrderUserId);

  // 2) Check if user owns this order or is admin
  // Use the previewOrderUserId we extracted above
  const requestUserId = req.user._id?.toString() || req.user.id?.toString();
  
  console.log('Permission check for preview:');
  console.log('- User role:', req.user.role);
  console.log('- Order user ID:', previewOrderUserId);
  console.log('- Request user ID:', requestUserId);
  console.log('- req.user._id:', req.user._id);
  console.log('- req.user.id:', req.user.id);
  
  if (req.user.role !== 'ADMIN' && previewOrderUserId !== requestUserId) {
    return next(new AppError('You do not have permission to access this invoice', 403));
  }

  // 3) Generate the invoice HTML
  try {
    console.log('Generating invoice HTML preview...');
    const html = invoiceService.generateInvoiceHTML(order, order.userId);
    
    // 4) Send HTML response
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
    console.log('Invoice HTML preview sent successfully');
  } catch (error) {
    console.error('Invoice preview error:', error);
    return next(new AppError('Failed to generate invoice preview: ' + error.message, 500));
  }
});
