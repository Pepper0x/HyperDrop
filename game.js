
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

const images = {};
let backgroundImg = new Image();
let gameStarted = false;

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

let currentPiece, currentX, currentY;
let dropInterval = 1000;
let dropCounter = 0;
let lastTime = 0;

function preloadAssets() {
  let loaded = 0;
  const total = pieceKeys.length + 1;

  backgroundImg.src = 'assets/hyperdrop_background.png';
  backgroundImg.onload = check;

  pieceKeys.forEach(key => {
    const img = new Image();
    img.src = `assets/${key}.png`;
    img.onload = check;
    images[key] = img;
  });

  function check() {
    loaded++;
    if (loaded === total) {
      console.log("All assets loaded.");
      startGame();
    }
  }
}

function createPiece() {
  const type = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
  return { type, shape: SHAPES[type] };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const block = grid[y][x];
      if (block) {
        ctx.drawImage(images[block], x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  if (currentPiece) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          ctx.drawImage(images[currentPiece.type], (currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
}

function collide(shape, offsetX, offsetY) {
  return shape.some((row, y) =>
    row.some((val, x) =>
      val && (grid[y + offsetY] && grid[y + offsetY][x + offsetX]) !== null
    )
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
    currentPiece = createPiece();
    currentX = 3;
    currentY = 0;
  }
  dropCounter = 0;
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

function startGame() {
  console.log("Starting game...");
  currentPiece = createPiece();
  currentX = 3;
  currentY = 0;
  gameStarted = true;
  update();
}

document.addEventListener('keydown', e => {
  if (!gameStarted) return;
  if (e.key === 'ArrowLeft' && !collide(currentPiece.shape, currentX - 1, currentY)) {
    currentX--;
  } else if (e.key === 'ArrowRight' && !collide(currentPiece.shape, currentX + 1, currentY)) {
    currentX++;
  } else if (e.key === 'ArrowDown') {
    drop();
  } else if (e.code === 'Space') {
    const rotated = rotate(currentPiece.shape);
    if (!collide(rotated, currentX, currentY)) {
      currentPiece.shape = rotated;
    }
  }
});

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

preloadAssets();
