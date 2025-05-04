
function startGame() {
  console.log("Start button clicked");
  const nameInput = document.getElementById("playerName");
  if (!nameInput.value.trim()) {
    alert("Please enter your name.");
    return;
  }
  localStorage.setItem("currentPlayer", nameInput.value.trim());
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameCanvas").classList.remove("hidden");
  // Start game logic here...
}
function showLeaderboard() {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("leaderboardScreen").classList.remove("hidden");
  const scores = JSON.parse(localStorage.getItem("scores") || "[]").slice(0, 10);
  const list = document.getElementById("leaderboardList");
  list.innerHTML = scores.map(s => `<li>${s.name}: ${s.score}</li>`).join('');
}
function hideLeaderboard() {
  document.getElementById("leaderboardScreen").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
}

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const colors = [
  null,
  'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

const SHAPES = [
  [],
  [[1, 1, 1, 1]],
  [[2, 0, 0], [2, 2, 2]],
  [[0, 0, 3], [3, 3, 3]],
  [[4, 4], [4, 4]],
  [[0, 5, 5], [5, 5, 0]],
  [[0, 6, 0], [6, 6, 6]],
  [[7, 7, 0], [0, 7, 7]],
];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
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

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect((x + offset.x) * BLOCK_SIZE,
                         (y + offset.y) * BLOCK_SIZE,
                         BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'TJLOSZI';
  const type = pieces[Math.floor(pieces.length * Math.random())];
  player.matrix = createPiece(type);
  player.pos.y = 0;
  player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
  }
}

function playerRotate(dir) {
  const m = player.matrix;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
    }
  }
  if (dir > 0) {
    m.forEach(row => row.reverse());
  } else {
    m.reverse();
  }
  if (collide(arena, player)) {
    rotateBack(dir);
  }
}

function rotateBack(dir) {
  playerRotate(-dir);
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

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

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

const arena = createMatrix(COLS, ROWS);
const player = {
  pos: {x: 0, y: 0},
  matrix: null
};

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") {
    playerMove(-1);
  } else if (event.key === "ArrowRight") {
    playerMove(1);
  } else if (event.key === "ArrowDown") {
    playerDrop();
  } else if (event.key === "q") {
    playerRotate(-1);
  } else if (event.key === "w") {
    playerRotate(1);
  }
});

function gameInit() {
  console.log("Game init triggered");
  playerReset();
  update();
}


const pieceImages = {
  1: new Image(),
  2: new Image(),
  3: new Image(),
  4: new Image(),
  5: new Image(),
  6: new Image(),
  7: new Image(),
};

pieceImages[1].src = 'assets/I.png';
pieceImages[2].src = 'assets/J.png';
pieceImages[3].src = 'assets/L.png';
pieceImages[4].src = 'assets/O.png';
pieceImages[5].src = 'assets/S.png';
pieceImages[6].src = 'assets/T.png';
pieceImages[7].src = 'assets/Z.png';

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const img = pieceImages[value];
        context.drawImage(
          img,
          (x + offset.x) * BLOCK_SIZE,
          (y + offset.y) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    });
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") {
    playerMove(-1);
  } else if (event.key === "ArrowRight") {
    playerMove(1);
  } else if (event.key === "ArrowDown") {
    playerDrop();
  } else if (event.key === "ArrowUp") {
    while (!collide(arena, player)) {
      player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    dropCounter = 0;
  } else if (event.code === "Space") {
    playerRotate(1);
  }
});
