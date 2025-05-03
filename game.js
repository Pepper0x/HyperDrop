
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
    const type = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
    return { shape: SHAPES[type], type };
}

// Draw the board
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
                    ctx.drawImage(images[currentPiece.type], (currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }
}

// Collision detection
function collide(shape, offsetX, offsetY) {
    return shape.some((row, y) =>
        row.some((val, x) =>
            val && (grid[y + offsetY] && grid[y + offsetY][x + offsetX]) !== null
        )
    );
}

// Merge piece into grid
function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                grid[currentY + y][currentX + x] = currentPiece.type;
            }
        });
    });
}

// Move piece down
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

// Remove full rows
function sweep() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== null)) {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(null));
        }
    }
}

// Game loop
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

// Controls
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        if (!collide(currentPiece.shape, currentX - 1, currentY)) currentX--;
    } else if (e.key === 'ArrowRight') {
        if (!collide(currentPiece.shape, currentX + 1, currentY)) currentX++;
    } else if (e.key === 'ArrowDown') {
        drop();
    }
});

// Start the game
function startGame() {
    currentPiece = createPiece();
    update();
}
