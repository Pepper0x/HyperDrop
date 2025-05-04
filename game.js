
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 32;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let colors = {
  I: 'cyan', J: 'blue', L: 'orange',
  O: 'yellow', S: 'lime', T: 'purple', Z: 'red'
};
let pieces = {
  I: [[1,1,1,1]], J: [[1,0,0],[1,1,1]], L: [[0,0,1],[1,1,1]],
  O: [[1,1],[1,1]], S: [[0,1,1],[1,1,0]], T: [[0,1,0],[1,1,1]], Z: [[1,1,0],[0,1,1]]
};

let bag = [], current, x, y, score = 0, playerName = "", interval;

function newPiece() {
  if (bag.length === 0) {
    bag = Object.keys(pieces).sort(() => Math.random() - 0.5);
  }
  let type = bag.pop();
  current = { shape: pieces[type], type };
  x = 3;
  y = 0;
  if (collides(x, y, current.shape)) gameOver();
}

function drawBlock(x, y, type) {
  ctx.fillStyle = colors[type];
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, i) => row.forEach((val, j) => {
    if (val) drawBlock(j, i, val);
  }));
  current.shape.forEach((row, i) =>
    row.forEach((val, j) => {
      if (val) drawBlock(x + j, y + i, current.type);
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
      updateScore();
      i++;
    }
  }
}

function updateScore() {
  document.getElementById('scoreDisplay').textContent = "Score: " + score;
}

function gameOver() {
  clearInterval(interval);
  alert("Game Over! Final Score: " + score);
  let lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  lb.push({ name: playerName, score });
  lb.sort((a, b) => b.score - a.score);
  lb = lb.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(lb));
  location.reload();
}

document.addEventListener("keydown", e => {
  if (!current) return;
  if (e.key === "ArrowLeft") move(-1, 0);
  if (e.key === "ArrowRight") move(1, 0);
  if (e.key === "ArrowDown") move(0, 1);
  if (e.key === " ") rotate();
});

document.getElementById("startButton").onclick = () => {
  playerName = document.getElementById("nameInput").value || "Player";
  document.getElementById("startScreen").style.display = "none";
  startGame();
};

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  score = 0;
  updateScore();
  newPiece();
  interval = setInterval(() => move(0, 1), 500);
}

function renderLeaderboard() {
  const lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const container = document.getElementById("leaderboard");
  container.innerHTML = "<h3>Top Scores</h3>" + lb.map(p => `<div>${p.name}: ${p.score}</div>`).join('');
}

renderLeaderboard();
