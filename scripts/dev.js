const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting The Movie Game development server...\n');

// Start Next.js development server
const nextServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  nextServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextServer.kill('SIGTERM');
  process.exit(0);
});
