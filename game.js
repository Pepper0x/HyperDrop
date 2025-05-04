
function startGame() {
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
