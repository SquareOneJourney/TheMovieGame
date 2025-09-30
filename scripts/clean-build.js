#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning build artifacts...');

// Remove .next directory
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('Removing .next directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// Remove node_modules/.cache
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  console.log('Removing node_modules/.cache...');
  fs.rmSync(cacheDir, { recursive: true, force: true });
}

// Clear npm cache
console.log('Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.warn('Warning: Could not clear npm cache:', error.message);
}

console.log('✅ Clean build completed!');
console.log('Run "npm run build" to create a fresh build.');
