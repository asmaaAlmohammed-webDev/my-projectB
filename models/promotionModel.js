const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Promotion name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Promotion description is required']
  },
  
  // Promotion Type
  type: {
    type: String,
    enum: ['first_time_buyer', 'loyalty_tier', 'special_campaign', 'seasonal', 'bulk_discount'],
    required: [true, 'Promotion type is required']
  },
  
  // Discount Configuration
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  maxDiscountAmount: {
    type: Number,
    default: null // For percentage discounts, cap the maximum discount
  },
  
  // Promo Code
  promoCode: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    uppercase: true
  },
  autoApply: {
    type: Boolean,
    default: false // If true, discount applies automatically without code
  },
  
  // Conditions
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxUsagePerUser: {
    type: Number,
    default: 1
  },
  totalUsageLimit: {
    type: Number,
    default: null // Unlimited if null
  },
  currentUsageCount: {
    type: Number,
    default: 0
  },
  
  // Target Audience
  targetAudience: {
    type: String,
    enum: ['all', 'new_customers', 'returning_customers', 'loyalty_tier', 'specific_users'],
    default: 'all'
  },
  loyaltyTierRequired: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum']
    // No default value - field will be undefined if not set
  },
  specificUserIds: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  
  // Product/Category Targeting
  applicableProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  
  // Scheduling
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  analytics: {
    totalUsage: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
promotionSchema.index({ type: 1 });
promotionSchema.index({ promoCode: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ targetAudience: 1 });

// Virtual for checking if promotion is currently valid
promotionSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (this.totalUsageLimit === null || this.currentUsageCount < this.totalUsageLimit);
});

// Method to check if user is eligible for this promotion
promotionSchema.methods.isUserEligible = function(user, orderAmount = 0) {
  // Check basic conditions
  if (!this.isCurrentlyValid) return false;
  if (orderAmount < this.minOrderAmount) return false;
  
  // Check target audience
  switch (this.targetAudience) {
    case 'new_customers':
      return user.orderCount === 0;
    
    case 'returning_customers':
      return user.orderCount > 0;
    
    case 'loyalty_tier':
      return user.loyaltyTier === this.loyaltyTierRequired;
    
    case 'specific_users':
      return this.specificUserIds.includes(user._id);
    
    case 'all':
    default:
      return true;
  }
};

// Method to calculate discount amount
promotionSchema.methods.calculateDiscount = function(orderAmount, items = []) {
  if (!this.isCurrentlyValid) return 0;
  
  let discountAmount = 0;
  
  switch (this.discountType) {
    case 'percentage':
      discountAmount = (orderAmount * this.discountValue) / 100;
      if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
        discountAmount = this.maxDiscountAmount;
      }
      break;
    
    case 'fixed_amount':
      discountAmount = Math.min(this.discountValue, orderAmount);
      break;
    
    case 'free_shipping':
      // This would be handled differently in shipping calculation
      discountAmount = 0;
      break;
  }
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Static method to get active promotions for user
promotionSchema.statics.getActivePromotionsForUser = async function(user, orderAmount = 0) {
  const now = new Date();
  
  const query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { totalUsageLimit: null },
      { $expr: { $lt: ['$currentUsageCount', '$totalUsageLimit'] } }
    ]
  };
  
  const promotions = await this.find(query).populate('applicableProducts applicableCategories');
  
  return promotions.filter(promo => promo.isUserEligible(user, orderAmount));
};

// Pre-save middleware
promotionSchema.pre('save', function(next) {
  // Auto-generate promo code if not provided and not auto-apply
  if (!this.promoCode && !this.autoApply) {
    this.promoCode = this.name.toUpperCase().replace(/\s+/g, '') + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  
  // Validate dates
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  next();
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
