// Three.js setup
const canvas = document.getElementById('game-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Camera position (adjusted for 2D-like view)
camera.position.z = 20;

// Colors for bubbles
const colors = [
    0xff0000, // Red
    0x00ff00, // Green
    0x0000ff, // Blue
    0xffff00, // Yellow
];

// Game variables
const bubbles = [];
const bubbleRadius = 0.5;
const shooterPos = new THREE.Vector3(0, -8, 0);
let shooterBubble = null;
let shooting = false;
let touchStart = null;
let aimDirection = new THREE.Vector3(0, 1, 0);
let score = 0;
const scoreElement = document.getElementById('score-value');
const bubbleSpeed = 0.05; // Speed of scrolling bubbles

// Create a bubble
function createBubble(x, y, color) {
    const geometry = new THREE.SphereGeometry(bubbleRadius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color });
    const bubble = new THREE.Mesh(geometry, material);
    bubble.position.set(x, y, 0);
    bubble.userData = { color, velocity: new THREE.Vector3(bubbleSpeed, 0, 0) };
    scene.add(bubble);
    bubbles.push(bubble);
    return bubble;
}

// Initialize shooter bubble
function createShooterBubble() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    shooterBubble = createBubble(shooterPos.x, shooterPos.y, color);
    shooterBubble.userData.isShooter = true;
}

// Initialize bubble grid (scrolling from left)
function initBubbles() {
    for (let y = 2; y <= 8; y += 1) {
        for (let x = -8; x <= -4; x += 1) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            createBubble(x, y, color);
        }
    }
    createShooterBubble();
}

// Collision detection
function checkCollisions(bubble) {
    const matches = [bubble];
    const visited = new Set();

    function findMatches(current) {
        if (visited.has(current)) return;
        visited.add(current);

        bubbles.forEach(other => {
            if (other !== current && !visited.has(other)) {
                const distance = current.position.distanceTo(other.position);
                if (distance < bubbleRadius * 2.1 && current.userData.color === other.userData.color) {
                    matches.push(other);
                    findMatches(other);
                }
            }
        });
    }

    findMatches(bubble);

    if (matches.length >= 3) {
        matches.forEach(match => {
            scene.remove(match);
            bubbles.splice(bubbles.indexOf(match), 1);
        });
        score += matches.length * 10;
        scoreElement.textContent = score;
    }
}

// Touch controls
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStart = new THREE.Vector2(
        (e.touches[0].clientX / window.innerWidth) * 2 - 1,
        -(e.touches[0].clientY / window.innerHeight) * 2 + 1
    );
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (touchStart && shooterBubble) {
        const touch = new THREE.Vector2(
            (e.touches[0].clientX / window.innerWidth) * 2 - 1,
            -(e.touches[0].clientY / window.innerHeight) * 2 + 1
        );
        aimDirection.set(touch.x - touchStart.x, touch.y - touchStart.y, 0).normalize();
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (shooterBubble && !shooting) {
        shooting = true;
        shooterBubble.userData.velocity = aimDirection.clone().multiplyScalar(0.2);
        shooterBubble.userData.isShooter = false;
        bubbles.push(shooterBubble);
        setTimeout(createShooterBubble, 500); // Delay to prevent immediate shooting
    }
    touchStart = null;
});

// Main game loop
function animate() {
    requestAnimationFrame(animate);

    // Move bubbles
    bubbles.forEach(bubble => {
        bubble.position.add(bubble.userData.velocity);

        // Check boundaries
        if (bubble.position.x > 10) {
            bubble.position.x = -10; // Wrap around to left
        }

        // Handle shooter bubble collision
        if (bubble.userData.isShooter && shooting) {
            bubbles.forEach(other => {
                if (other !== bubble && !other.userData.isShooter) {
                    const distance = bubble.position.distanceTo(other.position);
                    if (distance < bubbleRadius * 2) {
                        bubble.userData.velocity.set(0, 0, 0);
                        shooting = false;
                        checkCollisions(bubble);
                    }
                }
            });

            // Stop shooter bubble if it hits the top
            if (bubble.position.y > 8) {
                bubble.userData.velocity.set(0, 0, 0);
                shooting = false;
                checkCollisions(bubble);
            }
        }
    });

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Start the game
initBubbles();
animate();
