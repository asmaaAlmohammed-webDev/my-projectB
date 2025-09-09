const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    // <creating-property-schema />
  // author field removed; use author_en and author_ar only
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Please enter category'],
    },
    author_en: {
      type: String,
      required: [true, 'A product must have an English author name']
    },
    author_ar: {
      type: String,
      required: [true, 'A product must have an Arabic author name']
    },
    image: {
      type: String,
      required: [true, 'Please enter price'],
    },

    price: {
      type: Number,
      required: [true, 'Please enter price'],
    },
    description_en: {
      type: String,
      required: [true, 'Please enter English description'],
    },
    description_ar: {
      type: String,
      required: [true, 'Please enter Arabic description'],
    },
    name: {
      type: String,
      required: [true, 'Please enter name'],
      unique: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please enter stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Please enter minimum stock level'],
      min: [1, 'Minimum stock level must be at least 1'],
      default: 5,
    },
    publisherEmail: {
      type: String,
      required: [false, 'Publisher email for reorder notifications'],
      validate: {
        validator: function(email) {
          if (!email) return true; // Allow empty
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please enter a valid email address'
      }
    },
  },
  { timestamps: true, versionKey: false },
);
// <creating-function-schema />
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'categoryId',
    select: '-_id',
  });
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
