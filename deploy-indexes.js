#!/usr/bin/env node

/**
 * Script to deploy Firestore indexes
 * Run with: node deploy-indexes.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deploying Firestore Indexes...\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI is not installed. Please install it first:');
  console.error('npm install -g firebase-tools');
  process.exit(1);
}

// Check if firestore.indexes.json exists
const indexesFile = path.join(__dirname, 'firestore.indexes.json');
if (!fs.existsSync(indexesFile)) {
  console.error('❌ firestore.indexes.json not found');
  process.exit(1);
}

console.log('✅ Found firestore.indexes.json');

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Firebase authentication verified');
} catch (error) {
  console.error('❌ Not logged in to Firebase. Please run:');
  console.error('firebase login');
  process.exit(1);
}

// Deploy indexes
try {
  console.log('\n🚀 Deploying indexes...');
  execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
  console.log('\n✅ Indexes deployed successfully!');
  console.log('\n📝 Note: Indexes may take a few minutes to build in the Firebase Console');
  console.log('💡 You can monitor progress at: https://console.firebase.google.com');
} catch (error) {
  console.error('\n❌ Failed to deploy indexes');
  console.error('Error:', error.message);
  process.exit(1);
}
