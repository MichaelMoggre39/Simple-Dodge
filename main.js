
// main.js -- Entry point: initializes the game and starts the loop
import { createPlayer, setupPlayerMouse } from './player.js';
import { createInitialPickups } from './pickups.js';
import { createInput } from './input.js';
import { createGame } from './gameLoop.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

// --- Setup canvas and context ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Resize canvas to match window ---
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Central game state object ---
const state = {
  player: createPlayer(),
  pickups: createInitialPickups(),
  keys: createInput()
};

// --- Calculate scale and offset for mouse-to-world conversion ---
const scaleX = canvas.width / GAME_WIDTH;
const scaleY = canvas.height / GAME_HEIGHT;
const scale = Math.min(scaleX, scaleY);
const offsetX = (canvas.width / scale - GAME_WIDTH) / 2;
const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2;

// --- Set up mouse aiming and shooting for triangle mode ---
setupPlayerMouse(canvas, state.player, scale, offsetX, offsetY);

// --- Create and start the game loop controller ---
const game = createGame(canvas, ctx, state);
game.start();
