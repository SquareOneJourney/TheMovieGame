const fs = require('fs');
const path = require('path');

// This script builds the static database from admin movies
// It reads from the admin API and creates the static database

async function buildFromAdmin() {
  try {
    console.log('🔧 Building database from admin movies...');
    
    // For now, we'll use the existing static database as a fallback
    // In a real implementation, you'd fetch from your admin API
    const existingDatabasePath = path.join(__dirname, '..', 'data', 'movies-database.json');
    
    if (fs.existsSync(existingDatabasePath)) {
      console.log('📦 Using existing static database as base');
      const existingData = JSON.parse(fs.readFileSync(existingDatabasePath, 'utf8'));
      console.log(`✅ Found ${existingData.length} movies in existing database`);
      
      // Save a backup
      const backupPath = path.join(__dirname, '..', 'data', 'movies-database-backup.json');
      fs.writeFileSync(backupPath, JSON.stringify(existingData, null, 2));
      console.log(`💾 Backup saved to ${backupPath}`);
      
      return existingData;
    } else {
      console.log('❌ No existing database found. Please run the main build script first.');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error building from admin:', error);
    return [];
  }
}

// Run the build
buildFromAdmin().then(movies => {
  console.log(`✅ Admin build complete with ${movies.length} movies`);
});
