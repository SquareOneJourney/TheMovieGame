import { Server } from "socket.io";

interface GameState {
  players: { id: string; name: string; score: number }[];
  currentClue?: { actor1: string; actor2: string };
  currentTurn: string; // socket.id of clue giver
}

const games: Record<string, GameState> = {};

export default function initSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join_game", ({ gameId, name }) => {
      if (!games[gameId]) {
        games[gameId] = { players: [], currentTurn: socket.id };
      }

      // Check if player already exists in this game
      const existingPlayer = games[gameId].players.find(p => p.id === socket.id);
      if (!existingPlayer) {
        games[gameId].players.push({ id: socket.id, name, score: 0 });
      }

      socket.join(gameId);
      io.to(gameId).emit("game_update", games[gameId]);
    });

    socket.on("give_clue", ({ gameId, actor1, actor2 }) => {
      const game = games[gameId];
      if (!game) return;
      
      game.currentClue = { actor1, actor2 };
      io.to(gameId).emit("clue_given", game.currentClue);
    });

    socket.on("guess_movie", ({ gameId, guess, correctMovie }) => {
      const game = games[gameId];
      if (!game) return;

      const clueGiver = game.currentTurn;
      const guesser = game.players.find((p) => p.id !== clueGiver);

      if (guesser && guess.toLowerCase() === correctMovie.toLowerCase()) {
        // Correct guess - guesser gets 1 point and becomes clue giver
        guesser.score += 1;
        game.currentTurn = guesser.id; // switch turn
      } else {
        // Wrong guess - clue giver gets 2 points and keeps turn
        const giver = game.players.find((p) => p.id === clueGiver);
        if (giver) giver.score += 2;
      }

      // Clear the current clue for next round
      game.currentClue = undefined;
      io.to(gameId).emit("game_update", game);
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
      
      // Remove player from all games they were in
      Object.keys(games).forEach(gameId => {
        const game = games[gameId];
        if (game) {
          const playerIndex = game.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            game.players.splice(playerIndex, 1);
            
            // If no players left, clean up the game
            if (game.players.length === 0) {
              delete games[gameId];
            } else {
              // Notify remaining players
              io.to(gameId).emit("game_update", game);
            }
          }
        }
      });
    });
  });
}
