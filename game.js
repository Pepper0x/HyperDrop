
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;

let backgroundImg = new Image();
backgroundImg.src = 'assets/hyperdrop_background.png.png';

backgroundImg.onload = () => {
  drawBackground();
  drawPiece();
};

function drawBackground() {
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function drawPiece() {
  ctx.fillStyle = 'red';
  ctx.fillRect(3 * BLOCK_SIZE, 0, BLOCK_SIZE, BLOCK_SIZE);
}
