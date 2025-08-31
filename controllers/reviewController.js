const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');

// Generic CRUD operations
exports.getReview = handlerFactory.getOne(Review);
exports.createReview = handlerFactory.createOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.getAllReview = handlerFactory.getAll(Review);

// Product-specific review operations
exports.getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  // Get reviews for this product
  const reviews = await Review.find({ productId })
    .sort({ createdAt: -1 }); // Most recent first
  
  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length).toFixed(1)
    : 0;
  
  // Calculate rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: reviews.filter(review => review.rate === rating).length,
    percentage: reviews.length > 0 
      ? Math.round((reviews.filter(review => review.rate === rating).length / reviews.length) * 100)
      : 0
  }));
  
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
      stats: {
        totalReviews: reviews.length,
        averageRating: parseFloat(avgRating),
        ratingDistribution
      }
    }
  });
});

exports.createProductReview = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const { message, rate } = req.body;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ userId, productId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }
  
  // Validate rating
  if (!rate || rate < 1 || rate > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }
  
  // Create review
  const review = await Review.create({
    message,
    rate: parseInt(rate),
    productId,
    userId
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.checkUserProductReview = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;
  
  const existingReview = await Review.findOne({ userId, productId });
  
  res.status(200).json({
    status: 'success',
    data: {
      hasReviewed: !!existingReview,
      review: existingReview || null
    }
  });
});
