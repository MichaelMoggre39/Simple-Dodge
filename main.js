
// main.js -- Entry point: initializes the game and starts the loop

import { createPlayer, setupPlayerMouse } from './player.js'; // Import player creation and mouse setup
import { createInitialPickups } from './pickups.js'; // Import function to create pickups
import { createInput } from './input.js'; // Import function to handle keyboard input
import { createGame } from './gameLoop.js'; // Import function to create the game controller
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js'; // Import game size constants
import './enemies.js'; // Ensure enemies module is loaded

// --- Setup canvas and context ---
const canvas = document.getElementById('gameCanvas'); // Get the canvas element from the HTML
const ctx = canvas.getContext('2d'); // Get the 2D drawing context

// --- Resize canvas to match window ---
function resizeCanvas() { // This function resizes the canvas to fit the window
  canvas.width = window.innerWidth; // Set canvas width to window width
  canvas.height = window.innerHeight; // Set canvas height to window height
}
window.addEventListener('resize', resizeCanvas); // When the window is resized, call resizeCanvas
resizeCanvas(); // Call it once at the start

// --- Central game state object ---
const state = { // This object holds all the main game data
  player: createPlayer(), // The player object
  pickups: createInitialPickups(), // The array of pickups
  keys: createInput() // The object tracking which keys are pressed
};

// --- Calculate scale and offset for mouse-to-world conversion ---
const scaleX = canvas.width / GAME_WIDTH; // How much to scale horizontally
const scaleY = canvas.height / GAME_HEIGHT; // How much to scale vertically
const scale = Math.min(scaleX, scaleY); // Use the smaller scale to fit everything
const offsetX = (canvas.width / scale - GAME_WIDTH) / 2; // Horizontal offset for centering
const offsetY = (canvas.height / scale - GAME_HEIGHT) / 2; // Vertical offset for centering

// --- Set up mouse aiming and shooting for triangle mode ---
setupPlayerMouse(canvas, state.player, scale, offsetX, offsetY); // Enable mouse controls for the player

// --- Create and start the game loop controller ---
const game = createGame(canvas, ctx, state); // Create the game controller
game.start(); // Start the game loop
