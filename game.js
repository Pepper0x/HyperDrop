
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

const pieces = ["I", "J", "L", "O", "S", "T", "Z"];
let pieceIndex = 0;
let pieceY = 0;

function loadImage(name) {
  const img = new Image();
  img.src = `assets/${name}.png`;
  return img;
}

const pieceImages = {};
pieces.forEach(p => {
  pieceImages[p] = loadImage(p);
});

startBtn.onclick = () => {
  let username = usernameInput.value || "Player";
  menu.style.display = "none";
  scoreboard.style.display = "none";
  canvas.style.display = "block";
  score = 0;
  gameRunning = true;
  pieceIndex = Math.floor(Math.random() * pieces.length);
  pieceY = 0;
  draw();
};

scoreBtn.onclick = () => {
  menu.style.display = "none";
  scoreboard.style.display = "block";
  canvas.style.display = "none";
  scoreList.innerHTML = "<li>Pepper: 1300</li><li>Pepper: 1000</li><li>Pepper: 800</li>";
};

backBtn.onclick = () => {
  menu.style.display = "block";
  scoreboard.style.display = "none";
  canvas.style.display = "none";
};

function draw() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const piece = pieces[pieceIndex];
  const img = pieceImages[piece];
  if (img.complete) {
    ctx.drawImage(img, 120, pieceY, 40, 40);
  }
  pieceY += 1;
  if (pieceY > canvas.height - 40) {
    pieceY = 0;
    pieceIndex = Math.floor(Math.random() * pieces.length);
  }
  requestAnimationFrame(draw);
}
