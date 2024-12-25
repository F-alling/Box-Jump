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

function createObstacle() {
    obstacles.push({ x: canvas.width, y: 300, size: 20 });
}

function slowdown() {
    gameSpeed = Math.max(0.5, gameSpeed - 0.5); // Ensure minimum speed is 0.5
}

function speedup() {
    gameSpeed += 0.5; // Increase speed by 0.5
}

function drawBox() {
    ctx.fillStyle = 'white';
    ctx.fillRect(box.x, box.y, box.width, box.height);
}

function drawObstacles() {
    ctx.fillStyle = 'white';
    obstacles.forEach(ob => {
        ctx.beginPath();
        ctx.moveTo(ob.x, ob.y);
        ctx.lineTo(ob.x + ob.size, ob.y + ob.size);
        ctx.lineTo(ob.x - ob.size, ob.y + ob.size);
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
    ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}`, 20, 60); // Display current speed
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
    lastObstacleTime = 0;
}

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

window.addEventListener('keydown', e => {
    if (e.key === ' ') jump(); // Space to jump
    if (e.key === 'r' && isGameOver) restartGame(); // R to restart
});

gameLoop(0);
fetchRevisions();
