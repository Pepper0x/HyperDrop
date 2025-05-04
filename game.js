
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BLOCK_SIZE = 32;
const COLS = 10;
const ROWS = 19;
const PLAYABLE_ROWS = 19;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = 608;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const pieces = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
};

const images = {};
Object.keys(pieces).forEach(type => {
  const img = new Image();
  img.src = `assets/${type}.png`;
  images[type] = img;
});

let currentPiece, nextPiece, dropCounter = 0, dropInterval = 1000, lastTime = 0;
let score = 0, level = 1, linesCleared = 0, gameRunning = false;
let topScores = [];

const startBtn = document.getElementById("startBtn");
const scoreBtn = document.getElementById("scoreboardBtn");
const backBtn = document.getElementById("backBtn");
const menu = document.getElementById("menu");
const scoreboard = document.getElementById("scoreboard");
const scoreList = document.getElementById("scoreList");
const usernameInput = document.getElementById("username");

function createPiece(type) {
  return {
    shape: pieces[type],
    type,
    x: Math.floor((COLS - pieces[type][0].length) / 2),
    y: 0
  };
}

function collide(board, piece) {
  const { shape, x: px, y: py } = piece;
  return shape.some((row, y) =>
    row.some((val, x) => {
      if (!val) return false;
      const newY = y + py;
      const newX = x + px;
      return newY >= PLAYABLE_ROWS || board[newY] && board[newY][newX] !== null;
    })
  );
}

function merge(board, piece) {
  piece.shape.forEach((row, y) =>
    row.forEach((val, x) => {
      if (val) board[y + piece.y][x + piece.x] = piece.type;
    })
  );
}

function clearRows() {
  let lines = 0;
  for (let y = board.length - 2; y >= 0; y--) {
    if (board[y].every(cell => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      lines++;
      y++;
    }
  }
  if (lines > 0) {
    score += lines * 100;
    linesCleared += lines;
    level = Math.floor(linesCleared / 5) + 1;
    dropInterval = Math.max(200, 1000 - (level - 1) * 100);
    document.getElementById("scoreText").innerText = "Score: " + score;
    document.getElementById("levelText").innerText = "Level: " + level;
  }
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function drawMatrix(matrix, offset, type) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) ctx.drawImage(images[type], (x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    });
  });
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) ctx.drawImage(images[cell], x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    });
  });
}

function drawNextPiece() {
  const offsetX = canvas.width - 96;
  const offsetY = 10;
  nextPiece.shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) ctx.drawImage(images[nextPiece.type], offsetX + x * 20, offsetY + y * 20, 20, 20);
    });
  });
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) {
    drop();
  }
  drawBoard();
  drawMatrix(currentPiece.shape, { x: currentPiece.x, y: currentPiece.y }, currentPiece.type);
  drawNextPiece();
  if (gameRunning) requestAnimationFrame(update);
}

function drop() {
  currentPiece.y++;
  if (collide(board, currentPiece) || currentPiece.y + currentPiece.shape.length >= PLAYABLE_ROWS) {
    currentPiece.y--;
    merge(board, currentPiece);
    clearRows();
    currentPiece = nextPiece;
    nextPiece = createPiece(randomType());
    if (collide(board, currentPiece)) {
      gameRunning = false;
      saveScore(usernameInput.value || "Player", score);
      showGameOverPopup();
      return;
    }
  }
  dropCounter = 0;
}

function move(dir) {
  currentPiece.x += dir;
  if (collide(board, currentPiece)) currentPiece.x -= dir;
}

function hardDrop() {
  while (!collide(board, currentPiece)) currentPiece.y++;
  currentPiece.y--;
  merge(board, currentPiece);
  clearRows();
  currentPiece = nextPiece;
  nextPiece = createPiece(randomType());
}

function randomType() {
  return Object.keys(pieces)[Math.floor(Math.random() * 7)];
}

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  currentPiece = createPiece(randomType());
  nextPiece = createPiece(randomType());
  score = 0;
  level = 1;
  linesCleared = 0;
  gameRunning = true;
  document.getElementById("scoreText").innerText = "Score: 0";
  document.getElementById("levelText").innerText = "Level: 1";
  document.getElementById("gameOverPopup")?.remove();
  update();
}

function saveScore(name, score) {
  topScores.push({ name, score });
  topScores.sort((a, b) => b.score - a.score);
  topScores.length = Math.min(topScores.length, 10);
}

function getTopScoresHTML() {
  return topScores.map(s => `<li>${s.name}: ${s.score}</li>`).join("");
}

function showGameOverPopup() {
  const popup = document.createElement("div");
  popup.id = "gameOverPopup";
  popup.innerHTML = `
    <h2>Game Over</h2>
    <p>Your score: ${score}</p>
    <button id="mainMenuBtn">Main Menu</button>
    <button id="viewScoreboardBtn">View Leaderboard</button>
  `;
  document.getElementById("container").appendChild(popup);
  document.getElementById("mainMenuBtn").onclick = () => {
    popup.remove();
    menu.style.display = "block";
    scoreboard.style.display = "none";
  };
  document.getElementById("viewScoreboardBtn").onclick = () => {
    popup.remove();
    scoreboard.style.display = "block";
    scoreList.innerHTML = getTopScoresHTML();
  };
}

document.addEventListener("keydown", e => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft") move(-1);
  if (e.key === "ArrowRight") move(1);
  if (e.key === "ArrowDown") drop();
  if (e.key === "ArrowUp") hardDrop();
  if (e.key === " ") currentPiece.shape = rotate(currentPiece.shape);
});

startBtn.onclick = () => {
  menu.style.display = "none";
  scoreboard.style.display = "none";
  startGame();
};

scoreBtn.onclick = () => {
  menu.style.display = "none";
  scoreboard.style.display = "block";
  scoreList.innerHTML = getTopScoresHTML();
};

backBtn.onclick = () => {
  menu.style.display = "block";
  scoreboard.style.display = "none";
};
