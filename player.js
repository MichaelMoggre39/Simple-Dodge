// player.js                                                         // Player related state & logic
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, PLAYER_SPEED } from './constants.js'; // Import constants for dimensions & defaults

export function createPlayer() {                                     // Factory to create a new player object
  return {                                                           // Return a plain object representing the player
    x: GAME_WIDTH / 2,                                               // Start at horizontal center of game world
    y: GAME_HEIGHT / 2,                                              // Start at vertical center of game world
    size: PLAYER_SIZE,                                               // Width/height of the player (square base size)
    speed: PLAYER_SPEED,                                             // Movement speed per frame
    currentShape: 'square'                                           // Current shape (affects rendering)
  };                                                                 // End of player object
}                                                                    // End createPlayer

export function updatePlayer(player, keys) {                         // Update player position based on pressed keys
  if (keys['ArrowUp']) player.y -= player.speed;                     // Move up when Up Arrow held
  if (keys['ArrowDown']) player.y += player.speed;                   // Move down when Down Arrow held
  if (keys['ArrowLeft']) player.x -= player.speed;                   // Move left when Left Arrow held
  if (keys['ArrowRight']) player.x += player.speed;                  // Move right when Right Arrow held

  player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x)); // Constrain X inside left/right bounds
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.size, player.y)); // Constrain Y inside top/bottom bounds
}                                                                    // End updatePlayer
