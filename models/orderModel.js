const { methodePayment } = require('../utils/enum');
const { statusOrder } = require('../utils/enum');
const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
  {
    // <creating-property-schema />
    methodePayment: {
      type: String,
      enum: Object.values(methodePayment),
    },
    status: {
      type: String,
      enum: Object.values(statusOrder),
      default: statusOrder.wating,
    },
    total: {
      type: Number,
      required: [true, 'Please enter total'],
    },
    
    // Promotion and Discount Fields
    subtotal: {
      type: Number,
      required: [true, 'Please enter subtotal'],
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    appliedPromotions: [{
      promotionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Promotion'
      },
      promoCode: String,
      discountAmount: Number,
      discountType: String
    }],
    loyaltyPointsEarned: {
      type: Number,
      default: 0
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0
    },
    isFirstPurchase: {
      type: Boolean,
      default: false
    },
    address: {
      // <creating-property-object-address />
      descreption: {
        type: String,
        required: [true, 'Please enter descreption'],
      },
      street: {
        type: String,
        required: [true, 'Please enter street'],
      },
      region: {
        type: String,
        required: [true, 'Please enter region'],
      },
    },
    cart: [
      {
        // <creating-property-object-cart />
        amount: {
          type: Number,
          required: [true, 'Please enter amount'],
        },
        price: {
          type: Number,
          required: [true, 'Please enter price'],
        },
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: [true, 'Please enter product'],
        },
      },
    ],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please enter user'],
    },
  },
  { timestamps: true, versionKey: false },
);
// <creating-function-schema />

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'cart.productId',
    select: 'name description price _id', // Include _id field
  });
  next();
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name email phone _id role', // Include _id field
  });
  next();
});
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
