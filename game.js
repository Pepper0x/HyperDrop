
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const scoreBtn = document.getElementById("scoreboardBtn");
const backBtn = document.getElementById("backBtn");
const menu = document.getElementById("menu");
const scoreboard = document.getElementById("scoreboard");
const scoreList = document.getElementById("scoreList");
const usernameInput = document.getElementById("username");

let score = 0;
let gameRunning = false;
let topScores = [];
let dropInterval = 1000;
let dropCounter = 0;
let lastTime = 0;

const pieceTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const pieceImages = {};
pieceTypes.forEach(type => {
  const img = new Image();
  img.src = `assets/${type}.png`;
  pieceImages[type] = img;
});

function createPiece(type) {
  return {
    type: type,
    x: Math.floor((canvas.width / 32) / 2 - 1),
    y: 0,
    img: pieceImages[type]
  };
}

let currentPiece = createPiece(randomPiece());
let nextPiece = createPiece(randomPiece());

function randomPiece() {
  return pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentPiece.img, currentPiece.x * 32, currentPiece.y * 32, 32, 32);
  requestAnimationFrame(draw);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    currentPiece.y++;
    dropCounter = 0;
    if (currentPiece.y * 32 >= canvas.height - 32) {
      saveScore(usernameInput.value || "Player", score);
      showGameOverPopup();
      return;
    }
  }
  draw();
  if (gameRunning) requestAnimationFrame(update);
}

function startGame() {
  score = 0;
  gameRunning = true;
  currentPiece = createPiece(randomPiece());
  nextPiece = createPiece(randomPiece());
  document.getElementById("gameOverPopup")?.remove();
  update();
}

function saveScore(name, score) {
  topScores.push({ name, score });
  topScores.sort((a, b) => b.score - a.score);
  if (topScores.length > 10) topScores.length = 10;
}

function getTopScoresHTML() {
  return topScores.map(s => `<li>${s.name}: ${s.score}</li>`).join("");
}

function showGameOverPopup() {
  gameRunning = false;
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
