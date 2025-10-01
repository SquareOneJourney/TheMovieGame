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


# TMDB API (Required)
TMDB_BEARER_TOKEN="your-tmdb-bearer-token-here"
```

## 🎯 Testing Checklist

### Phase 1: Basic Functionality
- [ ] **Home Page Loads** - Check http://localhost:3000
- [ ] **Single Player Works** - Test AI gameplay
- [ ] **Authentication Flow** - Test login/logout
- [ ] **Database Connection** - Verify data persistence

### Phase 2: Single Player Game
- [ ] **Game Start** - Click "Play Now" to start single-player game
- [ ] **Movie Display** - Verify actors and movie poster show correctly
- [ ] **Guess Input** - Test guessing movie titles
- [ ] **Hint System** - Test hint functionality (costs half point)
- [ ] **Score Tracking** - Verify scoring works correctly
- [ ] **Game Completion** - Test winning/losing conditions

### Phase 3: Admin Dashboard
- [ ] **Admin Login** - Access admin dashboard
- [ ] **Movie Management** - Add, edit, delete movies
- [ ] **TMDB Integration** - Search and import movies from TMDB
- [ ] **Actor Management** - Assign actor roles and photos
- [ ] **Database Operations** - Verify data persistence

## 🔧 Testing Scenarios

### Scenario 1: Complete Single Player Game
1. Start a new game
2. Play through multiple rounds
3. Test hint functionality
4. Complete game (win or lose)
5. Verify scoring works correctly

### Scenario 2: Admin Movie Management
1. Access admin dashboard
2. Search for movies on TMDB
3. Add new movies to database
4. Edit existing movies
5. Delete movies
6. Verify changes persist

### Scenario 3: Error Handling
1. Test with invalid movie titles
2. Test hint system edge cases
3. Test game state persistence
4. Verify proper error messages

## 🐛 Common Issues & Solutions

### Issue: "Database not found"
**Solution:** Run `npx prisma db push` to create database

### Issue: "TMDB API error"
**Solution:** Check TMDB_BEARER_TOKEN in .env.local

### Issue: "Authentication not working"
**Solution:** Check NEXTAUTH_SECRET is set

### Issue: "Admin access denied"
**Solution:** Check admin credentials and permissions

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
