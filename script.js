// Create canvas and append to the document
const canvas = document.createElement('canvas');
canvas.id = 'gameCanvas'; // Add an ID for debugging
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = 800;
canvas.height = 400;

// Game variables
let box = { x: 50, y: 300, width: 20, height: 20, dy: 5, onGround: true };
let obstacles = [];
let score = 0;
let gameSpeed = 3;
let isGameOver = false;
let gameStarted = false;
let pubrevnum = 0;

let baseObstacleInterval = 2000; // Base interval in milliseconds
let lastObstacleTime = 0; // Tracks the last time an obstacle was created

// Function to fetch revisions (optional, can be removed if not needed)
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

            const linkHeader = response.headers.get("Link");
            let totalCommits;

            if (linkHeader) {
                const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
                if (match) {
                    totalCommits = parseInt(match[1], 10);
                }
            }

            return response.json().then(data => totalCommits || data.length);
        })
        .then(totalCommits => {
            pubrevnum = totalCommits;
            console.log("Total Commits:", pubrevnum);

            const pubRevNumDisplay = document.getElementById("pubrevnum");
            if (pubRevNumDisplay) {
                pubRevNumDisplay.textContent = pubrevnum;
            }
        })
        .catch(error => {
            console.error("Error fetching commits:", error);
        });
}

// Function to create obstacles with random colors and increased spacing (5x more)
function createObstacle() {
    const gap = Math.random() * 1.2 + 9; // Increase spacing between obstacles by 5x
    obstacles.push({ 
        x: canvas.width, 
        y: 300, 
        size: 20,
        color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})` // Random color
    });
}

// Function to slow down the game speed
function slowdown() {
    gameSpeed = Math.max(0.5, gameSpeed - 0.5); // Ensure minimum speed is 0.5
}

// Function to speed up the game speed
function speedup() {
    gameSpeed += 0.5; // Increase speed by 0.5
}

// Function to draw the box (player)
function drawBox() {
    ctx.fillStyle = 'white';
    ctx.fillRect(box.x, box.y, box.width, box.height);
}

// Function to draw obstacles with random colors
function drawObstacles() {
    obstacles.forEach(ob => {
        ctx.fillStyle = ob.color; // Set the random color for each obstacle
        ctx.beginPath();
        ctx.moveTo(ob.x, gap.y);
        ctx.lineTo(ob.x + ob.size, ob.y + ob.size);
        ctx.lineTo(ob.x - ob.size, ob.y + ob.size);
        ctx.closePath();
        ctx.fill();
    });
}

// Function to update the obstacles (move them)
function updateObstacles() {
    obstacles.forEach(ob => ob.x -= gameSpeed);
    obstacles = obstacles.filter(ob => ob.x + ob.size > 0); // Remove obstacles that move off screen
}

// Function to draw the score
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}`, 20, 60); // Display current speed
}

// Function to check for collisions
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

// Function to make the box jump
function jump() {
    if (!isGameOver && box.onGround) {
        box.dy = -12;
        box.onGround = false;
        if (!gameStarted) gameStarted = true; // Start the game and score on first jump
    }
}

// Function to display the Game Over screen
function gameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Game Over! Your score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

// Function to restart the game
function restartGame() {
    box = { x: 50, y: 300, width: 20, height: 20, dy: 0, onGround: true };
    obstacles = [];
    score = 0;
    isGameOver = false;
    gameStarted = false;
    gameSpeed = 3;
    lastObstacleTime = 0;
}

// Function to handle the game loop (animation)
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
        if (gameStarted) {
            // Adjust obstacle interval based on gameSpeed
            const obstacleInterval = baseObstacleInterval / (1.4 * gameSpeed);

            // Spawn obstacles at the adjusted interval
            if (timestamp - lastObstacleTime >= obstacleInterval) {
                createObstacle();
                lastObstacleTime = timestamp;
            }

            // Update box position with gravity
            box.dy += 0.5; // gravity
            box.y += box.dy;
            if (box.y >= 300) {
                box.y = 300;
                box.dy = 0;
                box.onGround = true;
            }

            // Move obstacles and update score
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

    requestAnimationFrame(gameLoop); // Schedule the next frame
}

// Listen for keypress events
window.addEventListener('keydown', e => {
    if (e.key === ' ') jump(); // Space to jump
    if (e.key === 'r' && isGameOver) restartGame(); // R to restart
});

gameLoop(0); // Start the game loop
fetchRevisions(); // Fetch commits if needed
