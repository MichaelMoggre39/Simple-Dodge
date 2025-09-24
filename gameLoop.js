
// gameLoop.js -- Orchestrates update & render each animation frame
import { updatePlayer } from './player.js';
import { checkPickupCollisions } from './pickups.js';
import { render } from './render.js';
import { updateBullets } from './bullets.js';

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

  // --- Update phase logic ---
  function update() {
    updatePlayer(state.player, state.keys); // Move player
    // Attach keys to player for confirm logic
    state.player.keys = state.keys;
    checkPickupCollisions(state.player, state.pickups); // Handle pickups
    updateBullets(); // Move bullets

    // Check for portal collision to start level 1
    if (checkPortalCollision(state.player, state.pickups)) {
      // Placeholder: Transition to Level 1
      // For now, just alert and reset player position
      alert('Level 1 starting!');
      state.player.x = 100;
      state.player.y = 100;
      // Optionally, remove the portal or pickups here
      // state.pickups = [];
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
