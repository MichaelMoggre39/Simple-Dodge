// gameLoop.js
import { updatePlayer } from './player.js';
import { checkPickupCollisions } from './pickups.js';
import { render } from './render.js';

export function createGame(canvas, ctx, state) {
  function update() {
    updatePlayer(state.player, state.keys);
    checkPickupCollisions(state.player, state.pickups);
  }

  function frame() {
    update();
    render(ctx, canvas, state);
    requestAnimationFrame(frame);
  }

  return { start: () => requestAnimationFrame(frame) };
}
