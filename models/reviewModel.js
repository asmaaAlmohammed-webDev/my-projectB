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
    select: '-_id',
  });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
