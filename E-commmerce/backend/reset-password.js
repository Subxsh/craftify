const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/craftify';

// User schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Email of the user whose password you want to reset
    const userEmail = 'subashperiyasamy25@gmail.com'; // Change this to your email
    const newPassword = 'newpassword123'; // Change this to your new password

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password
    const result = await User.updateOne(
      { email: userEmail },
      { password: hashedPassword }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Password updated successfully for ${userEmail}`);
      console.log(`🔑 New password: ${newPassword}`);
      console.log(`🔒 New hash: ${hashedPassword}`);
    } else {
      console.log(`❌ User not found with email: ${userEmail}`);
    }

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the reset
resetPassword();
