
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const pieceKeys = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const images = {};
let loadedImages = 0;

const backgroundImg = new Image();
backgroundImg.src = 'assets/hyperdrop_background.png';
backgroundImg.onload = () => {
    loadedImages++;
    checkStartGame();
};

pieceKeys.forEach(key => {
    const img = new Image();
    img.src = `assets/${key}.png`;
    img.onload = () => {
        loadedImages++;
        checkStartGame();
    };
    images[key] = img;
});

function checkStartGame() {
    if (loadedImages === pieceKeys.length + 1) {
        startGame();
    }
}

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

let pieceBag = [];
function refillBag() {
    pieceBag = [...pieceKeys].sort(() => Math.random() - 0.5);
}

function getNextPieceType() {
    if (pieceBag.length === 0) refillBag();
    return pieceBag.pop();
}

function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

let currentPiece = null;
let currentX = 3;
let currentY = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const SHAPES = {
    I: [[1, 1, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    T: [[0, 1, 0], [1, 1, 1]],
    Z: [[1, 1, 0], [0, 1, 1]]
};

function createPiece() {
    const type = getNextPieceType();
    return { shape: SHAPES[type], type };
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
        sweep();
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
    let cleared = false;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== null)) {
            for (let x = 0; x < COLS; x++) {
                grid[y][x] = null;
            }
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(null));
            cleared = true;
        }
    }
    if (cleared) draw();
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

canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
});

canvas.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
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

function startGame() {
    refillBag();
    currentPiece = createPiece();
    update();
}
