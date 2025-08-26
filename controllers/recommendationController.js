const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Get personalized recommendations for a user based on purchase history
 * Analyzes user's preferred categories and finds new books in those categories
 */
exports.getUserRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const lang = req.query.lang || 'en';
  
  // 1. Get user's order history (all orders except cancelled)
  const userOrders = await Order.find({ 
    userId: userId, 
    status: { $ne: 'cancelled' } // All orders except cancelled ones
  }).populate({
    path: 'cart.productId',
    populate: {
      path: 'categoryId',
      select: 'name'
    }
  }).sort({ createdAt: -1 }); // Most recent first

  if (userOrders.length < 2) {
    return res.status(200).json({
      status: 'success',
      data: {
        hasRecommendations: false,
        message: 'Insufficient purchase history for recommendations',
        recommendations: []
      }
    });
  }

  // 2. Analyze category preferences
  const categoryPurchases = {};
  const categoryRecency = {};
  
  userOrders.forEach((order, orderIndex) => {
    const recencyWeight = 1 / (orderIndex + 1); // Recent orders have higher weight
    
    order.cart.forEach(item => {
      if (item.productId && item.productId.categoryId) {
        const categoryName = item.productId.categoryId.name;
        
        if (!categoryPurchases[categoryName]) {
          categoryPurchases[categoryName] = 0;
          categoryRecency[categoryName] = 0;
        }
        
        categoryPurchases[categoryName] += item.amount;
        categoryRecency[categoryName] += recencyWeight * item.amount;
      }
    });
  });

  // 3. Find preferred category (highest weighted score)
  let preferredCategory = null;
  let maxScore = 0;
  
  Object.keys(categoryPurchases).forEach(category => {
    const score = categoryPurchases[category] + categoryRecency[category];
    if (score > maxScore && categoryPurchases[category] >= 2) { // Minimum 2 purchases
      maxScore = score;
      preferredCategory = category;
    }
  });

  if (!preferredCategory) {
    return res.status(200).json({
      status: 'success',
      data: {
        hasRecommendations: false,
        message: 'No clear category preference detected',
        recommendations: []
      }
    });
  }

  // 4. Find preferred category object
  const preferredCategoryObj = await Category.findOne({ name: preferredCategory });
  if (!preferredCategoryObj) {
    return res.status(200).json({
      status: 'success',
      data: {
        hasRecommendations: false,
        message: 'Preferred category not found',
        recommendations: []
      }
    });
  }

  // 5. Get latest 2 books in preferred category (regardless of date)
  const latestBooks = await Product.find({
    categoryId: preferredCategoryObj._id
  }).populate('categoryId', 'name').sort({ createdAt: -1 }).limit(2);

  // 6. Format response with localized descriptions
  const recommendations = latestBooks.map(book => {
    const bookObj = book.toObject();
    
    // Set localized description
    if (lang === 'ar') {
      bookObj.description = bookObj.description_ar || 'الترجمة قريباً';
    } else {
      bookObj.description = bookObj.description_en || 'Translation coming soon';
    }
    
    // Remove separate language fields
    delete bookObj.description_en;
    delete bookObj.description_ar;
    
    return bookObj;
  });

  // 7. Prepare response data
  const responseData = {
    hasRecommendations: recommendations.length > 0,
    preferredCategory: preferredCategory,
    totalPurchasesInCategory: categoryPurchases[preferredCategory],
    newBooksCount: recommendations.length,
    recommendations: recommendations,
    personalizedMessage: {
      en: `Based on your love for ${preferredCategory} books, we found ${recommendations.length} latest arrivals just for you!`,
      ar: `بناءً على حبك لكتب ${preferredCategory}، وجدنا ${recommendations.length} وصولات حديثة خصيصاً لك!`
    }
  };

  // 8. Update user's last recommendation check
  await User.findByIdAndUpdate(userId, { 
    lastRecommendationCheck: new Date(),
    lastLoginDate: new Date() // Update last login
  });

  res.status(200).json({
    status: 'success',
    data: responseData
  });
});

/**
 * Mark recommendations as seen (user dismissed the popup)
 */
exports.markRecommendationsSeen = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  await User.findByIdAndUpdate(userId, {
    lastRecommendationSeen: new Date()
  });

  res.status(200).json({
    status: 'success',
    message: 'Recommendations marked as seen'
  });
});

module.exports = {
  getUserRecommendations: exports.getUserRecommendations,
  markRecommendationsSeen: exports.markRecommendationsSeen
};
