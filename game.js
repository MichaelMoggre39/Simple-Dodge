// Get the canvas element and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Base Resolution
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Starting Position
let x = 640;
let y = 360;
const size = 40;
const speed = 5;

// Keyboard State
const keys = {}
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // run once at start


function update() {
  if (keys['ArrowUp']) y -= speed;
  if (keys['ArrowDown']) y += speed;
  if (keys['ArrowLeft']) x -= speed;
  if (keys['ArrowRight']) x += speed;

  // clamp so the square never overlaps the border
  x = Math.max(0, Math.min(GAME_WIDTH - size, x));
  y = Math.max(0, Math.min(GAME_HEIGHT - size, y));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // calculate scale factor
  const scaleX = canvas.width / GAME_WIDTH;
  const scaleY = canvas.height / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY); // preserve aspect ratio

  ctx.save();
  ctx.scale(scale, scale);

  // center the game world if letterboxed
  const offsetX = (canvas.width / scale - GAME_WIDTH) / 2;
  const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2;
  ctx.translate(offsetX, offsetY);

  // draw border
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // draw the square inside the fixed world
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y, size, size);

  ctx.restore();
}

function loop () {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start the Loop
loop();