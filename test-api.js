// Quick API Test Script
// Run with: node test-api.js

const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Movie Game API Endpoints...\n');

  try {
    // Test 1: Movies API
    console.log('1. Testing Movies API...');
    const moviesResponse = await fetch(`${baseUrl}/api/movies`);
    const moviesData = await moviesResponse.json();
    console.log(`   ✅ Movies API: ${moviesData.success ? 'SUCCESS' : 'FAILED'}`);
    if (moviesData.success) {
      console.log(`   📊 Found ${moviesData.movies?.length || 0} movies`);
    }

    // Test 2: Stats API (will fail without auth, but should return 401)
    console.log('\n2. Testing Stats API...');
    const statsResponse = await fetch(`${baseUrl}/api/stats?type=overview`);
    console.log(`   ✅ Stats API: ${statsResponse.status === 401 ? 'PROTECTED (401)' : 'UNEXPECTED'}`);

    // Test 3: Leaderboard API (will fail without auth, but should return 401)
    console.log('\n3. Testing Leaderboard API...');
    const leaderboardResponse = await fetch(`${baseUrl}/api/leaderboard`);
    console.log(`   ✅ Leaderboard API: ${leaderboardResponse.status === 401 ? 'PROTECTED (401)' : 'UNEXPECTED'}`);

    // Test 4: Home page
    console.log('\n4. Testing Home Page...');
    const homeResponse = await fetch(`${baseUrl}/`);
    console.log(`   ✅ Home Page: ${homeResponse.status === 200 ? 'SUCCESS' : 'FAILED'}`);

    // Test 5: Lobby page (should redirect or show login)
    console.log('\n5. Testing Lobby Page...');
    const lobbyResponse = await fetch(`${baseUrl}/lobby`);
    console.log(`   ✅ Lobby Page: ${lobbyResponse.status === 200 ? 'ACCESSIBLE' : 'REDIRECTED'}`);

    console.log('\n🎉 Basic API tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Test the authentication flow');
    console.log('   3. Create a game and test multiplayer');
    console.log('   4. Test the friend system');
    console.log('   5. Check statistics and leaderboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
