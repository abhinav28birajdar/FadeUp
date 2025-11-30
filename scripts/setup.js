#!/usr/bin/env node

/**
 * FadeUp Setup Script
 * This script helps set up the development environment for FadeUp
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Welcome to FadeUp Setup!');
console.log('');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created!');
  console.log('');
  console.log('🔧 Please edit .env file with your Firebase configuration:');
  console.log('   - Firebase project credentials');
  console.log('   - Google Sign-In client ID');
  console.log('');
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ Dependencies installed!');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed');
}

console.log('');
console.log('🎉 Setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Edit .env file with your Firebase configuration');
console.log('2. Set up Firebase project:');
console.log('   - Create project at https://console.firebase.google.com');
console.log('   - Enable Authentication, Firestore, and Cloud Functions');
console.log('   - Set up security rules (see README.md)');
console.log('3. Run: npm start');
console.log('');
console.log('For detailed setup instructions, see README.md');
console.log('');
console.log('Happy coding! ✂️');