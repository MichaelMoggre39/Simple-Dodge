
// gameLoop.js -- Orchestrates update & render each animation frame
import { updatePlayer } from './player.js';
import { checkPickupCollisions } from './pickups.js';
import { render } from './render.js';
import { updateBullets } from './bullets.js';
import { updateEnemies, spawnEnemy, clearEnemies } from './enemies.js';
import { bullets } from './bullets.js';

// --- Factory: Build a game controller ---
export function createGame(canvas, ctx, state) {
  // --- Helper: Check collision with portal ---
  function checkPortalCollision(player, pickups) {
    for (const p of pickups) {
      if (p.type === 'portal') {
        // Simple AABB collision
        if (
          player.x < p.x + p.size &&
          player.x + player.size > p.x &&
          player.y < p.y + p.size &&
          player.y + player.size > p.y
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // --- Start Level 1: new room, clear pickups, spawn enemies ---
  function startLevelOne() {
    // Move player to new room (e.g., left side)
    state.player.x = 100;
    state.player.y = 360;
    // Remove all pickups
    state.pickups = [];
    // Clear enemies
    clearEnemies();
    // Health and hit tracking
    state.inLevelOne = true;
    state.playerHits = 0;
    state.maxHits = 3;
    state.spawnTimer = 0;
    state.score = 0;
    state.gameOver = false;
    state.starSpinCooldown = 0;
  }

  // --- Update phase logic ---
  function update() {
    if (state.gameOver) return;
    updatePlayer(state.player, state.keys, state); // Pass state for star cooldown
    state.player.keys = state.keys;
    if (!state.inLevelOne) {
      checkPickupCollisions(state.player, state.pickups); // Handle pickups
      // Only allow entering the portal if not in square form
      if (checkPortalCollision(state.player, state.pickups)) {
        if (state.player.currentShape !== 'square') {
          startLevelOne();
        } else {
          // Set a flag to show a notification in render
          state.showPowerupNotification = 60; // Show for 1 second (60 frames)
        }
      }
    }
    updateBullets(); // Move bullets
    // Always decrement star spin cooldown, regardless of room
    if (state.starSpinCooldown > 0) state.starSpinCooldown--;
    if (state.inLevelOne) {
      // Spawn enemies from offscreen at intervals
      state.spawnTimer = (state.spawnTimer || 0) + 1;
      if (state.spawnTimer > 60) { // every 60 frames (~1 sec)
        // Randomly pick a side (top, bottom, left, right)
        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { // left
          x = -40; y = Math.random() * 720;
        } else if (side === 1) { // right
          x = 1280 + 40; y = Math.random() * 720;
        } else if (side === 2) { // top
          x = Math.random() * 1280; y = -40;
        } else { // bottom
          x = Math.random() * 1280; y = 720 + 40;
        }
        spawnEnemy(x, y);
        state.spawnTimer = 0;
      }
      updateEnemies(state.player, bullets, (destroyed, wasSpin, wasDash) => {
        // Player hit by enemy: lose a life
        if (!state.invuln) {
          state.playerHits = (state.playerHits || 0) + 1;
          state.invuln = 60; // 1 second invulnerability
          if (state.playerHits >= (state.maxHits || 3)) {
            state.gameOver = true;
          }
        }
      }, (scoreInc = 1) => {
        // Score callback: increase score
        state.score = (state.score || 0) + scoreInc;
      });
      if (state.invuln) state.invuln--;
    }
  }

  // --- Single animation frame callback ---
  function frame() {
    update();
    render(ctx, canvas, state);
    requestAnimationFrame(frame);
  }

  // --- Public API of game controller ---
  return {
    start: () => requestAnimationFrame(frame)
  };
}
