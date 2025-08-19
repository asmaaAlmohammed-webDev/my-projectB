const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { RoleCode } = require('../utils/enum');
const userSchema = new mongoose.Schema(
  {
    // <creating-property-schema />
    isVerified: {
      type: Boolean,
    },
    phone: {
      type: String,
      required: [true, 'Please enter phone'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: Object.values(RoleCode),
      default: 'USER',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    
    // Loyalty Program Fields
    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    orderCount: {
      type: Number,
      default: 0
    },
    
    // Promotion Usage Tracking
    usedPromotions: [{
      promotionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Promotion'
      },
      usageCount: {
        type: Number,
        default: 0
      },
      lastUsed: {
        type: Date,
        default: Date.now
      }
    }],
    
    // First Purchase Tracking
    firstPurchaseCompleted: {
      type: Boolean,
      default: false
    },
    firstPurchaseDate: {
      type: Date,
      default: null
    },
  },
  { versionKey: false },
);
// <creating-function-schema />

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Loyalty Program Methods
userSchema.methods.calculateLoyaltyTier = function() {
  const spent = this.totalSpent;
  
  if (spent >= 1000) return 'platinum';
  if (spent >= 500) return 'gold';
  if (spent >= 200) return 'silver';
  return 'bronze';
};

userSchema.methods.updateLoyaltyTier = function() {
  const newTier = this.calculateLoyaltyTier();
  const oldTier = this.loyaltyTier;
  
  if (newTier !== oldTier) {
    this.loyaltyTier = newTier;
    return { upgraded: true, oldTier, newTier };
  }
  
  return { upgraded: false, tier: this.loyaltyTier };
};

userSchema.methods.addLoyaltyPoints = function(orderAmount) {
  // 1 point per dollar spent
  const pointsToAdd = Math.floor(orderAmount);
  this.loyaltyPoints += pointsToAdd;
  return pointsToAdd;
};

userSchema.methods.hasUsedPromotion = function(promotionId) {
  const usage = this.usedPromotions.find(up => up.promotionId.toString() === promotionId.toString());
  return usage ? usage.usageCount : 0;
};

userSchema.methods.addPromotionUsage = function(promotionId) {
  const existingUsage = this.usedPromotions.find(up => up.promotionId.toString() === promotionId.toString());
  
  if (existingUsage) {
    existingUsage.usageCount += 1;
    existingUsage.lastUsed = new Date();
  } else {
    this.usedPromotions.push({
      promotionId,
      usageCount: 1,
      lastUsed: new Date()
    });
  }
};
const User = mongoose.model('User', userSchema);
module.exports = User;
