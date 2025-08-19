const User = require('../models/userModel');
const Promotion = require('../models/promotionModel');
const Order = require('../models/orderModel');
const AppError = require('../utils/appError');

class LoyaltyService {
  // Calculate loyalty tier thresholds
  static getTierThresholds() {
    return {
      bronze: { min: 0, max: 199, discount: 0 },
      silver: { min: 200, max: 499, discount: 5 },
      gold: { min: 500, max: 999, discount: 10 },
      platinum: { min: 1000, max: Infinity, discount: 15 }
    };
  }
  
  // Get tier benefits
  static getTierBenefits(tier) {
    const benefits = {
      bronze: {
        pointsMultiplier: 1,
        discount: 0,
        freeShippingThreshold: 50,
        earlyAccess: false
      },
      silver: {
        pointsMultiplier: 1.2,
        discount: 5,
        freeShippingThreshold: 40,
        earlyAccess: false
      },
      gold: {
        pointsMultiplier: 1.5,
        discount: 10,
        freeShippingThreshold: 30,
        earlyAccess: true
      },
      platinum: {
        pointsMultiplier: 2,
        discount: 15,
        freeShippingThreshold: 0,
        earlyAccess: true
      }
    };
    
    return benefits[tier] || benefits.bronze;
  }
  
  // Update user after order completion
  static async updateUserAfterOrder(userId, orderData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const { subtotal, appliedPromotions = [] } = orderData;
    
    // Update spending and order count
    user.totalSpent += subtotal;
    user.orderCount += 1;
    
    // Mark first purchase if applicable
    if (!user.firstPurchaseCompleted) {
      user.firstPurchaseCompleted = true;
      user.firstPurchaseDate = new Date();
    }
    
    // Add loyalty points based on tier
    const tierBenefits = this.getTierBenefits(user.loyaltyTier);
    const pointsEarned = Math.floor(subtotal * tierBenefits.pointsMultiplier);
    user.loyaltyPoints += pointsEarned;
    
    // Update loyalty tier
    const tierUpdate = user.updateLoyaltyTier();
    
    // Track promotion usage
    appliedPromotions.forEach(promo => {
      user.addPromotionUsage(promo.promotionId);
    });
    
    await user.save();
    
    return {
      user,
      pointsEarned,
      tierUpdate
    };
  }
  
  // Get auto-applicable promotions for user
  static async getAutoPromotions(userId, orderAmount = 0) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const autoPromotions = await Promotion.find({
      autoApply: true,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      minOrderAmount: { $lte: orderAmount }
    });
    
    const applicablePromotions = [];
    
    for (const promotion of autoPromotions) {
      if (promotion.isUserEligible(user, orderAmount)) {
        const userUsage = user.hasUsedPromotion(promotion._id);
        if (userUsage < promotion.maxUsagePerUser) {
          applicablePromotions.push({
            promotion,
            discountAmount: promotion.calculateDiscount(orderAmount)
          });
        }
      }
    }
    
    // Sort by discount amount (highest first)
    return applicablePromotions.sort((a, b) => b.discountAmount - a.discountAmount);
  }
  
  // Calculate tier-based automatic discount
  static calculateTierDiscount(user, orderAmount) {
    const tierBenefits = this.getTierBenefits(user.loyaltyTier);
    
    if (tierBenefits.discount > 0) {
      return {
        type: 'tier_discount',
        percentage: tierBenefits.discount,
        amount: (orderAmount * tierBenefits.discount) / 100,
        tier: user.loyaltyTier
      };
    }
    
    return null;
  }
  
  // Get user's promotion eligibility
  static async getUserPromotionEligibility(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const eligibility = {
      isFirstTimeBuyer: !user.firstPurchaseCompleted,
      loyaltyTier: user.loyaltyTier,
      loyaltyPoints: user.loyaltyPoints,
      totalSpent: user.totalSpent,
      orderCount: user.orderCount,
      tierBenefits: this.getTierBenefits(user.loyaltyTier),
      nextTierThreshold: this.getNextTierThreshold(user.totalSpent)
    };
    
    return eligibility;
  }
  
  // Get next tier threshold
  static getNextTierThreshold(currentSpent) {
    const thresholds = this.getTierThresholds();
    
    if (currentSpent < thresholds.silver.min) {
      return {
        tier: 'silver',
        threshold: thresholds.silver.min,
        remaining: thresholds.silver.min - currentSpent
      };
    } else if (currentSpent < thresholds.gold.min) {
      return {
        tier: 'gold',
        threshold: thresholds.gold.min,
        remaining: thresholds.gold.min - currentSpent
      };
    } else if (currentSpent < thresholds.platinum.min) {
      return {
        tier: 'platinum',
        threshold: thresholds.platinum.min,
        remaining: thresholds.platinum.min - currentSpent
      };
    }
    
    return null; // Already at highest tier
  }
  
  // Create first-time buyer promotion
  static async createFirstTimeBuyerPromotion() {
    const existingPromo = await Promotion.findOne({
      type: 'first_time_buyer',
      isActive: true
    });
    
    if (existingPromo) {
      return existingPromo;
    }
    
    return await Promotion.create({
      name: 'First Time Buyer Discount',
      description: 'Welcome! Get 15% off your first order',
      type: 'first_time_buyer',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscountAmount: 50,
      promoCode: 'WELCOME15',
      autoApply: true,
      minOrderAmount: 25,
      maxUsagePerUser: 1,
      targetAudience: 'new_customers',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdBy: null // System generated
    });
  }
  
  // Create loyalty tier promotions
  static async createLoyaltyTierPromotions() {
    const tiers = ['silver', 'gold', 'platinum'];
    const promotions = [];
    
    for (const tier of tiers) {
      const benefits = this.getTierBenefits(tier);
      
      const existingPromo = await Promotion.findOne({
        type: 'loyalty_tier',
        loyaltyTierRequired: tier,
        isActive: true
      });
      
      if (!existingPromo) {
        const promotion = await Promotion.create({
          name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Member Discount`,
          description: `Exclusive ${benefits.discount}% discount for ${tier} members`,
          type: 'loyalty_tier',
          discountType: 'percentage',
          discountValue: benefits.discount,
          autoApply: true,
          maxUsagePerUser: 1,
          targetAudience: 'loyalty_tier',
          loyaltyTierRequired: tier,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
          createdBy: null
        });
        
        promotions.push(promotion);
      }
    }
    
    return promotions;
  }
}

module.exports = LoyaltyService;
