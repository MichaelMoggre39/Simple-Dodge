// Get the canvas element and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // used to draw 2D graphics

// Base Resolution of the game world (fixed size)
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Starting position and size of the red square
let x = 640; // center horizontally
let y = 360; // center vertically
const size = 40; // width and height of the square
const speed = 5; // movement speed per frame

// Track which keys are currently pressed
const keys = {}
window.addEventListener('keydown', e => keys[e.key] = true); // mark key as pressed
window.addEventListener('keyup', e => keys[e.key] = false); // mark key as released

// Resize canvas to fill the browser window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas); // update on window resize
resizeCanvas(); // run once at start

// Update game logic (movement and clamping)
function update() {
  // move based on arrow keys
  if (keys['ArrowUp']) y -= speed;
  if (keys['ArrowDown']) y += speed;
  if (keys['ArrowLeft']) x -= speed;
  if (keys['ArrowRight']) x += speed;

  // Prevent the square from going outside the game world
  x = Math.max(0, Math.min(GAME_WIDTH - size, x));
  y = Math.max(0, Math.min(GAME_HEIGHT - size, y));
}

// Draw everything on the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear previous frame

  // Draw full canvas background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(1, '#2a5298'); // blue gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate scale to fit game world inside canvas while preserving aspect ratio
  const scaleX = canvas.width / GAME_WIDTH;
  const scaleY = canvas.height / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY); // choose smallest to avoid distortion

  // Center the game world if there's extra space (letterboxing)
  const offsetX = (canvas.width / scale - GAME_WIDTH) / 2;
  const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2;

  // Draw semi-transparent overlay in letterbox areas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, offsetY * scale); // top
  ctx.fillRect(0, canvas.height - offsetY * scale, canvas.width, offsetY * scale); // bottom
  ctx.fillRect(0, 0, offsetX * scale, canvas.height); // left
  ctx.fillRect(canvas.width - offsetX * scale, 0, offsetX * scale, canvas.height); // right

  // Draw the game world
  ctx.save(); // save current canvas state
  ctx.scale(scale, scale); // apply scale
  ctx.translate(offsetX, offsetY); // apply centering offset

  // Draw border around the game world
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Draw the red square (player)
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y, size, size);

  ctx.restore(); // restore canvas to original state
}

// Main game loop: update logic, draw frame, repeat
function loop () {
    update(); // update game state
    draw(); // render frame
    requestAnimationFrame(loop); // schedule next frame
}

// Start the game loop
loop();