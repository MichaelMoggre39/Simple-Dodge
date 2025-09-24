
// gameLoop.js -- Orchestrates update & render each animation frame
import { updatePlayer } from './player.js';
import { checkPickupCollisions } from './pickups.js';
import { render } from './render.js';
import { updateBullets } from './bullets.js';

// --- Factory: Build a game controller ---
export function createGame(canvas, ctx, state) {
  // --- Update phase logic ---
  function update() {
    updatePlayer(state.player, state.keys); // Move player
    checkPickupCollisions(state.player, state.pickups); // Handle pickups
    updateBullets(); // Move bullets
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
