const { createServer } = require('http');
const { Server } = require('socket.io');
const initSocket = require('./socket.js');

// Create HTTP server
const httpServer = createServer();

// Initialize Socket.IO
initSocket(httpServer);

// Start server
const PORT = process.env.SOCKET_IO_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Socket.IO server running on port ${PORT}`);
  console.log(`🔗 Connect to: http://localhost:${PORT}`);
});
