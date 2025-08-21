// generate-hash.js
import bcrypt from 'bcrypt';

async function generateHash(password) {
  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
  } catch (err) {
    console.error('Error generating hash:', err);
  }
}

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as a command line argument.');
  console.error('Usage: node generate-hash.js your_password');
  process.exit(1);
}

generateHash(password);
