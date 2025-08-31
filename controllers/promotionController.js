const Promotion = require('../models/promotionModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../utils/handlerFactory');

// Get all active promotions for a specific user
exports.getUserPromotions = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;
  const orderAmount = parseFloat(req.query.orderAmount) || 0;
  
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Admin users should not receive customer promotions
  if (user.role === 'ADMIN') {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        promotions: [],
        userInfo: {
          loyaltyTier: user.loyaltyTier,
          loyaltyPoints: user.loyaltyPoints,
          totalSpent: user.totalSpent,
          orderCount: user.orderCount,
          firstPurchaseCompleted: user.firstPurchaseCompleted
        },
        message: 'Admin users do not receive customer promotions'
      }
    });
  }
  
  const promotions = await Promotion.getActivePromotionsForUser(user, orderAmount);
  
  res.status(200).json({
    status: 'success',
    results: promotions.length,
    data: {
      promotions,
      userInfo: {
        loyaltyTier: user.loyaltyTier,
        loyaltyPoints: user.loyaltyPoints,
        totalSpent: user.totalSpent,
        orderCount: user.orderCount,
        firstPurchaseCompleted: user.firstPurchaseCompleted
      }
    }
  });
});

// Apply promotion to order
exports.applyPromotion = catchAsync(async (req, res, next) => {
  const { promoCode, orderAmount, items } = req.body;
  const userId = req.user.id;
  
  if (!promoCode || !orderAmount) {
    return next(new AppError('Promo code and order amount are required', 400));
  }
  
  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Admin users should not be able to apply customer promotions
  if (user.role === 'ADMIN') {
    return next(new AppError('Admin users cannot apply customer promotions', 403));
  }
  
  // Find promotion by code
  const promotion = await Promotion.findOne({ 
    promoCode: promoCode.toUpperCase(),
    isActive: true 
  });
  
  if (!promotion) {
    return next(new AppError('Invalid promo code', 400));
  }
  
  // Check if user is eligible
  if (!promotion.isUserEligible(user, orderAmount)) {
    return next(new AppError('You are not eligible for this promotion', 400));
  }
  
  // Check usage limits
  const userUsageCount = user.hasUsedPromotion(promotion._id);
  if (userUsageCount >= promotion.maxUsagePerUser) {
    return next(new AppError('You have already used this promotion the maximum number of times', 400));
  }
  
  // Calculate discount
  const discountAmount = promotion.calculateDiscount(orderAmount, items);
  
  if (discountAmount <= 0) {
    return next(new AppError('No discount applicable for this order', 400));
  }
  
  const finalAmount = Math.max(0, orderAmount - discountAmount);
  
  res.status(200).json({
    status: 'success',
    data: {
      promotion: {
        id: promotion._id,
        name: promotion.name,
        promoCode: promotion.promoCode,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue
      },
      orderAmount,
      discountAmount,
      finalAmount,
      savings: discountAmount
    }
  });
});

// Get first-time buyer promotions
exports.getFirstTimeBuyerPromotions = catchAsync(async (req, res, next) => {
  // Check if user is authenticated (for logged-in users)
  if (req.user) {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Admin users should not receive customer promotions
    if (user && user.role === 'ADMIN') {
      return res.status(200).json({
        status: 'success',
        data: {
          promotions: [],
          message: 'Admin users do not receive customer promotions'
        }
      });
    }
    
    if (user && user.firstPurchaseCompleted) {
      return res.status(200).json({
        status: 'success',
        data: {
          promotions: [],
          message: 'First-time buyer promotions already used'
        }
      });
    }
  }
  
  // For guest users or users who haven't made first purchase, show first-time buyer promotions
  const promotions = await Promotion.find({
    type: 'first_time_buyer',
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  
  res.status(200).json({
    status: 'success',
    results: promotions.length,
    data: {
      promotions,
      isFirstTime: true
    }
  });
});

// Get loyalty tier promotions
exports.getLoyaltyPromotions = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Admin users should not receive customer promotions
  if (user.role === 'ADMIN') {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        promotions: [],
        userTier: user.loyaltyTier,
        loyaltyPoints: user.loyaltyPoints,
        message: 'Admin users do not receive customer promotions'
      }
    });
  }
  
  const promotions = await Promotion.find({
    type: 'loyalty_tier',
    loyaltyTierRequired: user.loyaltyTier,
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  
  res.status(200).json({
    status: 'success',
    results: promotions.length,
    data: {
      promotions,
      userTier: user.loyaltyTier,
      loyaltyPoints: user.loyaltyPoints
    }
  });
});

