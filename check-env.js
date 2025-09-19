// check-env.js
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

console.log('=== Environment Check ===');
console.log('Current working directory:', process.cwd());

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);
console.log('.env file exists:', envExists);

if (envExists) {
  console.log('.env file path:', envPath);
  
  // Read and display .env content (hide sensitive data)
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n=== .env file content ===');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        const value = process.env[key];
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('key')) {
          console.log(`${key}=***HIDDEN***`);
        } else {
          console.log(`${key}=${value || 'UNDEFINED'}`);
        }
      }
    }
  });
}

console.log('\n=== Required Environment Variables ===');
const required = [
  'NODE_ENV',
  'PORT', 
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'BCRYPT_ROUNDS'
];

let allPresent = true;
required.forEach(key => {
  const value = process.env[key];
  const status = value ? '✓' : '✗';
  console.log(`${status} ${key}: ${value ? (key.includes('SECRET') ? '***HIDDEN***' : value) : 'MISSING'}`);
  if (!value) allPresent = false;
});

console.log('\n=== Status ===');
console.log('All required variables present:', allPresent ? '✓' : '✗');

if (!allPresent) {
  console.log('\nPlease ensure all required environment variables are set in your .env file.');
  process.exit(1);
} else {
  console.log('\nEnvironment configuration is valid!');
}