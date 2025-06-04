const Product = require('./productModel');
const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema(
  {
    // <creating-property-schema />
    photo: {
      type: String,
      required: [true, 'Please enter photo'],
    },
    descrption: {
      type: String,
      required: [true, 'Please enter descrption'],
    },
    name: {
      type: String,
      required: [true, 'Please enter name'],
    },
  },
  { timestamps: true, versionKey: false },
);
// <creating-function-schema />
categorySchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      await Product.deleteMany({ categoryId: doc._id });
    } catch (error) {
      return next(new AppError('error deleting productss', 500));
    }
  }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
