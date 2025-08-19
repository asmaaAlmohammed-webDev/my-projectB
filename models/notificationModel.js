const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    titleAr: {
      type: String,
      trim: true,
      maxlength: [100, 'Arabic title cannot exceed 100 characters']
    },
    messageAr: {
      type: String,
      trim: true,
      maxlength: [500, 'Arabic message cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['promotion', 'discount', 'general', 'order', 'system'],
      default: 'general'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    targetUsers: {
      type: String,
      enum: ['all', 'specific', 'role-based'],
      default: 'all'
    },
    specificUsers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    targetRoles: [{
      type: String,
      enum: ['USER', 'ADMIN']
    }],
    promotionData: {
      discountPercentage: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
      },
      discountAmount: {
        type: Number,
        min: [0, 'Discount amount cannot be negative']
      },
      minimumOrder: {
        type: Number,
        min: [0, 'Minimum order cannot be negative'],
        default: 0
      },
      validUntil: {
        type: Date
      },
      promoCode: {
        type: String,
        trim: true,
        uppercase: true
      },
      maxUses: {
        type: Number,
        min: [1, 'Max uses must be at least 1'],
        default: 1000
      },
      currentUses: {
        type: Number,
        default: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    readBy: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    actionUrl: {
      type: String,
      trim: true
    },
    actionText: {
      type: String,
      trim: true
    },
    actionTextAr: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better performance
notificationSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
notificationSchema.index({ targetUsers: 1, targetRoles: 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.endDate && this.endDate < new Date();
});

// Virtual for checking if notification is valid
notificationSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         (!this.startDate || this.startDate <= now) && 
         (!this.endDate || this.endDate >= now);
});

// Method to check if user has read this notification
notificationSchema.methods.isReadByUser = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to mark as read by user
notificationSchema.methods.markAsReadByUser = function(userId) {
  if (!this.isReadByUser(userId)) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  return this.save();
};

// Static method to get active notifications for user
notificationSchema.statics.getActiveForUser = function(userId, userRole) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } }
    ],
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ],
    $or: [
      { targetUsers: 'all' },
      { targetUsers: 'specific', specificUsers: userId },
      { targetUsers: 'role-based', targetRoles: userRole }
    ]
  })
  .populate('createdBy', 'name')
  .sort({ priority: -1, createdAt: -1 });
};

// Static method to get unread notifications for user
notificationSchema.statics.getUnreadForUser = function(userId, userRole) {
  return this.getActiveForUser(userId, userRole)
    .then(notifications => {
      return notifications.filter(notification => !notification.isReadByUser(userId));
    });
};

// Pre-save middleware to validate promotion data
notificationSchema.pre('save', function(next) {
  if (this.type === 'promotion' || this.type === 'discount') {
    if (!this.promotionData || (!this.promotionData.discountPercentage && !this.promotionData.discountAmount)) {
      return next(new Error('Promotion notifications must have discount percentage or amount'));
    }
    
    if (this.promotionData.discountPercentage && this.promotionData.discountAmount) {
      return next(new Error('Cannot have both percentage and amount discount'));
    }
  }
  
  // Auto-set end date if not provided for promotions
  if ((this.type === 'promotion' || this.type === 'discount') && !this.endDate) {
    this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  }
  
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
