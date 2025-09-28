# 🧪 Complete Testing Guide for The Movie Game

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```
The app will be available at: http://localhost:3000

### 2. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional for testing)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Socket.IO
SOCKET_IO_PORT=3001

# TMDB API (Required)
TMDB_BEARER_TOKEN="your-tmdb-bearer-token-here"
```

## 🎯 Testing Checklist

### Phase 1: Basic Functionality
- [ ] **Home Page Loads** - Check http://localhost:3000
- [ ] **Single Player Works** - Test AI gameplay
- [ ] **Authentication Flow** - Test login/logout
- [ ] **Database Connection** - Verify data persistence

### Phase 2: Authentication System
- [ ] **Login Required** - Try accessing /lobby without login
- [ ] **Google OAuth** - Test Google sign-in (if configured)
- [ ] **Session Persistence** - Refresh page, stay logged in
- [ ] **Logout Functionality** - Sign out works properly

### Phase 3: Multiplayer Game Creation
- [ ] **Create Game** - Go to /multiplayer, create a game
- [ ] **Movie Search** - Search for movies using TMDB
- [ ] **Actor Selection** - Select two actors and hint actor
- [ ] **Game Storage** - Game appears in database
- [ ] **Game ID Generation** - Get unique game ID

### Phase 4: Friend System
- [ ] **User Search** - Search for other users
- [ ] **Send Friend Request** - Add friends
- [ ] **Accept/Decline Requests** - Manage friend requests
- [ ] **Friends List** - View added friends
- [ ] **Game Invites** - Send invites to friends

### Phase 5: Game Joining & Playing
- [ ] **Join by ID** - Use game ID to join
- [ ] **Join via Invite** - Accept friend's game invite
- [ ] **Real-time Gameplay** - Test Socket.IO connection
- [ ] **Game Persistence** - Refresh during game, stay connected
- [ ] **Score Tracking** - Verify scoring works

### Phase 6: Statistics & Leaderboard
- [ ] **Personal Stats** - View your statistics
- [ ] **Game History** - See past games
- [ ] **Round History** - View individual rounds
- [ ] **Leaderboard** - Check rankings
- [ ] **Timeframe Filters** - Test week/month/all time

## 🔧 Testing Scenarios

### Scenario 1: Two Players, Same Browser
1. Open two incognito windows
2. Sign in with different accounts
3. Create game in one window
4. Join game in other window
5. Play complete game
6. Check statistics update

### Scenario 2: Friend System Test
1. Create two user accounts
2. Search for and add each other as friends
3. Send game invite from one to other
4. Accept invite and play game
5. Verify friend relationship persists

### Scenario 3: Database Persistence
1. Create a game
2. Close browser completely
3. Reopen and sign back in
4. Verify game still exists
5. Join the same game

### Scenario 4: Error Handling
1. Try joining non-existent game
2. Try creating game without selecting actors
3. Test with invalid game IDs
4. Verify proper error messages

## 🐛 Common Issues & Solutions

### Issue: "Database not found"
**Solution:** Run `npx prisma db push` to create database

### Issue: "TMDB API error"
**Solution:** Check TMDB_BEARER_TOKEN in .env.local

### Issue: "Socket connection failed"
**Solution:** Ensure Socket.IO server is running on port 3001

### Issue: "Authentication not working"
**Solution:** Check NEXTAUTH_SECRET is set

### Issue: "Can't find users to add as friends"
**Solution:** Create multiple test accounts first

## 📱 Mobile Testing

### Test on Mobile Device
1. Find your computer's IP address
2. Access http://[YOUR_IP]:3000 from mobile
3. Test responsive design
4. Test touch interactions
5. Test mobile authentication

## 🚀 Pre-Deployment Checklist

### Environment Variables
- [ ] All required env vars set
- [ ] Production database URL configured
- [ ] TMDB API key valid
- [ ] NextAuth secret secure

### Database
- [ ] Schema up to date
- [ ] Migrations applied
- [ ] Test data cleaned up

### Performance
- [ ] Page load times acceptable
- [ ] Socket connections stable
- [ ] Database queries optimized
- [ ] Images loading properly

### Security
- [ ] Authentication working
- [ ] API routes protected
- [ ] User data secure
- [ ] No sensitive data exposed

## 🎮 Game-Specific Tests

### Movie Selection
- [ ] TMDB search works
- [ ] Actor photos load
- [ ] Movie details accurate
- [ ] Hint actors available

### Gameplay Mechanics
- [ ] Clue giving works
- [ ] Guessing system functional
- [ ] Scoring accurate
- [ ] Turn switching correct
- [ ] Game end conditions

### Real-time Features
- [ ] Socket connections stable
- [ ] Real-time updates work
- [ ] Multiple players sync
- [ ] Disconnection handling

## 📊 Success Metrics

### Functionality
- [ ] All features work as expected
- [ ] No critical errors
- [ ] Smooth user experience
- [ ] Data persistence reliable

### Performance
- [ ] Fast page loads
- [ ] Responsive interface
- [ ] Stable connections
- [ ] Good mobile experience

### User Experience
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Helpful feedback
- [ ] Engaging gameplay

## 🚀 Ready for Deployment!

Once all tests pass, your movie game is ready for production deployment on Vercel, Netlify, or your preferred platform!
