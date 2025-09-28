// Simple in-memory database for demo purposes
// In production, you'd want to use a real database

interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

interface Game {
  id: string
  players: string[]
  status: string
  createdAt: Date
}

interface Round {
  id: string
  gameId: string
  clueGiver: string
  guesser: string
  actor1: string
  actor2: string
  movie: string
  hintActor?: string
  guess?: string
  outcome?: string
  createdAt: Date
}

class MemoryDB {
  private users: Map<string, User> = new Map()
  private games: Map<string, Game> = new Map()
  private rounds: Map<string, Round> = new Map()

  // User operations
  async createUser(data: Omit<User, 'id' | 'createdAt'>) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const user: User = {
      ...data,
      id,
      createdAt: new Date()
    }
    this.users.set(id, user)
    return user
  }

  async findUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }

  async findUserById(id: string) {
    return this.users.get(id) || null
  }

  // Game operations
  async createGame(data: Omit<Game, 'id' | 'createdAt'>) {
    const id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const game: Game = {
      ...data,
      id,
      createdAt: new Date()
    }
    this.games.set(id, game)
    return game
  }

  async findGameById(id: string) {
    return this.games.get(id) || null
  }

  async findGamesByPlayer(playerId: string) {
    const games: Game[] = []
    for (const game of this.games.values()) {
      if (game.players.includes(playerId)) {
        games.push(game)
      }
    }
    return games
  }

  // Round operations
  async createRound(data: Omit<Round, 'id' | 'createdAt'>) {
    const id = `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const round: Round = {
      ...data,
      id,
      createdAt: new Date()
    }
    this.rounds.set(id, round)
    return round
  }

  async findRoundsByGame(gameId: string) {
    const rounds: Round[] = []
    for (const round of this.rounds.values()) {
      if (round.gameId === gameId) {
        rounds.push(round)
      }
    }
    return rounds.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  async findRoundsByPlayer(playerId: string) {
    const rounds: Round[] = []
    for (const round of this.rounds.values()) {
      if (round.clueGiver === playerId || round.guesser === playerId) {
        rounds.push(round)
      }
    }
    return rounds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Count operations
  async countGamesByPlayer(playerId: string) {
    return this.findGamesByPlayer(playerId).then(games => games.length)
  }

  async countRoundsByPlayer(playerId: string) {
    return this.findRoundsByPlayer(playerId).then(rounds => rounds.length)
  }

  async countCorrectGuessesByPlayer(playerId: string) {
    const rounds = await this.findRoundsByPlayer(playerId)
    return rounds.filter(round => round.guesser === playerId && round.outcome === 'correct').length
  }
}

// Export singleton instance
export const memoryDB = new MemoryDB()
