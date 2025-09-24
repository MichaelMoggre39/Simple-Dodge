// main.js (entry point)
import { createPlayer } from './player.js';
import { createInitialPickups } from './pickups.js';
import { createInput } from './input.js';
import { createGame } from './gameLoop.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const state = {
  player: createPlayer(),
  pickups: createInitialPickups(),
  keys: createInput()
};

const game = createGame(canvas, ctx, state);
game.start();
