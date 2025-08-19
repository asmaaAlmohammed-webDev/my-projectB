const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter publisher name'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter publisher email'],
      unique: true,
      validate: {
        validator: function(email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    contactPerson: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Track order history with this publisher
    lastOrderDate: {
      type: Date,
      required: false,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

const Publisher = mongoose.model('Publisher', publisherSchema);
module.exports = Publisher;
