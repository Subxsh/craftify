const mongoose = require('mongoose');

// Use the exact MongoDB URI from the .env file
const MONGODB_URI = 'mongodb+srv://SubashP:subash25@cluster0.ib61c1f.mongodb.net/Craftify?retryWrites=true&w=majority';

// User schema (matching the actual User model)
const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'United States'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const sellerProfileSchema = new mongoose.Schema({
  businessName: {
    type: String,
    trim: true
  },
  businessDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Business description cannot exceed 1000 characters']
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  taxId: {
    type: String,
    trim: true
  },
  bankAccount: {
    accountNumber: String,
    routingNumber: String,
    accountHolderName: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/craftify/image/upload/v1/default-avatar.png'
    }
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  addresses: [addressSchema],
  sellerProfile: sellerProfileSchema,
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const User = mongoose.model('User', userSchema);

async function checkAtlasAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    console.log('Connection string:', MONGODB_URI);
    
    // Connect to database
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('Database name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    
    const email = 'admin@craftify.com';
    
    console.log(`\nSearching for admin user with email: ${email}`);
    
    // Find the admin user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ Admin user not found in Atlas database');
      
      // List all users to see what's there
      console.log('\n=== All Users in Atlas Database ===');
      const allUsers = await User.find({}).select('email role firstName lastName');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} <${user.email}> (${user.role})`);
      });
      
      return;
    }
    
    console.log('✅ Admin user found in Atlas database!');
    console.log('First Name:', user.firstName);
    console.log('Last Name:', user.lastName);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Active:', user.isActive);
    console.log('Password hash:', user.password);

  } catch (error) {
    console.error('Error connecting to Atlas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

// Run the script
checkAtlasAdmin();