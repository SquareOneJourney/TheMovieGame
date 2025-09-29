import { io, Socket } from 'socket.io-client'

// Socket.IO client setup for real-time gameplay
class SocketManager {
  private socket: Socket | null = null
  private gameId: string | null = null

  // Initialize socket connection
  connect(gameId: string, playerName: string) {
    if (this.socket?.connected) {
      this.disconnect()
    }

    this.gameId = gameId
    this.socket = io(process.env.NODE_ENV === 'production' 
      ? 'https://the-movie-game.vercel.app' 
      : 'http://localhost:3001'
    )

    // Join the game room
    this.socket.emit('join_game', { gameId, name: playerName })
  }

  // Disconnect from socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Give a clue (two actors) with enhanced movie data
  giveClue(actor1: string, actor2: string, movie?: string, poster?: string, year?: string, actor1Photo?: string, actor2Photo?: string, hintActorPhoto?: string, hintActor?: string) {
    if (this.socket && this.gameId) {
      this.socket.emit('give_clue', { 
        gameId: this.gameId, 
        actor1, 
        actor2,
        movie,
        poster,
        year,
        actor1Photo,
        actor2Photo,
        hintActorPhoto,
        hintActor
      })
    }
  }

  // Guess the movie with enhanced data
  guessMovie(guess: string, correctMovie: string, similarity?: number, confidence?: 'exact' | 'high' | 'medium' | 'low' | 'none', usedHint?: boolean) {
    if (this.socket && this.gameId) {
      this.socket.emit('guess_movie', { 
        gameId: this.gameId, 
        guess, 
        correctMovie,
        similarity,
        confidence,
        usedHint
      })
    }
  }

  // Event listeners
  onGameUpdate(callback: (gameState: any) => void) {
    if (this.socket) {
      this.socket.on('game_update', callback)
    }
  }

  onClueGiven(callback: (clue: { actor1: string; actor2: string }) => void) {
    if (this.socket) {
      this.socket.on('clue_given', callback)
    }
  }

  onPlayerJoined(callback: (player: any) => void) {
    if (this.socket) {
      this.socket.on('player_joined', callback)
    }
  }

  onPlayerLeft(callback: (playerId: string) => void) {
    if (this.socket) {
      this.socket.on('player_left', callback)
    }
  }

  onHintUsed(callback: (data: { hintUsed: boolean }) => void) {
    if (this.socket) {
      this.socket.on('hint_used', callback)
    }
  }

  // New methods for enhanced features
  useHint() {
    if (this.socket && this.gameId) {
      this.socket.emit('use_hint', { gameId: this.gameId })
    }
  }

  resetGame() {
    if (this.socket && this.gameId) {
      this.socket.emit('reset_game', { gameId: this.gameId })
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false
  }
}

// Export singleton instance
export const socketManager = new SocketManager()
export default socketManager
