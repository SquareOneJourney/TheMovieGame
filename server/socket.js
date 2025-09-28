const { Server } = require("socket.io");

const games = {};

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join_game", ({ gameId, name }) => {
      if (!games[gameId]) {
        games[gameId] = { 
          players: [], 
          currentTurn: socket.id,
          gameStatus: 'waiting',
          winner: null,
          hintUsed: false
        };
      }

      // Check if player already exists in this game
      const existingPlayer = games[gameId].players.find(p => p.id === socket.id);
      if (!existingPlayer) {
        games[gameId].players.push({ id: socket.id, name, score: 0 });
      }

      // Update game status when second player joins
      if (games[gameId].players.length === 2 && games[gameId].gameStatus === 'waiting') {
        games[gameId].gameStatus = 'playing';
      }

      socket.join(gameId);
      io.to(gameId).emit("game_update", games[gameId]);
    });

    socket.on("give_clue", ({ gameId, actor1, actor2, movie, poster, year, actor1Photo, actor2Photo, hintActorPhoto, hintActor }) => {
      const game = games[gameId];
      if (!game) return;
      
      game.currentClue = { 
        actor1, 
        actor2, 
        movie, 
        poster, 
        year, 
        actor1Photo, 
        actor2Photo, 
        hintActorPhoto, 
        hintActor 
      };
      game.hintUsed = false; // Reset hint status for new clue
      io.to(gameId).emit("clue_given", game.currentClue);
    });

    socket.on("guess_movie", ({ gameId, guess, correctMovie, similarity, confidence, usedHint }) => {
      const game = games[gameId];
      if (!game) return;

      const clueGiver = game.currentTurn;
      const guesser = game.players.find((p) => p.id !== clueGiver);
      const isCorrect = guess.toLowerCase() === correctMovie.toLowerCase();

      // Store result for display
      game.lastResult = {
        correct: isCorrect,
        guess,
        correctAnswer: correctMovie,
        similarity,
        confidence,
        usedHint
      };

      if (guesser && isCorrect) {
        // Correct guess - guesser gets points (0.5 if hint used, 1 if not)
        const pointsToAdd = usedHint ? 0.5 : 1;
        guesser.score += pointsToAdd;
        game.currentTurn = guesser.id; // switch turn
      } else {
        // Wrong guess - clue giver gets 2 points and keeps turn
        const giver = game.players.find((p) => p.id === clueGiver);
        if (giver) giver.score += 2;
      }

      // Check for winner
      const maxScore = Math.max(...game.players.map(p => p.score));
      if (maxScore >= 10) {
        game.gameStatus = 'finished';
        game.winner = game.players.find(p => p.score >= 10)?.id || null;
      }

      // Clear the current clue for next round
      game.currentClue = undefined;
      game.hintUsed = false;
      io.to(gameId).emit("game_update", game);
    });

    // New socket events for enhanced features
    socket.on("use_hint", ({ gameId }) => {
      const game = games[gameId];
      if (!game) return;
      
      game.hintUsed = true;
      io.to(gameId).emit("hint_used", { hintUsed: true });
    });

    socket.on("reset_game", ({ gameId }) => {
      const game = games[gameId];
      if (!game) return;
      
      // Reset game state but keep players
      game.currentClue = undefined;
      game.gameStatus = 'playing';
      game.winner = null;
      game.hintUsed = false;
      game.lastResult = undefined;
      
      // Reset scores
      game.players.forEach(player => {
        player.score = 0;
      });
      
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

module.exports = initSocket;
