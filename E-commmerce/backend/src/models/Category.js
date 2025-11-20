const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Category description cannot exceed 500 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    public_id: String,
    url: String,
    alt: String
  },
  icon: {
    type: String,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  path: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    }
  },
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect', 'boolean'],
      default: 'text'
    },
    options: [{
      type: String,
      trim: true
    }],
    isRequired: {
      type: Boolean,
      default: false
    },
    isFilterable: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full path name
categorySchema.virtual('fullPath').get(function() {
  return this.path ? this.path.map(cat => cat.name).join(' > ') : this.name;
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ level: 1, sortOrder: 1 });
categorySchema.index({ isFeatured: 1, isActive: 1 });

// Pre-save middleware to generate slug and set path
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (this.isModified('parent')) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
        this.path = [...parentCategory.path, parentCategory._id];
      }
    } else {
      this.level = 0;
      this.path = [];
    }
  }

  next();
});

// Method to get all children categories
categorySchema.methods.getChildren = function() {
  return this.constructor.find({ parent: this._id, isActive: true });
};

// Method to get all descendants
categorySchema.methods.getDescendants = function() {
  return this.constructor.find({ 
    path: this._id, 
    isActive: true 
  });
};

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: this._id, 
    status: 'active',
    isDeleted: false 
  });
  
  this.productCount = count;
  return this.save();
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { level: 1, sortOrder: 1, name: 1 } },
    {
      $group: {
        _id: '$parent',
        categories: {
          $push: {
            _id: '$_id',
            name: '$name',
            slug: '$slug',
            description: '$description',
            image: '$image',
            icon: '$icon',
            level: '$level',
            productCount: '$productCount',
            isFeatured: '$isFeatured'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Category', categorySchema);
