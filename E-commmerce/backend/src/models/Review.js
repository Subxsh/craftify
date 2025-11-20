const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro cannot exceed 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con cannot exceed 100 characters']
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    }
  },
  sellerResponse: {
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Seller response cannot exceed 500 characters']
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other'],
      required: true
    },
    details: {
      type: String,
      trim: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isHelpful: {
      type: Boolean,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.isHelpful.helpful + this.isHelpful.notHelpful;
  if (total === 0) return 0;
  return Math.round((this.isHelpful.helpful / total) * 100);
});

// Indexes
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });
reviewSchema.index({ isReported: 1 });

// Compound index to ensure one review per customer per product per order
reviewSchema.index({ customer: 1, product: 1, order: 1 }, { unique: true });

// Pre-save middleware to check verified purchase
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Order = mongoose.model('Order');
    const order = await Order.findOne({
      _id: this.order,
      customer: this.customer,
      'items.product': this.product,
      status: { $in: ['delivered', 'completed'] }
    });
    
    this.isVerifiedPurchase = !!order;
  }
  next();
});

// Post-save middleware to update product review stats
reviewSchema.post('save', async function() {
  if (this.isApproved) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    if (product) {
      await product.updateReviewStats();
    }
  }
});

// Post-remove middleware to update product review stats
reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  if (product) {
    await product.updateReviewStats();
  }
});

// Method to approve review
reviewSchema.methods.approve = function(approvedBy) {
  this.isApproved = true;
  this.approvedAt = new Date();
  this.approvedBy = approvedBy;
  this.rejectedAt = undefined;
  this.rejectedBy = undefined;
  this.rejectionReason = undefined;
  return this.save();
};

// Method to reject review
reviewSchema.methods.reject = function(rejectedBy, reason) {
  this.isApproved = false;
  this.rejectedAt = new Date();
  this.rejectedBy = rejectedBy;
  this.rejectionReason = reason;
  this.approvedAt = undefined;
  this.approvedBy = undefined;
  return this.save();
};

// Method to add helpful vote
reviewSchema.methods.addHelpfulVote = function(userId, isHelpful) {
  // Remove existing vote from this user
  this.helpfulVotes = this.helpfulVotes.filter(
    vote => !vote.user.equals(userId)
  );
  
  // Add new vote
  this.helpfulVotes.push({
    user: userId,
    isHelpful,
    votedAt: new Date()
  });
  
  // Update counters
  this.isHelpful.helpful = this.helpfulVotes.filter(vote => vote.isHelpful).length;
  this.isHelpful.notHelpful = this.helpfulVotes.filter(vote => !vote.isHelpful).length;
  
  return this.save();
};

// Method to report review
reviewSchema.methods.reportReview = function(userId, reason, details) {
  this.reportedBy.push({
    user: userId,
    reason,
    details,
    reportedAt: new Date()
  });
  
  this.isReported = true;
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
