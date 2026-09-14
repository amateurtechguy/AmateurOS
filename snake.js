const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const restartButton = document.getElementById("restartButton");
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake;
let food;
let direction;
let nextDirection;
let score;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameRunning;
let gameLoop;
highScoreElement.textContent = highScore;
function startGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreElement.textContent = score;
  gameRunning = true;
  createFood();
  clearInterval(gameLoop);
  gameLoop = setInterval(updateGame, 100);
  drawGame();
}
function updateGame() {
  if (!gameRunning) return;
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  if (
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount
  ) {
    gameOver();
    return;
  }
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreElement.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreElement.textContent = highScore;
      localStorage.setItem("snakeHighScore", highScore);
    }
    createFood();
  } else {
    snake.pop();
  }
  drawGame();
}
function drawGame() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#a30c01" : "#ff0101";
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
    if (index === 0) {
      ctx.fillStyle = "#060606";
      const eyeSize = 3;
      if (direction.x === 1) {
        ctx.fillRect(
          segment.x * gridSize + 13,
          segment.y * gridSize + 5,
          eyeSize,
          eyeSize
        );
        ctx.fillRect(
          segment.x * gridSize + 13,
          segment.y * gridSize + 12,
          eyeSize,
          eyeSize
        );
      } else if (direction.x === -1) {
        ctx.fillRect(
          segment.x * gridSize + 4,
          segment.y * gridSize + 5,
          eyeSize,
          eyeSize
        );
        ctx.fillRect(
          segment.x * gridSize + 4,
          segment.y * gridSize + 12,
          eyeSize,
          eyeSize
        );
      } else if (direction.y === -1) {
        ctx.fillRect(
          segment.x * gridSize + 5,
          segment.y * gridSize + 4,
          eyeSize,
          eyeSize
        );
        ctx.fillRect(
          segment.x * gridSize + 12,
          segment.y * gridSize + 4,
          eyeSize,
          eyeSize
        );
      } else {
        ctx.fillRect(
          segment.x * gridSize + 5,
          segment.y * gridSize + 13,
          eyeSize,
          eyeSize
        );
        ctx.fillRect(
          segment.x * gridSize + 12,
          segment.y * gridSize + 13,
          eyeSize,
          eyeSize
        );
      }
    }
  });
}
function drawGrid() {
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    const position = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }
}
function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fca5a5";
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY - 2, 2, 0, Math.PI * 2);
  ctx.fill();
}
function createFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (
    snake.some(
      segment => segment.x === newFood.x && segment.y === newFood.y
    )
  );
  food = newFood;
}
function changeDirection(newDirection) {
  if (
    newDirection.x === -direction.x &&
    newDirection.y === -direction.y
  ) {
    return;
  }
  nextDirection = newDirection;
}
document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  switch (key) {
    case "arrowup":
    case "w":
      event.preventDefault();
      changeDirection({ x: 0, y: -1 });
      break;
    case "arrowdown":
    case "s":
      event.preventDefault();
      changeDirection({ x: 0, y: 1 });
      break;
    case "arrowleft":
    case "a":
      event.preventDefault();
      changeDirection({ x: -1, y: 0 });
      break;
    case "arrowright":
    case "d":
      event.preventDefault();
      changeDirection({ x: 1, y: 0 });
      break;
    case " ":
      if (!gameRunning) {
        startGame();
      }
      break;
  }
});
function gameOver() {
  gameRunning = false;
  clearInterval(gameLoop);
  setTimeout(() => {
    alert(`Game Over! Your score: ${score}`);
  }, 50);
}
restartButton.addEventListener("click", startGame);
startGame();