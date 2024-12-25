const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = 800;
canvas.height = 400;

let box = { x: 50, y: 300, width: 20, height: 20, dy: 5, onGround: true };
let obstacles = [];
let score = 0;
let gameSpeed = 3;
let isGameOver = false;
let gameStarted = false;
let pubrevnum = 0;

function fetchRevisions() {
    const owner = "0689436";
    const repo = "pong";
    const branch = "main"; // Replace with your branch name
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=1`;
  
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`GitHub API returned an error: ${response.status}`);
        }
  
        // Get the 'Link' header to determine pagination
        const linkHeader = response.headers.get("Link");
        let totalCommits;
  
        if (linkHeader) {
          const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
          if (match) {
            totalCommits = parseInt(match[1], 10);
          }
        }
  
        // If not paginated (only 1 page), get the number of results
        return response.json().then(data => totalCommits || data.length);
      })
      .then(totalCommits => {
        pubrevnum = totalCommits;
        console.log("Total Commits:", pubrevnum);
  
        // Update the displayed revision number
        const pubRevNumDisplay = document.getElementById("pubrevnum");
        if (pubRevNumDisplay) {
          pubRevNumDisplay.textContent = pubrevnum; // Set only the revision number
        }
      })
      .catch(error => {
        console.error("Error fetching commits:", error);
      });
  }


function createObstacle() {
  const gap = Math.random() * 100 + 200; // Randomize spacing between obstacles
  obstacles.push({ x: canvas.width, y: 300, size: 20 });
}

function drawBox() {
  ctx.fillStyle = 'white';
  ctx.fillRect(box.x, box.y, box.width, box.height);
}

function drawObstacles() {
  ctx.fillStyle = 'white';
  obstacles.forEach(ob => {
    ctx.beginPath();
    ctx.moveTo(ob.x, ob.y); // Top point of the triangle
    ctx.lineTo(ob.x + ob.size, ob.y + ob.size); // Bottom-right
    ctx.lineTo(ob.x - ob.size, ob.y + ob.size); // Bottom-left
    ctx.closePath();
    ctx.fill();
  });
}

function updateObstacles() {
  obstacles.forEach(ob => ob.x -= gameSpeed);
  obstacles = obstacles.filter(ob => ob.x + ob.size > 0); // Remove obstacles that move off screen
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 20, 30);
}

function checkCollision() {
  obstacles.forEach(ob => {
    if (
      box.x < ob.x + ob.size &&
      box.x + box.width > ob.x - ob.size &&
      box.y + box.height > ob.y
    ) {
      isGameOver = true;
    }
  });
}

function jump() {
  if (!isGameOver && box.onGround) {
    box.dy = -12;
    box.onGround = false;
    if (!gameStarted) gameStarted = true; // Start the game and score on first jump
  }
}

function gameOverScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Game Over! Your score: ${score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

function restartGame() {
  box = { x: 50, y: 300, width: 20, height: 20, dy: 0, onGround: true };
  obstacles = [];
  score = 0;
  isGameOver = false;
  gameStarted = false;
  gameSpeed = 3;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isGameOver) {
    if (gameStarted) {
      // Update box
      box.dy += 0.5; // gravity
      box.y += box.dy;
      if (box.y >= 300) {
        box.y = 300;
        box.dy = 0;
        box.onGround = true;
      }

      // Update obstacles and score only if the game has started
      updateObstacles();
      score++;
    }

    // Draw everything
    drawBox();
    drawObstacles();
    drawScore();

    // Check collisions
    checkCollision();
  } else {
    gameOverScreen();
  }

  requestAnimationFrame(gameLoop);
}

setInterval(() => {
  if (gameStarted && !isGameOver) createObstacle();
}, 2000);

window.addEventListener('keydown', e => {
  if (e.key === ' ') jump(); // Space to jump
  if (e.key === 'r' && isGameOver) restartGame(); // R to restart
});

gameLoop();

fetchRevisions();
