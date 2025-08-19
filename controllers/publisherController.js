const Publisher = require('../models/publisherModel');
const AppError = require('../utils/appError');
const handlerFactory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getPublisher = handlerFactory.getOne(Publisher);
exports.createPublisher = handlerFactory.createOne(Publisher);
exports.updatePublisher = handlerFactory.updateOne(Publisher);
exports.deletePublisher = handlerFactory.deleteOne(Publisher);
exports.getAllPublisher = handlerFactory.getAll(Publisher);

// Get active publishers only
exports.getActivePublishers = catchAsync(async (req, res, next) => {
  const publishers = await Publisher.find({ isActive: true });

  res.status(200).json({
    status: 'success',
    results: publishers.length,
    data: {
      publishers,
    },
  });
});

// Deactivate publisher instead of deleting
exports.deactivatePublisher = catchAsync(async (req, res, next) => {
  const publisher = await Publisher.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true, runValidators: true }
  );

  if (!publisher) {
    return next(new AppError('No publisher found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      publisher,
    },
  });
});

// Reactivate publisher
exports.reactivatePublisher = catchAsync(async (req, res, next) => {
  const publisher = await Publisher.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true, runValidators: true }
  );

  if (!publisher) {
    return next(new AppError('No publisher found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      publisher,
    },
  });
});
