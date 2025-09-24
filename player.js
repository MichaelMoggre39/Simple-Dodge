// player.js
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, PLAYER_SPEED } from './constants.js';

export function createPlayer() {
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    size: PLAYER_SIZE,
    speed: PLAYER_SPEED,
    currentShape: 'square'
  };
}

export function updatePlayer(player, keys) {
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;

  // Clamp inside game world
  player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x));
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.size, player.y));
}
