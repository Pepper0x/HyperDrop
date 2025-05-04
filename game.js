const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function startGame() {
  document.getElementById('menu').style.display = 'none';
  // Placeholder for game initialization
  ctx.fillStyle = 'cyan';
  ctx.fillRect(32, 32, 32, 32); // Draw a square to confirm it starts
}

function showLeaderboard() {
  alert('Leaderboard coming soon...');
}
