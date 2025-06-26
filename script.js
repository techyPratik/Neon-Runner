const player = document.getElementById("player");
const obstaclesContainer = document.getElementById("obstacles");
const coinsContainer = document.getElementById("coins");
const scoreDisplay = document.getElementById("score");
const coinCountDisplay = document.getElementById("coinCount");
const finalScoreDisplay = document.getElementById("finalScore");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const coinSound = document.getElementById("coinSound");
const speedBar = document.getElementById("speedBar");
const speedLevelDisplay = document.getElementById("speedLevel");
const pauseBtn = document.getElementById("pauseBtn");

let playerLane = 1;
const lanes = ["25%", "50%", "75%"];
let score = 0;
let coinsCollected = 0;
let speedLevel = 1;
let gameRunning = true;
let paused = false;
let lastObstacleLane = -1;

// Movement
function movePlayer() {
  player.style.left = lanes[playerLane];
}

function moveLeft() {
  if (playerLane > 0) {
    playerLane--;
    movePlayer();
  }
}

function moveRight() {
  if (playerLane < 2) {
    playerLane++;
    movePlayer();
  }
}

// Collision Check
function isColliding(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return (
    aRect.left < bRect.right &&
    aRect.right > bRect.left &&
    aRect.top < bRect.bottom &&
    aRect.bottom > bRect.top
  );
}

// Spawn Obstacle
function spawnObstacle() {
  if (!gameRunning || paused) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  const lane = Math.floor(Math.random() * 3);
  lastObstacleLane = lane;
  obstacle.style.left = lanes[lane];
  obstacle.style.animationDuration = `${Math.max(1, 3 - speedLevel * 0.2)}s`;
  obstaclesContainer.appendChild(obstacle);

  const interval = setInterval(() => {
    if (!gameRunning || paused) return;
    if (isColliding(obstacle, player)) {
      endGame();
      clearInterval(interval);
    }
  }, 30);

  obstacle.addEventListener("animationend", () => {
    obstacle.remove();
    clearInterval(interval);
  });
}

// Spawn Coin
function spawnCoin() {
  if (!gameRunning || paused) return;

  const availableLanes = [0, 1, 2].filter(l => l !== lastObstacleLane);
  const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];

  const coin = document.createElement("div");
  coin.classList.add("coin");
  coin.style.left = lanes[lane];
  coin.style.animationDuration = `${Math.max(1.5, 3.5 - speedLevel * 0.2)}s`;
  coinsContainer.appendChild(coin);

  function checkCoin() {
    if (!gameRunning || paused || !document.body.contains(coin)) return;
    if (isColliding(coin, player)) {
      coin.remove();
      coinSound.play();
      coinsCollected++;
      coinCountDisplay.innerText = `Coins: ${coinsCollected}`;
      return;
    }
    requestAnimationFrame(checkCoin);
  }

  requestAnimationFrame(checkCoin);

  coin.addEventListener("animationend", () => coin.remove());
}

// End Game
function endGame() {
  gameRunning = false;
  gameOverScreen.style.display = "block";
  finalScoreDisplay.innerText = `Score: ${score} | Coins: ${coinsCollected}`;
}

// Restart Game
function restartGame() {
  score = 0;
  coinsCollected = 0;
  speedLevel = 1;
  gameRunning = true;
  paused = false;
  playerLane = 1;
  movePlayer();

  scoreDisplay.innerText = "Score: 0";
  coinCountDisplay.innerText = "Coins: 0";
  speedLevelDisplay.innerText = "Speed: 1";
  speedBar.style.width = "5%";
  gameOverScreen.style.display = "none";
  obstaclesContainer.innerHTML = "";
  coinsContainer.innerHTML = "";
  pauseBtn.innerText = "⏸";
  document.body.classList.remove("paused");
}

// Keyboard Controls
window.addEventListener("keydown", (e) => {
  if (!gameRunning || paused) return;
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
});

// Restart Button
restartBtn.addEventListener("click", restartGame);

// Pause/Play
pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.innerText = paused ? "▶" : "⏸";
  document.body.classList.toggle("paused", paused);
});

// Game Start
movePlayer();

// Score Timer
setInterval(() => {
  if (gameRunning && !paused) {
    score++;
    scoreDisplay.innerText = `Score: ${score}`;
  }
}, 1000);

// Spawners
setInterval(spawnObstacle, 1400);
setInterval(spawnCoin, 1600);

// Speed Scaling
setInterval(() => {
  if (!gameRunning || paused) return;

  speedLevel++;
  speedLevelDisplay.innerText = `Speed: ${speedLevel}`;
  const width = Math.min(100, 5 + speedLevel * 5);
  speedBar.style.width = width + "%";
}, 8000);
