const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema(
  {
    // <creating-property-schema />
    message: {
      type: String,
      required: [true, 'Please enter message'],
    },
    rate: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please enter rate'],
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Please enter product'],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please enter user'],
    },
  },
  { timestamps: true, versionKey: false },
);
// <creating-function-schema />

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name email photo',
  }).populate({
    path: 'productId',
    select: 'name price image',
  });
  next();
});

// Create compound index to prevent duplicate reviews from same user for same product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
