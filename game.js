
// Load background image
const backgroundImg = new Image();
backgroundImg.src = 'assets/hyperdrop_background.png';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Load images
const pieceKeys = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const images = {};
let loadedImages = 0;

pieceKeys.forEach(key => {
    const img = new Image();
    img.src = `assets/${key}.png`;
    img.onload = () => {
        loadedImages++;
        if (loadedImages === pieceKeys.length) {
            startGame();
        }
    };
    images[key] = img;
});

// Game grid
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// 7-bag system
let pieceBag = [];
function refillBag() {
    pieceBag = [...pieceKeys].sort(() => Math.random() - 0.5);
}

function getNextPieceType() {
    if (pieceBag.length === 0) refillBag();
    return pieceBag.pop();
}

// Rotation helper
function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

let currentPiece = null;
let currentX = 3;
let currentY = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Piece shapes
const SHAPES = {
    I: [[1, 1, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    T: [[0, 1, 0], [1, 1, 1]],
    Z: [[1, 1, 0], [0, 1, 1]]
};

// Create a new piece
function createPiece() {
    const type = getNextPieceType();
    return { shape: SHAPES[type], type };
}

// Draw the board
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
        if (collide(currentPiece.shape, currentX, currentY)) {
            alert("Game Over");
            for (let y = 0; y < ROWS; y++) grid[y].fill(null);
        }
    }
    dropCounter = 0;
}



function sweep() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== null)) {
            let x = 0;
            const clearInterval = setInterval(() => {
                if (x < COLS) {
                    grid[y][x] = null;
                    x++;
                } else {
                    clearInterval(clearInterval);
                    setTimeout(() => {
                        grid.splice(y, 1);
                        grid.unshift(Array(COLS).fill(null));
                    }, 50);
                }
            }, 30);
            return; // handle one row at a time for animation
        }
    }
}
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        drop();
        sweep();
    }

    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        if (!collide(currentPiece.shape, currentX - 1, currentY)) currentX--;
    } else if (e.key === 'ArrowRight') {
        if (!collide(currentPiece.shape, currentX + 1, currentY)) currentX++;
    } else if (e.key === 'ArrowDown') {
        drop();
    } else if (e.code === 'Space') {
        const rotated = rotate(currentPiece.shape);
        if (!collide(rotated, currentX, currentY)) {
            currentPiece.shape = rotated;
        }
    }
});

function startGame() {
    refillBag();
    currentPiece = createPiece();
    update();
}

// --- Mobile Controls ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchStartTime = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartTime = Date.now();
});

canvas.addEventListener("touchend", (e) => {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  const time = Date.now() - touchStartTime;

  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    // Tap to rotate
    const rotated = rotate(currentPiece.shape);
    if (!collide(rotated, currentX, currentY)) {
        currentPiece.shape = rotated;
    }
    return;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) {
      if (!collide(currentPiece.shape, currentX + 1, currentY)) currentX++;
    } else if (dx < -30) {
      if (!collide(currentPiece.shape, currentX - 1, currentY)) currentX--;
    }
  } else {
    if (dy > 30) {
      drop();
    }
  }
});

canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
});
