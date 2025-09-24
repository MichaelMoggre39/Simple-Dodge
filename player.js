
// player.js -- Player state, movement, and mouse controls
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, PLAYER_SPEED } from './constants.js';
import { shootBullet } from './bullets.js';

// --- Factory: Create a new player object ---
export function createPlayer() {
  return {
    x: GAME_WIDTH / 2, // Start at horizontal center
    y: GAME_HEIGHT / 2, // Start at vertical center
    size: PLAYER_SIZE,  // Player size (square base)
    speed: PLAYER_SPEED, // Movement speed
    currentShape: 'square', // Current shape (affects rendering)
    aimAngle: 0, // Angle (radians) the triangle tip is facing
    mouseX: GAME_WIDTH / 2, // Last known mouse X in world coords
    mouseY: GAME_HEIGHT / 2, // Last known mouse Y in world coords
    canShoot: true, // Whether the player can shoot (for click debounce)
    dashCooldown: 0, // Cooldown timer for dashing (circle form)
    dashTime: 0, // Dash active timer (circle form)
    spinTime: 0, // Spin active timer (star form)
    spinning: false // Whether star is spinning
  };
}

// --- Update player position, state, and actions ---
export function updatePlayer(player, keys, state) {
  // --- Timers for dash/spin mechanics ---
  if (player.dashCooldown > 0) player.dashCooldown--;
  if (player.dashTime > 0) player.dashTime--;
  if (player.spinTime > 0) player.spinTime--;
  if (player.spinTime === 0) player.spinning = false;

  // --- Movement and special mechanics by shape ---
  if (player.currentShape === 'circle') {
    handleCircleDash(player, keys);
  } else if (player.currentShape === 'star') {
    handleStarSpin(player, keys, state);
  } else {
    handleDefaultMovement(player, keys);
  }

  // --- Constrain player inside game bounds ---
  player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x));
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.size, player.y));

  // --- Triangle form: handle aiming and shooting ---
  if (player.currentShape === 'triangle') {
    handleTriangleAimingAndShooting(player);
  }
}

// --- Helper: Circle dash mechanic ---
function handleCircleDash(player, keys) {
  // Initiate dash if left click (shooting) and not on cooldown
  if (player.shooting && player.dashCooldown === 0 && player.dashTime === 0) {
    player.dashTime = 10; // Dash lasts 10 frames
    player.dashCooldown = 40; // Cooldown (e.g. 40 frames)
    // Store dash direction based on input
    player.dashDX = (keys['ArrowRight'] ? 1 : 0) - (keys['ArrowLeft'] ? 1 : 0);
    player.dashDY = (keys['ArrowDown'] ? 1 : 0) - (keys['ArrowUp'] ? 1 : 0);
    // If no direction, dash forward (up)
    if (player.dashDX === 0 && player.dashDY === 0) player.dashDY = -1;
    // Normalize direction
    const len = Math.hypot(player.dashDX, player.dashDY);
    if (len > 0) {
      player.dashDX /= len;
      player.dashDY /= len;
    }
  }
  // If dashing, move player rapidly
  if (player.dashTime > 0) {
    const dashSpeed = 18;
    player.x += player.dashDX * dashSpeed;
    player.y += player.dashDY * dashSpeed;
  } else {
    // Normal movement if not dashing
    handleDefaultMovement(player, keys);
  }
}

// --- Helper: Star spin mechanic ---
function handleStarSpin(player, keys, state) {
  // Only allow spin if not spinning, not on cooldown, and mouse was released since last spin
  if (!player._spinReady && !player.shooting) {
    player._spinReady = true;
  }
  if (player.shooting && !player.spinning && player._spinReady && (!state || !state.starSpinCooldown || state.starSpinCooldown <= 0)) {
    player.spinTime = 15; // Spin lasts 15 frames
    player.spinning = true;
    player._spinReady = false;
    if (state) state.starSpinCooldown = 30; // 0.5 second cooldown (reduced)
  }
  handleDefaultMovement(player, keys);
}

// --- Helper: Default movement for all forms ---
function handleDefaultMovement(player, keys) {
  if (keys['ArrowUp'] || keys['w'] || keys['W']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s'] || keys['S']) player.y += player.speed;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;
}

// --- Helper: Triangle aiming and shooting ---
function handleTriangleAimingAndShooting(player) {
  // Calculate angle from player center to mouse position
  const centerX = player.x + player.size / 2;
  const centerY = player.y + player.size / 2;
  const dx = player.mouseX - centerX;
  const dy = player.mouseY - centerY;
  player.aimAngle = Math.atan2(dy, dx);

  // If left mouse is pressed and canShoot is true, fire a bullet
  if (player.shooting && player.canShoot) {
    // Calculate tip of triangle (where bullet spawns)
    const tipX = centerX + Math.cos(player.aimAngle) * player.size / 2;
    const tipY = centerY + Math.sin(player.aimAngle) * player.size / 2;
    const bulletSpeed = 12;
    const vx = Math.cos(player.aimAngle) * bulletSpeed;
    const vy = Math.sin(player.aimAngle) * bulletSpeed;
    shootBullet(tipX, tipY, vx, vy);
    player.canShoot = false; // Prevent holding down mouse to shoot rapidly
  }
}

// --- Mouse event listeners for aiming and shooting ---
export function setupPlayerMouse(canvas, player, scale, offsetX, offsetY) {
  // Listen for mouse movement to update aim
  canvas.addEventListener('mousemove', e => {
    // Convert screen coords to world coords
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / scale - offsetX;
    const my = (e.clientY - rect.top) / scale - offsetY;
    player.mouseX = mx;
    player.mouseY = my;
  });
  // Listen for mouse down to start shooting
  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) player.shooting = true;
  });
  // Listen for mouse up to stop shooting and allow next shot
  canvas.addEventListener('mouseup', e => {
    if (e.button === 0) {
      player.shooting = false;
      player.canShoot = true;
    }
  });
}
