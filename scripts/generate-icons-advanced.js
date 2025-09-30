const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if ImageMagick is available
function checkImageMagick() {
  try {
    execSync('magick -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Icon sizes required for PWA and app stores
const iconSizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 60, name: 'icon-60x60.png' },
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
  { size: 1024, name: 'icon-1024x1024.png' }
];

console.log('🎨 Advanced App Icon Generator');
console.log('📁 Creating icons directory...');

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Check for source logo
const sourceLogo = path.join(__dirname, '..', 'public', 'TheMovieGame Logo.png');
if (!fs.existsSync(sourceLogo)) {
  console.error('❌ Source logo not found at:', sourceLogo);
  console.log('📁 Available files in public directory:');
  const publicDir = path.join(__dirname, '..', 'public');
  const files = fs.readdirSync(publicDir);
  files.forEach(file => console.log(`  - ${file}`));
  process.exit(1);
}

console.log('✅ Source logo found:', sourceLogo);

// Check if ImageMagick is available
const hasImageMagick = checkImageMagick();
if (!hasImageMagick) {
  console.log('⚠️  ImageMagick not found. Creating placeholder icons...');
  console.log('💡 To generate proper icons, install ImageMagick and run this script again.');
  
  // Create placeholder icons
  iconSizes.forEach(icon => {
    const placeholderPath = path.join(iconsDir, icon.name);
    // Create a simple placeholder file
    fs.writeFileSync(placeholderPath, '');
    console.log(`📄 Created placeholder: ${icon.name}`);
  });
  
  console.log('\n📋 Next steps:');
  console.log('1. Install ImageMagick: https://imagemagick.org/script/download.php');
  console.log('2. Run this script again to generate proper icons');
  console.log('3. Or manually create icons using your design tool');
  
  process.exit(0);
}

console.log('✅ ImageMagick found. Generating icons...');

// Generate icons using ImageMagick
iconSizes.forEach(icon => {
  try {
    const outputPath = path.join(iconsDir, icon.name);
    const command = `magick "${sourceLogo}" -resize ${icon.size}x${icon.size} -background transparent -gravity center -extent ${icon.size}x${icon.size} "${outputPath}"`;
    
    execSync(command, { stdio: 'ignore' });
    console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size})`);
  } catch (error) {
    console.error(`❌ Failed to generate ${icon.name}:`, error.message);
  }
});

// Create additional Microsoft tile sizes
const tileSizes = [
  { size: 70, name: 'icon-70x70.png' },
  { size: 150, name: 'icon-150x150.png' },
  { size: 310, name: 'icon-310x310.png' }
];

// Create wide tile (310x150)
try {
  const wideTilePath = path.join(iconsDir, 'icon-310x150.png');
  const command = `magick "${sourceLogo}" -resize 310x150 -background transparent -gravity center -extent 310x150 "${wideTilePath}"`;
  execSync(command, { stdio: 'ignore' });
  console.log('✅ Generated: icon-310x150.png (310x150) - Wide tile');
} catch (error) {
  console.error('❌ Failed to generate wide tile:', error.message);
}

console.log('\n🎉 Icon generation complete!');
console.log(`📁 Icons saved to: ${iconsDir}`);
console.log('\n📱 Generated icons:');
iconSizes.forEach(icon => {
  const iconPath = path.join(iconsDir, icon.name);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size}) - ${Math.round(stats.size / 1024)}KB`);
  } else {
    console.log(`  ❌ ${icon.name} - Failed to generate`);
  }
});

console.log('\n🔄 Next: Update manifest.json to reference these icons');

