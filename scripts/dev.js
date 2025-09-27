const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting The Movie Game development servers...\n');

// Start Next.js development server
const nextServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Start Socket.IO server
const socketServer = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  nextServer.kill('SIGINT');
  socketServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextServer.kill('SIGTERM');
  socketServer.kill('SIGTERM');
  process.exit(0);
});
