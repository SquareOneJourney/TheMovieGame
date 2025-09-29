const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA and app stores
const iconSizes = [
  // Standard favicons
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 60, name: 'icon-60x60.png' },
  { size: 57, name: 'icon-57x57.png' },
  { size: 70, name: 'icon-70x70.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 76, name: 'icon-76x76.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 114, name: 'icon-114x114.png' },
  { size: 120, name: 'icon-120x120.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 150, name: 'icon-150x150.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 310, name: 'icon-310x310.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  // Additional sizes for better coverage
  { size: 1024, name: 'icon-1024x1024.png' }
];

// Microsoft tile sizes
const tileSizes = [
  { size: 70, name: 'icon-70x70.png' },
  { size: 150, name: 'icon-150x150.png' },
  { size: 310, name: 'icon-310x310.png' },
  { size: 310, name: 'icon-310x150.png', width: 310, height: 150 } // Wide tile
];

console.log('🎨 App Icon Generator');
console.log('📁 Creating icons directory...');

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('📋 Required icon sizes:');
iconSizes.forEach(icon => {
  console.log(`  - ${icon.name} (${icon.size}x${icon.size})`);
});

console.log('\n📱 Microsoft Tile sizes:');
tileSizes.forEach(tile => {
  const dimensions = tile.width ? `${tile.width}x${tile.height}` : `${tile.size}x${tile.size}`;
  console.log(`  - ${tile.name} (${dimensions})`);
});

console.log('\n⚠️  Note: This script lists the required sizes.');
console.log('🖼️  You need to create these icons using your design tool:');
console.log('   1. Use your "TheMovieGame Logo.png" as the base');
console.log('   2. Create square versions for each size');
console.log('   3. Save them in the public/icons/ directory');
console.log('   4. Use PNG format with transparent background');
console.log('   5. For Microsoft tiles, create both square and wide versions');

console.log('\n🎯 Recommended design guidelines:');
console.log('  - Use your existing logo design');
console.log('  - Ensure icons are readable at small sizes');
console.log('  - Use high contrast colors');
console.log('  - Test on both light and dark backgrounds');
console.log('  - Keep design simple and recognizable');

console.log('\n📱 App Store Requirements:');
console.log('  - iOS: 1024x1024 (App Store), 180x180 (iPhone), 152x152 (iPad)');
console.log('  - Android: 512x512 (Play Store), 192x192 (Android)');
console.log('  - PWA: 192x192, 512x512 (minimum)');

console.log('\n✅ Icon generation script complete!');
console.log('📁 Icons directory created at: public/icons/');
console.log('🔄 Next: Create the actual icon files using your design tool');
