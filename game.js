
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BLOCK_SIZE = 32;
const COLS = 10;
const ROWS = 20;
const WIDTH = BLOCK_SIZE * COLS;
const HEIGHT = BLOCK_SIZE * ROWS;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const scoreDisplay = document.createElement("div");
scoreDisplay.id = "scoreDisplay";
scoreDisplay.style.textAlign = "center";
scoreDisplay.style.fontSize = "18px";
scoreDisplay.style.color = "#fff";
scoreDisplay.style.marginTop = "6px";
document.getElementById("container").appendChild(scoreDisplay);

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPiece = null;
let nextPiece = null;
let dropInterval = 800;
let dropCounter = 0;
let lastTime = 0;
let score = 0;
let gameOver = false;

const pieceTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const pieceShapes = {
  'I': [[1, 1, 1, 1]],
  'J': [[1, 0, 0], [1, 1, 1]],
  'L': [[0, 0, 1], [1, 1, 1]],
  'O': [[1, 1], [1, 1]],
  'S': [[0, 1, 1], [1, 1, 0]],
  'T': [[0, 1, 0], [1, 1, 1]],
  'Z': [[1, 1, 0], [0, 1, 1]]
};

const pieceImages = {};
pieceTypes.forEach(t => {
  const img = new Image();
  img.src = `assets/${t}.png`;
  pieceImages[t] = img;
});

function createPiece(type) {
  return {
    shape: pieceShapes[type],
    type: type,
    x: Math.floor((COLS - pieceShapes[type][0].length) / 2),
    y: 0
  };
}

function drawBlock(x, y, type) {
  const img = pieceImages[type];
  if (img.complete) {
    ctx.drawImage(img, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  } else {
    img.onload = () => {
      ctx.drawImage(img, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    };
  }
}

function drawMatrix(matrix, offset, type) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        drawBlock(x + offset.x, y + offset.y, type);
      }
    });
  });
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        drawBlock(x, y, cell);
      }
    });
  });
}

function draw() {
  drawBoard();
  drawMatrix(currentPiece.shape, { x: currentPiece.x, y: currentPiece.y }, currentPiece.type);
  scoreDisplay.innerText = `Score: ${score}`;
}

function collide(board, piece) {
  const [m, o] = [piece.shape, { x: piece.x, y: piece.y }];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] && (board[y + o.y] && board[y + o.y][x + o.x]) !== null) {
        return true;
      }
    }
  }
  return false;
}

function merge(board, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        board[y + piece.y][x + piece.x] = piece.type;
      }
    });
  });
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function drop() {
  currentPiece.y++;
  if (collide(board, currentPiece)) {
    currentPiece.y--;
    merge(board, currentPiece);
    resetPiece();
    clearRows();
    if (collide(board, currentPiece)) {
      gameOver = true;
      alert("Game Over");
      resetGame();
    }
  }
  dropCounter = 0;
}

function clearRows() {
  outer: for (let y = board.length - 1; y >= 0; --y) {
    for (let x = 0; x < board[y].length; ++x) {
      if (!board[y][x]) continue outer;
    }
    const row = board.splice(y, 1)[0].fill(null);
    board.unshift(row);
    score += 100;
    y++;
  }
}

function move(dir) {
  currentPiece.x += dir;
  if (collide(board, currentPiece)) {
    currentPiece.x -= dir;
  }
}

function hardDrop() {
  while (!collide(board, currentPiece)) {
    currentPiece.y++;
  }
  currentPiece.y--;
  merge(board, currentPiece);
  resetPiece();
  clearRows();
}

function resetPiece() {
  currentPiece = nextPiece || createPiece(pieceTypes[Math.floor(Math.random() * pieceTypes.length)]);
  nextPiece = createPiece(pieceTypes[Math.floor(Math.random() * pieceTypes.length)]);
  currentPiece.x = Math.floor((COLS - currentPiece.shape[0].length) / 2);
  currentPiece.y = 0;
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  score = 0;
  gameOver = false;
  resetPiece();
}

document.addEventListener("keydown", e => {
  if (gameOver) return;
  if (e.key === "ArrowLeft") move(-1);
  else if (e.key === "ArrowRight") move(1);
  else if (e.key === "ArrowDown") drop();
  else if (e.key === "ArrowUp") hardDrop();
  else if (e.key === " ") currentPiece.shape = rotate(currentPiece.shape);
});

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
  resetGame();
  update();
}

document.getElementById("startBtn").onclick = () => {
  document.getElementById("menu").style.display = "none";
  document.getElementById("scoreboard").style.display = "none";
  canvas.style.display = "block";
  startGame();
};

document.getElementById("scoreboardBtn").onclick = () => {
  document.getElementById("menu").style.display = "none";
  document.getElementById("scoreboard").style.display = "block";
  canvas.style.display = "none";
  document.getElementById("scoreList").innerHTML = "<li>Pepper: 1300</li><li>Pepper: 1000</li>";
};

document.getElementById("backBtn").onclick = () => {
  document.getElementById("menu").style.display = "block";
  document.getElementById("scoreboard").style.display = "none";
  canvas.style.display = "none";
};


function showGameOverPopup() {
  const popup = document.createElement("div");
  popup.id = "gameOverPopup";
  popup.style.position = "absolute";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "rgba(0, 0, 0, 0.8)";
  popup.style.color = "#fff";
  popup.style.padding = "20px";
  popup.style.border = "2px solid #fff";
  popup.style.borderRadius = "10px";
  popup.style.textAlign = "center";
  popup.style.zIndex = "100";

  popup.innerHTML = \`
    <h2>Game Over</h2>
    <p>Your score: \${score}</p>
    <button id="mainMenuBtn">Main Menu</button>
    <button id="viewScoreboardBtn">View Leaderboard</button>
  \`;

  document.body.appendChild(popup);

  document.getElementById("mainMenuBtn").onclick = () => {
    popup.remove();
    document.getElementById("menu").style.display = "block";
    canvas.style.display = "none";
    scoreList.innerHTML = getTopScoresHTML();
  };

  document.getElementById("viewScoreboardBtn").onclick = () => {
    popup.remove();
    document.getElementById("scoreboard").style.display = "block";
    canvas.style.display = "none";
    scoreList.innerHTML = getTopScoresHTML();
  };

  saveScore(usernameInput.value || "Player", score);
}

let topScores = [];

function saveScore(name, score) {
  topScores.push({ name, score });
  topScores.sort((a, b) => b.score - a.score);
  if (topScores.length > 10) topScores.length = 10;
}

function getTopScoresHTML() {
  return topScores.map(s => \`<li>\${s.name}: \${s.score}</li>\`).join("");
}
