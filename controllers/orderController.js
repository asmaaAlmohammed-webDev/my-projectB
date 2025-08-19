const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Promotion = require('../models/promotionModel');
const AppError = require('../utils/appError');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const invoiceService = require('../services/invoiceService');
const InventoryService = require('../services/inventoryService');
const LoyaltyService = require('../services/loyaltyService');

// Create order with inventory validation and promotion handling
exports.createOrderWithInventory = catchAsync(async (req, res, next) => {
  const { cart, appliedPromotions = [], promoCode, subtotal, ...orderData } = req.body;
  const userId = req.user.id;
  
  // Get user for loyalty calculations
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Validate stock for all items in cart
  for (const item of cart) {
    const stockCheck = await InventoryService.checkStock(item.productId, item.amount);
    
    if (!stockCheck.available) {
      return next(new AppError(
        `Insufficient stock for ${stockCheck.product.name}. Available: ${stockCheck.currentStock}, Requested: ${stockCheck.requested}`,
        400
      ));
    }
  }
  
  let totalDiscountAmount = 0;
  let processedPromotions = [];
  
  // Process manual promo code if provided
  if (promoCode) {
    const promotion = await Promotion.findOne({ 
      promoCode: promoCode.toUpperCase(),
      isActive: true 
    });
    
    if (!promotion || !promotion.isCurrentlyValid) {
      return next(new AppError('Invalid or expired promo code', 400));
    }
    
    if (!promotion.isUserEligible(user, subtotal)) {
      return next(new AppError('You are not eligible for this promotion', 400));
    }
    
    const userUsage = user.hasUsedPromotion(promotion._id);
    if (userUsage >= promotion.maxUsagePerUser) {
      return next(new AppError('Promotion usage limit exceeded', 400));
    }
    
    const discountAmount = promotion.calculateDiscount(subtotal);
    totalDiscountAmount += discountAmount;
    
    processedPromotions.push({
      promotionId: promotion._id,
      promoCode: promotion.promoCode,
      discountAmount,
      discountType: promotion.discountType
    });
  }
  
  // Get auto-applicable promotions
  const autoPromotions = await LoyaltyService.getAutoPromotions(userId, subtotal);
  
  for (const autoPromo of autoPromotions) {
    // Skip if already applied manually
    const alreadyApplied = processedPromotions.some(p => 
      p.promotionId.toString() === autoPromo.promotion._id.toString()
    );
    
    if (!alreadyApplied) {
      totalDiscountAmount += autoPromo.discountAmount;
      processedPromotions.push({
        promotionId: autoPromo.promotion._id,
        promoCode: autoPromo.promotion.promoCode || 'AUTO',
        discountAmount: autoPromo.discountAmount,
        discountType: autoPromo.promotion.discountType
      });
    }
  }
  
  // Apply tier-based discount
  const tierDiscount = LoyaltyService.calculateTierDiscount(user, subtotal);
  if (tierDiscount) {
    totalDiscountAmount += tierDiscount.amount;
    processedPromotions.push({
      promotionId: null, // Tier discount doesn't have promotion ID
      promoCode: `TIER_${tierDiscount.tier.toUpperCase()}`,
      discountAmount: tierDiscount.amount,
      discountType: 'tier_discount'
    });
  }
  
  // Calculate final total
  const finalTotal = Math.max(0, subtotal - totalDiscountAmount);
  
  // Calculate loyalty points
  const tierBenefits = LoyaltyService.getTierBenefits(user.loyaltyTier);
  const loyaltyPointsEarned = Math.floor(subtotal * tierBenefits.pointsMultiplier);
  
  // Create order
  const order = await Order.create({
    ...orderData,
    cart,
    subtotal,
    discountAmount: totalDiscountAmount,
    total: finalTotal,
    appliedPromotions: processedPromotions,
    loyaltyPointsEarned,
    isFirstPurchase: !user.firstPurchaseCompleted,
    userId
  });
  
  // Reduce stock for all items
  for (const item of cart) {
    await InventoryService.reduceStock(item.productId, item.amount);
  }
  
  // Update user loyalty and promotion usage
  await LoyaltyService.updateUserAfterOrder(userId, {
    subtotal,
    appliedPromotions: processedPromotions
  });
  
  // Update promotion analytics
  for (const promo of processedPromotions) {
    if (promo.promotionId) {
      await Promotion.findByIdAndUpdate(promo.promotionId, {
        $inc: {
          currentUsageCount: 1,
          'analytics.totalUsage': 1,
          'analytics.totalRevenue': subtotal,
          'analytics.totalDiscount': promo.discountAmount
        }
      });
    }
  }
  
  res.status(201).json({
    status: 'success',
    data: {
      order,
      promotionsApplied: processedPromotions,
      totalSavings: totalDiscountAmount,
      loyaltyPointsEarned
    },
  });
});

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
