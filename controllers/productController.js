const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const InventoryService = require('../services/inventoryService');

// Custom controller for localized products
exports.getAllProductsLocalized = catchAsync(async (req, res, next) => {
  const lang = req.query.lang || 'en'; // Default to English
  const validLangs = ['en', 'ar'];
  
  if (!validLangs.includes(lang)) {
    return next(new AppError('Invalid language parameter. Use "en" or "ar"', 400));
  }

  // Get all products with populated category
  const products = await Product.find().populate({
    path: 'categoryId',
    select: 'name'
  });

  // Transform products to include localized description
  const localizedProducts = products.map(product => {
    const productObj = product.toObject();
    
    // Set localized description
    if (lang === 'ar') {
      productObj.description = productObj.description_ar || 'الترجمة قريباً'; // "Translation coming soon" in Arabic
    } else {
      productObj.description = productObj.description_en || 'Translation coming soon';
    }
    
    // Remove the separate language fields from response
    delete productObj.description_en;
    delete productObj.description_ar;
    
    return productObj;
  });

  res.status(200).json({
    status: 'success',
    results: localizedProducts.length,
    data: {
      products: localizedProducts,
    },
  });
});

// Get newest books for news bar
exports.getNewestBooks = catchAsync(async (req, res, next) => {
  const lang = req.query.lang || 'en';
  const limit = parseInt(req.query.limit) || 10;
  
  const validLangs = ['en', 'ar'];
  if (!validLangs.includes(lang)) {
    return next(new AppError('Invalid language parameter. Use "en" or "ar"', 400));
  }

  // Get newest books sorted by creation date
  const newestBooks = await Product.find()
    .populate({
      path: 'categoryId',
      select: 'name'
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(limit)
    .select('name price categoryId createdAt image description_en description_ar');

  // Transform books to include localized description and formatted data
  const localizedBooks = newestBooks.map(book => {
    const bookObj = book.toObject();
    
    // Set localized description
    if (lang === 'ar') {
      bookObj.description = bookObj.description_ar || 'الترجمة قريباً';
    } else {
      bookObj.description = bookObj.description_en || 'Translation coming soon';
    }
    
    // Remove the separate language fields from response
    delete bookObj.description_en;
    delete bookObj.description_ar;
    
    // Add formatted creation date for display
    bookObj.arrivalDate = bookObj.createdAt;
    
    return bookObj;
  });

  res.status(200).json({
    status: 'success',
    results: localizedBooks.length,
    data: {
      newestBooks: localizedBooks,
    },
  });
});

// Get inventory statistics
exports.getInventoryStats = catchAsync(async (req, res, next) => {
  const stats = await InventoryService.getInventoryStats();
  
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Get low stock products
exports.getLowStockProducts = catchAsync(async (req, res, next) => {
  const products = await InventoryService.getLowStockProducts();
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Get out of stock products
exports.getOutOfStockProducts = catchAsync(async (req, res, next) => {
  const products = await InventoryService.getOutOfStockProducts();
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Update stock for a product
exports.updateStock = catchAsync(async (req, res, next) => {
  const { stock } = req.body;
  
  if (stock < 0) {
    return next(new AppError('Stock cannot be negative', 400));
  }
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  );
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.getProduct = handlerFactory.getOne(Product);
exports.createProduct = handlerFactory.createOne(Product);
exports.updateProduct = handlerFactory.updateOne(Product);
exports.deleteProduct = handlerFactory.deleteOne(Product);
exports.getAllProduct = handlerFactory.getAll(Product);
