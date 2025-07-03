#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';

console.log('🔍 Running pre-publish checks...\n');

// Check if build directory exists
if (!existsSync('build')) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if main entry point exists
if (!existsSync('build/index.js')) {
  console.error('❌ Main entry point build/index.js not found.');
  process.exit(1);
}

// Check if package.json is valid
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  
  if (!pkg.name || !pkg.version || !pkg.description) {
    console.error('❌ package.json is missing required fields (name, version, description).');
    process.exit(1);
  }
  
  if (pkg.private === true) {
    console.error('❌ Package is marked as private. Set "private": false to publish.');
    process.exit(1);
  }
  
  console.log(`✅ Package: ${pkg.name}@${pkg.version}`);
  console.log(`✅ Description: ${pkg.description}`);
} catch (error) {
  console.error('❌ Invalid package.json:', error.message);
  process.exit(1);
}

// Check if README exists
if (!existsSync('README.md')) {
  console.error('❌ README.md not found.');
  process.exit(1);
}

// Check if LICENSE exists
if (!existsSync('LICENSE')) {
  console.error('❌ LICENSE file not found.');
  process.exit(1);
}

console.log('\n✅ All pre-publish checks passed!');
console.log('\n📦 Ready to publish. Run:');
console.log('   npm publish --access public');
