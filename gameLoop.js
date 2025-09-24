// gameLoop.js                                                        // Orchestrates update & render each animation frame
import { updatePlayer } from './player.js';                           // Player movement logic
import { checkPickupCollisions } from './pickups.js';                 // Pickup collision checks
import { render } from './render.js';                                 // Rendering function

export function createGame(canvas, ctx, state) {                      // Factory to build a game controller
  function update() {                                                 // Update phase logic
    updatePlayer(state.player, state.keys);                           // Move player based on current keys
    checkPickupCollisions(state.player, state.pickups);               // Apply collisions & shape changes
  }                                                                   // End update

  function frame() {                                                  // Single animation frame callback
    update();                                                         // Run game state updates
    render(ctx, canvas, state);                                       // Draw the current frame
    requestAnimationFrame(frame);                                     // Schedule the next frame
  }                                                                   // End frame

  return {                                                            // Public API of game controller
    start: () => requestAnimationFrame(frame)                         // Begin the animation loop when called
  };                                                                  // End returned object
}                                                                     // End createGame
