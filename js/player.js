
// player.js -- Player state, movement, and mouse controls

import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, PLAYER_SPEED } from './constants.js'; // Import constants for game size and player
import { shootBullet } from './bullets.js'; // Import function to shoot bullets
import { createTrail } from './particles.js'; // Import particle effects
import { playSound } from './audio.js'; // Import sound effects

// --- Factory: Create a new player object ---
export function createPlayer() { // This function creates a new player object
  return {
    x: GAME_WIDTH / 2, // Start at horizontal center
    y: GAME_HEIGHT / 2, // Start at vertical center
    size: PLAYER_SIZE,  // Player size (square base)
    speed: PLAYER_SPEED, // Movement speed
    currentShape: 'square', // Current shape (affects rendering and abilities)
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
export function updatePlayer(player, keys, state) { // This function updates the player every frame
  // --- Timers for dash/spin mechanics ---
  if (player.dashCooldown > 0) player.dashCooldown--; // Reduce dash cooldown if above 0
  if (player.dashTime > 0) player.dashTime--; // Reduce dash time if above 0
  if (player.spinTime > 0) player.spinTime--; // Reduce spin time if above 0
  if (player.spinTime === 0) player.spinning = false; // Stop spinning if spin time is 0

  // --- Movement and special mechanics by shape ---
  if (player.currentShape === 'circle') { // If player is a circle
    handleCircleDash(player, keys); // Handle dash movement
  } else if (player.currentShape === 'star') { // If player is a star
    handleStarSpin(player, keys, state); // Handle spin movement
  } else {
    handleDefaultMovement(player, keys); // Otherwise, use normal movement
  }

  // --- Constrain player inside game bounds ---
  player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x)); // Keep player inside left/right edges
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.size, player.y)); // Keep player inside top/bottom edges

  // --- Triangle form: handle aiming and shooting ---
  if (player.currentShape === 'triangle') { // If player is a triangle
    handleTriangleAimingAndShooting(player); // Handle aiming and shooting
  }
}

// --- Helper: Circle dash mechanic ---
function handleCircleDash(player, keys) { // Handles dashing for circle form
  // Initiate dash if left click (shooting) and not on cooldown
  if (player.shooting && player.dashCooldown === 0 && player.dashTime === 0) {
    player.dashTime = 10; // Dash lasts 10 frames
    player.dashCooldown = 40; // Cooldown (e.g. 40 frames)
    
    // Play dash sound
    playSound.dash();
    
    // Store dash direction based on mouse aim
    const centerX = player.x + player.size / 2; // Find the center x of the player
    const centerY = player.y + player.size / 2; // Find the center y of the player
    const dx = player.mouseX - centerX; // Calculate x distance from player to mouse
    const dy = player.mouseY - centerY; // Calculate y distance from player to mouse
    const len = Math.hypot(dx, dy); // Get the length of the direction vector
    if (len > 0) {
      player.dashDX = dx / len; // Normalize x direction (unit length)
      player.dashDY = dy / len; // Normalize y direction (unit length)
    } else {
      player.dashDX = 0; // If mouse is exactly at player center, dash up
      player.dashDY = -1;
    }
  }
  // If dashing, move player rapidly
  if (player.dashTime > 0) {
    const dashSpeed = 18; // Dash speed
    player.x += player.dashDX * dashSpeed; // Move in dash direction
    player.y += player.dashDY * dashSpeed;
    
    // Create dash trail particles
    createTrail(
      player.x + player.size / 2 - player.dashDX * 20,
      player.y + player.size / 2 - player.dashDY * 20,
      -player.dashDX * 5,
      -player.dashDY * 5,
      '#ff4444'
    );
  } else {
    // Normal movement if not dashing
    handleDefaultMovement(player, keys); // Use normal movement
  }
}

// --- Helper: Star spin mechanic ---
function handleStarSpin(player, keys, state) { // Handles spinning for star form
  // Only allow spin if not spinning, not on cooldown, and mouse was released since last spin
  if (!player._spinReady && !player.shooting) {
    player._spinReady = true; // Ready to spin again after mouse released
  }
  // Use left-click for star spin
  if (player.shooting && !player.spinning && player._spinReady && (!state || !state.starSpinCooldown || state.starSpinCooldown <= 0)) {
    player.spinTime = 15; // Spin lasts 15 frames
    player.spinning = true; // Start spinning
    player._spinReady = false; // Can't spin again until mouse released
    if (state) state.starSpinCooldown = 30; // 0.5 second cooldown (reduced)
    
    // Play spin sound
    playSound.spin();
  }
  handleDefaultMovement(player, keys); // Use normal movement while spinning
}

// --- Helper: Default movement for all forms ---
function handleDefaultMovement(player, keys) { // Handles normal movement
  // Only move if we have valid key states and they're currently pressed
  if (keys && typeof keys === 'object') {
    // Only respond to specific movement keys, ignore all others
    if (keys['w'] || keys['W']) player.y -= player.speed; // Move up
    if (keys['s'] || keys['S']) player.y += player.speed; // Move down
    if (keys['a'] || keys['A']) player.x -= player.speed; // Move left
    if (keys['d'] || keys['D']) player.x += player.speed; // Move right
  }
}

// --- Helper: Triangle aiming and shooting ---
function handleTriangleAimingAndShooting(player) { // Handles aiming and shooting for triangle form
  // Calculate angle from player center to mouse position
  const centerX = player.x + player.size / 2; // Player center x
  const centerY = player.y + player.size / 2; // Player center y
  const dx = player.mouseX - centerX; // Difference in x
  const dy = player.mouseY - centerY; // Difference in y
  player.aimAngle = Math.atan2(dy, dx); // Angle to mouse

  // If left mouse is pressed and canShoot is true, fire a bullet
  if (player.shooting && player.canShoot) {
    // Calculate tip of triangle (where bullet spawns)
    const tipX = centerX + Math.cos(player.aimAngle) * player.size / 2; // Tip x
    const tipY = centerY + Math.sin(player.aimAngle) * player.size / 2; // Tip y
    const bulletSpeed = 12; // Speed of bullet
    const vx = Math.cos(player.aimAngle) * bulletSpeed; // Bullet velocity x
    const vy = Math.sin(player.aimAngle) * bulletSpeed; // Bullet velocity y
    shootBullet(tipX, tipY, vx, vy); // Shoot the bullet
    player.canShoot = false; // Prevent holding down mouse to shoot rapidly
    
    // Play shoot sound
    playSound.shoot();
  }
}

// --- Mouse event listeners for aiming and shooting ---
export function setupPlayerMouse(canvas, player, scale, offsetX, offsetY) { // Sets up mouse controls
  // Listen for mouse movement to update aim
  canvas.addEventListener('mousemove', e => { // When mouse moves
    // Convert screen coords to world coords
    const rect = canvas.getBoundingClientRect(); // Get canvas position on screen
    const mx = (e.clientX - rect.left) / scale - offsetX; // Convert x
    const my = (e.clientY - rect.top) / scale - offsetY; // Convert y
    player.mouseX = mx; // Update player's mouse x
    player.mouseY = my; // Update player's mouse y
  });
  // Listen for mouse down to start shooting
  canvas.addEventListener('mousedown', e => { // When mouse button pressed
    if (e.button === 0) player.shooting = true; // If left button, start shooting
  });
  // Listen for mouse up to stop shooting and allow next shot
  canvas.addEventListener('mouseup', e => { // When mouse button released
    if (e.button === 0) {
      player.shooting = false; // Stop shooting
      player.canShoot = true; // Allow next shot
    }
  });
}
