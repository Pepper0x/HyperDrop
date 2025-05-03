
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 32;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const pieceImages = {
    I: 'assets/I.png',
    J: 'assets/J.png',
    L: 'assets/L.png',
    O: 'assets/O.png',
    S: 'assets/S.png',
    T: 'assets/T.png',
    Z: 'assets/Z.png',
};

const pieces = {
    I: [[1, 1, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    T: [[0, 1, 0], [1, 1, 1]],
    Z: [[1, 1, 0], [0, 1, 1]]
};

let bag = [];
let current, x, y, fallingInterval;

function newPiece() {
    if (bag.length === 0) {
        bag = Object.keys(pieces);
        for (let i = bag.length - 1; i > 0; i--) {
            [bag[i], bag[Math.floor(Math.random() * (i + 1))]] = [bag[Math.floor(Math.random() * (i + 1))], bag[i]];
        }
    }
    let type = bag.pop();
    current = { shape: pieces[type], type };
    x = 3;
    y = 0;
}

function drawBlock(x, y, type) {
    let img = new Image();
    img.src = pieceImages[type];
    img.onload = () => ctx.drawImage(img, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) drawBlock(col, row, board[row][col]);
        }
    }
    current.shape.forEach((r, i) =>
        r.forEach((v, j) => {
            if (v) drawBlock(x + j, y + i, current.type);
        })
    );
}

function move(dx, dy) {
    if (!collides(x + dx, y + dy, current.shape)) {
        x += dx;
        y += dy;
        draw();
    } else if (dy) {
        freeze();
        clearLines();
        newPiece();
    }
}

function rotate() {
    let rotated = current.shape[0].map((_, i) => current.shape.map(r => r[i])).reverse();
    if (!collides(x, y, rotated)) current.shape = rotated;
    draw();
}

function collides(x, y, shape) {
    return shape.some((r, i) => r.some((v, j) => v && (board[y + i]?.[x + j] ?? 1)));
}

function freeze() {
    current.shape.forEach((r, i) =>
        r.forEach((v, j) => {
            if (v) board[y + i][x + j] = current.type;
        })
    );
}

function clearLines() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(v => v)) {
            for (let i = r; i > 0; i--) board[i] = [...board[i - 1]];
            board[0] = Array(COLS).fill(null);
            r++;
        }
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') move(-1, 0);
    else if (e.key === 'ArrowRight') move(1, 0);
    else if (e.key === 'ArrowDown') move(0, 1);
    else if (e.key === ' ') rotate();
});

document.getElementById('startButton').onclick = () => {
    document.getElementById('startScreen').style.display = 'none';
    startGame();
};

function startGame() {
    newPiece();
    fallingInterval = setInterval(() => move(0, 1), 500);
    draw();
}
