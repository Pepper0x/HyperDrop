
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('preview');
const previewCtx = previewCanvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 32;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
previewCanvas.width = 6 * BLOCK_SIZE;
previewCanvas.height = 6 * BLOCK_SIZE;

let board, current, nextPiece, x, y;
let bag = [], score = 0, level = 1, linesCleared = 0, interval, dropSpeed = 500, playerName = "", isGameOver = false;

const colors = {
  I: 'cyan', J: 'blue', L: 'orange',
  O: 'yellow', S: 'lime', T: 'purple', Z: 'red'
};

const pieces = {
  I: [[1,1,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  T: [[0,1,0],[1,1,1]],
  Z: [[1,1,0],[0,1,1]]
};

function getRandomPiece() {
  if (bag.length === 0) bag = Object.keys(pieces).sort(() => Math.random() - 0.5);
  return bag.pop();
}

function newPiece() {
  current = {
    type: nextPiece || getRandomPiece(),
    shape: pieces[nextPiece || getRandomPiece()]
  };
  nextPiece = getRandomPiece();
  x = 3;
  y = 0;
  if (collides(x, y, current.shape)) gameOver();
  drawPreview();
}

function drawBlock(ctx, x, y, type, alpha = 1) {
  ctx.globalAlpha = alpha;
  let img = new Image(); img.src = `assets/${type}.png`; ctx.drawImage(img, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, i) => row.forEach((val, j) => {
    if (val) drawBlock(ctx, j, i, val);
  }));

  // Draw ghost
  const ghostY = getGhostY();
  current.shape.forEach((row, i) =>
    row.forEach((val, j) => {
      if (val) drawBlock(ctx, x + j, ghostY + i, current.type, 0.3);
    })
  );

  // Draw active piece
  current.shape.forEach((row, i) =>
    row.forEach((val, j) => {
      if (val) drawBlock(ctx, x + j, y + i, current.type);
    })
  );
}

function getGhostY() {
  let ghostY = y;
  while (!collides(x, ghostY + 1, current.shape)) ghostY++;
  return ghostY;
}

function drawPreview() {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  const shape = pieces[nextPiece];
  shape.forEach((row, i) =>
    row.forEach((val, j) => {
      if (val) drawBlock(previewCtx, j + 1, i + 1, nextPiece);
    })
  );
}

function move(dx, dy) {
  if (!collides(x + dx, y + dy, current.shape)) {
    x += dx; y += dy;
  } else if (dy === 1) {
    merge();
    clearLines();
    newPiece();
  }
  draw();
}

function rotate() {
  let rotated = current.shape[0].map((_, i) => current.shape.map(r => r[i])).reverse();
  if (!collides(x, y, rotated)) current.shape = rotated;
  draw();
}

function collides(nx, ny, shape) {
  return shape.some((row, i) =>
    row.some((val, j) =>
      val && (board[ny + i]?.[nx + j] !== null || nx + j < 0 || nx + j >= COLS || ny + i >= ROWS)
    )
  );
}

function merge() {
  current.shape.forEach((row, i) =>
    row.forEach((val, j) => {
      if (val) board[y + i][x + j] = current.type;
    })
  );
}

function clearLines() {
  for (let i = ROWS - 1; i >= 0; i--) {
    if (board[i].every(cell => cell)) {
      for (let k = i; k > 0; k--) board[k] = [...board[k - 1]];
      board[0] = Array(COLS).fill(null);
      score += 100;
      linesCleared++;
      updateLevel();
      updateScore();
      i++;
    }
  }
}

function updateLevel() {
  let newLevel = Math.min(5, Math.floor(linesCleared / 5) + 1);
  if (newLevel !== level) {
    level = newLevel;
    dropSpeed = 500 - (level - 1) * 75;
    clearInterval(interval);
    interval = setInterval(() => move(0, 1), dropSpeed);
  }
}

function updateScore() {
  document.getElementById('scoreDisplay').textContent = "Score: " + score + " | Level: " + level;
}

function gameOver() {
  if (isGameOver) return;
  isGameOver = true;
  clearInterval(interval);
  alert("Game Over! Final Score: " + score);
  let lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  lb.push({ name: playerName, score });
  lb.sort((a, b) => b.score - a.score);
  lb = lb.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(lb));
  showStartScreen();
}

function showStartScreen() {
  document.getElementById("startScreen").style.display = "flex";
  renderLeaderboard();
}

function hardDrop() {
  while (!collides(x, y + 1, current.shape)) {
    y++;
  }
  move(0, 1);
}

document.addEventListener("keydown", e => {
  if (!current) return;
  if (e.key === "ArrowLeft") move(-1, 0);
  if (e.key === "ArrowRight") move(1, 0);
  if (e.key === "ArrowDown") move(0, 1);
  if (e.key === "ArrowUp") hardDrop();
  if (e.key === " ") rotate();
});

document.getElementById("startButton").onclick = () => {
  playerName = document.getElementById("nameInput").value || "Player";
  document.getElementById("startScreen").style.display = "none";
  startGame();
};

function startGame() {
  isGameOver = false;
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  score = 0;
  linesCleared = 0;
  level = 1;
  dropSpeed = 500;
  nextPiece = getRandomPiece();
  updateScore();
  newPiece();
  interval = setInterval(() => move(0, 1), dropSpeed);
}

function renderLeaderboard() {
  const lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const container = document.getElementById("leaderboard");
  container.innerHTML = "<h3>Top Scores</h3>" + lb.map(p => `<div>${p.name}: ${p.score}</div>`).join('');
}

renderLeaderboard();

document.getElementById("startButton").addEventListener("click", () => {
  document.getElementById("leaderboard").style.display = "none";
});

function showStartScreen() {
  document.getElementById("startScreen").style.display = "flex";
  document.getElementById("leaderboard").style.display = "block";
  renderLeaderboard();
}
