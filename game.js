
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const pieceKeys = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const SHAPES = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
};

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPiece, currentX, currentY;
let dropCounter = 0, dropInterval = 1000, lastTime = 0;
let backgroundImg = new Image();
const images = {};
let loadedCount = 0;

// Load background
backgroundImg.src = 'assets/hyperdrop_background.png.png';
backgroundImg.onload = assetLoaded;

// Load piece images
pieceKeys.forEach(key => {
  const img = new Image();
  img.src = `assets/${key}.png`;
  img.onload = assetLoaded;
  images[key] = img;
});

function assetLoaded() {
  loadedCount++;
  if (loadedCount === pieceKeys.length + 1) {
    startGame();
  }
}

function startGame() {
  console.log("Game starting...");
  spawnPiece();
  update();
}

function spawnPiece() {
  const type = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
  currentPiece = { type, shape: SHAPES[type] };
  currentX = 3;
  currentY = 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // Draw grid
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const block = grid[y][x];
      if (block) {
        ctx.drawImage(images[block], x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  // Draw current piece
  if (currentPiece) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          ctx.drawImage(
            images[currentPiece.type],
            (currentX + x) * BLOCK_SIZE,
            (currentY + y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    drop();
  }

  draw();
  requestAnimationFrame(update);
}

function collide(shape, offsetX, offsetY) {
  return shape.some((row, y) =>
    row.some((val, x) => {
      if (!val) return false;
      const newY = y + offsetY;
      const newX = x + offsetX;
      return newY >= ROWS || newX < 0 || newX >= COLS || grid[newY][newX] !== null;
    })
  );
}

function merge() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        grid[currentY + y][currentX + x] = currentPiece.type;
      }
    });
  });
}

function drop() {
  if (!collide(currentPiece.shape, currentX, currentY + 1)) {
    currentY++;
  } else {
    merge();
    spawnPiece();
  }
  dropCounter = 0;
}

// Controls
document.addEventListener('keydown', e => {
  if (!currentPiece) return;
  if (e.key === 'ArrowLeft' && !collide(currentPiece.shape, currentX - 1, currentY)) currentX--;
  if (e.key === 'ArrowRight' && !collide(currentPiece.shape, currentX + 1, currentY)) currentX++;
  if (e.key === 'ArrowDown') drop();
  if (e.code === 'Space') {
    const rotated = rotate(currentPiece.shape);
    if (!collide(rotated, currentX, currentY)) currentPiece.shape = rotated;
  }
});

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}
