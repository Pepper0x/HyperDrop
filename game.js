
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

let score = 0;
let level = 1;
let linesCleared = 0;

const colors = {
  1: 'assets/I.png',
  2: 'assets/J.png',
  3: 'assets/L.png',
  4: 'assets/O.png',
  5: 'assets/S.png',
  6: 'assets/T.png',
  7: 'assets/Z.png'
};

const pieceImages = {};
for (let i = 1; i <= 7; i++) {
  pieceImages[i] = new Image();
  pieceImages[i].src = colors[i];
}

const pieces = 'TJLOSZI';

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0, 6, 0], [6, 6, 6]];
    case 'O': return [[4, 4], [4, 4]];
    case 'L': return [[0, 0, 3], [3, 3, 3]];
    case 'J': return [[2, 0, 0], [2, 2, 2]];
    case 'I': return [[1, 1, 1, 1]];
    case 'S': return [[0, 5, 5], [5, 5, 0]];
    case 'Z': return [[7, 7, 0], [0, 7, 7]];
  }
}

function collide(matrix, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (matrix[y + o.y] &&
           matrix[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(matrix, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        matrix[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    arena.splice(y, 1);
    arena.unshift(new Array(COLS).fill(0));
    ++y;
    score += 100;
    linesCleared++;
    if (linesCleared % 5 === 0) {
      level++;
      dropInterval *= 0.9;
    }
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.drawImage(pieceImages[value],
          (x + offset.x) * BLOCK_SIZE,
          (y + offset.y) * BLOCK_SIZE,
          BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function drawBackground() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#333";
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
  }
  context.fillStyle = "#111";
  context.fillRect(0, canvas.height - 30, canvas.width, 30);
  context.fillStyle = "#fff";
  context.fillText("Score: " + score + "  Level: " + level, 10, canvas.height - 10);
}

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  next.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        nextCtx.drawImage(pieceImages[value],
          x * 30, y * 30, 30, 30);
      }
    });
  });
}

function draw() {
  drawBackground();
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
  drawNextPiece();
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function playerReset() {
  player.matrix = next.matrix;
  next.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
  player.pos.y = 0;
  player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    score = 0;
    linesCleared = 0;
    level = 1;
    dropInterval = 1000;
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const arena = createMatrix(COLS, ROWS);
const player = {
  pos: {x: 0, y: 0},
  matrix: null
};

const next = {
  matrix: createPiece(pieces[Math.floor(pieces.length * Math.random())])
};

function gameInit() {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameCanvas").classList.remove("hidden");
  document.getElementById("nextPieceBox").classList.remove("hidden");
  playerReset();
  update();
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") playerMove(-1);
  else if (event.key === "ArrowRight") playerMove(1);
  else if (event.key === "ArrowDown") playerDrop();
  else if (event.key === "ArrowUp") {
    while (!collide(arena, player)) player.pos.y++;
    player.pos.y--;
    merge(arena, player);
    playerReset();
    dropCounter = 0;
  } else if (event.code === "Space") {
    playerRotate(1);
  }
});

window.onload = () => {
  document.getElementById("startBtn").onclick = () => {
    gameInit();
  };
};
