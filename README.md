# 🎬 The Movie Game

A fun single-player movie trivia game where you challenge Mr. Robot by guessing movie titles from actor clues!

## 🎮 How to Play

1. **Mr. Robot** shows you two actors from a movie
2. **You guess** the movie title from the actors
3. **Correct guess** = 1 point for you + your turn to give clues
4. **Wrong guess** = 1 point for Mr. Robot + he keeps giving clues
5. **First to 10 points wins!**

## ✨ Features

- 🎭 **Real Movie Data**: Powered by TMDB API with movies from 1980 onwards
- 🤖 **AI Opponent**: Challenge Mr. Robot in movie trivia
- 💡 **Hints**: Get a third actor as a hint (costs half a point)
- 🎯 **Smart Matching**: Fuzzy matching for movie titles
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔧 **Admin Dashboard**: Manage movie database and settings

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/movie-game.git
   cd movie-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your TMDB API key:
   ```env
   TMDB_BEARER_TOKEN=your_tmdb_bearer_token_here
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Socket.IO
SOCKET_IO_PORT=3001

# TMDB API (required)
TMDB_BEARER_TOKEN="your-tmdb-bearer-token-here"
```

## 🎯 Getting a TMDB API Key

1. Go to [themoviedb.org](https://www.themoviedb.org)
2. Create a free account
3. Go to Settings → API
4. Request an API key
5. Copy the "Bearer Token" (starts with `eyJ...`)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma
- **Database**: SQLite (development)
- **Real-time**: Socket.IO
- **Movie Data**: TMDB API
- **Authentication**: NextAuth.js
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
movie-game/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── game/              # Multiplayer game pages
│   └── singleplayer/      # Single player mode
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `TMDB_BEARER_TOKEN` - Your TMDB API key
- `NEXTAUTH_SECRET` - A random secret string
- `NEXTAUTH_URL` - Your production URL
- `DATABASE_URL` - Your production database URL

## 🎮 Game Modes

### Single Player
- AI-powered opponent (Mr. Robot)
- Progressive difficulty
- Score tracking
- Perfect for solo gaming

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the amazing movie database
- [Next.js](https://nextjs.org/) for the awesome framework
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling

## 🐛 Issues

Found a bug? Have a feature request? Please [open an issue](https://github.com/yourusername/movie-game/issues)!

---

**Happy Gaming! 🎬🎮**

---
*Last updated: $(date)*