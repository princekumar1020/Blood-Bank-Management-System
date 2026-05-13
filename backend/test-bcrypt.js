import bcrypt from 'bcryptjs';

const password = 'Admin@123';

async function test() {
  try {
    console.log('Testing bcrypt...');
    console.log('Original password:', password);
    
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated');
    
    const hash = await bcrypt.hash(password, salt);
    console.log('Password hashed:', hash);
    
    const match = await bcrypt.compare(password, hash);
    console.log('bcrypt.compare result:', match);
    
    if (match) {
      console.log('✓ bcrypt is working correctly');
    } else {
      console.log('✗ bcrypt compare failed');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
