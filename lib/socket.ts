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
      ? 'https://your-domain.com' 
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

  // Give a clue (two actors)
  giveClue(actor1: string, actor2: string) {
    if (this.socket && this.gameId) {
      this.socket.emit('give_clue', { 
        gameId: this.gameId, 
        actor1, 
        actor2 
      })
    }
  }

  // Guess the movie
  guessMovie(guess: string, correctMovie: string) {
    if (this.socket && this.gameId) {
      this.socket.emit('guess_movie', { 
        gameId: this.gameId, 
        guess, 
        correctMovie 
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
