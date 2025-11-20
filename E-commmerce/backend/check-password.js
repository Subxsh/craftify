const bcrypt = require('bcryptjs');

// Your bcrypt hash
const hash = '$2a$12$VZczxfUaF5IM67hy1TrkLedt9eyLMl7u1w5eChjoFTaZ98qNOGew2';

// Common passwords to try (add any passwords you think it might be)
const possiblePasswords = [
  'password',
  'password123',
  '123456',
  'admin',
  'admin123',
  'Subash25',
  'subash25',
  'SUBASH25',
  'subash123',
  'Subash123',
  'subashperiyasamy',
  'Subash@25',
  'subash@25',
  'craftify',
  'Craftify123',
  'test123',
  'user123',
  'seller123',
  // Add more passwords you think it might be
];

async function checkPasswords() {
  console.log('🔍 Checking possible passwords against hash...\n');
  
  for (const password of possiblePasswords) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      if (isMatch) {
        console.log(`✅ FOUND IT! Password is: "${password}"`);
        return;
      } else {
        console.log(`❌ "${password}" - No match`);
      }
    } catch (error) {
      console.log(`⚠️ Error checking "${password}":`, error.message);
    }
  }
  
  console.log('\n❌ None of the common passwords matched.');
  console.log('💡 Try running the reset-password.js script to set a new password.');
}

checkPasswords();