// Validate promotion for checkout
exports.validatePromotion = catchAsync(async (req, res, next) => {
  const { promoCode, items, subtotal } = req.body;
  const userId = req.user.id;
  
  if (!promoCode) {
    return next(new AppError('Promo code is required', 400));
  }
  
  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Admin users should not be able to validate customer promotions
  if (user.role === 'ADMIN') {
    return next(new AppError('Admin users cannot validate customer promotions', 403));
  }
  
  const promotion = await Promotion.findOne({ 
    promoCode: promoCode.toUpperCase(),
    isActive: true 
  }).populate('applicableProducts applicableCategories');
  
  if (!promotion || !promotion.isCurrentlyValid) {
    return next(new AppError('Invalid or expired promo code', 400));
  }
  
  if (!promotion.isUserEligible(user, subtotal)) {
    return next(new AppError('You are not eligible for this promotion', 400));
  }
  
  const userUsageCount = user.hasUsedPromotion(promotion._id);
  if (userUsageCount >= promotion.maxUsagePerUser) {
    return next(new AppError('Promotion usage limit exceeded', 400));
  }
  
  const discountAmount = promotion.calculateDiscount(subtotal, items);
  
  res.status(200).json({
    status: 'success',
    data: {
      valid: true,
      promotion: {
        id: promotion._id,
        name: promotion.name,
        promoCode: promotion.promoCode,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue
      },
      discountAmount,
      finalAmount: Math.max(0, subtotal - discountAmount)
    }
  });
});

// Admin: Create promotion
exports.createPromotion = catchAsync(async (req, res, next) => {
  const promotionData = {
    ...req.body,
    createdBy: req.user.id
  };
  
  const promotion = await Promotion.create(promotionData);
  
  res.status(201).json({
    status: 'success',
    data: {
      promotion
    }
  });
});

// Admin: Get all promotions with analytics
exports.getAllPromotions = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filter = {};
  
  // Apply filters - handle empty strings properly
  if (req.query.type && req.query.type.trim() !== '') {
    filter.type = req.query.type;
  }
  if (req.query.isActive !== undefined && req.query.isActive !== '' && req.query.isActive !== null) {
    filter.isActive = req.query.isActive === 'true';
  }
  if (req.query.search && req.query.search.trim() !== '') {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { promoCode: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  const total = await Promotion.countDocuments(filter);
  const promotions = await Promotion.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  res.status(200).json({
    status: 'success',
    results: promotions.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      promotions
    }
  });
});

// Admin: Get promotion analytics
exports.getPromotionAnalytics = catchAsync(async (req, res, next) => {
  const stats = await Promotion.aggregate([
    {
      $group: {
        _id: null,
        totalPromotions: { $sum: 1 },
        activePromotions: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        totalUsage: { $sum: '$analytics.totalUsage' },
        totalRevenue: { $sum: '$analytics.totalRevenue' },
        totalDiscount: { $sum: '$analytics.totalDiscount' }
      }
    }
  ]);
  
  const typeStats = await Promotion.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalUsage: { $sum: '$analytics.totalUsage' },
        totalDiscount: { $sum: '$analytics.totalDiscount' }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      overview: stats[0] || {
        totalPromotions: 0,
        activePromotions: 0,
        totalUsage: 0,
        totalRevenue: 0,
        totalDiscount: 0
      },
      byType: typeStats
    }
  });
});

// Get auto-applicable promotions for a user
exports.getAutoPromotions = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const orderAmount = parseFloat(req.query.orderAmount) || 0;
  
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Get auto-applicable promotions
  const LoyaltyService = require('../services/loyaltyService');
  const autoPromotions = await LoyaltyService.getAutoPromotions(userId, orderAmount);
  
  res.status(200).json({
    status: 'success',
    results: autoPromotions.length,
    data: {
      autoPromotions
    }
  });
});

// Standard CRUD operations
exports.getPromotion = handlerFactory.getOne(Promotion);
exports.updatePromotion = handlerFactory.updateOne(Promotion);
exports.deletePromotion = handlerFactory.deleteOne(Promotion);
